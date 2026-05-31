import StaffCopybook from '../models/StaffCopybook.js';
import CopybookEntry from '../models/CopybookEntry.js';
import Customer from '../models/Customer.js';
import { formatPkr, udhaarTypeFromPercent } from '../utils/mandiHelpers.js';

const getLatestBalance = async (copybookId) => {
    const last = await CopybookEntry.findOne({ copybook: copybookId }).sort({ entryDate: -1, createdAt: -1 });
    return last?.balanceAfter || 0;
};

export const getStaffCopybooks = async (req, res) => {
    try {
        const staff = await StaffCopybook.find({ isActive: true }).sort({ staffCode: 1 });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const seedStaffCopybooks = async (req, res) => {
    try {
        const STAFF = [
            { staffName: 'Person A', staffCode: 'STAFF-A' },
            { staffName: 'Person B', staffCode: 'STAFF-B' },
            { staffName: 'Person C', staffCode: 'STAFF-C' },
            { staffName: 'Person D', staffCode: 'STAFF-D' },
            { staffName: 'Person E', staffCode: 'STAFF-E' },
        ];
        for (const s of STAFF) {
            await StaffCopybook.findOneAndUpdate({ staffCode: s.staffCode }, s, { upsert: true, new: true });
        }
        const staff = await StaffCopybook.find({ isActive: true }).sort({ staffCode: 1 });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCopybookEntries = async (req, res) => {
    try {
        const filter = {};
        if (req.query.copybook) filter.copybook = req.query.copybook;
        if (req.query.staffCode) {
            const staff = await StaffCopybook.findOne({ staffCode: req.query.staffCode });
            if (staff) filter.copybook = staff._id;
        }
        if (req.query.customer) filter.customer = req.query.customer;
        if (req.query.from || req.query.to) {
            filter.entryDate = {};
            if (req.query.from) filter.entryDate.$gte = new Date(req.query.from);
            if (req.query.to) filter.entryDate.$lte = new Date(req.query.to);
        }

        const entries = await CopybookEntry.find(filter)
            .populate('copybook', 'staffName staffCode')
            .populate('customer', 'name customerId')
            .sort({ entryDate: -1, createdAt: -1 });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createManualCopybookEntry = async (req, res) => {
    try {
        const { copybookId, type, customer, customerName, description, debit, credit } = req.body;
        const staff = await StaffCopybook.findById(copybookId);
        if (!staff) return res.status(404).json({ message: 'Staff copybook not found' });

        const prev = await getLatestBalance(staff._id);
        const balanceAfter = prev + (Number(debit) || 0) - (Number(credit) || 0);

        const entry = await CopybookEntry.create({
            copybook: staff._id,
            type: type || 'manual',
            customer,
            customerName: customerName || '',
            description: description || '',
            debit: Number(debit) || 0,
            credit: Number(credit) || 0,
            balanceAfter,
            entryDate: req.body.entryDate ? new Date(req.body.entryDate) : new Date(),
        });

        const populated = await CopybookEntry.findById(entry._id)
            .populate('copybook', 'staffName staffCode')
            .populate('customer', 'name customerId');

        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const recordCustomerPayment = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });

        const amount = Number(req.body.amount) || 0;
        if (amount <= 0) return res.status(400).json({ message: 'Invalid payment amount' });

        const newUdhaar = Math.max(0, (customer.udhaarRaw || 0) - amount);
        customer.udhaarRaw = newUdhaar;
        customer.udhaar = formatPkr(newUdhaar);
        customer.udhaarPercent =
            customer.purchaseRaw > 0 ? (newUdhaar / customer.purchaseRaw) * 100 : 0;
        customer.udhaarType = udhaarTypeFromPercent(customer.udhaarPercent);
        customer.lastPaymentAt = new Date();
        customer.payments = customer.payments || [];
        customer.payments.push({
            amount,
            date: new Date(),
            copybookStaff: req.body.copybookStaff || '',
            method: req.body.method || 'cash',
            note: req.body.note || '',
        });
        await customer.save();

        const staffCode = req.body.copybookStaff || customer.assignedCopybook;
        if (staffCode) {
            const staff = await StaffCopybook.findOne({
                $or: [{ staffCode }, { staffName: staffCode }],
            });
            if (staff) {
                const prev = await getLatestBalance(staff._id);
                await CopybookEntry.create({
                    copybook: staff._id,
                    type: 'payment',
                    customer: customer._id,
                    customerName: customer.name,
                    description: `Payment received — ${formatPkr(amount)}`,
                    debit: 0,
                    credit: amount,
                    balanceAfter: prev - amount,
                    entryDate: new Date(),
                });
            }
        }

        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
