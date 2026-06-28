import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { orders, orderItems, carts, cartItems, products, wallets, walletMutations, promos, stores, addresses, deliveryJobs } from '../db/schema';
import { eq, desc, and, or, sql } from 'drizzle-orm';
import { verify } from 'hono/jwt';
import type { Env } from '../types';

export const orderRouter = new Hono<Env>();

const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ message: 'Unauthorized' }, 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = await verify(token, c.env.JWT_SECRET, "HS256") as any;
    c.set('user', payload);
    await next();
  } catch (err) {
    return c.json({ message: 'Invalid token' }, 401);
  }
};

orderRouter.use('*', authMiddleware);

orderRouter.post('/checkout/validate-voucher', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user') as any;
  const body = await c.req.json().catch(() => ({}));
  const code = body.code;

  if (!code) return c.json({ message: 'Kode voucher tidak boleh kosong' }, 400);

  const cart = await db.select().from(carts).where(eq(carts.userId, user.id as string)).get();
  if (!cart || !cart.storeId) return c.json({ message: 'Keranjang kosong' }, 400);

  const promo = await db.select().from(promos)
    .where(and(eq(promos.code, code), or(eq(promos.storeId, cart.storeId), sql`${promos.storeId} IS NULL`)))
    .get();
  
  if (!promo) return c.json({ message: 'Voucher tidak ditemukan atau tidak berlaku untuk toko ini' }, 404);
  if (promo.quota <= 0) return c.json({ message: 'Kuota voucher sudah habis' }, 400);

  return c.json({ data: { discount: promo.discountAmount, type: promo.type } });
});

orderRouter.post('/checkout', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user') as any;
  const body = await c.req.json().catch(() => ({}));
  const promoCode = body.voucherCode || body.promoCode;

  const cart = await db.select().from(carts).where(eq(carts.userId, user.id as string)).get();
  if (!cart || !cart.storeId) return c.json({ message: 'Cart is empty' }, 400);

  const items = await db.select().from(cartItems).where(eq(cartItems.cartId, cart.id)).all();
  if (items.length === 0) return c.json({ message: 'Cart is empty' }, 400);

  let subtotal = 0;
  const productUpdates: { id: string; newStock: number }[] = [];
  const orderItemList: { id: string; productId: string; quantity: number; priceAtPurchase: number }[] = [];

  for (const item of items) {
    const product = await db.select().from(products).where(eq(products.id, item.productId)).get();
    if (!product || product.stock < item.quantity) {
      return c.json({ message: `Stok produk ${product?.name} tidak mencukupi` }, 400);
    }
    subtotal += product.price * item.quantity;
    productUpdates.push({ id: product.id, newStock: product.stock - item.quantity });
    orderItemList.push({
      id: crypto.randomUUID(),
      productId: product.id,
      quantity: item.quantity,
      priceAtPurchase: product.price
    });
  }

  let deliveryFee = 15000;
  let discount = 0;
  let appliedPromo = null;

  if (promoCode) {
    appliedPromo = await db.select().from(promos)
      .where(and(eq(promos.code, promoCode), or(eq(promos.storeId, cart.storeId!), sql`${promos.storeId} IS NULL`)))
      .get();
    if (appliedPromo && appliedPromo.quota > 0) {
      if (appliedPromo.type === 'SHIPPING') {
        discount = Math.min(deliveryFee, appliedPromo.discountAmount);
      } else {
        discount = Math.min(subtotal, appliedPromo.discountAmount);
      }
    } else {
      appliedPromo = null;
    }
  }

  const totalAmount = subtotal + deliveryFee - discount;

  const wallet = await db.select().from(wallets).where(eq(wallets.userId, user.id as string)).get();
  if (!wallet || wallet.balance < totalAmount) {
    return c.json({ message: 'Saldo tidak cukup' }, 400);
  }

  const orderId = crypto.randomUUID();

  await db.update(wallets).set({ balance: wallet.balance - totalAmount }).where(eq(wallets.id, wallet.id));

  await db.insert(walletMutations).values({
    id: crypto.randomUUID(),
    walletId: wallet.id,
    amount: -totalAmount,
    type: 'PAYMENT',
    description: `Pembayaran pesanan ${orderId}`
  });

  for (const update of productUpdates) {
    await db.update(products).set({ stock: update.newStock }).where(eq(products.id, update.id));
  }

  if (appliedPromo) {
    await db.update(promos).set({ quota: appliedPromo.quota - 1 }).where(eq(promos.id, appliedPromo.id));
  }

  await db.insert(orders).values({
    id: orderId,
    buyerId: user.id as string,
    storeId: cart.storeId!,
    status: 'SEDANG_DIKEMAS',
    totalAmount,
    deliveryFee
  });

  for (const oi of orderItemList) {
    await db.insert(orderItems).values({ ...oi, orderId });
  }

  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
  await db.update(carts).set({ storeId: null }).where(eq(carts.id, cart.id));

  return c.json({ message: 'Checkout successful', orderId }, 201);
});

