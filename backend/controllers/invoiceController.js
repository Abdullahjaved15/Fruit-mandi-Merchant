import Invoice from '../models/Invoice.js';
import ShopSale from '../models/ShopSale.js';
import BeypariSettlement from '../models/BeypariSettlement.js';

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

// @desc    Get report stats for dashboard
// @route   GET /api/reports/stats
export const getReportStats = async (req, res) => {
    try {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        
        const [sales, settlements] = await Promise.all([
            ShopSale.aggregate([
                { $match: { saleDate: { $gte: startOfMonth } } },
                { $group: { _id: null, totalVolume: { $sum: '$totalAmount' } } }
            ]),
            BeypariSettlement.aggregate([
                { $match: { createdAt: { $gte: startOfMonth } } },
                { $group: { _id: null, totalCommission: { $sum: '$commissionAmount' } } }
            ])
        ]);

        const monthlyVolume = sales[0]?.totalVolume || 0;
        const commissionEarned = settlements[0]?.totalCommission || 0;
        const taxLiability = monthlyVolume * 0.02; // 2% of total volume

        res.json({
            monthlyVolume,
            commissionEarned,
            taxLiability
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
