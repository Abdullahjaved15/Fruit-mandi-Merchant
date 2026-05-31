# 🍎 Fruit Mandi - Full-Stack Agricultural Management System (Deep-Dive Documentation)

Welcome to the exhaustive technical documentation for "Fruit Mandi". This project is a professional MERN stack application designed to digitize the operations of a traditional fruit market (Mandi), managing everything from complex B2B ledgers to a B2C digital storefront.

---

## 📁 Complete Project Structure Diagram

```text
Fruit-Mandi/ (Root)
│
├── backend/ (The Node.js/Express Server)
│   ├── config/ 
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── beypariController.js
│   │   ├── crudFactory.js
│   │   ├── customerController.js
│   │   ├── employeeController.js
│   │   ├── extraCollectionsController.js
│   │   ├── financeController.js
│   │   ├── inventoryController.js
│   │   ├── invoiceController.js
│   │   ├── ledgerController.js
│   │   ├── metaController.js
│   │   └── orderController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── uploadMiddleware.js
│   │   └── validationMiddleware.js
│   ├── models/
│   │   ├── Attendance.js
│   │   ├── Beypari.js
│   │   ├── BeypariSettlement.js
│   │   ├── Consignment.js
│   │   ├── Customer.js
│   │   ├── DueAccount.js
│   │   ├── DuePayment.js
│   │   ├── Employee.js
│   │   ├── Expense.js
│   │   ├── FinanceTransaction.js
│   │   ├── FruitType.js
│   │   ├── Inventory.js
│   │   ├── Invoice.js
│   │   ├── Notification.js
│   │   ├── Order.js
│   │   ├── Partner.js
│   │   ├── PartnerCopybook.js
│   │   ├── Payroll.js
│   │   ├── ProductReview.js
│   │   ├── SalesTransaction.js
│   │   ├── StockMovement.js
│   │   ├── SystemSetting.js
│   │   └── User.js
│   ├── routes/
│   │   ├── apiRoutes.js
│   │   └── authRoutes.js
│   ├── scripts/
│   │   ├── checkUser.js
│   │   ├── hashPassword.js
│   │   └── updateAdmin.js
│   ├── uploads/ (Static Assets)
│   └── server.js (Entry Point)
│
├── src/ (The React Frontend)
│   ├── api/
│   │   └── axios.js
│   ├── components/
│   │   ├── FruitIcon.jsx
│   │   └── Sidebar.jsx
│   ├── pages/
│   │   ├── Store/
│   │   │   ├── StoreCart.jsx
│   │   │   ├── StoreHome.jsx
│   │   │   ├── StoreOrders.jsx
│   │   │   └── StoreProducts.jsx
│   │   ├── AdminLogin.jsx
│   │   ├── AdminOrders.jsx
│   │   ├── Beyparis.jsx
│   │   ├── Commission.jsx
│   │   ├── Copybooks.jsx
│   │   ├── Customers.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Finance.jsx
│   │   ├── HR.jsx
│   │   ├── Inventory.jsx
│   │   ├── Landing.jsx
│   │   ├── Ledger.jsx
│   │   ├── Login.jsx
│   │   ├── Reports.jsx
│   │   ├── Settings.jsx
│   │   └── Udhaar.jsx
│   ├── redux/
│   │   ├── authSlice.js
│   │   ├── cartSlice.js
│   │   └── store.js
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
└── vite.config.js
```

---

## 🛠️ EXHAUSTIVE FILE-BY-FILE BREAKDOWN

### 1. BACKEND: The Server & Logic Layer

#### 📁 `backend/config/`
*   **`db.js`**:
    *   **Purpose**: Handles the asynchronous connection between Node.js and MongoDB.
    *   **Logic**: Uses `mongoose.connect()` with a `try-catch` block to ensure the server doesn't crash if the database is offline.

