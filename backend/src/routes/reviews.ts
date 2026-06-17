import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { drizzle } from 'drizzle-orm/d1';
import { reviews, users } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { verify } from 'hono/jwt';

export const reviewRouter = new Hono<{ Bindings: { DB: D1Database, JWT_SECRET: string } }>();

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
    payload = await verify(token, secret);
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
