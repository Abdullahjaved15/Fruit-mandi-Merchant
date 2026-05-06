import mongoose from 'mongoose';

const invoiceSchema = mongoose.Schema(
    {
        invoiceId: { type: String, required: true }, // e.g., "INV-88210"
        entity: { type: String, required: true }, // "Sargodha Farms"
        type: { type: String, required: true }, // "Settlement", "Statement"
        date: { type: String }, // "28 Mar 2026"
        amount: { type: Number, required: true },
    },
    {
        timestamps: true,
        collection: 'Invoices',
    }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
