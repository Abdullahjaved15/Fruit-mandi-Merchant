import FinanceTransaction from '../models/FinanceTransaction.js';

// @desc    Get all vouchers
// @route   GET /api/finance
export const getVouchers = async (req, res) => {
    try {
        const vouchers = await FinanceTransaction.find({}).sort({ createdAt: -1 });
        res.json(vouchers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Save a voucher
// @route   POST /api/finance
export const createVoucher = async (req, res) => {
    try {
        const voucher = await FinanceTransaction.create(req.body);
        res.status(201).json(voucher);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
// @desc    Delete a voucher
// @route   DELETE /api/finance/:id
export const deleteVoucher = async (req, res) => {
    try {
        const voucher = await FinanceTransaction.findByIdAndDelete(req.params.id);
        if (voucher) {
            res.json({ message: 'Voucher removed' });
        } else {
            res.status(404).json({ message: 'Voucher not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