#### 📁 `backend/controllers/`
*   **`authController.js`**: Logic for logging users in. It verifies emails, checks hashed passwords using `bcrypt`, and generates **JWT tokens** for the frontend.
*   **`beypariController.js`**: Logic for managing "Beyparis" (the middlemen/suppliers). Handles adding and removing suppliers from the system.
*   **`crudFactory.js`**: **Crucial Architecture File.** It contains a generic "Factory" function that takes a Model and creates standard `list`, `create`, `update`, and `delete` functions for it. This saves hundreds of lines of code.
*   **`customerController.js`**: Manages fruit buyers. It tracks their basic info and their current debt (Udhaar) status.
*   **`employeeController.js`**: Handles HR logic for hiring and firing market staff.
*   **`extraCollectionsController.js`**: A centralized hub that applies the `crudFactory` logic to all 23 "extra" models like Attendance or Expenses.
*   **`financeController.js`**: Handles financial vouchers and transaction records.
*   **`inventoryController.js`**: Manages the cold storage. It handles logic for stock level updates and quality health checks.
*   **`invoiceController.js`**: Logic for generating and retrieving billing records.
*   **`ledgerController.js`**: Manages the complex "Ledger" (Bahi Khata). It tracks incoming and outgoing cash flows.
*   **`metaController.js`**: A diagnostic tool used by admins to check the status of all database collections at once.
*   **`orderController.js`**: Processes orders from the digital storefront (Shop). It links buyers to products and calculates total bills.

#### 📁 `backend/middlewares/`
*   **`authMiddleware.js`**: The "Security Guard". It sits between the user's request and the controller. It decodes the JWT token to prove the user is who they claim to be.
*   **`uploadMiddleware.js`**: Uses the **Multer** library to handle image uploads for fruit pictures or profile photos.
*   **`validationMiddleware.js`**: Checks incoming data (like prices or dates) to ensure they are the correct format before they ever reach the database.

#### 📁 `backend/models/` (Data Blueprints)
*   **`Attendance.js`**: Schema for tracking employee presence/absence.
*   **`Beypari.js`**: Schema for suppliers (Name, Area, Contact).
*   **`BeypariSettlement.js`**: Tracks financial payouts to suppliers.
*   **`Consignment.js`**: Records incoming shipments of fruit crates.
*   **`Customer.js`**: Schema for buyers, including their debt limit.
*   **`DueAccount.js`**: Tracks overall money owed to the Mandi.
*   **`DuePayment.js`**: Records specific payments made against debts.
*   **`Employee.js`**: Schema for staff (Salary, Role, Contact).
*   **`Expense.js`**: Logs operational costs (Electricity, rent, etc.).
*   **`FinanceTransaction.js`**: General ledger entries.
*   **`FruitType.js`**: Catalog of available fruit varieties.
*   **`Inventory.js`**: The main stock record (Price, Stock Count, Quality %).
*   **`Invoice.js`**: Schema for saved bills.
*   **`Notification.js`**: Schema for system alerts (e.g., "Low Stock!").
*   **`Order.js`**: Detailed POS schema for store sales.
*   **`Partner.js`**: Information for market business partners.
*   **`PartnerCopybook.js`**: Shared account records.
*   **`Payroll.js`**: Salary records.
*   **`ProductReview.js`**: Stores customer feedback on fruit quality.
*   **`SalesTransaction.js`**: Tracks internal market sales.
*   **`StockMovement.js`**: Logs every time stock is moved or sold.
*   **`SystemSetting.js`**: Global app settings (Commission rate, Mandi name).
*   **`User.js`**: Schema for Admin and User accounts with password hashing.

#### 📁 `backend/routes/`
*   **`apiRoutes.js`**: The main highway. It defines URLs like `/api/data/inventory` and links them to the correct Controller logic.
*   **`authRoutes.js`**: Dedicated endpoints for `/login` and `/register`.

#### 📁 `backend/scripts/`
*   **`checkUser.js`**: A dev tool to verify if a user exists in the DB via terminal.
*   **`hashPassword.js`**: A tool to manually create encrypted passwords for initial setup.
*   **`updateAdmin.js`**: A utility to promote a regular user to Admin status.

#### 📝 `backend/server.js`
*   **The Heart of the Project**: It initializes Express, connects to MongoDB, sets up file upload routing, and starts the server on Port 5000.

---

