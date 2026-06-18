import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { orders, deliveryJobs, stores, addresses } from '../db/schema';
import { eq, isNull, and } from 'drizzle-orm';
import { verify } from 'hono/jwt';
import type { Env } from '../types';

export const deliveryRouter = new Hono<Env>();

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

deliveryRouter.use('*', authMiddleware);

// Driver: Get Available Jobs (Orders waiting for driver)
deliveryRouter.get('/available', async (c) => {
  const db = drizzle(c.env.DB);
  
  // Create jobs for MENUNGGU_PENGIRIM if they don't exist yet
  const waitingOrders = await db.select().from(orders).where(eq(orders.status, 'MENUNGGU_PENGIRIM')).all();
  for (const order of waitingOrders) {
    const existingJob = await db.select().from(deliveryJobs).where(eq(deliveryJobs.orderId, order.id)).get();
    if (!existingJob) {
      await db.insert(deliveryJobs).values({
        id: crypto.randomUUID(),
        orderId: order.id,
        status: 'MENUNGGU_DRIVER'
      });
    }
  }

  // Fetch available jobs
  const availableJobs = await db.select({
    id: deliveryJobs.id,
    orderId: deliveryJobs.orderId,
    status: deliveryJobs.status,
    totalAmount: orders.totalAmount,
    deliveryFee: orders.deliveryFee,
    createdAt: deliveryJobs.createdAt
  })
  .from(deliveryJobs)
  .innerJoin(orders, eq(deliveryJobs.orderId, orders.id))
  .where(eq(deliveryJobs.status, 'MENUNGGU_DRIVER'))
  .all();

  return c.json({ data: availableJobs });
});

// Driver: Take Job
deliveryRouter.post('/:id/take', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user') as any;
  const jobId = c.req.param('id');

  // Verify role
  if (!user.roles.includes('DRIVER')) {
    return c.json({ message: 'Forbidden' }, 403);
  }

  const job = await db.select().from(deliveryJobs).where(eq(deliveryJobs.id, jobId)).get();
  if (!job) return c.json({ message: 'Job not found' }, 404);
  if (job.status !== 'MENUNGGU_DRIVER') return c.json({ message: 'Job is already taken' }, 400);

  // Update job
  await db.update(deliveryJobs).set({
    driverId: user.id as string,
    status: 'DIKIRIM'
  }).where(eq(deliveryJobs.id, jobId));

  // Update order status
  await db.update(orders).set({
    status: 'SEDANG_DIKIRIM'
  }).where(eq(orders.id, job.orderId));

  return c.json({ message: 'Job taken successfully' });
});

// Driver: My Active Jobs
deliveryRouter.get('/my-jobs', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user') as any;

  const myJobs = await db.select({
    id: deliveryJobs.id,
    orderId: deliveryJobs.orderId,
    status: deliveryJobs.status,
    totalAmount: orders.totalAmount,
    deliveryFee: orders.deliveryFee,
    createdAt: deliveryJobs.createdAt
  })
  .from(deliveryJobs)
  .innerJoin(orders, eq(deliveryJobs.orderId, orders.id))
  .where(eq(deliveryJobs.driverId, user.id as string))
  .all();

  return c.json({ data: myJobs });
});

// Driver: Complete Job
deliveryRouter.post('/:id/complete', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user') as any;
  const jobId = c.req.param('id');

  const job = await db.select().from(deliveryJobs).where(and(eq(deliveryJobs.id, jobId), eq(deliveryJobs.driverId, user.id as string))).get();
  if (!job) return c.json({ message: 'Job not found or not yours' }, 404);
  if (job.status === 'SELESAI') return c.json({ message: 'Job already completed' }, 400);

  // Update job
  await db.update(deliveryJobs).set({
    status: 'SELESAI',
    completedAt: new Date()
  }).where(eq(deliveryJobs.id, jobId));

  // Update order status (Trigger payment to seller which is already handled in orderRouter or here)
  // To avoid duplicate logic, let's just make an internal call or duplicate the logic for PESANAN_SELESAI.
  // Actually, we should just update order status and let the order router's PUT /orders/:id/status handle it, or duplicate it here.
  // Let's duplicate the seller payment logic here so the driver finishing it pays the seller.
  const order = await db.select().from(orders).where(eq(orders.id, job.orderId)).get();
  if (order) {
    await db.update(orders).set({ status: 'PESANAN_SELESAI' }).where(eq(orders.id, job.orderId));
    
    // Add income to seller
    const { wallets, stores, walletMutations } = await import('../db/schema');
    const store = await db.select().from(stores).where(eq(stores.id, order.storeId)).get();
    if (store) {
      let sellerWallet = await db.select().from(wallets).where(eq(wallets.userId, store.ownerId)).get();
      let sellerWalletId = sellerWallet?.id;
      if (sellerWallet) {
        await db.update(wallets).set({ balance: sellerWallet.balance + order.totalAmount }).where(eq(wallets.id, sellerWallet.id));
      } else {
        sellerWalletId = crypto.randomUUID();
        await db.insert(wallets).values({ id: sellerWalletId, userId: store.ownerId, balance: order.totalAmount });
      }

      await db.insert(walletMutations).values({
        id: crypto.randomUUID(),
        walletId: sellerWalletId as string,
        amount: order.totalAmount,
        type: 'INCOME',
        description: `Penjualan pesanan ${order.id} selesai dikirim`
      });
    }

    // Add delivery fee income to driver
    let driverWallet = await db.select().from(wallets).where(eq(wallets.userId, user.id as string)).get();
    let driverWalletId = driverWallet?.id;
    if (driverWallet) {
      await db.update(wallets).set({ balance: driverWallet.balance + order.deliveryFee }).where(eq(wallets.id, driverWallet.id));
    } else {
      driverWalletId = crypto.randomUUID();
      await db.insert(wallets).values({ id: driverWalletId, userId: user.id as string, balance: order.deliveryFee });
    }

    await db.insert(walletMutations).values({
      id: crypto.randomUUID(),
      walletId: driverWalletId as string,
      amount: order.deliveryFee,
      type: 'INCOME',
      description: `Pendapatan pengiriman pesanan ${order.id}`
    });
  }

  return c.json({ message: 'Job completed successfully' });
});
