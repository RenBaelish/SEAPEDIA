import { Hono } from 'hono';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { orders, orderItems, carts, cartItems, products, wallets } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
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

  const deliveryFee = 15000; // Fixed dummy delivery fee
  const totalAmount = subtotal + deliveryFee;

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
