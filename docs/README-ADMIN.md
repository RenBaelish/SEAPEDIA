<div align="center">
  <img src="../frontend/public/logo-seapedia-for-readme.png" alt="SEAPEDIA Logo" width="220" />
</div>

<h1 align="center">SEAPEDIA - Admin Flow Documentation</h1>

---

## Overview

The Admin role has full read access to all platform data and moderation capabilities including banning users, suspending stores, managing promos, and triggering overdue simulations.

## Pages and Purpose

| Page               | Route           | Purpose                                        |
| ------------------ | --------------- | ---------------------------------------------- |
| Admin Dashboard    | /admin          | Overview stats: users, stores, orders, revenue |
| Users              | /admin/users    | List all users, ban or unban accounts          |
| Stores             | /admin/stores   | List all stores, suspend or activate           |
| Products           | /admin/products | Browse all products across stores              |
| Orders             | /admin/orders   | All orders with status and financial detail    |
| Promos             | /admin/promos   | Create and delete vouchers and promos          |
| Overdue Simulation | /admin          | Trigger overdue check from Admin dashboard     |

## Admin Flow

```JavaScript
Login with Admin account (admin@seapedia.id)
    |
    v
View overview dashboard at /admin
- Total users, stores, products, orders, drivers
- Platform revenue
    |
    v
Moderate users at /admin/users
- Ban: blocks login (HTTP 403 on next attempt)
- Unban: restores access
    |
    v
Moderate stores at /admin/stores
- Suspend: hides store from public and prevents checkout
- Activate: restores store visibility
    |
    v
Manage promos at /admin/promos
- Create platform-wide or store-scoped vouchers/promos
- Delete any promo
    |
    v
Trigger overdue at Admin dashboard
POST /admin/overdue/simulate
- Checks all orders in SEDANG_DIKEMAS or MENUNGGU_PENGIRIM
- Compares createdAt against SLA limits
- Eligible orders -> DIKEMBALIKAN
- Buyer wallet refunded, product stock restored
- No double refund: already refunded orders are skipped
```

## Key API Endpoints

| Method | Endpoint                   | Description                     |
| ------ | -------------------------- | ------------------------------- |
| GET    | /admin/stats               | Aggregated platform statistics  |
| GET    | /admin/users               | All users with roles and status |
| PATCH  | /admin/users/:id/ban       | Ban a user                      |
| PATCH  | /admin/users/:id/unban     | Unban a user                    |
| GET    | /admin/stores              | All stores with owner info      |
| PATCH  | /admin/stores/:id/suspend  | Suspend a store                 |
| PATCH  | /admin/stores/:id/activate | Activate a store                |
| GET    | /admin/orders              | All orders                      |
| POST   | /admin/overdue/simulate    | Trigger overdue processing      |
| GET    | /promos                    | List all promos                 |
| POST   | /promos                    | Create promo or voucher         |
| DELETE | /promos/:id                | Delete promo                    |

## SLA Reference

| Delivery Method | SLA Limit |
| --------------- | --------- |
| INSTANT         | 2 hours   |
| NEXT_DAY        | 24 hours  |
| REGULAR         | 72 hours  |

SLA starts from order createdAt. If the order is still in SEDANG_DIKEMAS or MENUNGGU_PENGIRIM after the SLA, it is eligible for refund on next simulation run.
