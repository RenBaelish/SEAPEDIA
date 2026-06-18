import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { orders, users, stores, wallets, walletMutations } from '../db/schema';
import { eq, inArray, sql } from 'drizzle-orm';
import { verify } from 'hono/jwt';
import type { Env } from '../types';

export const adminRouter = new Hono<Env>();

const adminMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ message: 'Unauthorized' }, 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = await verify(token, c.env.JWT_SECRET || 'fallback_secret', "HS256") as any;
    if (!payload.roles || !payload.roles.includes('ADMIN')) {
      return c.json({ message: 'Forbidden: Admins only' }, 403);
    }
    c.set('user', payload);
    await next();
  } catch (err) {
    return c.json({ message: 'Invalid token' }, 401);
  }
};

adminRouter.use('*', adminMiddleware);

adminRouter.get('/dashboard', async (c) => {
  const db = drizzle(c.env.DB);
  
  const userCount = await db.select({ count: sql<number>`count(*)` }).from(users).get();
  const storeCount = await db.select({ count: sql<number>`count(*)` }).from(stores).get();
  const activeOrders = await db.select({ count: sql<number>`count(*)` }).from(orders).where(inArray(orders.status, ['SEDANG_DIKEMAS', 'MENUNGGU_PENGIRIM', 'SEDANG_DIKIRIM'])).get();
  const completedOrders = await db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, 'PESANAN_SELESAI')).get();
  
  return c.json({
    data: {
      users: userCount?.count || 0,
      stores: storeCount?.count || 0,
      activeOrders: activeOrders?.count || 0,
      completedOrders: completedOrders?.count || 0,
    }
  });
});

adminRouter.post('/trigger-overdue', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json().catch(() => ({}));
  const daysOffset = body.daysOffset || 3; // Default 3 days to simulate overdue

  // In SQLite, date manipulation is tricky if stored as integer timestamps
  // We'll calculate the threshold timestamp in seconds
  const thresholdTimestamp = Math.floor(Date.now() / 1000) - (daysOffset * 24 * 60 * 60);

  // Find orders that are SEDANG_DIKEMAS and were created BEFORE the threshold
  const overdueOrders = await db.select().from(orders)
    .where(sql`${orders.status} = 'SEDANG_DIKEMAS' AND ${orders.createdAt} < datetime(${thresholdTimestamp}, 'unixepoch')`)
    .all();

  // If we can't do datetime comparisons easily with integers, let's just fetch all SEDANG_DIKEMAS and filter in JS
  // Since we stored createdAt as timestamp integer
  const allPackingOrders = await db.select().from(orders).where(eq(orders.status, 'SEDANG_DIKEMAS')).all();
  
  let refundedCount = 0;

  for (const order of allPackingOrders) {
    const createdAtSeconds = Math.floor(new Date(order.createdAt).getTime() / 1000);
    
    // If order is older than threshold
    if (createdAtSeconds < thresholdTimestamp) {
      // 1. Update order status to DIKEMBALIKAN
      await db.update(orders).set({ status: 'DIKEMBALIKAN' }).where(eq(orders.id, order.id));
      
      // 2. Refund to buyer
      const buyerWallet = await db.select().from(wallets).where(eq(wallets.userId, order.buyerId)).get();
      if (buyerWallet) {
        await db.update(wallets).set({ balance: buyerWallet.balance + order.totalAmount }).where(eq(wallets.id, buyerWallet.id));
        
        // Log mutation
        await db.insert(walletMutations).values({
          id: crypto.randomUUID(),
          walletId: buyerWallet.id,
          amount: order.totalAmount,
          type: 'REFUND',
          description: `(Auto-Refund) Pengembalian dana keterlambatan pesanan ${order.id}`
        });
      }
      refundedCount++;
    }
  }

  return c.json({ message: `Simulasi waktu maju ${daysOffset} hari berhasil dijalankan. ${refundedCount} pesanan dibatalkan secara otomatis (Refund).` });
});
