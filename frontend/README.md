# 🍎 Fruit Mandi - Advanced Agricultural Ledger Management System

Fruit Mandi is a comprehensive **MERN Stack** digital management system specifically tailored for the Pakistani agricultural market context. It automates the traditional "Bahi Khata" (paper-based ledger) system used in fruit markets (Mandis).

The system handles everything from **private cold storage inventory** and **supplier (Beypari) consignments** to **business credit tracking (Udhaar)** and a **customer-facing retail storefront**. It is designed to solve the problems of data loss, human error in bookkeeping, and inefficient stock tracking in high-volume agriculture businesses.

---

## 🛠️ Tech Stack

### Database & Backend
*   **MongoDB + Mongoose**: Used as the primary database. MongoDB's document-based structure is perfect for flexible agricultural records, while Mongoose provides strict schema validation to prevent data errors.
*   **Node.js**: The runtime environment that allows us to run JavaScript on the server for high performance and scalability.
*   **Express.js**: The backend framework used to build the RESTful API endpoints that the frontend communicates with.
*   **JWT (JSON Web Token)**: Used for secure authentication. It allows the server to verify user identities without storing session data on the server.
*   **Bcrypt**: A library used to hash passwords before storing them in the database, ensuring user security even if the database is compromised.
*   **Multer**: A middleware for handling `multipart/form-data`, specifically used for uploading fruit images and profile pictures to the server.

### Frontend
*   **React.js (Vite)**: The frontend library used for building a fast, interactive user interface. Vite is used as the build tool for near-instant server starts and optimized production builds.
*   **Redux Toolkit**: The industrial standard for state management in React. It manages the global state for user authentication and the shopping cart.
*   **Axios**: An HTTP client used to send requests from the React frontend to the Express backend.
*   **Lucide-React**: A library of beautiful, consistent icons used throughout the dashboard and store.

---

## 📁 Complete Folder & File Breakdown

### 📂 `Root Folder`
The top-level directory containing the entire ecosystem.
*   **`.gitignore`**: Tells Git which files/folders to ignore (like `node_modules`).
*   **`eslint.config.js`**: Configuration file for ESLint to ensure code quality and consistency.
*   **`index.html`**: The main entry point for the React application.
*   **`package.json`**: Lists frontend dependencies and scripts (like `npm run dev`).
*   **`vite.config.js`**: Settings for the Vite build tool.
*   **`tmp_inventory.jsx`**: A temporary experimental file for testing inventory UI changes.
*   **`tmp_patch.py`**: A Python script used for one-time data patching or file updates.

---

### 📂 `backend/`
Contains the entire server-side logic and database interactions.

#### 📁 `backend/config/`
*   **`db.js`**: Contains the logic to connect the application to MongoDB. It uses **Mongoose** to establish a secure link.

#### 📁 `backend/controllers/`
Responsible for the "Business Logic". These files process requests and decide what data to send back.
*   **`authController.js`**: Manages user login, registration, and token generation.
*   **`beypariController.js`**: Logic for managing fruit suppliers (Beyparis).
*   **`crudFactory.js`**: A reusable "Factory" that provides standard Create, Read, Update, and Delete logic to all other modules.
*   **`customerController.js`**: Logic for buyer management and credit tracking.
*   **`employeeController.js`**: Handles HR logic, staff hiring, and data management.
*   **`extraCollectionsController.js`**: A hub that applies CRUD logic to 23+ auxiliary models like Attendance and Expenses.
*   **`financeController.js`**: Logic for processing financial vouchers and bookkeeping.
*   **`inventoryController.js`**: Managing stock levels, fruit health, and pricing.
*   **`invoiceController.js`**: Logic for searching and creating bills/invoices.
*   **`ledgerController.js`**: The core accounting engine that tracks "Cash In" and "Cash Out".
*   **`metaController.js`**: Allows admins to view technical metadata about the database collections.
*   **`orderController.js`**: Logic for processing retail orders from the store.

