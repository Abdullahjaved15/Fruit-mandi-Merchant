import mongoose from 'mongoose';

const salesTransactionSchema = mongoose.Schema(
    {
        transactionId: { type: String, required: true }, // e.g., "TX-9021"
        date: { type: String }, // "Today, 02:30 PM"
        desc: { type: String, required: true },
        party: { type: String },
        amountRaw: { type: Number, required: true },
        amount: { type: String }, // "+₨ 45,000"
        type: { type: String, enum: ['income', 'expense'], required: true },
    },
    {
        timestamps: true,
        collection: 'Sales_Transactions', // MUST exact match Compass collection name (Ledger)
    }
);

const SalesTransaction = mongoose.model('SalesTransaction', salesTransactionSchema);
export default SalesTransaction;