orderRouter.get('/me', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user') as any;
  const rawOrders = await db.select().from(orders).where(eq(orders.buyerId, user.id as string)).orderBy(desc(orders.createdAt)).all();
  
  const myOrders = [];
  for (const o of rawOrders) {
    const store = await db.select().from(stores).where(eq(stores.id, o.storeId)).get();
    const items = await db.select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      price: orderItems.priceAtPurchase,
      productName: products.name,
      productImage: products.images
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, o.id))
    .all();

    const mappedItems = items.map(item => {
      let parsedImages = [];
      try {
        parsedImages = typeof item.productImage === 'string' ? JSON.parse(item.productImage) : item.productImage;
      } catch(e) {}
      return {
        ...item,
        productImage: parsedImages?.[0] || null
      };
    });

    myOrders.push({
      ...o,
      total: o.totalAmount,
      store: { name: store?.name },
      items: mappedItems
    });
  }

  return c.json({ data: myOrders });
});

orderRouter.get('/store/incoming', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user') as any;

  const store = await db.select().from(stores).where(eq(stores.ownerId, user.id as string)).get();
  if (!store) return c.json({ message: 'Forbidden' }, 403);

  const incomingOrders = await db.select().from(orders).where(eq(orders.storeId, store.id)).orderBy(desc(orders.createdAt)).all();
  
  const mappedIncomingOrders = await Promise.all(incomingOrders.map(async (o) => {
    const { users } = await import('../db/schema');
    const buyer = await db.select().from(users).where(eq(users.id, o.buyerId)).get();
    
    const items = await db.select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      price: orderItems.priceAtPurchase,
      productName: products.name,
      productImage: products.images
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, o.id))
    .all();

    const mappedItems = items.map(item => {
      let parsedImages = [];
      try {
        parsedImages = typeof item.productImage === 'string' ? JSON.parse(item.productImage) : item.productImage;
      } catch(e) {}
      return {
        ...item,
        productImg: parsedImages?.[0] || null
      };
    });

    return {
      ...o,
      subtotal: o.totalAmount,
      buyer: { fullName: buyer?.fullName || 'User' },
      items: mappedItems
    };
  }));

  return c.json({ data: mappedIncomingOrders });
});

