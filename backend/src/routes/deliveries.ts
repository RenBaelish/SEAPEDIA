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
  const jobs = await db.select({
    id: deliveryJobs.id,
    orderId: deliveryJobs.orderId,
    status: deliveryJobs.status,
    totalAmount: orders.totalAmount,
    deliveryFee: orders.deliveryFee,
    createdAt: deliveryJobs.createdAt,
    storeName: stores.name,
    buyerId: orders.buyerId
  })
  .from(deliveryJobs)
  .innerJoin(orders, eq(deliveryJobs.orderId, orders.id))
  .innerJoin(stores, eq(orders.storeId, stores.id))
  .where(eq(deliveryJobs.status, 'MENUNGGU_DRIVER'))
  .all();

  // Attach addresses
  const availableJobs = await Promise.all(jobs.map(async (job) => {
    const address = await db.select().from(addresses).where(and(eq(addresses.userId, job.buyerId), eq(addresses.isDefault, true))).get();
    return {
      ...job,
      pickupAddress: `Toko ${job.storeName}`,
      dropAddress: address ? `${address.street}, ${address.city}` : 'Alamat Pembeli',
      order: { store: { name: job.storeName } }
    };
  }));

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

  const jobs = await db.select({
    id: deliveryJobs.id,
    orderId: deliveryJobs.orderId,
    status: deliveryJobs.status,
    totalAmount: orders.totalAmount,
    deliveryFee: orders.deliveryFee,
    createdAt: deliveryJobs.createdAt,
    storeName: stores.name,
    buyerId: orders.buyerId
  })
  .from(deliveryJobs)
  .innerJoin(orders, eq(deliveryJobs.orderId, orders.id))
  .innerJoin(stores, eq(orders.storeId, stores.id))
  .where(eq(deliveryJobs.driverId, user.id as string))
  .all();

  const myJobs = await Promise.all(jobs.map(async (job) => {
    const address = await db.select().from(addresses).where(and(eq(addresses.userId, job.buyerId), eq(addresses.isDefault, true))).get();
    return {
      ...job,
      pickupAddress: `Toko ${job.storeName}`,
      dropAddress: address ? `${address.street}, ${address.city}` : 'Alamat Pembeli',
      order: { store: { name: job.storeName } }
    };
  }));

  return c.json({ data: myJobs });
});

// Driver: Get Earnings Report
deliveryRouter.get('/earnings', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user') as any;

  // Assuming walletMutations records the driver earnings. Let's fetch them.
  const { wallets, walletMutations } = await import('../db/schema');
  
  const myWallet = await db.select().from(wallets).where(eq(wallets.userId, user.id as string)).get();
  
  let history: any[] = [];
  if (myWallet) {
    history = await db.select().from(walletMutations).where(eq(walletMutations.walletId, myWallet.id)).orderBy(walletMutations.createdAt).all();
    history = history.reverse(); // Latest first
  }

  // Calculate total earnings (only from INCOME type)
  const totalEarnings = history.filter(h => h.type === 'INCOME').reduce((sum, h) => sum + h.amount, 0);

  // We map history to calculate running balance and attach order details
  let runningBalance = 0;
  const historyWithBalance = await Promise.all([...history].reverse().map(async (h) => {
    runningBalance += h.amount;
    
    let orderDetails = null;
    if (h.type === 'INCOME' && h.description.includes('pesanan ')) {
      const orderIdMatch = h.description.match(/pesanan ([\w-]+)/);
      const orderId = orderIdMatch ? orderIdMatch[1] : null;
      if (orderId) {
        const order = await db.select().from(orders).where(eq(orders.id, orderId)).get();
        if (order) {
          const store = await db.select().from(stores).where(eq(stores.id, order.storeId)).get();
          const address = await db.select().from(addresses).where(eq(addresses.userId, order.buyerId)).get();
          orderDetails = {
            id: order.id,
            storeName: store?.name || 'Toko',
            buyerName: address?.recipientName || 'Pembeli',
            dropAddress: address ? `${address.street}, ${address.city}` : 'Alamat',
            deliveryFee: order.deliveryFee
          };
        }
      }
    }

    return { ...h, balanceAfter: runningBalance, order: orderDetails };
  }));
  const finalHistory = historyWithBalance.reverse();

  return c.json({ 
    data: {
      totalEarnings,
      history: finalHistory
    } 
  });
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

  // Update order status to TERKIRIM (Buyer hasn't confirmed yet)
  const order = await db.select().from(orders).where(eq(orders.id, job.orderId)).get();
  if (order) {
    await db.update(orders).set({ status: 'TERKIRIM' }).where(eq(orders.id, job.orderId));
    
    // Add delivery fee income to driver (Minus 10% platform commission)
    const { wallets, walletMutations } = await import('../db/schema');
    const netFee = Math.floor(order.deliveryFee * 0.9);

    let driverWallet = await db.select().from(wallets).where(eq(wallets.userId, user.id as string)).get();
    let driverWalletId = driverWallet?.id;
    if (driverWallet) {
      await db.update(wallets).set({ balance: driverWallet.balance + netFee }).where(eq(wallets.id, driverWallet.id));
    } else {
      driverWalletId = crypto.randomUUID();
      await db.insert(wallets).values({ id: driverWalletId, userId: user.id as string, balance: netFee });
    }

    await db.insert(walletMutations).values({
      id: crypto.randomUUID(),
      walletId: driverWalletId as string,
      amount: netFee,
      type: 'INCOME',
      description: `Pendapatan pengiriman pesanan ${order.id} (Dipotong Komisi 10%)`
    });
  }

  return c.json({ message: 'Job completed successfully' });
});
