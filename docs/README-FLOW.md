<div align="center">
  <img src="../frontend/public/logo-seapedia-for-readme.png" alt="SEAPEDIA Logo" width="220" />
</div>

<h1 align="center">SEAPEDIA - End-to-End Flow Guide</h1>

This document is specifically prepared for the judges to test the SEAPEDIA system flow thoroughly. This application has implemented the full capabilities of an e-commerce ecosystem according to the Task Level specifications (Levels 1 to 7).

---

## Preparation
- Ensure you have accessed the main web application.
- You can log in using the demo accounts provided in the main `README.md`.
- The system uses a **Single Account Multi-Role** concept (Role Switcher - Level 7). This means one email address can have dual roles (e.g., as both a Buyer and a Seller).

---

## Main Testing Scenario (End-to-End Flow)

Below is the main transaction scenario from start to finish to prove that all application level specifications have been met.

### 1. Buyer Selects and Orders Products (Level 1, Level 4)
1. Log in using the **Buyer** account (`budi.santoso@gmail.com`).
2. Go to the **Home** or **Search** page and find a product from a specific store (e.g., "TechMart Indonesia").
3. Click on the product, then press the **Add to Cart** button.
4. Open the **Cart** page via the icon in the top right corner.
5. You will see the system obeys **strict business rules (Level 4)**: A buyer can only select and checkout items from **the exact same store** at one time. If you add products from another store, the checkbox will be blocked.
6. Click **Checkout**, fill in the delivery method, and ensure the E-Wallet balance is sufficient. Click **Pay & Create Order**.
7. The order is successfully created with the initial status: `MENUNGGU_DIPROSES` (Waiting to be Processed).
8. *Security Note (Level 7)*: If a seller maliciously switches their role to Buyer and attempts to purchase goods from their own store, the system will automatically block the transaction to prevent fraud.

### 2. Seller Processes the Order (Level 2, Level 3)
1. Log out from the Buyer account, then Log in using the **Seller** account from the store whose items were just purchased (e.g., `techmart@seapedia.id`).
2. In the top right corner, click **Seller Dashboard** or use the *Switch Role* feature to switch to the SELLER role.
3. Open the **Orders** menu in the left navigation. You will see the new order from Budi Santoso with the status `MENUNGGU_DIPROSES`.
4. Click on the order, then click the **Process Order** button.
5. The system (Level 2) will update the order status to `DIPROSES` (Processed).
6. When the seller has packed the goods and is ready to ship, click the **Ship Order** button.
7. The system changes the order status to `DIKIRIM` (Shipped) and automatically posts a delivery job to the delivery board for *Drivers*.

### 3. Courier (Driver) Picks Up & Completes Delivery (Level 2)
1. Log out from the Seller account, then Log in using the **Driver** account (`rudi.driver@seapedia.id`).
2. You will automatically enter the **Driver Dashboard**.
3. Open the **Job Board** menu. The delivery job that was just triggered by the seller will appear here.
4. Click **Take Job**. The job now moves to your **My Deliveries** menu.
5. After simulating the delivery of the goods to the destination, open the job details and click **Complete Delivery**.
6. The system records that the goods have arrived, but the order status on the customer's side remains `DIKIRIM` until the customer makes the final confirmation.

### 4. Customer Confirms Order & Finances (Level 3, Level 5)
1. Log out from the Driver account, Log in again using the **Buyer** account (`budi.santoso@gmail.com`).
2. Go to the **My Orders** page.
3. Click the **Complete Order** button on the order that has the status `DIKIRIM`. The final status of the order changes to `SELESAI` (Completed).
4. *Fund & Commission Distribution (Level 3)*: 
   - The product funds are automatically credited to the **Seller's Wallet** after deducting the platform commission (5%).
   - The shipping fee is credited to the **Driver's Wallet** after deducting the platform admin fee (10%).
   - This distribution can be verified in real-time on their respective Dashboards (Seller & Driver Wallet).
5. *Review (Level 5)*: After the order is completed, the user can leave a rating (1-5 stars) along with a comment for the product. This rating will affect the aggregate rating (average stars) on the product details page going forward.

---

## Additional Verification

**Automated SLA (Service Level Agreement) System (Level 6)**
The backend system is equipped with a *cron job* and internal validations. If the seller does not process the order beyond the SLA time limit (e.g., 24 hours), or the *Driver* does not complete the delivery (e.g., 72 hours), the system can cancel the order and refund the money to the buyer's wallet.

**Admin Analytics & Dashboard (Level 7)**
Log in using the **Admin** account (`admin@seapedia.id`). On the main dashboard page, the Admin can view the aggregation of money traffic, total users per role, total orders, and E-Wallet statistics.

---
By following the flow above, you can prove the solid end-to-end integration between all components/levels in the SEAPEDIA ecosystem. Happy testing!
