import { Hono } from 'hono';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { orders, orderItems, carts, cartItems, products, wallets, promos, stores } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { verify } from 'hono/jwt';

export const orderRouter = new Hono<{ Bindings: { DB: D1Database, JWT_SECRET: string } }>();

const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ message: 'Unauthorized' }, 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = await verify(token, c.env.JWT_SECRET || 'fallback_secret');
    c.set('user', payload);
    await next();
  } catch (err) {
    return c.json({ message: 'Invalid token' }, 401);
  }
};

orderRouter.use('*', authMiddleware);

// Checkout
orderRouter.post('/checkout', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  const promoCode = body.promoCode;

  // 1. Get cart
  const cart = await db.select().from(carts).where(eq(carts.userId, user.id as string)).get();
  if (!cart || !cart.storeId) return c.json({ message: 'Cart is empty' }, 400);

  const items = await db.select().from(cartItems).where(eq(cartItems.cartId, cart.id)).all();
  if (items.length === 0) return c.json({ message: 'Cart is empty' }, 400);

  // 2. Validate stock and calculate total
  let subtotal = 0;
  const productUpdates = [];
  const orderItemList = [];

  for (const item of items) {
    const product = await db.select().from(products).where(eq(products.id, item.productId)).get();
    if (!product || product.stock < item.quantity) {
      return c.json({ message: `Product ${product?.name || 'unknown'} is out of stock` }, 400);
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

  let deliveryFee = 15000; // Fixed dummy delivery fee
  let discount = 0;
  let appliedPromo = null;

  if (promoCode) {
    appliedPromo = await db.select().from(promos).where(and(eq(promos.code, promoCode), eq(promos.storeId, cart.storeId))).get();
    if (appliedPromo && appliedPromo.quota > 0) {
      if (appliedPromo.type === 'SHIPPING') {
        discount = Math.min(deliveryFee, appliedPromo.discountAmount);
      } else {
        discount = Math.min(subtotal, appliedPromo.discountAmount);
      }
    } else {
      appliedPromo = null; // invalid or depleted
    }
  }

  const totalAmount = subtotal + deliveryFee - discount;

  // 3. Check wallet balance
  const wallet = await db.select().from(wallets).where(eq(wallets.userId, user.id as string)).get();
  if (!wallet || wallet.balance < totalAmount) {
    return c.json({ message: 'Saldo tidak cukup' }, 400);
  }

  // 4. Process payment & create order
  const orderId = crypto.randomUUID();

  // Deduct balance
  await db.update(wallets).set({ balance: wallet.balance - totalAmount }).where(eq(wallets.id, wallet.id));

  // Deduct stock
  for (const update of productUpdates) {
    await db.update(products).set({ stock: update.newStock }).where(eq(products.id, update.id));
  }

  if (appliedPromo) {
    await db.update(promos).set({ quota: appliedPromo.quota - 1 }).where(eq(promos.id, appliedPromo.id));
  }

  // Create order
  await db.insert(orders).values({
    id: orderId,
    buyerId: user.id as string,
    storeId: cart.storeId,
    status: 'SEDANG_DIKEMAS',
    totalAmount,
    deliveryFee
  });

  // Create order items
  for (const oi of orderItemList) {
    await db.insert(orderItems).values({
      ...oi,
      orderId
    });
  }

  // Clear cart
  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
  await db.update(carts).set({ storeId: null }).where(eq(carts.id, cart.id));

  return c.json({ message: 'Checkout successful', orderId }, 201);
});

// Get My Orders
orderRouter.get('/me', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');

  const myOrders = await db.select().from(orders).where(eq(orders.buyerId, user.id as string)).orderBy(desc(orders.createdAt)).all();

  return c.json({ data: myOrders });
});

// Get Order Details
orderRouter.get('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');
  const orderId = c.req.param('id');

  const order = await db.select().from(orders).where(eq(orders.id, orderId)).get();
  if (!order) return c.json({ message: 'Order not found' }, 404);

  // Allow buyer or seller to view
  // Proper permission check can be added

  const items = await db.select({
    id: orderItems.id,
    quantity: orderItems.quantity,
    priceAtPurchase: orderItems.priceAtPurchase,
    productName: products.name
  })
  .from(orderItems)
  .innerJoin(products, eq(orderItems.productId, products.id))
  .where(eq(orderItems.orderId, order.id))
  .all();

  return c.json({ data: { ...order, items } });
});

// Seller: Get Incoming Orders
orderRouter.get('/store/incoming', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');

  const store = await db.select().from(stores).where(eq(stores.ownerId, user.id as string)).get();
  if (!store) return c.json({ message: 'Forbidden' }, 403);

  const incomingOrders = await db.select().from(orders).where(eq(orders.storeId, store.id)).orderBy(desc(orders.createdAt)).all();

  return c.json({ data: incomingOrders });
});

// Update Status
orderRouter.put('/:id/status', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');
  const orderId = c.req.param('id');
  const body = await c.req.json();
  const newStatus = body.status;

  const order = await db.select().from(orders).where(eq(orders.id, orderId)).get();
  if (!order) return c.json({ message: 'Order not found' }, 404);

  // Validation: Only seller can update to MENUNGGU_PENGIRIM, SEDANG_DIKIRIM
  // Only buyer can update to PESANAN_SELESAI, DIKEMBALIKAN
  
  await db.update(orders).set({ status: newStatus }).where(eq(orders.id, orderId));

  // If PESANAN_SELESAI, transfer funds to seller wallet (Simplification)
  if (newStatus === 'PESANAN_SELESAI') {
    const store = await db.select().from(stores).where(eq(stores.id, order.storeId)).get();
    if (store) {
      const sellerWallet = await db.select().from(wallets).where(eq(wallets.userId, store.ownerId)).get();
      if (sellerWallet) {
        await db.update(wallets).set({ balance: sellerWallet.balance + order.totalAmount }).where(eq(wallets.id, sellerWallet.id));
      } else {
        await db.insert(wallets).values({
          id: crypto.randomUUID(),
          userId: store.ownerId,
          balance: order.totalAmount
        });
      }
    }
  }

  // If DIKEMBALIKAN, refund to buyer wallet
  if (newStatus === 'DIKEMBALIKAN') {
    const buyerWallet = await db.select().from(wallets).where(eq(wallets.userId, order.buyerId)).get();
    if (buyerWallet) {
      await db.update(wallets).set({ balance: buyerWallet.balance + order.totalAmount }).where(eq(wallets.id, buyerWallet.id));
    }
  }

  return c.json({ message: 'Order status updated' });
});
