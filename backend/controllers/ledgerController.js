import SalesTransaction from '../models/SalesTransaction.js';

export const getTransactions = async (req, res) => {
    try {
        const transactions = await SalesTransaction.find({});
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createTransaction = async (req, res) => {
    try {
        const transaction = await SalesTransaction.create(req.body);
        res.status(201).json(transaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteTransaction = async (req, res) => {
    try {
        const transaction = await SalesTransaction.findByIdAndDelete(req.params.id);
        if (transaction) {
            res.json({ message: 'Transaction removed' });
        } else {
            res.status(404).json({ message: 'Transaction not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
