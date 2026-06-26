import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { drizzle } from 'drizzle-orm/d1';
import { stores, products, orders } from '../db/schema';
import { eq, sql, or } from 'drizzle-orm';
import { verify } from 'hono/jwt';
import type { Env } from '../types';

export const storeRouter = new Hono<Env>();

const storeSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional()
});

// Create Store
storeRouter.post('/', zValidator('json', storeSchema), async (c) => {
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

  const roles = payload.roles as string[];
  if (!roles.includes('SELLER')) {
    return c.json({ message: 'Forbidden. Only sellers can create a store.' }, 403);
  }

  const db = drizzle(c.env.DB);
  const data = c.req.valid('json');

  // Check if owner already has a store
  const existingStore = await db.select().from(stores).where(eq(stores.ownerId, payload.id as string)).get();
  if (existingStore) {
    return c.json({ message: 'You already have a store' }, 400);
  }

  const storeId = crypto.randomUUID();

  await db.insert(stores).values({
    id: storeId,
    ownerId: payload.id as string,
    name: data.name,
    slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: data.description || ''
  });

  return c.json({ message: 'Store created successfully', storeId }, 201);
});

// Get My Store
storeRouter.get('/me', async (c) => {
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
    return c.json({ message: 'Store not found' }, 404);
  }

  return c.json({ data: store });
});

// Get My Store Stats
storeRouter.get('/me/stats', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return c.json({ message: 'Unauthorized' }, 401);

  const token = authHeader.split(' ')[1];
  let payload;
  try {
    payload = await verify(token, c.env.JWT_SECRET || 'fallback_secret', "HS256");
  } catch (err) {
    return c.json({ message: 'Invalid token' }, 401);
  }

  const db = drizzle(c.env.DB);
  const store = await db.select().from(stores).where(eq(stores.ownerId, payload.id as string)).get();
  
  if (!store) return c.json({ message: 'Store not found' }, 404);

  const productCount = await db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.storeId, store.id)).get();
  const storeOrders = await db.select({ totalAmount: orders.totalAmount, status: orders.status }).from(orders).where(eq(orders.storeId, store.id)).all();
  
  const totalSalesCount = storeOrders.filter(o => o.status === 'PESANAN_SELESAI').length;
  const totalIncome = storeOrders.filter(o => o.status === 'PESANAN_SELESAI').reduce((sum, order) => sum + order.totalAmount, 0);

  return c.json({ 
    data: {
      store: {
        ...store,
        _count: { products: productCount?.count || 0 },
        totalSales: totalSalesCount
      },
      income: { totalIncome }
    }
  });
});

const updateStoreSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
});

// Update My Store
storeRouter.patch('/me', zValidator('json', updateStoreSchema), async (c) => {
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
  const data = c.req.valid('json');

  const store = await db.select().from(stores).where(eq(stores.ownerId, payload.id as string)).get();
  if (!store) {
    return c.json({ message: 'Store not found' }, 404);
  }

  const updates: any = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.description !== undefined) updates.description = data.description;
  if (data.logoUrl !== undefined) updates.logoUrl = data.logoUrl;
  if (data.bannerUrl !== undefined) updates.bannerUrl = data.bannerUrl;

  await db.update(stores).set(updates).where(eq(stores.id, store.id));

  const updatedStore = await db.select().from(stores).where(eq(stores.id, store.id)).get();
  return c.json({ data: updatedStore });
});

// Get All Stores (Public)
storeRouter.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const allStores = await db.select().from(stores).all();
  return c.json({ data: allStores });
});

// Get Store by ID or Slug (Public)
storeRouter.get('/:idOrSlug', async (c) => {
  const db = drizzle(c.env.DB);
  const idOrSlug = c.req.param('idOrSlug');
  const store = await db.select().from(stores).where(or(eq(stores.id, idOrSlug), eq(stores.slug, idOrSlug))).get();

  if (!store) {
    return c.json({ message: 'Store not found' }, 404);
  }

  return c.json({ data: store });
});

// Get Store Products (Public)
storeRouter.get('/:idOrSlug/products', async (c) => {
  const db = drizzle(c.env.DB);
  const idOrSlug = c.req.param('idOrSlug');
  const store = await db.select().from(stores).where(or(eq(stores.id, idOrSlug), eq(stores.slug, idOrSlug))).get();

  if (!store) {
    return c.json({ message: 'Store not found' }, 404);
  }

  const storeProducts = await db.select().from(products).where(eq(products.storeId, store.id)).all();
  
  const mappedProducts = storeProducts.map(p => ({
    ...p,
    storeName: store.name,
    images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : p.images
  }));

  return c.json({ data: mappedProducts });
});
