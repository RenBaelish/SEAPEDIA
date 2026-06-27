<div align="center" style="background-color: white; padding: 20px; border-radius: 12px; display: inline-block;">
  <img src="../frontend/public/logo-seapedia.png" alt="SEAPEDIA Logo" width="180" />
</div>

<h1 align="center">SEAPEDIA - Driver Flow Documentation</h1>

---

## Overview

Drivers see available delivery jobs created when sellers process orders, take them, and mark them as delivered. Earnings are automatically credited to the driver's wallet minus a 10% platform commission.

## Pages and Purpose

| Page | Route | Purpose |
|---|---|---|
| Driver Dashboard | /driver | Available jobs overview |
| Available Jobs | /driver | List of orders ready for pickup |
| My Deliveries | /driver/my-deliveries | Job history (completed and active) |
| Earnings | /driver/earnings | Income summary and breakdown |
| Driver Wallet | /driver/wallet | Wallet balance and transaction history |

## Driver Flow

```
Register or Login (select DRIVER role)
    |
    v
View available jobs at /driver
Jobs appear when orders status = MENUNGGU_PENGIRIM
    |
    v
Click "Ambil Job" on a delivery card
Order status changes to: SEDANG_DIKIRIM
Job is now exclusively yours (other drivers cannot take it)
    |
    v
Deliver to buyer's address
Click "Selesaikan Pengiriman"
    |
    v
Order status changes to: TERKIRIM
Driver wallet credited: 90% of delivery fee
(10% platform commission deducted)
    |
    v
Buyer confirms receipt -> order becomes PESANAN_SELESAI
(No driver action required for this step)
```

## Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /deliveries/available | List available jobs (MENUNGGU_PENGIRIM) |
| POST | /deliveries/:id/take | Claim a job |
| POST | /deliveries/:id/complete | Mark delivery as done |
| GET | /deliveries/my-jobs | Driver's job history |
| GET | /wallet | Wallet balance |
| GET | /wallet/transactions | Earnings history |

## Earnings Calculation

- Gross delivery fee: set at order checkout by buyer
  - INSTANT: Rp 35,000
  - NEXT_DAY: Rp 20,000
  - REGULAR: Rp 12,000
- Platform commission: 10% of gross fee
- Net income to driver: gross fee x 0.90

Example: INSTANT order -> Rp 35,000 x 0.90 = Rp 31,500 net to driver wallet

## Job Rules

- Only one driver can claim each job
- Once taken, the job disappears from the available list for other drivers
- A driver can only complete a job they personally claimed
