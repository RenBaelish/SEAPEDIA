<div align="center">
  <img src="../frontend/public/logo-seapedia-for-readme.png" alt="SEAPEDIA Logo" width="220" />
</div>

<h1 align="center">SEAPEDIA - Seller Flow Documentation</h1>

---

## Overview

Sellers manage their own store, list products, and process incoming orders. A single account can hold both Seller and Buyer roles; the active role is selected at login.

## Pages and Purpose

| Page | Route | Purpose |
|---|---|---|
| Seller Dashboard | /seller | Revenue overview, stats, recent orders |
| Store Settings | /seller/settings | Edit store name, description, logo |
| Products | /seller/products | List, add, edit, delete products |
| Add Product | /seller/products/new | Create a new product listing |
| Edit Product | /seller/products/:id | Edit existing product |
| Incoming Orders | /seller/orders | All orders from the seller's store |
| Order Detail | /seller/orders/:id | Full order detail, process button |
| Promo Management | /seller/promos | Create and list store-specific promos |
| Seller Wallet | /seller/wallet | Earnings balance and transaction history |

## Seller Flow

```
Register or Login (select SELLER role)
    |
    v
Create Store at /seller/settings (if no store yet)
    |
    v
Add products at /seller/products/new
  - Name, description, price, compare price
  - Stock, weight (grams), category, images
    |
    v
Buyer places an order for your product
Order appears in /seller/orders with status: SEDANG_DIKEMAS
    |
    v
Click "Proses Pesanan" to pack the order
Status changes to: MENUNGGU_PENGIRIM
Order is now visible to drivers
    |
    v
Driver picks up and delivers (no seller action needed)
    |
    v
Buyer confirms receipt (PESANAN_SELESAI)
Seller wallet credited: 95% of product subtotal
(5% platform commission deducted)
```

## Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /stores/me | Get own store data |
| POST | /stores/me | Create a store |
| PUT | /stores/me | Update store settings |
| GET | /products/seller | List own products |
| POST | /products/seller | Create product |
| PUT | /products/seller/:id | Update product |
| DELETE | /products/seller/:id | Delete product |
| GET | /orders/seller | Incoming orders |
| POST | /orders/:id/process | Process order (pack it) |
| GET | /promos | List promos |
| POST | /promos | Create a promo for your store |
| DELETE | /promos/:id | Remove a promo |
| GET | /wallet | Wallet balance |
| GET | /wallet/transactions | Earnings history |

## Earnings and Commission

When a buyer confirms receipt:
- Platform takes 5% of the order subtotal (product prices only, excluding delivery fee and tax)
- Seller receives: subtotal x 0.95
- This amount is credited as an INCOME mutation to the seller wallet

## Store Constraints

- Store name must be globally unique
- One seller account can have only one store
- Products cannot be purchased from a suspended store


## Enhanced Features
- **Dynamic Store Metrics**: Your store's `Total Sales` and `Rating` are automatically aggregated based on actual completed orders and buyer reviews. No manual updating is required.
- **Automated Sales Tracking**: Each product's `sold` count dynamically increases the moment an order reaches `PESANAN_SELESAI`.
