import express from 'express';
import { protect, admin } from '../middlewares/authMiddleware.js';
import { getBeyparis, createBeypari, deleteBeypari } from '../controllers/beypariController.js';
import { getCustomers, createCustomer, updateCustomerPayment, deleteCustomer } from '../controllers/customerController.js';
import { getTransactions, createTransaction, deleteTransaction } from '../controllers/ledgerController.js';
import { getInventory, createInventory, deleteInventory, updateInventory } from '../controllers/inventoryController.js';
import { getEmployees, createEmployee, deleteEmployee } from '../controllers/employeeController.js';
import { getVouchers, createVoucher, deleteVoucher } from '../controllers/financeController.js';
import { getInvoices, createInvoice, deleteInvoice } from '../controllers/invoiceController.js';
import { addOrderItems, getMyOrders, getOrders, updateOrderToDelivered } from '../controllers/orderController.js';
import { getCollectionMap } from '../controllers/metaController.js';
import {
    attendance,
    beypariSettlements,
    consignments,
    dueAccounts,
    duePayments,
    expenses,
    fruitTypes,
    notifications,
    partners,
    partnerCopybooks,
    payrolls,
    productReviews,
    stockMovements,
    systemSettings,
} from '../controllers/extraCollectionsController.js';

const router = express.Router();

// Order Routes
router.route('/orders')
    .post(protect, addOrderItems)
    .get(protect, admin, getOrders);

router.route('/orders/myorders')
    .get(protect, getMyOrders);

router.route('/orders/:id/deliver')
    .put(protect, admin, updateOrderToDelivered);

// Beypari Routes
router.route('/beyparis')
    .get(protect, admin, getBeyparis)
    .post(protect, admin, createBeypari);
router.route('/beyparis/:id')
    .delete(protect, admin, deleteBeypari);

// Customer Routes
router.route('/customers')
    .get(protect, admin, getCustomers)
    .post(protect, admin, createCustomer);
router.route('/customers/:id')
    .delete(protect, admin, deleteCustomer);
router.route('/customers/:id/payment')
    .put(protect, admin, updateCustomerPayment);

// Ledger Routes
router.route('/ledger')
    .get(protect, admin, getTransactions)
    .post(protect, admin, createTransaction);
router.route('/ledger/:id')
    .delete(protect, admin, deleteTransaction);

// Inventory Routes
router.route('/inventory')
    .get(protect, getInventory) // Let normal users read inventory for store
    .post(protect, admin, createInventory);
router.route('/inventory/:id')
    .delete(protect, admin, deleteInventory)
    .put(protect, admin, updateInventory);

// HR/Employee Routes
router.route('/employees')
    .get(protect, admin, getEmployees)
    .post(protect, admin, createEmployee);
router.route('/employees/:id')
    .delete(protect, admin, deleteEmployee);

// Finance Routes
router.route('/finance')
    .get(protect, admin, getVouchers)
    .post(protect, admin, createVoucher);
router.route('/finance/:id')
    .delete(protect, admin, deleteVoucher);

// Reports/Invoice Routes
router.route('/reports')
    .get(protect, admin, getInvoices)
    .post(protect, admin, createInvoice);
router.route('/reports/:id')
    .delete(protect, admin, deleteInvoice);

// Meta (admin diagnostics)
router.route('/_meta/collections')
    .get(protect, admin, getCollectionMap);

// Extra collections (semester features)
router.route('/attendance')
    .get(protect, admin, attendance.list)
    .post(protect, admin, attendance.create);
router.route('/attendance/:id')
    .get(protect, admin, attendance.getById)
    .put(protect, admin, attendance.updateById)
    .delete(protect, admin, attendance.deleteById);

router.route('/beypari-settlements')
    .get(protect, admin, beypariSettlements.list)
    .post(protect, admin, beypariSettlements.create);
