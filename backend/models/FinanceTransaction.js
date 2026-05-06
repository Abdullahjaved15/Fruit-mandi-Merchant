import mongoose from 'mongoose';

const financeTransactionSchema = mongoose.Schema(
    {
        voucherId: { type: String, required: true }, // e.g., "#VOU-1021"
        category: { type: String, required: true }, // Electricity Bill, Fuel, etc.
        desc: { type: String },
        amount: { type: String, required: true }, // "12500"
        method: { type: String, default: 'Cash' }, // Cash, Bank, JazzCash, EasyPaisa
        type: { type: String, enum: ['debit', 'credit'], required: true },
        date: { type: String }, // "2024-08-15"
    },
    {
        timestamps: true,
        collection: 'Finance_Transactions',
    }
);

const FinanceTransaction = mongoose.model('FinanceTransaction', financeTransactionSchema);
export default FinanceTransaction;
