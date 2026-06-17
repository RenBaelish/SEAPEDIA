import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(), // hashed
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
  rating: integer('rating').notNull(), // 1 to 5
  comment: text('comment').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});
