import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { drizzle } from 'drizzle-orm/d1';
import { carts, cartItems, products, stores } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { verify } from 'hono/jwt';
import type { Env } from '../types';

export const cartRouter = new Hono<Env>();

const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ message: 'Unauthorized' }, 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = await verify(token, c.env.JWT_SECRET || 'fallback_secret', "HS256") as any;
    c.set('user', payload);
    await next();
  } catch (err) {
    return c.json({ message: 'Invalid token' }, 401);
  }
};

cartRouter.use('*', authMiddleware);

cartRouter.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user') as any;

  let cart = await db.select().from(carts).where(eq(carts.userId, user.id as string)).get();
  
  if (!cart) {
    const cartId = crypto.randomUUID();
    await db.insert(carts).values({ id: cartId, userId: user.id as string });
    cart = { id: cartId, userId: user.id as string, storeId: null };
  }

  const rawItems = await db
    .select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      product: {
        id: products.id,
        name: products.name,
        price: products.price,
        stock: products.stock,
        images: products.images,
        slug: products.slug,
        comparePrice: products.comparePrice
      }
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cart.id));

  const items = rawItems.map(item => ({
    ...item,
    product: {
      ...item.product,
      images: item.product.images ? JSON.parse(item.product.images as string) : []
    }
  }));

  let store = null;
  if (cart.storeId) {
    store = await db.select().from(stores).where(eq(stores.id, cart.storeId)).get();
  }

  return c.json({ data: { cart, items, store } });
});

const addItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1)
});

cartRouter.post('/items', zValidator('json', addItemSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user') as any;
  const data = c.req.valid('json');

  const product = await db.select().from(products).where(eq(products.id, data.productId)).get();
  if (!product) return c.json({ message: 'Product not found' }, 404);
  if (product.stock < data.quantity) return c.json({ message: 'Insufficient stock' }, 400);

  let cart = await db.select().from(carts).where(eq(carts.userId, user.id as string)).get();
  if (!cart) {
    const cartId = crypto.randomUUID();
    await db.insert(carts).values({ id: cartId, userId: user.id as string, storeId: product.storeId });
    cart = { id: cartId, userId: user.id as string, storeId: product.storeId };
  }

  if (cart.storeId && cart.storeId !== product.storeId) {
    const existingItems = await db.select().from(cartItems).where(eq(cartItems.cartId, cart.id)).all();
    if (existingItems.length > 0) {
      return c.json({ message: 'Anda hanya dapat memesan produk dari 1 toko dalam satu checkout. Harap kosongkan keranjang Anda jika ingin memesan dari toko ini.' }, 400);
    } else {
      await db.update(carts).set({ storeId: product.storeId }).where(eq(carts.id, cart.id));
      cart.storeId = product.storeId;
    }
  } else if (!cart.storeId) {
    await db.update(carts).set({ storeId: product.storeId }).where(eq(carts.id, cart.id));
  }

  const existingItem = await db.select().from(cartItems).where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, product.id))).get();

  if (existingItem) {
    const newQuantity = existingItem.quantity + data.quantity;
    if (newQuantity > product.stock) return c.json({ message: 'Stock not enough' }, 400);
    await db.update(cartItems).set({ quantity: newQuantity }).where(eq(cartItems.id, existingItem.id));
  } else {
    await db.insert(cartItems).values({
      id: crypto.randomUUID(),
      cartId: cart.id,
      productId: product.id,
      quantity: data.quantity
    });
  }

  return c.json({ message: 'Item added to cart' });
});

cartRouter.delete('/items/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user') as any;
  const itemId = c.req.param('id');

  const cart = await db.select().from(carts).where(eq(carts.userId, user.id as string)).get();
  if (!cart) return c.json({ message: 'Cart not found' }, 404);

  await db.delete(cartItems).where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)));

  const items = await db.select().from(cartItems).where(eq(cartItems.cartId, cart.id)).all();
  if (items.length === 0) {
    await db.update(carts).set({ storeId: null }).where(eq(carts.id, cart.id));
  }

  return c.json({ message: 'Item removed' });
});

cartRouter.patch('/items/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user') as any;
  const itemId = c.req.param('id');
  const { quantity } = await c.req.json();

  const cart = await db.select().from(carts).where(eq(carts.userId, user.id as string)).get();
  if (!cart) return c.json({ message: 'Cart not found' }, 404);

  const existingItem = await db.select().from(cartItems).where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id))).get();
  if (!existingItem) return c.json({ message: 'Item not found' }, 404);

  const product = await db.select().from(products).where(eq(products.id, existingItem.productId)).get();
  if (!product) return c.json({ message: 'Product not found' }, 404);

  if (quantity > product.stock) return c.json({ message: 'Stock not enough' }, 400);

  await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, itemId));

  return c.json({ message: 'Quantity updated' });
});

cartRouter.delete('/', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user') as any;

  const cart = await db.select().from(carts).where(eq(carts.userId, user.id as string)).get();
  if (!cart) return c.json({ message: 'Cart not found' }, 404);

  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
  await db.update(carts).set({ storeId: null }).where(eq(carts.id, cart.id));

  return c.json({ message: 'Cart cleared' });
});
