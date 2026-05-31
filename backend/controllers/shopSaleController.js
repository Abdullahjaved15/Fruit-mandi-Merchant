import mongoose from 'mongoose';
import ShopSale from '../models/ShopSale.js';
import Consignment from '../models/Consignment.js';
import Customer from '../models/Customer.js';
import Inventory from '../models/Inventory.js';
import StaffCopybook from '../models/StaffCopybook.js';
import CopybookEntry from '../models/CopybookEntry.js';
import StockMovement from '../models/StockMovement.js';
import { formatPkr, udhaarTypeFromPercent, sumShopSalesForConsignment } from '../utils/mandiHelpers.js';

const getLatestCopybookBalance = async (copybookId) => {
    const last = await CopybookEntry.findOne({ copybook: copybookId }).sort({ entryDate: -1, createdAt: -1 });
    return last?.balanceAfter || 0;
};

const addCopybookEntry = async ({ copybookStaff, type, shopSale, customer, customerName, description, debit, credit }) => {
    const staff = await StaffCopybook.findOne({
        $or: [{ staffCode: copybookStaff }, { staffName: copybookStaff }],
    });
    if (!staff) return null;

    const prev = await getLatestCopybookBalance(staff._id);
    const balanceAfter = prev + (debit || 0) - (credit || 0);

    return CopybookEntry.create({
        copybook: staff._id,
        type,
        shopSale,
        customer,
        customerName,
        description,
        debit: debit || 0,
        credit: credit || 0,
        balanceAfter,
        entryDate: new Date(),
    });
};

const updateCustomerUdhaar = async (customerId, udhaarDelta, purchaseDelta = 0, session = null) => {
    if (!customerId) return null;
    const customer = await Customer.findById(customerId).session(session);
    if (!customer) return null;

    customer.udhaarRaw = Math.max(0, (customer.udhaarRaw || 0) + udhaarDelta);
    if (purchaseDelta !== 0) {
        customer.purchaseRaw = Math.max(0, (customer.purchaseRaw || 0) + purchaseDelta);
        customer.purchase = formatPkr(customer.purchaseRaw);
    }
    customer.udhaar = formatPkr(customer.udhaarRaw);
    const base = customer.purchaseRaw || customer.udhaarRaw || 1;
    customer.udhaarPercent = customer.purchaseRaw > 0 ? (customer.udhaarRaw / customer.purchaseRaw) * 100 : 0;
    customer.udhaarType = udhaarTypeFromPercent(customer.udhaarPercent);
    return customer.save({ session });
};