#### 📁 `backend/middlewares/`
Software that runs "in the middle" of a request and a response.
*   **`authMiddleware.js`**: Protects routes by checking if the user has a valid **JWT Token**.
*   **`uploadMiddleware.js`**: Configures **Multer** to save uploaded files (like fruit photos) into the `uploads/` folder.
*   **`validationMiddleware.js`**: Ensures that data sent from the frontend is complete and correctly formatted.

#### 📁 `backend/models/` (Explained in Detail below)
Contains 23 files defining the structure of every table in the database using **Mongoose Schemas**.

#### 📁 `backend/routes/`
Defines the URL endpoints of your API.
*   **`apiRoutes.js`**: The main route file for core business features like Inventory, Ledger, and Orders.
*   **`authRoutes.js`**: Secure routes specifically for `/login` and `/register`.

#### 📁 `backend/scripts/`
*   **`checkUser.js`**: Terminal utility to check if a user profile is correctly saved.
*   **`hashPassword.js`**: Tool to manually generate encrypted passwords for new accounts.
*   **`updateAdmin.js`**: Utility to change a regular user's role to 'Admin' in the database.

---

### 📂 `src/`
The source code for the React frontend application.

#### 📁 `src/api/`
*   **`axios.js`**: Creates a global **Axios Instance**. It includes an "Interceptor" that automatically attaches the user's JWT token to every outgoing request.

#### 📁 `src/components/`
*   **`FruitIcon.jsx`**: A reusable visual component that shows the correct icon for each fruit category.
*   **`Sidebar.jsx`**: The main navigation menu that lets users switch between Dashboard, Inventory, etc.

#### 📁 `src/pages/`
The actual screens users see and interact with.
*   **`Dashboard.jsx`**: The command center showing sales charts and vital stats.
*   **`Inventory.jsx`**: Management page for stock levels and fruit quality.
*   **`Ledger.jsx`**: Digital bookkeeping page for tracking every rupee entering or leaving the business.
*   **`Customers.jsx`**: Profile management for buyers.
*   **`Beyparis.jsx`**: Profile management for suppliers (brokers).
*   **`Udhaar.jsx`**: Dedicated credit-tracking page for "Pending Receivables".
*   **`HR.jsx`**: Employee management, attendance, and payroll.
*   **`Reports.jsx`**: Generates and exports digital reports in **PDF** or **Excel**.
*   **`Landing.jsx`**: The public homepage of the Mandi website.
*   **`Login.jsx`**: Portal for customers to log in.
*   **`AdminLogin.jsx`**: Secure portal for administrators.
*   ...and several others for Settings, Copybooks, Commission, and Finance.

#### 📁 `src/pages/Store/`
Specialized module for the retail side of the business.
*   **`StoreHome.jsx`**: The "Featured" section for buyers.
*   **`StoreProducts.jsx`**: The searchable catalog of all fruits in stock.
*   **`StoreCart.jsx`**: Review and checkout page for buyers.
*   **`StoreOrders.jsx`**: Personal history page where users track their orders.

#### 📁 `src/redux/`
*   **`authSlice.js`**: Stores the logged-in user's information globally.
*   **`cartSlice.js`**: Manages the logic for adding and removing items from the shopping cart.
*   **`store.js`**: The main Redux configuration file.

---

## ⚙️ How The Project Works (Full Flow)

1.  **Frontend Load**: `main.jsx` mounts the `App.jsx` component. **Redux Store** initializes to check if a user was previously logged in.
2.  **Request Cycle**: When you click "Save Inventory", **Axios** (src/api) creates a JSON request. It injects the **JWT token** into the header so the server knows who you are.
3.  **Routing**: The request hits `backend/server.js`, which passes it to `apiRoutes.js`.
4.  **Interception**: Before reaching the logic, **`authMiddleware.js`** verifies the token. If it's valid, the request proceeds.
5.  **Logic**: The matching **Controller** (e.g., `inventoryController.js`) receives the data.
6.  **Database**: The controller uses a **Mongoose Model** (e.g., `Inventory.js`) to save the data into the specific **MongoDB Collection**.
7.  **Response**: The server sends back a "Success" message. The React frontend receives this and updates the UI instantly without a page refresh.
8.  **State Update**: If the action affects the user's account or cart, **Redux** updates the state to reflect the change globally.

