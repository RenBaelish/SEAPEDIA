import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { drizzle } from 'drizzle-orm/d1';
import { promos, stores } from '../db/schema';
import { eq } from 'drizzle-orm';
import { verify } from 'hono/jwt';
import type { Env } from '../types';

export const promoRouter = new Hono<Env>();

const promoSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  discountAmount: z.number().min(1000),
  type: z.enum(['SHIPPING', 'DISCOUNT']),
  quota: z.number().min(1)
});

promoRouter.post('/', zValidator('json', promoSchema), async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  const token = authHeader.split(' ')[1];
  const secret = c.env.JWT_SECRET;

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

  const data = c.req.valid('json');

  const existingPromo = await db.select().from(promos).where(eq(promos.code, data.code)).get();
  if (existingPromo) {
    return c.json({ message: 'Promo code already exists' }, 400);
  }

  await db.insert(promos).values({
    id: crypto.randomUUID(),
    storeId: store.id,
    code: data.code,
    discountAmount: data.discountAmount,
    type: data.type,
    quota: data.quota
  });

  return c.json({ message: 'Promo created successfully' }, 201);
});

promoRouter.get('/mine', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  const token = authHeader.split(' ')[1];
  const secret = c.env.JWT_SECRET;

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

  const storePromos = await db.select().from(promos).where(eq(promos.storeId, store.id)).all();
  return c.json({ data: storePromos });
});

promoRouter.get('/store/:storeId', async (c) => {
  const db = drizzle(c.env.DB);
  const storeId = c.req.param('storeId');
  const storePromos = await db.select().from(promos).where(eq(promos.storeId, storeId)).all();
  return c.json({ data: storePromos });
});

promoRouter.post('/apply', async (c) => {
  const body = await c.req.json();
  const db = drizzle(c.env.DB);

  if (!body.code || !body.storeId) {
    return c.json({ message: 'Invalid request' }, 400);
  }

  const promo = await db.select().from(promos).where(eq(promos.code, body.code)).get();
  if (!promo) return c.json({ message: 'Kode promo tidak ditemukan' }, 404);
  
  if (promo.storeId !== body.storeId) return c.json({ message: 'Kode promo tidak berlaku untuk toko ini' }, 400);
  if (promo.quota <= 0) return c.json({ message: 'Kuota promo telah habis' }, 400);

  return c.json({ data: promo });
});
