<div align="center">
  <img src="../frontend/public/logo-seapedia-for-readme.png" alt="SEAPEDIA Logo" width="220" />
</div>

<h1 align="center">SEAPEDIA - Buyer Flow Documentation</h1>

---

## Overview

The Buyer role is the primary consumer of the marketplace. Buyers browse products, manage a cart, checkout with wallet payment, track orders, and confirm delivery.

## Pages and Purpose

| Page             | Route          | Purpose                                                                  |
| ---------------- | -------------- | ------------------------------------------------------------------------ |
| Homepage         | /              | Browse featured products and app reviews                                 |
| Search / Catalog | /search        | Filter and search products by category, keyword, sort                    |
| Product Detail   | /product/:slug | View product info, images, price, and add to cart                        |
| Cart             | /cart          | View and manage cart items, see subtotal                                 |
| Checkout         | /checkout      | Select delivery address, shipping method, apply voucher, confirm payment |
| Orders           | /orders        | List all past and current orders                                         |
| Order Detail     | /orders/:id    | View full order with items, tracking, and status timeline                |
| Wallet           | /wallet        | View balance, top up, and transaction history                            |
| Account          | /account       | Edit profile, manage addresses                                           |

## Buyer Flow

```
Register or Login (select BUYER role)
    |
    v
Browse products on Homepage or /search
    |
    v
View product detail, click "Tambah ke Keranjang"
    |
    v
Open Cart - review items and subtotal
Note: Only products from one store per cart allowed
    |
    v
Go to /checkout
  - Select delivery address
  - Choose delivery method: INSTANT, NEXT_DAY, or REGULAR
  - Apply optional promo/voucher code
  - Review: subtotal, discount, PPN 12%, delivery fee, total
    |
    v
Confirm Payment (deducts from wallet)
    |
    v
Order created with status: SEDANG_DIKEMAS
    |
    v
Wait for Seller to process order (MENUNGGU_PENGIRIM)
Wait for Driver to pick up and deliver (SEDANG_DIKIRIM)
Wait for delivery to complete (TERKIRIM)
    |
    v
Confirm receipt on Order Detail page
Order becomes: PESANAN_SELESAI
Seller wallet credited (minus 5% platform fee)
```

## Key API Endpoints

| Method | Endpoint                          | Description                       |
| ------ | --------------------------------- | --------------------------------- |
| GET    | /products                         | Browse public product catalog     |
| GET    | /products/:slug                   | Product detail                    |
| GET    | /cart                             | Get current cart                  |
| POST   | /cart/items                       | Add item to cart                  |
| PATCH  | /cart/items/:id                   | Update item quantity              |
| DELETE | /cart/items/:id                   | Remove item                       |
| DELETE | /cart/clear                       | Empty cart                        |
| POST   | /orders/checkout/validate-voucher | Check promo code                  |
| POST   | /orders/checkout                  | Place order                       |
| GET    | /orders                           | Order history                     |
| GET    | /orders/:id                       | Order detail with status history  |
| PATCH  | /orders/:id/status                | Confirm receipt (PESANAN_SELESAI) |
| GET    | /wallet                           | Wallet balance                    |
| POST   | /wallet/topup                     | Top up balance                    |
| GET    | /wallet/transactions              | Transaction history               |
| GET    | /addresses                        | Saved addresses                   |
| POST   | /addresses                        | Add new address                   |
| PATCH  | /addresses/:id                    | Update or set default             |
| DELETE | /addresses/:id                    | Remove address                    |

## Business Rules for Buyers

**Cart** - Only one store's products allowed per cart. Adding a product from a different store while the cart has items returns HTTP 400.

**Checkout Calculation** -
  Subtotal = sum of (item price x quantity)
  Discount = from promo code (PERCENTAGE or FIXED)
  Tax (PPN 12%) = (Subtotal - Discount) x 0.12
  Delivery Fee = INSTANT: 35,000 | NEXT_DAY: 20,000 | REGULAR: 12,000
  Total = Subtotal - Discount + Tax + Delivery Fee

**Overdue Refund** - If the order is stuck in processing beyond SLA, Admin can trigger an auto-refund. Order status becomes DIKEMBALIKAN, wallet balance is restored, and product stock is returned.

## Order Status Reference

| Status            | Meaning                                 |
| ----------------- | --------------------------------------- |
| SEDANG_DIKEMAS    | Seller is packing the order             |
| MENUNGGU_PENGIRIM | Waiting for a driver                    |
| SEDANG_DIKIRIM    | Driver picked up and on the way         |
| TERKIRIM          | Delivered, waiting for buyer to confirm |
| PESANAN_SELESAI   | Buyer confirmed receipt, finalized      |
| DIKEMBALIKAN      | Refunded due to overdue or cancellation |
