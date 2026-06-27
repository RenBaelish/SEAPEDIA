import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { orders, users, stores, wallets, walletMutations, categories, promos, products } from '../db/schema';
import { eq, inArray, sql, desc } from 'drizzle-orm';
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
    const payload = await verify(token, c.env.JWT_SECRET, "HS256") as any;
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
  const productCount = await db.select({ count: sql<number>`count(*)` }).from(products).get();
  const orderCount = await db.select({ count: sql<number>`count(*)` }).from(orders).get();
  
  const completedOrders = await db.select({ totalAmount: orders.totalAmount }).from(orders).where(eq(orders.status, 'PESANAN_SELESAI')).all();
  const revenue = completedOrders.reduce((sum, order) => sum + (order.totalAmount * 0.2), 0);
  
  return c.json({
    data: {
      users: userCount?.count || 0,
      stores: storeCount?.count || 0,
      products: productCount?.count || 0,
      orders: orderCount?.count || 0,
      revenue: revenue || 0,
    }
  });
});

adminRouter.get('/users', async (c) => {
  const db = drizzle(c.env.DB);
  const allUsers = await db.select({
    id: users.id,
    fullName: users.fullName,
    username: users.username,
    email: users.email,
    profilePictureUrl: users.profilePictureUrl,
    status: users.status,
    createdAt: users.createdAt
  }).from(users).orderBy(desc(users.createdAt)).all();

  return c.json({ data: allUsers });
});

adminRouter.put('/users/:id/status', async (c) => {
  const db = drizzle(c.env.DB);
  const userId = c.req.param('id');
  const body = await c.req.json();
  
  if (!['ACTIVE', 'BANNED'].includes(body.status)) {
    return c.json({ message: 'Invalid status' }, 400);
  }

  await db.update(users)
    .set({ status: body.status })
    .where(eq(users.id, userId));

  return c.json({ message: `User status updated to ${body.status}` });
});

adminRouter.get('/stores', async (c) => {
  const db = drizzle(c.env.DB);
  const allStores = await db.select().from(stores).orderBy(desc(stores.createdAt)).all();
  return c.json({ data: allStores });
});

adminRouter.put('/stores/:id/status', async (c) => {
  const db = drizzle(c.env.DB);
  const storeId = c.req.param('id');
  const body = await c.req.json();
  
  if (!['ACTIVE', 'SUSPENDED'].includes(body.status)) {
    return c.json({ message: 'Invalid status' }, 400);
  }

  await db.update(stores)
    .set({ status: body.status })
    .where(eq(stores.id, storeId));

  return c.json({ message: `Store status updated to ${body.status}` });
});

adminRouter.get('/categories', async (c) => {
  const db = drizzle(c.env.DB);
  const allCategories = await db.select().from(categories).all();
  return c.json({ data: allCategories });
});

adminRouter.post('/categories', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  if (!body.name || !body.slug) return c.json({ message: 'Name and slug required' }, 400);

  const existing = await db.select().from(categories).where(eq(categories.slug, body.slug)).get();
  if (existing) return c.json({ message: 'Category slug already exists' }, 400);

  await db.insert(categories).values({
    id: crypto.randomUUID(),
    name: body.name,
    slug: body.slug
  });

  return c.json({ message: 'Kategori berhasil ditambahkan' });
});

adminRouter.get('/promos', async (c) => {
  const db = drizzle(c.env.DB);
  const platformPromos = await db.select().from(promos).where(sql`${promos.storeId} IS NULL`).orderBy(desc(promos.createdAt)).all();
  return c.json({ data: platformPromos });
});

