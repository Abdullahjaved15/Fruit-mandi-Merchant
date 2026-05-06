import mongoose from 'mongoose';
import User from '../models/User.js';
import Inventory from '../models/Inventory.js';
import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import Beypari from '../models/Beypari.js';
import Employee from '../models/Employee.js';
import Invoice from '../models/Invoice.js';
import FinanceTransaction from '../models/FinanceTransaction.js';
import SalesTransaction from '../models/SalesTransaction.js';
import Attendance from '../models/Attendance.js';
import BeypariSettlement from '../models/BeypariSettlement.js';
import Consignment from '../models/Consignment.js';
import DueAccount from '../models/DueAccount.js';
import DuePayment from '../models/DuePayment.js';
import Expense from '../models/Expense.js';
import FruitType from '../models/FruitType.js';
import Notification from '../models/Notification.js';

// New models
import Partner from '../models/Partner.js';
import PartnerCopybook from '../models/PartnerCopybook.js';
import Payroll from '../models/Payroll.js';
import ProductReview from '../models/ProductReview.js';
import StockMovement from '../models/StockMovement.js';
import SystemSetting from '../models/SystemSetting.js';

const models = [
  { feature: 'Auth / Users', model: User },
  { feature: 'Inventory / Store Products', model: Inventory },
  { feature: 'Orders', model: Order },
  { feature: 'Customers', model: Customer },
  { feature: 'Beyparis', model: Beypari },
  { feature: 'Employees', model: Employee },
  { feature: 'Invoices / Reports', model: Invoice },
  { feature: 'Finance Vouchers', model: FinanceTransaction },
  { feature: 'Ledger / Sales Transactions', model: SalesTransaction },
  { feature: 'Attendance', model: Attendance },
  { feature: 'Beypari Settlements', model: BeypariSettlement },
  { feature: 'Consignments', model: Consignment },
  { feature: 'Due Accounts', model: DueAccount },
  { feature: 'Due Payments', model: DuePayment },
  { feature: 'Expenses', model: Expense },
  { feature: 'Fruit Types', model: FruitType },
  { feature: 'Notifications', model: Notification },
  { feature: 'Partners', model: Partner },
  { feature: 'Partner Copybook', model: PartnerCopybook },
  { feature: 'Payroll Records', model: Payroll },
  { feature: 'Product Reviews', model: ProductReview },
  { feature: 'Stock Movements', model: StockMovement },
  { feature: 'System Settings', model: SystemSetting },
];

// GET /api/data/_meta/collections (admin only)
export const getCollectionMap = async (req, res) => {
  const dbName = mongoose.connection?.name || '(not connected)';
  const uri = process.env.MONGODB_URI || '';
  const hostHint = uri ? uri.replace(/\/\/([^/]+)\/.*/, '//$1') : '';

  const mapped = await Promise.all(
    models.map(async ({ feature, model }) => {
      const collection = model.collection?.name || '(unknown)';
      let count = null;
      try {
        count = await model.estimatedDocumentCount();
      } catch {
        count = null;
      }
      return { feature, model: model.modelName, collection, count };
    })
  );

  // Also list actual collections present in this DB (for spotting duplicates like users vs Users)
  let existingCollections = [];
  try {
    existingCollections = await mongoose.connection.db.listCollections().toArray();
    existingCollections = existingCollections.map((c) => c.name).sort((a, b) => a.localeCompare(b));
  } catch {
    existingCollections = [];
  }

  res.json({
    db: { name: dbName, hostHint },
    mapping: mapped,
    existingCollections,
  });
};
