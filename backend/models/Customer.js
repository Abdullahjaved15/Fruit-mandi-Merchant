import mongoose from 'mongoose';

const paymentSchema = mongoose.Schema(
    {
        amount: { type: Number, required: true, min: 0 },
        date: { type: Date, default: Date.now },
        copybookStaff: { type: String, default: '' },
        method: { type: String, default: 'cash' },
        note: { type: String, default: '' },
    },
    { _id: true }
);

const customerSchema = mongoose.Schema(
    {
        customerId: { type: String, required: true },
        name: { type: String, required: true },
        contact: { type: String },
        product: { type: String, default: '' },
        beypariProduct: { type: String, default: '' },
        purchaseRaw: { type: Number, default: 0 },
        purchase: { type: String },
        udhaarRaw: { type: Number, default: 0 },
        udhaar: { type: String },
        udhaarPercent: { type: Number, default: 0 },
        udhaarType: { type: String, default: 'success' },
        assignedCopybook: { type: String, default: '' },
        payments: [paymentSchema],
        lastPaymentAt: { type: Date },
    },
    {
        timestamps: true,
        collection: 'Customers',
    }
);

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