---

## 🗄️ Database Models Explained

The Mandi system uses 23 specific models to map a complex agricultural business:

*   **Attendance**: Tracks employee check-in/out times.
*   **Beypari**: Profiles for brokers/suppliers who bring fruit to the Mandi.
*   **BeypariSettlement**: Records of when suppliers are paid for their produce.
*   **Consignment**: Details of incoming shipments (e.g., "500 crates of Apples").
*   **Customer**: Profiles for buyers, tracking their purchase history and debt.
*   **DueAccount**: A master record of who owes money to the business.
*   **DuePayment**: Specific records of cash received against debts.
*   **Employee**: Personal and professional details of the workforce.
*   **Expense**: Operational costs like electricity, rent, or maintenance.
*   **FinanceTransaction**: General ledger entries for business accounting.
*   **FruitType**: Categories of fruits (Citrus, Mango, etc.) for better organization.
*   **Inventory**: The real-time stock levels, health status, and prices of all produce.
*   **Invoice**: Permanently saved records of customer transactions.
*   **Notification**: System-generated alerts for low stock or late payments.
*   **Order**: Point-of-sale records for online store transactions.
*   **Partner**: Details for co-owners or stakeholders in the market.
*   **PartnerCopybook**: A specialized ledger for tracking partner contributions.
*   **Payroll**: Salary distribution records for employees.
*   **ProductReview**: Feedback and ratings from store customers.
*   **SalesTransaction**: Detailed logs of every physical sale made in the market.
*   **StockMovement**: A history of every time stock was added or removed.
*   **SystemSetting**: Global settings like commission percentages and Mandi names.
*   **User**: The central authentication model for logins and roles.

---

## 🔐 Authentication Flow

1.  **User Logins**: User enters credentials on `Login.jsx` or `AdminLogin.jsx`.
2.  **Server Check**: `authController.js` verifies the email and password (via Bcrypt).
3.  **Token Generation**: If correct, the server creates a **JWT Token** containing the user's ID and role.
4.  **Storage**: The frontend receives the token and saves it in **LocalStorage** and **Redux (`authSlice`)**.
5.  **Protection**: Every time the user visits a private page, the `authMiddleware.js` on the server checks the token to ensure it hasn't expired.

---

## 🚀 How To Run The Project

### Backend Setup:
1.  Open terminal in `/backend`.
2.  Run `npm install` to install dependencies.
3.  Create a `.env` file and add:
    *   `MONGODB_URI=your_mongo_url`
    *   `JWT_SECRET=your_secret_key`
    *   `PORT=5000`
4.  Run `npm start` to launch the server.

### Frontend Setup:
1.  Open terminal in the root folder.
2.  Run `npm install`.
3.  Run `npm run dev`.
4.  Visit `http://localhost:5173` in your browser.

---

## 📝 Important Notes

*   **`dist/` Folder**: This folder is generated when you run `npm run build`. It contains the highly optimized production version of your website that you would upload to a real server.
*   **`file-manifests/`**: This folder contains simple text files that act as "snapshots" of your project folders. They are useful for quickly seeing what files existed at a certain time.
*   **`old/` Folder**: Contains the original code (HTML/JS) from the very first version of this project. It is kept for reference but is NOT used in the current app.
*   **`COLLECTIONS.md`**: A technical document located in the backend folder that lists every database collection name exactly as it appears in MongoDB.
*   **Scripts**: The utilities in the `backend/scripts/` folder are for manual administrative work (like resetting passwords or checking data) and are not part of the main website UI.

---
*Documentation Authored by Antigravity AI Engineering.*
