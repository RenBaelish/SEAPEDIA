import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { drizzle } from 'drizzle-orm/d1';
import { reviews, users } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { verify } from 'hono/jwt';
import type { Env } from '../types';

export const reviewRouter = new Hono<Env>();

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(3)
});

reviewRouter.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  
  const allReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      user: {
        id: users.id,
        fullName: users.fullName,
        username: users.username,
        profilePictureUrl: users.profilePictureUrl
      }
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .orderBy(desc(reviews.createdAt));

  return c.json({ data: allReviews });
});

reviewRouter.post('/', zValidator('json', reviewSchema), async (c) => {
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

  const reviewId = crypto.randomUUID();

  await db.insert(reviews).values({
    id: reviewId,
    userId: payload.id as string,
    rating: data.rating,
    comment: data.comment
  });

  return c.json({ message: 'Review added successfully' }, 201);
});

const appReviewSchema = z.object({
  guestName: z.string().min(2),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10)
});

reviewRouter.get('/app', async (c) => {
  const db = drizzle(c.env.DB);
  
  const appReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      guestName: reviews.guestName,
      user: {
        id: users.id,
        fullName: users.fullName,
        username: users.username,
        profilePictureUrl: users.profilePictureUrl
      }
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .orderBy(desc(reviews.createdAt));

  const formattedReviews = appReviews.map(r => ({
    id: r.id,
    guestName: r.guestName || r.user?.fullName || 'Anonymous',
    profilePictureUrl: r.user?.profilePictureUrl || null,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt
  }));

  return c.json({ data: formattedReviews });
});

reviewRouter.post('/app', zValidator('json', appReviewSchema), async (c) => {
  const authHeader = c.req.header('Authorization');
  let userId = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = await verify(token, c.env.JWT_SECRET, "HS256");
      userId = payload.id as string;
    } catch (err) {
      
    }
  }

  const db = drizzle(c.env.DB);
  const data = c.req.valid('json');
  const reviewId = crypto.randomUUID();

  await db.insert(reviews).values({
    id: reviewId,
    userId: userId as string,
    guestName: data.guestName,
    rating: data.rating,
    comment: data.comment
  });

  return c.json({ message: 'App review added successfully' }, 201);
});

reviewRouter.post('/product', zValidator('json', z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(3),
  orderId: z.string(),
  productId: z.string()
})), async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return c.json({ message: 'Unauthorized' }, 401);

  const token = authHeader.split(' ')[1];
  let payload;
  try {
    payload = await verify(token, c.env.JWT_SECRET, "HS256");
  } catch (err) {
    return c.json({ message: 'Invalid token' }, 401);
  }

  const db = drizzle(c.env.DB);
  const data = c.req.valid('json');
  const userId = payload.id as string;

  const { orders, orderItems, products, stores } = await import('../db/schema');
  const { eq, and } = await import('drizzle-orm');

  const order = await db.select().from(orders).where(and(eq(orders.id, data.orderId), eq(orders.buyerId, userId))).get();
  if (!order) return c.json({ message: 'Pesanan tidak ditemukan' }, 404);
  if (order.status !== 'PESANAN_SELESAI') return c.json({ message: 'Hanya pesanan selesai yang dapat diulas' }, 400);

  const item = await db.select().from(orderItems).where(and(eq(orderItems.orderId, data.orderId), eq(orderItems.productId, data.productId))).get();
  if (!item) return c.json({ message: 'Produk tidak ditemukan dalam pesanan ini' }, 404);

  const existingReview = await db.select().from(reviews).where(and(eq(reviews.orderId, data.orderId), eq(reviews.productId, data.productId))).get();
  if (existingReview) return c.json({ message: 'Anda sudah mengulas produk ini' }, 400);

  await db.insert(reviews).values({
    id: crypto.randomUUID(),
    userId,
    productId: data.productId,
    orderId: data.orderId,
    rating: data.rating,
    comment: data.comment
  });

  const allReviews = await db.select().from(reviews).where(eq(reviews.productId, data.productId)).all();
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  await db.update(products).set({ rating: avgRating }).where(eq(products.id, data.productId));

  const storeProducts = await db.select().from(products).where(eq(products.storeId, order.storeId)).all();
  let totalRating = 0;
  let ratedProducts = 0;
  for (const p of storeProducts) {
    if (p.rating && p.rating > 0) {
      totalRating += p.rating;
      ratedProducts++;
    }
  }
  const storeRating = ratedProducts > 0 ? totalRating / ratedProducts : 0;
  await db.update(stores).set({ rating: storeRating }).where(eq(stores.id, order.storeId));

  return c.json({ message: 'Ulasan berhasil disimpan' }, 201);
});

reviewRouter.get('/product/:productId', async (c) => {
  const db = drizzle(c.env.DB);
  const productId = c.req.param('productId');
  const { eq, desc } = await import('drizzle-orm');
  
  const productReviews = await db.select({
    id: reviews.id,
    rating: reviews.rating,
    comment: reviews.comment,
    createdAt: reviews.createdAt,
    user: {
      fullName: users.fullName,
      profilePictureUrl: users.profilePictureUrl
    }
  })
  .from(reviews)
  .innerJoin(users, eq(reviews.userId, users.id))
  .where(eq(reviews.productId, productId))
  .orderBy(desc(reviews.createdAt))
  .all();

  return c.json({ data: productReviews });
});