router.route('/beypari-settlements/:id')
    .get(protect, admin, beypariSettlements.getById)
    .put(protect, admin, beypariSettlements.updateById)
    .delete(protect, admin, beypariSettlements.deleteById);

router.route('/consignments')
    .get(protect, admin, consignments.list)
    .post(protect, admin, consignments.create);
router.route('/consignments/:id')
    .get(protect, admin, consignments.getById)
    .put(protect, admin, consignments.updateById)
    .delete(protect, admin, consignments.deleteById);

router.route('/due-accounts')
    .get(protect, admin, dueAccounts.list)
    .post(protect, admin, dueAccounts.create);
router.route('/due-accounts/:id')
    .get(protect, admin, dueAccounts.getById)
    .put(protect, admin, dueAccounts.updateById)
    .delete(protect, admin, dueAccounts.deleteById);

router.route('/due-payments')
    .get(protect, admin, duePayments.list)
    .post(protect, admin, duePayments.create);
router.route('/due-payments/:id')
    .get(protect, admin, duePayments.getById)
    .put(protect, admin, duePayments.updateById)
    .delete(protect, admin, duePayments.deleteById);

router.route('/expenses')
    .get(protect, admin, expenses.list)
    .post(protect, admin, expenses.create);
router.route('/expenses/:id')
    .get(protect, admin, expenses.getById)
    .put(protect, admin, expenses.updateById)
    .delete(protect, admin, expenses.deleteById);

router.route('/fruit-types')
    .get(protect, admin, fruitTypes.list)
    .post(protect, admin, fruitTypes.create);
router.route('/fruit-types/:id')
    .get(protect, admin, fruitTypes.getById)
    .put(protect, admin, fruitTypes.updateById)
    .delete(protect, admin, fruitTypes.deleteById);

router.route('/notifications')
    .get(protect, admin, notifications.list)
    .post(protect, admin, notifications.create);
router.route('/notifications/:id')
    .get(protect, admin, notifications.getById)
    .put(protect, admin, notifications.updateById)
    .delete(protect, admin, notifications.deleteById);

router.route('/partners')
    .get(protect, admin, partners.list)
    .post(protect, admin, partners.create);
router.route('/partners/:id')
    .get(protect, admin, partners.getById)
    .put(protect, admin, partners.updateById)
    .delete(protect, admin, partners.deleteById);

router.route('/partner-copybook')
    .get(protect, admin, partnerCopybooks.list)
    .post(protect, admin, partnerCopybooks.create);
router.route('/partner-copybook/:id')
    .get(protect, admin, partnerCopybooks.getById)
    .put(protect, admin, partnerCopybooks.updateById)
    .delete(protect, admin, partnerCopybooks.deleteById);

router.route('/payroll')
    .get(protect, admin, payrolls.list)
    .post(protect, admin, payrolls.create);
router.route('/payroll/:id')
    .get(protect, admin, payrolls.getById)
    .put(protect, admin, payrolls.updateById)
    .delete(protect, admin, payrolls.deleteById);

router.route('/product-reviews')
    .get(protect, productReviews.list) // Allow users to see reviews
    .post(protect, productReviews.create); // Allow users to post reviews
router.route('/product-reviews/:id')
    .get(protect, productReviews.getById)
    .put(protect, admin, productReviews.updateById)
    .delete(protect, admin, productReviews.deleteById);

router.route('/stock-movements')
    .get(protect, admin, stockMovements.list)
    .post(protect, admin, stockMovements.create);
router.route('/stock-movements/:id')
    .get(protect, admin, stockMovements.getById)
    .put(protect, admin, stockMovements.updateById)
    .delete(protect, admin, stockMovements.deleteById);

router.route('/system-settings')
    .get(protect, admin, systemSettings.list)
    .post(protect, admin, systemSettings.create);
router.route('/system-settings/:id')
    .get(protect, admin, systemSettings.getById)
    .put(protect, admin, systemSettings.updateById)
    .delete(protect, admin, systemSettings.deleteById);

export default router;
