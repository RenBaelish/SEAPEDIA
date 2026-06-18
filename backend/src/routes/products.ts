import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { drizzle } from 'drizzle-orm/d1';
import { products, stores } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { verify } from 'hono/jwt';
import type { Env } from '../types';

export const productRouter = new Hono<Env>();

const productSchema = z.object({
  name: z.string().min(3),
  description: z.string(),
  price: z.number().min(0),
  stock: z.number().min(0)
});

// Create Product
productRouter.post('/', zValidator('json', productSchema), async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  const token = authHeader.split(' ')[1];
  const secret = c.env.JWT_SECRET || 'fallback_secret';

  let payload;
  try {
    payload = await verify(token, secret, "HS256");
  } catch (err) {
    return c.json({ message: 'Invalid token' }, 401);
  }

  const db = drizzle(c.env.DB);
  
  // Check if user has a store
  const store = await db.select().from(stores).where(eq(stores.ownerId, payload.id as string)).get();
  if (!store) {
    return c.json({ message: 'Forbidden. You do not have a store.' }, 403);
  }

  const data = c.req.valid('json');
  const productId = crypto.randomUUID();

  await db.insert(products).values({
    id: productId,
    storeId: store.id,
    name: data.name,
    description: data.description,
    price: data.price,
    stock: data.stock
  });

  return c.json({ message: 'Product created successfully', productId }, 201);
});

// Update Product
productRouter.put('/:id', zValidator('json', productSchema), async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  const token = authHeader.split(' ')[1];
  const secret = c.env.JWT_SECRET || 'fallback_secret';

  let payload;
  try {
    payload = await verify(token, secret, "HS256");
  } catch (err) {
    return c.json({ message: 'Invalid token' }, 401);
  }

  const db = drizzle(c.env.DB);
  const store = await db.select().from(stores).where(eq(stores.ownerId, payload.id as string)).get();
  if (!store) {
    return c.json({ message: 'Forbidden. You do not have a store.' }, 403);
  }

  const productId = c.req.param('id');
  const product = await db.select().from(products).where(and(eq(products.id, productId), eq(products.storeId, store.id))).get();

  if (!product) {
    return c.json({ message: 'Product not found or not yours' }, 404);
  }

  const data = c.req.valid('json');

  await db.update(products).set({
    name: data.name,
    description: data.description,
    price: data.price,
    stock: data.stock
  }).where(eq(products.id, productId));

  return c.json({ message: 'Product updated successfully' });
});

// Delete Product
productRouter.delete('/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  const token = authHeader.split(' ')[1];
  const secret = c.env.JWT_SECRET || 'fallback_secret';

  let payload;
  try {
    payload = await verify(token, secret, "HS256");
  } catch (err) {
    return c.json({ message: 'Invalid token' }, 401);
  }

  const db = drizzle(c.env.DB);
  const store = await db.select().from(stores).where(eq(stores.ownerId, payload.id as string)).get();
  if (!store) {
    return c.json({ message: 'Forbidden' }, 403);
  }

  const productId = c.req.param('id');
  const product = await db.select().from(products).where(and(eq(products.id, productId), eq(products.storeId, store.id))).get();

  if (!product) {
    return c.json({ message: 'Product not found or not yours' }, 404);
  }

  await db.delete(products).where(eq(products.id, productId));

  return c.json({ message: 'Product deleted successfully' });
});

// Get All Products (Public Catalog)
productRouter.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const allProducts = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      stock: products.stock,
      storeId: products.storeId,
      storeName: stores.name
    })
    .from(products)
    .innerJoin(stores, eq(products.storeId, stores.id));

  return c.json({ data: allProducts });
});

// Get Product by ID
productRouter.get('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const productId = c.req.param('id');
  
  const product = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      stock: products.stock,
      storeId: products.storeId,
      storeName: stores.name
    })
    .from(products)
    .innerJoin(stores, eq(products.storeId, stores.id))
    .where(eq(products.id, productId))
    .get();

  if (!product) {
    return c.json({ message: 'Product not found' }, 404);
  }

  return c.json({ data: product });
});

// Get Products by Store ID
productRouter.get('/store/:storeId', async (c) => {
  const db = drizzle(c.env.DB);
  const storeId = c.req.param('storeId');
  
  const storeProducts = await db.select().from(products).where(eq(products.storeId, storeId)).all();

  return c.json({ data: storeProducts });
});