orderRouter.get('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const orderId = c.req.param('id');

  const order = await db.select().from(orders).where(eq(orders.id, orderId)).get();
  if (!order) return c.json({ message: 'Order not found' }, 404);

  const store = await db.select().from(stores).where(eq(stores.id, order.storeId)).get();

  const items = await db.select({
    id: orderItems.id,
    quantity: orderItems.quantity,
    price: orderItems.priceAtPurchase,
    productName: products.name
  })
  .from(orderItems)
  .innerJoin(products, eq(orderItems.productId, products.id))
  .where(eq(orderItems.orderId, order.id))
  .all();

  const mappedItems = items.map(item => ({
    ...item,
    subtotal: item.price * item.quantity
  }));

  const address = await db.select().from(addresses).where(eq(addresses.userId, order.buyerId)).get();

  const job = await db.select().from(deliveryJobs).where(eq(deliveryJobs.orderId, order.id)).get();

  const history = [
    { id: '1', status: 'SEDANG_DIKEMAS', createdAt: order.createdAt, note: 'Pesanan dibuat dan sedang disiapkan penjual' }
  ];

  if (order.status !== 'SEDANG_DIKEMAS' && job) {
    history.push({ id: '2', status: 'MENUNGGU_PENGIRIM', createdAt: new Date(new Date(order.createdAt).getTime() + 10 * 60000), note: 'Menunggu kurir mengambil pesanan' });
    
    if (['SEDANG_DIKIRIM', 'TERKIRIM', 'PESANAN_SELESAI'].includes(order.status)) {
      history.push({ id: '3', status: 'SEDANG_DIKIRIM', createdAt: job.createdAt, note: 'Kurir sedang mengantar pesanan' });
    }
  }

  if (['TERKIRIM', 'PESANAN_SELESAI'].includes(order.status)) {
    history.push({ id: '4', status: 'TERKIRIM', createdAt: job?.completedAt || new Date(new Date(order.createdAt).getTime() + 60 * 60000), note: 'Pesanan telah sampai di tujuan' });
  }

  if (order.status === 'PESANAN_SELESAI') {
    history.push({ id: '5', status: 'PESANAN_SELESAI', createdAt: new Date(new Date(job?.completedAt || order.createdAt).getTime() + 5 * 60000), note: 'Pesanan telah diselesaikan pembeli' });
  }

  return c.json({ 
    data: { 
      ...order, 
      total: order.totalAmount,
      subtotal: order.totalAmount - order.deliveryFee,
      shippingFee: order.deliveryFee,
      discount: 0,
      store: { name: store?.name },
      address: address,
      items: mappedItems,
      statusHistory: history.reverse()
    } 
  });
});

orderRouter.put('/:id/status', async (c) => {
  const db = drizzle(c.env.DB);
  const orderId = c.req.param('id');
  const body = await c.req.json();
  const newStatus = body.status;

  const order = await db.select().from(orders).where(eq(orders.id, orderId)).get();
  if (!order) return c.json({ message: 'Order not found' }, 404);

  await db.update(orders).set({ status: newStatus }).where(eq(orders.id, orderId));

  if (newStatus === 'PESANAN_SELESAI') {
    const store = await db.select().from(stores).where(eq(stores.id, order.storeId)).get();
    if (store) {
      let sellerWallet = await db.select().from(wallets).where(eq(wallets.userId, store.ownerId)).get();
      let sellerWalletId = sellerWallet?.id;
      
      const sellerGross = order.totalAmount - order.deliveryFee;
      const netIncome = Math.floor(sellerGross * 0.95);

      if (sellerWallet) {
        await db.update(wallets).set({ balance: sellerWallet.balance + netIncome }).where(eq(wallets.id, sellerWallet.id));
      } else {
        sellerWalletId = crypto.randomUUID();
        await db.insert(wallets).values({ id: sellerWalletId, userId: store.ownerId, balance: netIncome });
      }

      const items = await db.select({ productName: products.name })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, orderId))
        .all();
      const productNames = items.map(i => i.productName).join(', ');

      await db.insert(walletMutations).values({
        id: crypto.randomUUID(),
        walletId: sellerWalletId as string,
        amount: netIncome,
        type: 'INCOME',
        description: `Penjualan: ${productNames} (Dipotong Komisi 5%)`
      });
    }
  }

  if (newStatus === 'DIKEMBALIKAN') {
    const buyerWallet = await db.select().from(wallets).where(eq(wallets.userId, order.buyerId)).get();
    if (buyerWallet) {
      await db.update(wallets).set({ balance: buyerWallet.balance + order.totalAmount }).where(eq(wallets.id, buyerWallet.id));
      
      await db.insert(walletMutations).values({
        id: crypto.randomUUID(),
        walletId: buyerWallet.id,
        amount: order.totalAmount,
        type: 'REFUND',
        description: `Pengembalian dana pesanan ${orderId}`
      });
    }
  }

  return c.json({ message: 'Order status updated' });
});
