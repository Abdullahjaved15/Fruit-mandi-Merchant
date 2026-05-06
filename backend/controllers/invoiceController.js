import Invoice from '../models/Invoice.js';

// @desc    Get all invoice logs
// @route   GET /api/reports
export const getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({}).sort({ createdAt: -1 });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Save an invoice
// @route   POST /api/reports
export const createInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.create(req.body);
        res.status(201).json(invoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
// @desc    Delete an invoice
// @route   DELETE /api/reports/:id
export const deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndDelete(req.params.id);
        if (invoice) {
            res.json({ message: 'Invoice removed' });
        } else {
            res.status(404).json({ message: 'Invoice not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
