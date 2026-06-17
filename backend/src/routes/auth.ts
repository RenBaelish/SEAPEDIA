import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { drizzle } from 'drizzle-orm/d1';
import { users, userRoles, roles } from '../db/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { sign, verify } from 'hono/jwt';

export const authRouter = new Hono<{ Bindings: { DB: D1Database, JWT_SECRET: string } }>();

const registerSchema = z.object({
  fullName: z.string().min(3),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  roles: z.array(z.string()).min(1) // array of role names
});

authRouter.post('/register', zValidator('json', registerSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const data = c.req.valid('json');

  // Check if user exists
  const existingUser = await db.select().from(users).where(eq(users.email, data.email)).get();
  if (existingUser) {
    return c.json({ message: 'Email already exists' }, 400);
  }

  const existingUsername = await db.select().from(users).where(eq(users.username, data.username)).get();
  if (existingUsername) {
    return c.json({ message: 'Username already exists' }, 400);
  }

  const hashedPassword = bcrypt.hashSync(data.password, 10);
  const userId = crypto.randomUUID();

  // Insert user
  await db.insert(users).values({
    id: userId,
    fullName: data.fullName,
    username: data.username,
    email: data.email,
    password: hashedPassword
  });

  // Assign roles
  for (const roleName of data.roles) {
    let role = await db.select().from(roles).where(eq(roles.name, roleName.toUpperCase())).get();
    if (!role) {
      const roleId = crypto.randomUUID();
      await db.insert(roles).values({ id: roleId, name: roleName.toUpperCase() });
      role = { id: roleId, name: roleName.toUpperCase() };
    }
    
    await db.insert(userRoles).values({
      userId,
      roleId: role.id
    });
  }

  return c.json({ message: 'Registered successfully', userId }, 201);
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

authRouter.post('/login', zValidator('json', loginSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const data = c.req.valid('json');

  const user = await db.select().from(users).where(eq(users.email, data.email)).get();
  if (!user || !bcrypt.compareSync(data.password, user.password)) {
    return c.json({ message: 'Invalid credentials' }, 401);
  }

  // Get roles
  const userRolesList = await db
    .select({ name: roles.name })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, user.id));

  const roleNames = userRolesList.map(r => r.name);

  // Generate JWT
  const secret = c.env.JWT_SECRET || 'fallback_secret';
  const token = await sign({
    id: user.id,
    email: user.email,
    username: user.username,
    roles: roleNames,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 1 day
  }, secret);

  return c.json({
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        roles: roleNames
      },
      token
    }
  });
});

authRouter.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  const token = authHeader.split(' ')[1];
  const secret = c.env.JWT_SECRET || 'fallback_secret';

  try {
    const payload = await verify(token, secret);
    return c.json({ user: payload });
  } catch (err) {
    return c.json({ message: 'Invalid token' }, 401);
  }
});
