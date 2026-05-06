# MongoDB Collections Map (Compass)

Your backend uses **Mongoose models** which write into specific MongoDB **collections**.
Use this file to quickly find where data is stored in MongoDB Compass.

## 1) Confirm you are viewing the correct database

When you start the backend it prints:

- `MongoDB Connected: <host> / <dbName>`

The `<dbName>` shown there is the **exact database name** you must open in Compass.

> Important: your `.env` uses `MONGODB_URI=mongodb://localhost:27017/Javed_%26_Sons`
> but MongoDB decodes `%26` to `&`, so the real DB name is **`Javed_&_Sons`**.
> If you created a separate Compass DB named `Javed_%26_Sons`, that is a different DB.

## 2) Feature → Model → Collection (what Compass shows)

| Feature (UI) | API base | Model | Collection name (Compass) |
|---|---|---|---|
| Auth / Users | `/api/auth/*` | `User` | `Users` |
| Inventory / Store Products | `/api/data/inventory` | `Inventory` | **`Products`** |
| Online Orders | `/api/data/orders` | `Order` | **`Online_Orders`** |
| Customers | `/api/data/customers` | `Customer` | `Customers` |
| Beyparis | `/api/data/beyparis` | `Beypari` | `Beypari` |
| Employees | `/api/data/employees` | `Employee` | `Employee` |
| Invoices / Reports | `/api/data/reports` | `Invoice` | `Invoices` |
| Finance vouchers | `/api/data/finance` | `FinanceTransaction` | `Finance_Transactions` |
| Ledger transactions | `/api/data/ledger` | `SalesTransaction` | `Sales_Transactions` |
| Attendance | `/api/data/attendance` | `Attendance` | `Attendance` |
| Beypari settlements | `/api/data/beypari-settlements` | `BeypariSettlement` | `Beypari_Settlements` |
| Consignments | `/api/data/consignments` | `Consignment` | `Consignments` |
| Due accounts | `/api/data/due-accounts` | `DueAccount` | `Due_Accounts` |
| Due payments | `/api/data/due-payments` | `DuePayment` | `Due_Payments` |
| Expenses | `/api/data/expenses` | `Expense` | `Expenses` |
| Fruit types | `/api/data/fruit-types` | `FruitType` | `Fruit_Types` |
| Notifications | `/api/data/notifications` | `Notification` | `Notification` |
| **Partners** | `/api/data/partners` | `Partner` | **`Partners`** |
| **Partner Copybook** | `/api/data/partner-copybook` | `PartnerCopybook` | **`Partner_Copybook`** |
| **Payroll** | `/api/data/payroll` | `Payroll` | **`Payroll`** |
| **Product Reviews** | `/api/data/product-reviews` | `ProductReview` | **`Product_Reviews`** |
| **Stock Movements** | `/api/data/stock-movements` | `StockMovement` | **`Stock_movements`** |
| **System Settings** | `/api/data/system-settings` | `SystemSetting` | **`System_Settings`** |

## 3) Why “it saved in another collection” happens

Usually one of these:

1. **Wrong database in Compass** (most common).  
   Example: you are looking at `Javed_%26_Sons` but server is writing to `Javed_&_Sons`.

2. **Duplicate collections** created earlier.  
   Example: `users` and `Users` both exist from earlier experiments.  
   The app writes to **one** of them (see table above).

3. **Multiple Mongo connections/URIs** on different machines/environments.  
   Localhost vs Atlas, or different `.env` values.

## 4) Recommended cleanup (after you confirm which DB is correct)

- Pick one database name (recommended: avoid `&`, use `Javed_and_Sons`).
- Update `MONGODB_URI` to that name.
- In Compass, move/copy documents from the old DB to the new DB if needed.
- Delete/rename duplicate collections only after you confirm they are not used.