adminRouter.post('/promos', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  
  if (!body.code || !body.discountAmount || !body.quota) return c.json({ message: 'Incomplete data' }, 400);

  const existing = await db.select().from(promos).where(eq(promos.code, body.code)).get();
  if (existing) return c.json({ message: 'Promo code already exists' }, 400);

  await db.insert(promos).values({
    id: crypto.randomUUID(),
    storeId: null,
    code: body.code,
    discountAmount: body.discountAmount,
    type: body.type || 'DISCOUNT',
    quota: body.quota
  });

  return c.json({ message: 'Promo platform berhasil dibuat' });
});

adminRouter.delete('/promos/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const promoId = c.req.param('id');
  
  await db.delete(promos).where(eq(promos.id, promoId));
  return c.json({ message: 'Promo berhasil dihapus' });
});

adminRouter.put('/promos/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const promoId = c.req.param('id');
  const body = await c.req.json();

  if (!body.discountAmount || !body.quota) {
    return c.json({ message: 'Incomplete data' }, 400);
  }

  await db.update(promos).set({
    discountAmount: body.discountAmount,
    quota: body.quota
  }).where(eq(promos.id, promoId));

  return c.json({ message: 'Promo berhasil diperbarui' });
});

adminRouter.get('/analytics', async (c) => {
  const db = drizzle(c.env.DB);
  
  const topStores = await db.select({
    id: stores.id,
    name: stores.name,
    slug: stores.slug,
    orderCount: sql<number>`count(${orders.id})`
  })
  .from(stores)
  .leftJoin(orders, eq(orders.storeId, stores.id))
  .groupBy(stores.id)
  .orderBy(desc(sql<number>`count(${orders.id})`))
  .limit(5)
  .all();

  const topProductsRaw = await db.select({
    id: products.id,
    name: products.name,
    sold: products.sold,
    price: products.price,
    images: products.images
  })
  .from(products)
  .orderBy(desc(products.sold))
  .limit(5)
  .all();

  const topProducts = topProductsRaw.map(p => {
    let firstImage = 'https://i.pinimg.com/736x/d9/5f/28/d95f284e3d6f1c4e7ab5a7ecb9308e0d.jpg';
    try {
      const imgs = JSON.parse(p.images as string || '[]');
      if (imgs.length > 0) firstImage = imgs[0];
    } catch(e) {}
    return {
      id: p.id,
      name: p.name,
      sold: p.sold,
      price: p.price,
      thumbnailUrl: firstImage
    };
  });

  return c.json({
    data: {
      topStores,
      topProducts
    }
  });
});

adminRouter.post('/overdue/simulate', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json().catch(() => ({}));
  const hoursToAdvance = body.hoursToAdvance || 24;

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const simulatedTime = currentTimestamp + (hoursToAdvance * 60 * 60);

  const activeOrders = await db.select().from(orders).where(
    sql`${orders.status} IN ('SEDANG_DIKEMAS', 'SEDANG_DIKIRIM')`
  ).all();
  
  let refundedCount = 0;

  for (const order of activeOrders) {
    const createdAtSeconds = Math.floor(new Date(order.createdAt).getTime() / 1000);
    const hoursElapsed = (simulatedTime - createdAtSeconds) / 3600;
    
    let shouldCancel = false;
    
    if (order.status === 'SEDANG_DIKEMAS' && hoursElapsed >= 24) {
      shouldCancel = true;
    } else if (order.status === 'SEDANG_DIKIRIM' && hoursElapsed >= 72) {
      shouldCancel = true;
    }

    if (shouldCancel) {
      await db.update(orders).set({ status: 'DIKEMBALIKAN' }).where(eq(orders.id, order.id));
      
      const buyerWallet = await db.select().from(wallets).where(eq(wallets.userId, order.buyerId)).get();
      if (buyerWallet) {
        await db.update(wallets).set({ balance: buyerWallet.balance + order.totalAmount }).where(eq(wallets.id, buyerWallet.id));
        
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

  return c.json({ message: `Simulasi waktu maju ${hoursToAdvance} jam berhasil dijalankan. ${refundedCount} pesanan dibatalkan secara otomatis (Refund).` });
});
