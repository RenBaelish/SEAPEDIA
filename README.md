<div align="center">
  <img src="frontend/public/logo-seapedia-for-readme.png" alt="SEAPEDIA Logo" width="220" />
</div>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

# SEAPEDIA - E-Commerce Platform Ecosystem

- **Live Web Application:** [https://seapedia-compfest-seacademy.vercel.app/](https://seapedia-compfest-seacademy.vercel.app/)
- **Live API Documentation (Swagger):** [https://seapedia-backend.raffirabbani518.workers.dev/docs](https://seapedia-backend.raffirabbani518.workers.dev/docs)
- **Repository URL:** [https://github.com/RenBaelish/SEAPEDIA](https://github.com/RenBaelish/SEAPEDIA)

SEAPEDIA is a comprehensive e-commerce platform built to fulfill the Advanced Fullstack Web Development task. It features a complete ecosystem with four distinct user roles: Admin, Buyer, Seller, and Driver.

## 1. Application Flow and Features (Task Level Fulfillment)

SEAPEDIA fulfills the complete marketplace ecosystem from basic product listing to complex multi-role interactions. Below is the mapping of features to task levels:

| Level | Focus Area | Features Implemented |
|---|---|---|
| **Level 1** | Basic E-Commerce | Buyers can browse products, add to cart, and checkout. Sellers can list and manage products in their stores. |
| **Level 2** | Transactions & Deliveries | Complex state machine for orders (Menunggu Pembayaran -> Diproses -> Dikirim -> Selesai). Integrated delivery routing for Drivers. |
| **Level 3** | Commissions & Wallets | Financial ecosystem. 5% platform commission on seller transactions. 10% platform fee on driver delivery earnings. E-Wallet system for seamless payments. |
| **Level 4** | Promos & Multi-cart Rules | Discount vouchers managed by Admin. Strict business rule implemented: A buyer can only checkout products from one store at a time. |
| **Level 5** | Review & Rating | Buyers can leave 1-5 star reviews on products after completing an order. Store ratings are aggregated. |
| **Level 6** | Service Level Agreement (SLA) | Automated order cancellations if deadlines are missed (2 hours for payment, 24 hours for seller processing, 72 hours for driver delivery). |
| **Level 7** | Admin Analytics & Roles | Comprehensive admin dashboard with financial metrics. Support for multiple roles per account (e.g., a user can be both a Buyer and a Seller) with a seamless Role Switcher. |

For detailed documentation per role and a comprehensive step-by-step testing guide for judges, please read the following:
- [Application End-to-End Flow (Mandatory for Judges)](docs/README-FLOW.md)
- [Admin Documentation](docs/README-ADMIN.md)
- [Buyer Documentation](docs/README-BUYER.md)
- [Seller Documentation](docs/README-SELLER.md)
- [Driver Documentation](docs/README-DRIVER.md)

## 2. Technology Stack

- **Frontend:** React 18, Vite, React Router, Zustand (State Management), TailwindCSS / Vanilla CSS, Lucide Icons.
- **Backend:** Hono.js (Cloudflare Workers framework), Drizzle ORM.
- **Database:** Cloudflare D1 (Serverless SQLite).
- **Security:** Bcrypt (Password Hashing), JWT (Stateless Authentication).

## 3. Environment Variables Configuration

The application strictly avoids hardcoded API URLs or secrets. You must set up environment variables for both the frontend and backend. 

### 1. Frontend (`frontend/.env`)
Create a file named `.env` exactly inside the `frontend` folder and copy-paste the following content:
```env
VITE_API_URL=http://localhost:8787
```
*(Explanation: `VITE_API_URL` tells the Vite React application where the backend API is running).*

### 2. Backend (`backend/.dev.vars`)
Cloudflare Workers uses a file named `.dev.vars` (instead of `.env`) for local development. Create a file named `.dev.vars` exactly inside the `backend` folder and copy-paste the following content:
```env
JWT_SECRET=super_secret_key_for_development
```
*(Explanation: `JWT_SECRET` is the secret key used to securely sign and verify JSON Web Tokens for user login sessions. For local development, this can be any random string).*

## 4. How to Run the Application Locally (Via Docker)

We provide a `docker-compose.yml` file to run the entire stack (both frontend and backend) simultaneously with a single command. 

**What happens inside Docker?**
- The `backend` service builds the Hono server and exposes it on port `8787`.
- The `frontend` service builds the React Vite server and exposes it on port `5173`.
- They run concurrently in isolated containers, communicating seamlessly.

**Steps to run via Docker:**
1. Ensure [Docker Desktop](https://www.docker.com/) is installed and running.
2. Open terminal in the project root directory (where `docker-compose.yml` is located).
3. Run the stack in detached mode:
   ```bash
   docker-compose up -d --build
   ```
4. Access the **Frontend** at: `http://localhost:5173`
5. Access the **Backend API Docs** at: `http://localhost:8787/docs`
6. (Optional) To view logs: `docker-compose logs -f`
7. (Optional) To stop the application: `docker-compose down`

## 5. How to Run the Application Locally (Without Docker)

**IMPORTANT NOTE:** Running this application locally **DOES NOT** require you to login to Cloudflare or have an active Cloudflare account. The local development environment uses `wrangler d1` which simulates the database using a local SQLite file in the `.wrangler` folder.

If you prefer to run it manually without Docker, ensure you have **Node.js 18+**, **PNPM**, and **NPM** installed.

### Step 1: Getting the Source Code

**Method A: From GitHub Repository (Clone)**
1. Open terminal and clone the repository:
   `git clone https://github.com/RenBaelish/SEAPEDIA.git`
2. Enter the project root directory:
   `cd SEAPEDIA`

**Method B: From ZIP File Extraction**
1. Extract the downloaded ZIP file to your preferred location.
2. Open terminal and navigate into the extracted root folder (where this README is located):
   `cd path/to/extracted/SEAPEDIA`

### Step 2: Run the Backend
1. From the project root directory, navigate to the backend directory: 
   `cd backend`
2. Install dependencies: 
   `pnpm install`
3. Start the backend development server: 
   `pnpm run dev` 
   *(This will start the server at http://localhost:8787 and automatically initialize the local SQLite database).*

### Step 3: Seed the Database
Before using the application, you must populate the database with the initial products, stores, and demo accounts.
1. Ensure the backend is running.
2. Open your browser and navigate to: `http://localhost:8787/seed`
3. Wait for the success response. The database is now populated.

### Step 4: Run the Frontend
1. Open a **new terminal** at the project root directory, then navigate to the frontend directory: 
   `cd frontend`
2. Install dependencies: 
   `npm install`
3. Start the frontend development server: 
   `npm run dev`
4. Access the web application at: `http://localhost:5173`

## 6. How to Use the Application (Demo Accounts)

You can log in to `http://localhost:5173/auth/login` using the following seeded accounts. All passwords are case-sensitive.

**Admin Account:**
- Email: `admin@seapedia.id`
- Password: `Admin@SEAPEDIA2025`
- Role: Admin (Full dashboard access)

**Buyer Accounts:**
- Email: `budi.santoso@gmail.com`
- Password: `Budi@Buyer2025`
- Role: Buyer (2,000,000 IDR Wallet Balance)

**10 Akun Seller yang Tersedia:**
- `techmart@seapedia.id` | Pass: `TechMart@2025` (TechMart Indonesia)
- `glowskin@seapedia.id` | Pass: `GlowSkin@2025` (GlowSkin Official)
- `urbanstyle@seapedia.id` | Pass: `UrbanStyle@2025` (Urban Style ID)
- `freshmart@seapedia.id` | Pass: `FreshMart@2025` (FreshMart Daily)
- `sportszone@seapedia.id` | Pass: `SportsZone@2025` (SportsZone ID)
- `homedeco@seapedia.id` | Pass: `HomeDeco@2025` (HomeDeco Living)
- `autojaya@seapedia.id` | Pass: `AutoJaya@2025` (AutoJaya Store)
- `healthplus@seapedia.id` | Pass: `HealthPlus@2025` (HealthPlus ID)
- `gaminghub@seapedia.id` | Pass: `GamingHub@2025` (GamingHub ID)
- `periplus@seapedia.id` | Pass: `Periplus@2025` (Periplus Online)

**Driver Accounts:**
- Email: `rudi.driver@seapedia.id`
- Password: `Rudi@Driver2025`
- Role: Driver (Access to Job Board for deliveries).

## 7. API Documentation

The backend provides an automatically generated interactive OpenAPI / Swagger UI.
**Live Production Documentation:** [https://seapedia-backend.raffirabbani518.workers.dev/docs](https://seapedia-backend.raffirabbani518.workers.dev/docs)

*(If you are running the backend locally via Docker or Manual setup, you can access the local documentation at: **http://localhost:8787/docs**)*

## 8. Production Deployment Guide

If you wish to deploy SEAPEDIA to production, the architecture is designed to be decoupled.

### Backend Deployment (Cloudflare Workers & D1)
The backend is deployed to Cloudflare Workers (a serverless execution environment) and uses Cloudflare D1 (a serverless SQL database).

1. Navigate to the backend directory: `cd backend`
2. Login to your Cloudflare account via CLI: 
   `npx wrangler login`
3. Create a production D1 Database:
   `npx wrangler d1 create seapedia-db`
4. Update the `wrangler.jsonc` file in the `backend` folder with the `database_id` generated from the previous step.
5. Apply the database migrations to the production database:
   `npx wrangler d1 migrations apply seapedia-db --remote`
6. Set your production JWT Secret:
   `npx wrangler secret put JWT_SECRET`
   *(Enter your strong random string when prompted)*
7. Deploy the backend: 
   `pnpm run deploy`
8. Note the generated Cloudflare Worker URL (e.g., `https://seapedia-api.your-username.workers.dev`).
9. **IMPORTANT**: Seed the production database by visiting the seed endpoint in your browser or running:
   `curl https://<YOUR_WORKER_URL>/seed`
   *(This populates the empty production database with products, users, and stores).*

### Frontend Deployment (Vercel)
To deploy the React frontend seamlessly to Vercel:
1. Push your full repository to GitHub.
2. Go to your [Vercel Dashboard](https://vercel.com) and click **Add New Project**.
3. Import your `SEAPEDIA` GitHub repository.
4. **Configure the Project:**
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. **Environment Variables:**
   - Add a new variable named `VITE_API_URL`
   - Set the value to your production backend URL from Cloudflare (e.g., `https://seapedia-api.your-username.workers.dev`)
6. Click **Deploy**. Vercel will automatically build the `frontend` folder and host the application.

## 9. System Architecture & Design (Advanced Topics)

For a deeper dive into the technical architecture of SEAPEDIA, including:
- Frontend & Backend APIs Architecture
- Edge Caching & Global Load Balancing (Cloudflare)
- CI/CD & Production Infrastructure
- Authentication & Authorization
- Database Entity Relationship Diagram (ERD)

Please read our detailed **[System Architecture & Design Document](docs/SYSTEM_DESIGN.md)**.

## 10. Security Hardening (Level 7 Task Fulfillment)

SEAPEDIA fully implements the security requirements set in Level 7:
1. **SQL Injection Prevention:** Uses Drizzle ORM which inherently executes parameterized queries, preventing SQLi attacks across all forms and API endpoints.
2. **XSS Prevention:** React 18 is used on the frontend, which automatically sanitizes user inputs (like public application reviews) to prevent Cross-Site Scripting.
3. **Input Validation:** Zod schemas rigorously validate incoming API requests before processing.
4. **Role-Based Access Control (RBAC):** Backend Middleware securely extracts the active role from the JWT token. It prevents a Buyer from hitting Seller endpoints, or a user from accessing resources (like orders) they don't own.