export const getShopSales = async (req, res) => {
    try {
        const filter = {};
        if (req.query.consignment) filter.consignment = req.query.consignment;
        if (req.query.beypari) filter.beypari = req.query.beypari;
        if (req.query.customer) filter.customer = req.query.customer;
        if (req.query.copybookStaff) filter.copybookStaff = req.query.copybookStaff;
        if (req.query.from || req.query.to) {
            filter.saleDate = {};
            if (req.query.from) filter.saleDate.$gte = new Date(req.query.from);
            if (req.query.to) filter.saleDate.$lte = new Date(req.query.to);
        }

        const sales = await ShopSale.find(filter)
            .populate('beypari', 'name partnerId')
            .populate('consignment', 'productName minimumTargetAmount')
            .populate('customer', 'name customerId contact')
            .sort({ saleDate: -1 });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createShopSale = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const body = { ...req.body };
        body.totalAmount = body.quantity * body.ratePerUnit;

        if (body.paymentMode === 'spot') {
            body.spotAmount = body.totalAmount;
            body.udhaarAmount = 0;
        } else if (body.paymentMode === 'udhaar') {
            body.spotAmount = 0;
            body.udhaarAmount = body.totalAmount;
        } else if (body.paymentMode === 'mixed') {
            body.spotAmount = body.spotAmount || 0;
            body.udhaarAmount = body.udhaarAmount || body.totalAmount - body.spotAmount;
        }

        if (body.commissionRate) {
            body.commissionAmount = (body.totalAmount * body.commissionRate) / 100;
        }

        if (req.user?._id) body.recordedBy = req.user._id;

        const saleDocs = await ShopSale.create([body], { session });
        const sale = saleDocs[0];

        if (sale.consignment) {
            const { quantitySold } = await sumShopSalesForConsignment(ShopSale, sale.consignment);
            // sumShopSalesForConsignment doesn't include the newly created sale since it's not committed
            await Consignment.findByIdAndUpdate(sale.consignment, {
                quantitySold: quantitySold + sale.quantity,
            }, { session });
        }

        if (sale.inventoryItem && sale.quantity > 0) {
            const item = await Inventory.findById(sale.inventoryItem).session(session);
            if (item) {
                const newStock = Math.max(0, item.stock - sale.quantity);
                await Inventory.findByIdAndUpdate(item._id, { stock: newStock }, { session });
                await StockMovement.create([{
                    product: item._id,
                    type: 'Out',
                    quantity: sale.quantity,
                    reason: `Shop sale ${sale._id}`,
                }], { session });

                if (newStock === 0 && sale.consignment) {
                    await Beypari.findByIdAndUpdate(sale.beypari, { status: 'Pending Settlement' }, { session });
                }
            }
        }

        if (sale.customer && sale.udhaarAmount > 0) {
            await updateCustomerUdhaar(sale.customer, sale.udhaarAmount, sale.totalAmount, session);
        }

        const custName =
            body.customerName ||
            (sale.customer ? (await Customer.findById(sale.customer).session(session))?.name : '') ||
            'Walk-in';

        if (sale.udhaarAmount > 0) {
            const staff = await StaffCopybook.findOne({
                $or: [{ staffCode: sale.copybookStaff }, { staffName: sale.copybookStaff }],
            }).session(session);
            
            if (staff) {
                const last = await CopybookEntry.findOne({ copybook: staff._id }).sort({ entryDate: -1, createdAt: -1 }).session(session);
                const prev = last?.balanceAfter || 0;
                const debit = sale.udhaarAmount;
                const credit = 0;
                const balanceAfter = prev + debit - credit;

                await CopybookEntry.create([{
                    copybook: staff._id,
                    type: 'sale',
                    shopSale: sale._id,
                    customer: sale.customer,
                    customerName: custName,
                    description: `Sale ${sale.productName || ''} — udhaar ${formatPkr(sale.udhaarAmount)}`,
                    debit: debit,
                    credit: credit,
                    balanceAfter,
                    entryDate: new Date(),
                }], { session });
            }
        }

        await session.commitTransaction();
        session.endSession();

        const populated = await ShopSale.findById(sale._id)
            .populate('beypari', 'name partnerId')
            .populate('consignment', 'productName')
            .populate('customer', 'name customerId');

        res.status(201).json(populated);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: error.message });
    }
};

export const deleteShopSale = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const sale = await ShopSale.findById(req.params.id).session(session);
        if (!sale) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Sale not found' });
        }

        // Restore inventory
        if (sale.inventoryItem && sale.quantity > 0) {
            const item = await Inventory.findById(sale.inventoryItem).session(session);
            if (item) {
                await Inventory.findByIdAndUpdate(item._id, { $inc: { stock: sale.quantity } }, { session });
                await StockMovement.deleteMany({ reason: `Shop sale ${sale._id}` }).session(session);
            }
        }

        // Reverse udhaar
        if (sale.customer && sale.udhaarAmount > 0) {
            await updateCustomerUdhaar(sale.customer, -sale.udhaarAmount, -sale.totalAmount, session);
        }

        // Restore consignment sold quantity
        if (sale.consignment) {
            await Consignment.findByIdAndUpdate(sale.consignment, { $inc: { quantitySold: -sale.quantity } }, { session });
        }

        // Remove copybook entries
        await CopybookEntry.deleteMany({ shopSale: sale._id }).session(session);
        
        await ShopSale.findByIdAndDelete(sale._id).session(session);

        await session.commitTransaction();
        session.endSession();
        res.json({ message: 'Sale removed and related balances restored' });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: error.message });
    }
};
