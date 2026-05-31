import express from 'express';
import { protect, admin } from '../middlewares/authMiddleware.js';
import { validateRequest, schemas } from '../middlewares/validationMiddleware.js';
import { getBeyparis, createBeypari, updateBeypari, deleteBeypari } from '../controllers/beypariController.js';
import { getCustomers, createCustomer, updateCustomerPayment, deleteCustomer } from '../controllers/customerController.js';
import { getTransactions, createTransaction, deleteTransaction } from '../controllers/ledgerController.js';
import { getInventory, createInventory, deleteInventory, updateInventory } from '../controllers/inventoryController.js';
import { getEmployees, createEmployee, deleteEmployee } from '../controllers/employeeController.js';
import { getVouchers, createVoucher, deleteVoucher } from '../controllers/financeController.js';
import { getInvoices, createInvoice, deleteInvoice, getReportStats } from '../controllers/invoiceController.js';
import { addOrderItems, getMyOrders, getOrders, updateOrderToDelivered } from '../controllers/orderController.js';
import { getCollectionMap } from '../controllers/metaController.js';
import {
    getConsignments,
    createConsignment,
    getConsignmentById,
    getConsignmentSummary,
    updateConsignment,
    deleteConsignment,
} from '../controllers/consignmentController.js';
import { getShopSales, createShopSale, deleteShopSale } from '../controllers/shopSaleController.js';
import {
    getSettlements,
    createSettlement,
    getSettlementById,
    markSettlementPaid,
    deleteSettlement,
} from '../controllers/settlementController.js';
import {
    getStaffCopybooks,
    seedStaffCopybooks,
    getCopybookEntries,
    createManualCopybookEntry,
    recordCustomerPayment,
} from '../controllers/staffCopybookController.js';
import { getMandiStats } from '../controllers/mandiStatsController.js';
import {
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
    .put(protect, admin, updateBeypari)
    .delete(protect, admin, deleteBeypari);

// Customer Routes
router.route('/customers')
    .get(protect, admin, getCustomers)
    .post(protect, admin, createCustomer);
router.route('/customers/:id')
    .delete(protect, admin, deleteCustomer);
router.route('/customers/:id/payment')
    .put(protect, admin, updateCustomerPayment);
router.route('/customers/:id/payments')
    .post(protect, admin, validateRequest(schemas.customerPayment), recordCustomerPayment);

// Ledger Routes
router.route('/ledger')
    .get(protect, admin, getTransactions)
    .post(protect, admin, validateRequest(schemas.ledger), createTransaction);
router.route('/ledger/:id')
    .delete(protect, admin, deleteTransaction);

// Inventory Routes
router.route('/inventory')
    .get(protect, getInventory) // Let normal users read inventory for store
    .post(protect, admin, validateRequest(schemas.inventory), createInventory);
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
router.route('/reports/stats')
    .get(protect, admin, getReportStats);
router.route('/reports')
    .get(protect, admin, getInvoices)
    .post(protect, admin, createInvoice);
router.route('/reports/:id')
    .delete(protect, admin, deleteInvoice);

// Meta (admin diagnostics)
router.route('/_meta/collections')
    .get(protect, admin, getCollectionMap);



// Mandi core — consignments, shop sales, settlements
router.route('/mandi-stats').get(protect, admin, getMandiStats);

router.route('/consignments')
    .get(protect, admin, getConsignments)
    .post(protect, admin, validateRequest(schemas.consignment), createConsignment);
router.route('/consignments/:id/summary').get(protect, admin, getConsignmentSummary);
router.route('/consignments/:id')
    .get(protect, admin, getConsignmentById)
    .put(protect, admin, updateConsignment)
    .delete(protect, admin, deleteConsignment);

router.route('/shop-sales')
    .get(protect, admin, getShopSales)
    .post(protect, admin, validateRequest(schemas.shopSale), createShopSale);
router.route('/shop-sales/:id').delete(protect, admin, deleteShopSale);

router.route('/beypari-settlements')
    .get(protect, admin, getSettlements)
    .post(protect, admin, validateRequest(schemas.settlement), createSettlement);
router.route('/beypari-settlements/:id/mark-paid')
    .put(protect, admin, markSettlementPaid);
router.route('/beypari-settlements/:id')
    .get(protect, admin, getSettlementById)
    .delete(protect, admin, deleteSettlement);

router.route('/staff-copybooks')
    .get(protect, admin, getStaffCopybooks)
    .post(protect, admin, seedStaffCopybooks);
router.route('/staff-copybooks/entries')
    .get(protect, admin, getCopybookEntries)
    .post(protect, admin, validateRequest(schemas.copybookEntry), createManualCopybookEntry);



router.route('/stock-movements')
    .get(protect, admin, stockMovements.list)
    .post(protect, admin, stockMovements.create);
router.route('/stock-movements/:id')
    .get(protect, admin, stockMovements.getById)
    .put(protect, admin, stockMovements.updateById)
    .delete(protect, admin, stockMovements.deleteById);

router.route('/system-settings')
    .get(protect, systemSettings.list)
    .post(protect, admin, systemSettings.create);
router.route('/system-settings/:id')
    .get(protect, admin, systemSettings.getById)
    .put(protect, admin, systemSettings.updateById)
    .delete(protect, admin, systemSettings.deleteById);

export default router;
