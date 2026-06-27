import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { drizzle } from 'drizzle-orm/d1';
import { addresses } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { verify } from 'hono/jwt';
import type { Env } from '../types';

export const addressRouter = new Hono<Env>();

addressRouter.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  const token = authHeader.split(' ')[1];
  const secret = c.env.JWT_SECRET || 'fallback_secret';

  try {
    const payload = await verify(token, secret, "HS256");
    c.set('jwtPayload', payload);
    await next();
  } catch (err) {
    return c.json({ message: 'Invalid token' }, 401);
  }
});

addressRouter.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const payload = c.get('jwtPayload') as any;

  const userAddresses = await db.select().from(addresses).where(eq(addresses.userId, payload.id));
  return c.json({ data: userAddresses });
});

const createAddressSchema = z.object({
  label: z.string().min(1),
  recipientName: z.string().min(1),
  phone: z.string().min(8),
  street: z.string().min(1),
  city: z.string().min(1),
  province: z.string().min(1),
  postalCode: z.string().min(1),
  isDefault: z.boolean().optional().default(false),
});

addressRouter.post('/', zValidator('json', createAddressSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const payload = c.get('jwtPayload') as any;
  const data = c.req.valid('json');

  const addressId = crypto.randomUUID();

  if (data.isDefault) {
    await db.update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.userId, payload.id));
  }

  const existingCount = await db.select().from(addresses).where(eq(addresses.userId, payload.id));
  const isDefault = existingCount.length === 0 ? true : data.isDefault;

  await db.insert(addresses).values({
    id: addressId,
    userId: payload.id,
    label: data.label,
    recipientName: data.recipientName,
    phone: data.phone,
    street: data.street,
    city: data.city,
    province: data.province,
    postalCode: data.postalCode,
    isDefault,
  });

  return c.json({ message: 'Address created successfully', data: { id: addressId } }, 201);
});

addressRouter.patch('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const payload = c.get('jwtPayload') as any;
  const id = c.req.param('id');
  const data = await c.req.json();

  if (data.isDefault) {
    await db.update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.userId, payload.id));
  }

  await db.update(addresses)
    .set({ ...data })
    .where(and(eq(addresses.id, id), eq(addresses.userId, payload.id)));

  return c.json({ message: 'Address updated successfully' });
});

addressRouter.delete('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const payload = c.get('jwtPayload') as any;
  const id = c.req.param('id');

  await db.delete(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, payload.id)));

  return c.json({ message: 'Address deleted successfully' });
});
