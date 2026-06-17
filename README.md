# SEAPEDIA
SEAPEDIA is a growing e-commerce platform that connects sellers, buyers, and delivery drivers in one marketplace experience.

This repository is built progressively as part of the Software Engineering Academy COMPFEST 18 submission.
It consists of:
- **Frontend**: Preact (Vite) + TailwindCSS
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
