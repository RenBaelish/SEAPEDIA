import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(), // hashed
  profilePictureUrl: text('profile_picture_url').notNull().default('https://i.pinimg.com/736x/22/87/85/2287856db3ec37b4d0d3fd0ffd99930a.jpg'),
  phoneNumber: text('phone_number'),
  gender: text('gender'),
  birthDate: text('birth_date'),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, BANNED
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const roles = sqliteTable('roles', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(), // ADMIN, BUYER, SELLER, DRIVER
});

export const userRoles = sqliteTable('user_roles', {
  userId: text('user_id').notNull().references(() => users.id),
  roleId: text('role_id').notNull().references(() => roles.id),
});

export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const stores = sqliteTable('stores', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull().unique().references(() => users.id),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  logoUrl: text('logo_url'),
  bannerUrl: text('banner_url'),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, SUSPENDED, CLOSED
  rating: real('rating').notNull().default(0),
  totalSales: integer('total_sales').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id),
  categoryId: text('category_id').references(() => categories.id),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  price: integer('price').notNull(),
  comparePrice: integer('compare_price'),
  rating: real('rating').notNull().default(0),
  sold: integer('sold').notNull().default(0),
  stock: integer('stock').notNull(),
  weight: integer('weight').notNull().default(1000), // in grams
  status: text('status').notNull().default('ACTIVE'), // DRAFT, ACTIVE, INACTIVE, DELETED
  images: text('images', { mode: 'json' }).notNull().default('[]'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const wallets = sqliteTable('wallets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => users.id),
  balance: integer('balance').notNull().default(0),
});

export const addresses = sqliteTable('addresses', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  label: text('label').notNull(), // e.g. Rumah, Kantor
  recipientName: text('recipient_name').notNull(),
  phone: text('phone').notNull(),
  street: text('street').notNull(),
  city: text('city').notNull(),
  province: text('province').notNull(),
  postalCode: text('postal_code').notNull(),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
});

export const carts = sqliteTable('carts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => users.id),
  storeId: text('store_id').references(() => stores.id), // Enforce single store checkout
});

export const cartItems = sqliteTable('cart_items', {
  id: text('id').primaryKey(),
  cartId: text('cart_id').notNull().references(() => carts.id),
  productId: text('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
});

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  buyerId: text('buyer_id').notNull().references(() => users.id),
  storeId: text('store_id').notNull().references(() => stores.id),
  status: text('status').notNull(), // SEDANG_DIKEMAS, MENUNGGU_PENGIRIM, SEDANG_DIKIRIM, PESANAN_SELESAI, DIKEMBALIKAN
  totalAmount: integer('total_amount').notNull(),
  deliveryFee: integer('delivery_fee').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id),
  productId: text('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  priceAtPurchase: integer('price_at_purchase').notNull(),
});

export const promos = sqliteTable('promos', {
  id: text('id').primaryKey(),
  storeId: text('store_id').references(() => stores.id),
  code: text('code').notNull().unique(),
  discountAmount: integer('discount_amount').notNull(),
  type: text('type').notNull(), // 'SHIPPING' or 'DISCOUNT'
  quota: integer('quota').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const walletMutations = sqliteTable('wallet_mutations', {
  id: text('id').primaryKey(),
  walletId: text('wallet_id').notNull().references(() => wallets.id),
  amount: integer('amount').notNull(), // positive for income/topup, negative for payment
  type: text('type').notNull(), // 'TOP_UP', 'PAYMENT', 'REFUND', 'INCOME'
  description: text('description').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const deliveryJobs = sqliteTable('delivery_jobs', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().unique().references(() => orders.id),
  driverId: text('driver_id').references(() => users.id), // Null if not taken
  status: text('status').notNull(), // 'MENUNGGU_DRIVER', 'DIKIRIM', 'SELESAI'
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});
