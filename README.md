<div align="center" style="background-color: white; padding: 20px; border-radius: 12px; display: inline-block;">
  <img src="frontend/public/logo-seapedia.png" alt="SEAPEDIA Logo" width="220" />
</div>

<h1 align="center">SEAPEDIA</h1>

<p align="center">
  Multi-role e-commerce platform connecting Sellers, Buyers, and Delivery Drivers.<br />
  Built as a fullstack web application for COMPFEST 18 Software Engineering Academy.
</p>

---

## About

SEAPEDIA is a marketplace application that supports four distinct roles: Admin, Seller, Buyer, and Driver. Each role has its own dashboard, workflow, and permissions. The system handles the complete lifecycle from product listing to order delivery and payment settlement.

## Tech Stack

| Layer      | Technology                              | Reason                              |
| ---------- | --------------------------------------- | ----------------------------------- |
| Frontend   | React 19 + Vite                         | Fast build tooling with HMR         |
| Styling    | Tailwind CSS v4                         | Utility-first, rapid UI development |
| State      | Zustand                                 | Lightweight, no boilerplate         |
| Backend    | Hono.js                                 | Ultra-fast edge-ready API framework |
| Runtime    | Cloudflare Workers (local via wrangler) | Low-latency serverless runtime      |
| Database   | Cloudflare D1 (SQLite)                  | Serverless SQLite, zero-ops         |
| ORM        | Drizzle ORM                             | Type-safe, zero-overhead SQL        |
| Auth       | JWT (hono/jwt)                          | Stateless, role-aware tokens        |
| Validation | Zod                                     | Schema validation on inputs         |
| API Docs   | Swagger UI (OpenAPI 3.0)                | Auto-generated from openapi.json    |

## Task Level Implementation

| Level | Topic                                 | Key Endpoints                         |
| ----- | ------------------------------------- | ------------------------------------- |
| 1     | Public Marketplace, Auth, Reviews     | /auth/*, /products, /reviews/app      |
| 2     | Seller Experience                     | /stores/me, /products/seller          |
| 3     | Buyer Wallet, Cart, Checkout          | /wallet, /cart, /orders/checkout      |
| 4     | Discounts and Seller Order Processing | /promos, /orders/:id/process          |
| 5     | Delivery and Driver Workflow          | /deliveries/*                         |
| 6     | Admin Monitoring and Overdue Handling | /admin/*, /admin/overdue/simulate     |
| 7     | Security Hardening and Finalization   | JWT RBAC, Drizzle ORM, Zod validation |

## Project Structure

```Shell
SEAPEDIA/
|-- backend/              Hono.js API server
|   |-- src/
|   |   |-- routes/       All API route handlers (12 files)
|   |   |-- db/           Schema and Drizzle setup
|   |   |-- seed.ts       Database seeder
|   |   `-- index.ts      App entry point
|   |-- openapi.json      OpenAPI 3.0 specification
|   `-- wrangler.jsonc    Cloudflare Workers config
|-- frontend/             React + Vite client
|   `-- src/
|       |-- components/   Shared UI components
|       |-- features/     Feature modules (auth, cart, dashboard, etc.)
|       |-- store/        Zustand state stores
|       |-- router/       Route definitions
|       `-- lib/          API client (axios)
|-- docs/                 Role-specific flow documentation
|-- docker-compose.yml    Docker setup for both services
`-- README.md             This file
```

## Running Locally

### Prerequisites

- Node.js v18+
- pnpm (backend)
- npm (frontend)

### Manual Setup

**Backend (Terminal 1)**

```bash
cd backend
pnpm install
pnpm run dev
```

Backend: http://127.0.0.1:8787
API Docs: http://127.0.0.1:8787/docs

**Frontend (Terminal 2)**

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

**Seed the database (first time only)**

While backend is running, visit: http://127.0.0.1:8787/seed

### Docker Compose

```bash
docker-compose up --build
```

- Frontend -> http://localhost:5173
- Backend -> http://localhost:8787

## Demo Accounts

All accounts are created by visiting /seed. Passwords are bcrypt-hashed.

### Admin

| Email             | Password           |
| ----------------- | ------------------ |
| admin@seapedia.id | Admin@SEAPEDIA2025 |

### Buyers

| Email                  | Password        |
| ---------------------- | --------------- |
| budi.santoso@gmail.com | Budi@Buyer2025  |
| siti.rahayu@gmail.com  | Siti@Buyer2025  |
| ahmad.fauzi@gmail.com  | Ahmad@Buyer2025 |
| dewi.kartika@gmail.com | Dewi@Buyer2025  |

### Sellers (also have Buyer role)

| Email                  | Password        | Store              |
| ---------------------- | --------------- | ------------------ |
| techmart@seapedia.id   | TechMart@2025   | TechMart Indonesia |
| glowskin@seapedia.id   | GlowSkin@2025   | GlowSkin Official  |
| urbanstyle@seapedia.id | UrbanStyle@2025 | Urban Style ID     |
| freshmart@seapedia.id  | FreshMart@2025  | FreshMart Daily    |
| sportszone@seapedia.id | SportsZone@2025 | SportsZone ID      |
| homedeco@seapedia.id   | HomeDeco@2025   | HomeDeco Living    |
| autojaya@seapedia.id   | AutoJaya@2025   | AutoJaya Store     |
| healthplus@seapedia.id | HealthPlus@2025 | HealthPlus ID      |
| gaminghub@seapedia.id  | GamingHub@2025  | GamingHub ID       |
| periplus@seapedia.id   | Periplus@2025   | Periplus Online    |

Note: After login, you must select an active role before accessing dashboards.

### Drivers

| Email                   | Password        |
| ----------------------- | --------------- |
| rudi.driver@seapedia.id | Rudi@Driver2025 |
| andi.kurir@seapedia.id  | Andi@Driver2025 |

## Detailed Role Documentation

For complete flow, pages, and API documentation per role, see the `docs/` folder:

- Admin dashboard and monitoring -> docs/README-ADMIN.md
- Buyer checkout and order flow -> docs/README-BUYER.md
- Seller store and order management -> docs/README-SELLER.md
- Driver delivery and earnings flow -> docs/README-DRIVER.md

## Business Rules

**Single-Store Checkout** - One cart may only contain products from one store. Returns HTTP 400 for cross-store conflict.

**PPN 12%** - Tax = (Subtotal - Discount) x 0.12

**Commissions** - Driver receives 90% of gross delivery fee. Seller receives 95% of subtotal, released when buyer confirms receipt.

**Overdue SLA** - INSTANT: 2 hours, NEXT_DAY: 24 hours, REGULAR: 72 hours. Admin triggers simulation via POST /admin/overdue/simulate.

## Security

- SQL Injection: Drizzle ORM parameterized queries
- XSS: React JSX auto-escapes output; no dangerouslySetInnerHTML
- RBAC: JWT activeRole verified server-side on every protected endpoint
- Passwords: bcrypt with cost factor 10
- Token expiry: 24 hours
