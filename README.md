# SEAPEDIA
SEAPEDIA is a growing e-commerce platform that connects sellers, buyers, and delivery drivers in one marketplace experience.

This repository is built progressively as part of the Software Engineering Academy COMPFEST 18 submission.
It consists of:
- **Frontend**: React (Vite) + TailwindCSS
- **Backend**: Hono.js + Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite) + Drizzle ORM

## Prerequisites
- Node.js (v18+)
- pnpm / npm
- Docker (optional, for containerized running)

## Setup and Running Locally

### Option 1: Manual Run
You must run both the backend and frontend in separate terminals.

**1. Backend**
```bash
cd backend
pnpm install
pnpm run dev
```

**2. Frontend**
```bash
cd frontend
npm install
npm run dev
```

### Option 2: Docker
If you have Docker and Docker Compose installed:
```bash
docker-compose up --build
```
The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:8787`.

## Features per Level
Please refer to the commit history to see the progress per level:
- Level 1: Public Marketplace, Authentication, and Reviews
- Level 2: Building the Seller Experience
- Level 3: Buyer Wallet, Cart, and Checkout
- Level 4: Discounts and Seller Order Processing
- Level 5: Delivery and Driver Workflow
- Level 6: Admin Monitoring and Overdue Handling
- Level 7: Security Hardening and Finalization

## Business Rules & Logic Documentation (Level 7 Requirements)

### 1. Single-Store Checkout Behavior
SEAPEDIA implements a **strict single-store checkout rule**. 
- A buyer's cart (`/api/cart/items`) can only contain items from **one store** at any given time.
- If a buyer attempts to add a product from a different store while the cart already contains items from another store, the backend rejects the request with a `400 Bad Request` and prompts the buyer to either checkout the current items or empty their cart first.

### 2. Discount Combination and PPN 12% Rules
- **Discounts**: Buyers can apply either a Voucher OR a Promo code during checkout. Combining multiple discount codes in a single order is not currently supported.
- **PPN 12%**: The 12% Value Added Tax (PPN) is calculated based on the **subtotal after the discount is applied**, but **before the delivery fee** is added. 
  *(Formula: `Tax = (Subtotal - Discount) * 0.12`)*

### 3. Driver Earnings & Seller Commissions
- **Driver Earnings**: When a driver completes a delivery, a **10% platform commission** is deducted from the gross delivery fee. The remaining 90% is credited to the Driver's wallet as net income.
- **Seller Income**: When a buyer finalizes an order (`PESANAN_SELESAI`), a **5% platform commission** is deducted from the product gross subtotal. The remaining 95% is credited to the Seller's wallet.

### 4. Overdue SLA and Time Simulation
- **SLA Rules**:
  - `Instant`: 2 hours SLA
  - `Next Day`: 24 hours SLA
  - `Regular`: 3 days SLA
- **Overdue Handling**: If an order exceeds its SLA and is still stuck in `SEDANG_DIKEMAS` or `MENUNGGU_PENGIRIM`, it becomes eligible for an **auto-refund**. The order status changes to `DIKEMBALIKAN` (Returned/Refunded), product stock is restored, and the buyer's wallet is refunded.
- **Simulation**: Time simulation can be triggered manually by Admins via the backend endpoint `POST /admin/overdue/simulate` which checks all active orders against their timestamps.

### 5. Security Measures (SQL Injection, XSS, RBAC)
- **SQL Injection Prevention**: All database queries are executed using **Drizzle ORM** (parameterized queries). No raw user string concatenation is passed to the SQLite instance.
- **XSS Prevention**: React automatically escapes all string variables in JSX templates. The public application reviews do not use `dangerouslySetInnerHTML`.
- **Role-Based Access Control (RBAC)**: Authentication is handled via stateless JWTs. Backend API endpoints strictly verify the user's `activeRole` from the JWT payload. A user attempting an action outside their active role (e.g., a Buyer trying to process an order like a Seller) will be rejected with `403 Forbidden`.
- **Session/Token Behavior**: Logging out on the frontend clears the token. Tokens expire after 24 hours.

## End-to-End Demo Guide
1. Create a Buyer account and leave a public review on the Homepage.
2. Create a Seller account, setup a store, and add a product.
3. Use the Buyer account to add the product to the cart. Do a dummy top-up on the Wallet page.
4. Checkout the item.
5. Use the Seller account to process the order (`SEDANG_DIKEMAS` -> `MENUNGGU_PENGIRIM`).
6. Create a Driver account, find the available job, take it, and mark it as delivered.
7. As the Buyer, confirm the order is completed (`PESANAN_SELESAI`).
8. View the 5% seller deduction in Seller Wallet, and 10% driver deduction in Driver Wallet.
9. View the Admin dashboard to monitor all metrics and simulate overdue orders.
