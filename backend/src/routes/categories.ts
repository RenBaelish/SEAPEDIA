import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { categories } from '../db/schema';
import type { Env } from '../types';

export const categoryRouter = new Hono<Env>();

categoryRouter.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const allCategories = await db.select().from(categories).all();
  return c.json({ data: allCategories });
});
