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
import BeypariSettlement from '../models/BeypariSettlement.js';
import Consignment from '../models/Consignment.js';

// New models
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
  { feature: 'Beypari Settlements', model: BeypariSettlement },
  { feature: 'Consignments', model: Consignment },
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
