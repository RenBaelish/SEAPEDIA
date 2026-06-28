import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { drizzle } from 'drizzle-orm/d1';
import { products, stores, categories } from '../db/schema';
import { eq, and, like, or, desc, asc } from 'drizzle-orm';
import { verify } from 'hono/jwt';
import type { Env } from '../types';

export const productRouter = new Hono<Env>();

const productSchema = z.object({
  name: z.string().min(3),
  description: z.string(),
  price: z.number().min(0),
  comparePrice: z.number().min(0).optional(),
  stock: z.number().min(0),
  weight: z.number().min(0).optional(),
  categoryId: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'DELETED']).optional(),
  images: z.array(z.string().url()).max(8).optional()
});

productRouter.post('/', zValidator('json', productSchema), async (c) => {
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
  
  const store = await db.select().from(stores).where(eq(stores.ownerId, payload.id as string)).get();
  if (!store) {
    return c.json({ message: 'Forbidden. You do not have a store.' }, 403);
  }

  const data = c.req.valid('json');
  const productId = crypto.randomUUID();
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + crypto.randomUUID().substring(0, 8);

  await db.insert(products).values({
    id: productId,
    storeId: store.id,
    categoryId: data.categoryId,
    name: data.name,
    slug: slug,
    description: data.description,
    price: data.price,
    comparePrice: data.comparePrice,
    stock: data.stock,
    weight: data.weight,
    status: data.status,
    images: JSON.stringify(data.images || [])
  });

  return c.json({ message: 'Product created successfully', productId }, 201);
});

productRouter.put('/:id', zValidator('json', productSchema), async (c) => {
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
  const store = await db.select().from(stores).where(eq(stores.ownerId, payload.id as string)).get();
  if (!store) {
    return c.json({ message: 'Forbidden. You do not have a store.' }, 403);
  }

  const productId = c.req.param('id');
  const product = await db.select().from(products).where(and(eq(products.id, productId), eq(products.storeId, store.id))).get();

  if (!product) {
    return c.json({ message: 'Product not found or not yours' }, 404);
  }

  const data = c.req.valid('json');

  await db.update(products).set({
    categoryId: data.categoryId,
    name: data.name,
    description: data.description,
    price: data.price,
    comparePrice: data.comparePrice,
    stock: data.stock,
    weight: data.weight,
    status: data.status,
    images: JSON.stringify(data.images || [])
  }).where(eq(products.id, productId));

  return c.json({ message: 'Product updated successfully' });
});

productRouter.patch('/:id', async (c) => {
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
  const store = await db.select().from(stores).where(eq(stores.ownerId, payload.id as string)).get();
  if (!store) {
    return c.json({ message: 'Forbidden' }, 403);
  }

  const productId = c.req.param('id');
  const product = await db.select().from(products).where(and(eq(products.id, productId), eq(products.storeId, store.id))).get();

  if (!product) {
    return c.json({ message: 'Product not found or not yours' }, 404);
  }

  const data = await c.req.json();
  const updates: any = {};
  if (data.status) updates.status = data.status;

  await db.update(products).set(updates).where(eq(products.id, productId));

  return c.json({ message: 'Product status updated' });
});

productRouter.delete('/:id', async (c) => {
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
  const store = await db.select().from(stores).where(eq(stores.ownerId, payload.id as string)).get();
  if (!store) {
    return c.json({ message: 'Forbidden' }, 403);
  }

  const productId = c.req.param('id');
  const product = await db.select().from(products).where(and(eq(products.id, productId), eq(products.storeId, store.id))).get();

  if (!product) {
    return c.json({ message: 'Product not found or not yours' }, 404);
  }

  await db.delete(products).where(eq(products.id, productId));

  return c.json({ message: 'Product deleted successfully' });
});

productRouter.get('/seller/mine', async (c) => {
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
  const store = await db.select().from(stores).where(eq(stores.ownerId, payload.id as string)).get();
  if (!store) {
    return c.json({ message: 'Store not found' }, 404);
  }

  const myProducts = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      price: products.price,
      comparePrice: products.comparePrice,
      rating: products.rating,
      sold: products.sold,
      stock: products.stock,
      weight: products.weight,
      status: products.status,
      images: products.images,
      categoryId: products.categoryId,
      categoryName: categories.name,
      storeId: products.storeId,
      storeName: stores.name,
      storeSlug: stores.slug,
      storeLogoUrl: stores.logoUrl,
      storeRating: stores.rating,
      storeTotalSales: stores.totalSales
    })
    .from(products)
    .innerJoin(stores, eq(products.storeId, stores.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.storeId, store.id));

  const mappedProducts = myProducts.map(p => ({
    ...p,
    images: JSON.parse(p.images as string || '[]')
  }));

  return c.json({ data: mappedProducts });
});

