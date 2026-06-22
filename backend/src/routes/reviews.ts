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
        username: users.username
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
  const secret = c.env.JWT_SECRET || 'fallback_secret';

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
        username: users.username
      }
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id)) // leftJoin because guestName reviews have no user
    .orderBy(desc(reviews.createdAt));

  // Format to standard shape for frontend
  const formattedReviews = appReviews.map(r => ({
    id: r.id,
    guestName: r.guestName || r.user?.fullName || 'Anonymous',
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt
  }));

  return c.json({ data: formattedReviews });
});

reviewRouter.post('/app', zValidator('json', appReviewSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const data = c.req.valid('json');

  const reviewId = crypto.randomUUID();

  await db.insert(reviews).values({
    id: reviewId,
    guestName: data.guestName,
    rating: data.rating,
    comment: data.comment
  });

  return c.json({ message: 'App review added successfully' }, 201);
});