### 2. FRONTEND: The User Interface

#### 📁 `src/api/`
*   **`axios.js`**: Configures the connection to the backend. It has an **Interceptor** that automatically takes the JWT from LocalStorage and puts it in the `Authorization` header for every single call.

#### 📁 `src/components/`
*   **`FruitIcon.jsx`**: A reusable UI component that renders specific fruit icons based on the category (Apple, Orange, etc.).
*   **`Sidebar.jsx`**: The main navigation menu. It changes dynamically depending on if you are an "Admin" or a "User".

#### 📁 `src/redux/`
*   **`authSlice.js`**: Manages the "Login State" globally so the app knows who you are.
*   **`cartSlice.js`**: Manages the shopping cart items, quantities, and totals.
*   **`store.js`**: The central brain of React that coordinates all data slices.

#### 📁 `src/pages/` (The Views)
*   **`AdminLogin.jsx`**: A private portal for the Mandi owner to log in.
*   **`AdminOrders.jsx`**: A control panel for admins to see orders and mark them as "Delivered".
*   **`Beyparis.jsx`**: A page to manage relationships with suppliers.
*   **`Commission.jsx`**: Calculates the Mandi's 8% cut from all transactions.
*   **`Copybooks.jsx`**: A digital version of traditional market record books.
*   **`Customers.jsx`**: A directory of all buyers with their mobile numbers and addresses.
*   **`Dashboard.jsx`**: The command center. Shows charts, pie graphs, and stock alerts.
*   **`Finance.jsx`**: A page for logging vouchers and general bookkeeping.
*   **`HR.jsx`**: Employee management, attendance, and payroll tracking.
*   **`Inventory.jsx`**: Managing physical stock. It allows uploading item photos and setting quality levels.
*   **`Landing.jsx`**: The beautiful first page users see introducing "Javed & Sons Mandi".
*   **`Ledger.jsx`**: The primary accounting page showing Cash In vs. Cash Out.
*   **`Login.jsx`**: Entry portal for consumers/store users.
*   **`Reports.jsx`**: A feature to export business data into **PDF (jsPDF)** or **Excel (XLSX)**.
*   **`Settings.jsx`**: Allows admins to update their profile and system preferences.
*   **`Udhaar.jsx`**: A dedicated page for tracking and managing business credit (Receivables).

#### 📁 `src/pages/Store/` (The Consumer Module)
*   **`StoreHome.jsx`**: The main shopping dashboard where users can see featured fruits.
*   **`StoreProducts.jsx`**: A searchable catalog of all fruits available for purchase.
*   **`StoreCart.jsx`**: Where users review their selected items before checking out.
*   **`StoreOrders.jsx`**: A history page where users can see their past purchases and delivery status.

#### 📝 `App.jsx`
*   The **Master Routing File**. It decides which page and sidebar to show based on the URL and the user's role.

---

## ⚙️ TECHNICAL WORKFLOW

### 1. The Communication Flow
The Frontend speaks to the Backend using **REST APIs**. When a user clicks "Add Stock":
1.  **React State** (Inventory.jsx) gathers the form data.
2.  **Axios** (axios.js) wraps that data and adds the **JWT Token**.
3.  **Express Router** (apiRoutes.js) receives it and calls the **Controller** (inventoryController.js).
4.  **Mongoose** (Inventory.js Model) saves it into **MongoDB**.
5.  The Server sends back a `201 Created` status, and the UI updates instantly.

### 2. State Management Flow
We use **Redux Toolkit** to prevent "Prop Drilling".
*   If a user logs in, the `authSlice` updates.
*   Every component (Sidebar, Topbar, Dashboard) reads from the `authSlice` to change the UI (e.g., showing the user's name).

---

## 🛠️ INSTALLATION & SETUP

### Backend Setup
1. `cd backend`
2. `npm install`
3. Fill your `.env` (MONGODB_URI and JWT_SECRET)
4. `npm start`

### Frontend Setup
1. Open a new terminal in the root folder.
2. `npm install`
3. `npm run dev`

---
*Generated by the Antigravity Senior Engineering Team.*
