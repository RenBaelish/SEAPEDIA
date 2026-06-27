import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { drizzle } from 'drizzle-orm/d1';
import { wallets, walletMutations } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { verify } from 'hono/jwt';
import type { Env } from '../types';

export const walletRouter = new Hono<Env>();

walletRouter.get('/', async (c) => {
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
  let wallet = await db.select().from(wallets).where(eq(wallets.userId, payload.id as string)).get();

  if (!wallet) {
    const walletId = crypto.randomUUID();
    await db.insert(wallets).values({
      id: walletId,
      userId: payload.id as string,
      balance: 0
    });
    wallet = { id: walletId, userId: payload.id as string, balance: 0 };
  }

  return c.json({ data: wallet });
});

const topupSchema = z.object({
  amount: z.number().min(1000)
});

walletRouter.post('/topup', zValidator('json', topupSchema), async (c) => {
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
  const data = c.req.valid('json');

  let wallet = await db.select().from(wallets).where(eq(wallets.userId, payload.id as string)).get();

  let currentWalletId = wallet?.id;
  if (!wallet) {
    const walletId = crypto.randomUUID();
    await db.insert(wallets).values({
      id: walletId,
      userId: payload.id as string,
      balance: data.amount
    });
    currentWalletId = walletId;
  } else {
    await db.update(wallets).set({
      balance: wallet.balance + data.amount
    }).where(eq(wallets.id, wallet.id));
  }

  await db.insert(walletMutations).values({
    id: crypto.randomUUID(),
    walletId: currentWalletId as string,
    amount: data.amount,
    type: 'TOP_UP',
    description: 'Top up saldo'
  });

  return c.json({ message: 'Top up successful' });
});

walletRouter.get('/transactions', async (c) => {
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
  const wallet = await db.select().from(wallets).where(eq(wallets.userId, payload.id as string)).get();

  if (!wallet) {
    return c.json({ data: [] });
  }

  const mutations = await db.select().from(walletMutations)
    .where(eq(walletMutations.walletId, wallet.id))
    .orderBy(desc(walletMutations.createdAt))
    .all();

  return c.json({ data: mutations });
});
