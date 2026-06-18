import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { drizzle } from 'drizzle-orm/d1';
import { stores } from '../db/schema';
import { eq } from 'drizzle-orm';
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

// Get All Stores (Public)
storeRouter.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const allStores = await db.select().from(stores).all();
  return c.json({ data: allStores });
});

// Get Store by ID (Public)
storeRouter.get('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const storeId = c.req.param('id');
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).get();

  if (!store) {
    return c.json({ message: 'Store not found' }, 404);
  }

  return c.json({ data: store });
});
