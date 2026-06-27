<div align="center">
  <img src="frontend/public/logo-seapedia-for-readme.png" alt="SEAPEDIA Logo" width="220" />
</div>

# SEAPEDIA - E-Commerce Platform Ecosystem

**Repository URL:** [https://github.com/RenBaelish/SEAPEDIA](https://github.com/RenBaelish/SEAPEDIA)
**Git Clone URL:** https://github.com/RenBaelish/SEAPEDIA.git

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

For detailed documentation per role, please read the following:
- [Admin Documentation](docs/README-ADMIN.md)
- [Buyer Documentation](docs/README-BUYER.md)
- [Seller Documentation](docs/README-SELLER.md)
- [Driver Documentation](docs/README-DRIVER.md)

## 2. Technology Stack

- **Frontend:** React 18, Vite, React Router, Zustand (State Management), TailwindCSS / Vanilla CSS, Lucide Icons.
- **Backend:** Hono.js (Cloudflare Workers framework), Drizzle ORM.
- **Database:** Cloudflare D1 (Serverless SQLite).
- **Security:** Bcrypt (Password Hashing), JWT (Stateless Authentication).

## 3. How to Run the Application Locally (Development Mode)

**IMPORTANT NOTE:** Running this application locally **DOES NOT** require you to login to Cloudflare or have an active Cloudflare account. The local development environment uses wrangler d1 which simulates the database using a local SQLite file in the .wrangler folder.

To run the application locally without Docker, ensure your environment meets these prerequisites:

### Prerequisites
- **Node.js**: Version 18 or higher.
- **PNPM**: Package manager used for the backend workspace (install via 
pm install -g pnpm).
- **NPM**: Default package manager for the frontend workspace.

### Environment Variables (.env)
The application is designed to be plug-and-play for local evaluation. 
- **Backend:** Uses Wrangler configuration (wrangler.jsonc) and local SQLite state. **No .env file is required for local development.**
- **Frontend:** API requests proxy to http://localhost:8787 by default in the API client (lib/api.ts). **No .env file is required.**

---

### Step 1: Getting the Source Code

Depending on how you received the project, follow the appropriate method below to enter the project folder.

**Method A: From GitHub Repository (Clone)**
1. Open terminal and clone the repository:
   git clone https://github.com/RenBaelish/SEAPEDIA.git
2. Enter the project root directory:
   cd SEAPEDIA

**Method B: From ZIP File Extraction**
1. Extract the downloaded ZIP file to your preferred location.
2. Open terminal and navigate into the extracted root folder (where this README is located):
   cd path/to/extracted/SEAPEDIA

---

### Step 2: Run the Backend
1. From the project root directory, navigate to the backend directory: 
   cd backend
2. Install dependencies: 
   pnpm install
3. Start the backend development server: 
   pnpm run dev 
   *(This will start the server at http://localhost:8787 and automatically initialize the local SQLite database).*

### Step 3: Seed the Database
Before using the application, you must populate the database with the initial products, stores, and demo accounts.
1. Ensure the backend is running.
2. Open your browser and navigate to: http://localhost:8787/seed
3. Wait for the success response. The database is now populated.

### Step 4: Run the Frontend
1. Open a **new terminal** at the project root directory, then navigate to the frontend directory: 
   cd frontend
2. Install dependencies: 
   
pm install
3. Start the frontend development server: 
   
pm run dev
4. Access the web application at: http://localhost:5173

## 4. How to Use the Application (Demo Accounts)

You can log in to http://localhost:5173/auth/login using the following seeded accounts. All passwords are case-sensitive.

**Admin Account:**
- Email: dmin@seapedia.id
- Password: Admin@SEAPEDIA2025
- Role: Admin (Full dashboard access)

**Buyer Accounts:**
- Email: udi.santoso@gmail.com
- Password: Budi@Buyer2025
- Role: Buyer (2,000,000 IDR Wallet Balance)

**Seller Accounts:**
- Email: 	echmart@seapedia.id
- Password: TechMart@2025
- Role: Buyer & Seller (Can switch roles via Profile Menu. Pre-populated with Electronics).

**Driver Accounts:**
- Email: 
udi.driver@seapedia.id
- Password: Rudi@Driver2025
- Role: Driver (Access to Job Board for deliveries).

## 5. API Documentation

The backend provides an automatically generated interactive OpenAPI / Swagger UI.
Once the backend is running, access the documentation at: **http://localhost:8787/docs**

## 6. Production Deployment Guide

If you wish to deploy SEAPEDIA to production, the architecture is designed to be decoupled (Frontend and Backend are deployed separately).

### Backend Deployment (Cloudflare Workers)
1. Navigate to the backend directory: cd backend
2. Login to Cloudflare: 
px wrangler login
3. Create a D1 Database on Cloudflare dashboard and update the database_id in wrangler.jsonc.
4. Deploy the backend: pnpm run deploy
5. Note the generated Cloudflare Worker URL (e.g., https://seapedia-api.your-username.workers.dev).

### Frontend Deployment (Vercel / Netlify / Cloudflare Pages)
1. Navigate to the frontend directory: cd frontend
2. Update the VITE_API_URL environment variable in your hosting provider's dashboard to point to the backend's Production URL.
3. Build the frontend: 
pm run build
4. The output in the dist folder can be served statically anywhere.
