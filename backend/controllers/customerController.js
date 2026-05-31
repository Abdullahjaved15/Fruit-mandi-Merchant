import Customer from '../models/Customer.js';
import { formatPkr, udhaarTypeFromPercent } from '../utils/mandiHelpers.js';

export const getCustomers = async (req, res) => {
    try {
        const filter = {};
        if (req.query.assignedCopybook) filter.assignedCopybook = req.query.assignedCopybook;
        if (req.query.customerId) filter.customerId = req.query.customerId;
        if (req.query.customer) {
            filter.$or = [
                { name: new RegExp(req.query.customer, 'i') },
                { contact: new RegExp(req.query.customer, 'i') },
                { customerId: new RegExp(req.query.customer, 'i') },
            ];
        }
        const customers = await Customer.find(filter).sort({ updatedAt: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createCustomer = async (req, res) => {
    try {
        let payload = { ...req.body };
        if (!payload.customerId || String(payload.customerId).trim() === '') {
            const count = await Customer.countDocuments();
            payload.customerId = `CUST-${String(count + 1).padStart(3, '0')}`;
        }

        const purchaseRaw = Number(payload.purchaseRaw) || 0;
        const udhaarRaw = Number(payload.udhaarRaw) || 0;
        payload.purchaseRaw = purchaseRaw;
        payload.udhaarRaw = udhaarRaw;
        payload.purchase = formatPkr(purchaseRaw);
        payload.udhaar = formatPkr(udhaarRaw);
        payload.udhaarPercent = purchaseRaw > 0 ? (udhaarRaw / purchaseRaw) * 100 : 0;
        payload.udhaarType = udhaarTypeFromPercent(payload.udhaarPercent);

        delete payload.id;
        const customer = await Customer.create(payload);
        res.status(201).json(customer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateCustomerPayment = async (req, res) => {
    try {
        let customer = await Customer.findById(req.params.id);
        if (!customer) {
            customer = await Customer.findOne({ customerId: req.params.id });
        }

        if (customer) {
            if (req.body.udhaarRaw !== undefined) {
                customer.udhaarRaw = req.body.udhaarRaw;
                customer.udhaar = req.body.udhaar || formatPkr(req.body.udhaarRaw);
            }
            if (req.body.udhaarPercent !== undefined) customer.udhaarPercent = req.body.udhaarPercent;
            if (req.body.udhaarType) customer.udhaarType = req.body.udhaarType;
            const updatedCustomer = await customer.save();
            res.json(updatedCustomer);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (customer) {
            res.json({ message: 'Customer removed' });
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