productRouter.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const q = c.req.query('q');
  const categorySlug = c.req.query('category');
  const limitStr = c.req.query('limit');
  const limit = limitStr ? parseInt(limitStr, 10) : 50;

  let query = db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      price: products.price,
      comparePrice: products.comparePrice,
      rating: products.rating,
      sold: products.sold,
      stock: products.stock,
      weight: products.weight,
      status: products.status,
      images: products.images,
      categoryId: products.categoryId,
      categoryName: categories.name,
      storeId: products.storeId,
      storeName: stores.name,
      storeSlug: stores.slug,
      storeLogoUrl: stores.logoUrl,
      storeRating: stores.rating,
      storeTotalSales: stores.totalSales
    })
    .from(products)
    .innerJoin(stores, eq(products.storeId, stores.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .$dynamic();

  const conditions = [
    eq(products.status, 'ACTIVE'),
    eq(stores.status, 'ACTIVE')
  ];
  
  if (q) {
    const searchCondition = or(
      like(products.name, `%${q}%`),
      like(products.description, `%${q}%`),
      like(categories.name, `%${q}%`)
    );
    if (searchCondition) conditions.push(searchCondition);
  }

  if (categorySlug) {
    conditions.push(eq(categories.slug, categorySlug));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const sort = c.req.query('sort');
  let orderByClause: any = desc(products.createdAt);
  
  if (sort === 'price-asc') {
    orderByClause = asc(products.price);
  } else if (sort === 'price-desc') {
    orderByClause = desc(products.price);
  } else if (sort === 'sold-desc') {
    orderByClause = desc(products.sold);
  } else if (sort === 'newest') {
    orderByClause = desc(products.createdAt);
  }

  const allProducts = await query.limit(limit).orderBy(orderByClause);

  const mappedProducts = allProducts.map(p => ({
    ...p,
    images: JSON.parse(p.images as string || '[]')
  }));

  return c.json({ data: mappedProducts });
});

productRouter.get('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const productId = c.req.param('id');
  
  const product = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      price: products.price,
      comparePrice: products.comparePrice,
      rating: products.rating,
      sold: products.sold,
      stock: products.stock,
      weight: products.weight,
      status: products.status,
      images: products.images,
      categoryId: products.categoryId,
      categoryName: categories.name,
      storeId: products.storeId,
      storeName: stores.name,
      storeSlug: stores.slug,
      storeLogoUrl: stores.logoUrl,
      storeRating: stores.rating,
      storeTotalSales: stores.totalSales
    })
    .from(products)
    .innerJoin(stores, eq(products.storeId, stores.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, productId))
    .get();

  if (!product) {
    const productById = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        price: products.price,
        comparePrice: products.comparePrice,
        rating: products.rating,
        sold: products.sold,
        stock: products.stock,
        weight: products.weight,
        status: products.status,
        images: products.images,
        categoryId: products.categoryId,
        categoryName: categories.name,
        storeId: products.storeId,
        storeName: stores.name,
        storeSlug: stores.slug,
        storeLogoUrl: stores.logoUrl,
        storeRating: stores.rating,
        storeTotalSales: stores.totalSales
      })
      .from(products)
      .innerJoin(stores, eq(products.storeId, stores.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, productId))
      .get();
      
    if (!productById) {
      return c.json({ message: 'Product not found' }, 404);
    }
    
    return c.json({ data: { ...productById, images: JSON.parse(productById.images as string || '[]') } });
  }

  return c.json({ data: { ...product, images: JSON.parse(product.images as string || '[]') } });
});

productRouter.get('/store/:storeId', async (c) => {
  const db = drizzle(c.env.DB);
  const storeId = c.req.param('storeId');
  
  const storeProducts = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      price: products.price,
      comparePrice: products.comparePrice,
      rating: products.rating,
      sold: products.sold,
      stock: products.stock,
      weight: products.weight,
      status: products.status,
      images: products.images,
      categoryId: products.categoryId,
      categoryName: categories.name,
      storeId: products.storeId,
      storeName: stores.name,
      storeSlug: stores.slug,
      storeLogoUrl: stores.logoUrl,
      storeRating: stores.rating,
      storeTotalSales: stores.totalSales
    })
    .from(products)
    .innerJoin(stores, eq(products.storeId, stores.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.storeId, storeId))
    .all();

  const mappedProducts = storeProducts.map(p => ({
    ...p,
    images: JSON.parse(p.images as string || '[]')
  }));

  return c.json({ data: mappedProducts });
});
