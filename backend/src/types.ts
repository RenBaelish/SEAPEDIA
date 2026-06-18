import type { JwtVariables } from 'hono/jwt';

export type Variables = JwtVariables & {
  user: {
    id: string;
    email: string;
    username: string;
    roles: string[];
    exp: number;
  };
};

export type Env = {
  Bindings: {
    DB: D1Database;
    JWT_SECRET: string;
  };
  Variables: Variables;
};
