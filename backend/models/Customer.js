import mongoose from 'mongoose';

const customerSchema = mongoose.Schema(
    {
        customerId: { type: String, required: true }, // e.g., "CUST-001"
        name: { type: String, required: true },
        contact: { type: String },
        purchaseRaw: { type: Number, default: 0 },
        purchase: { type: String }, // e.g., "PKR 1,250,000"
        udhaarRaw: { type: Number, default: 0 },
        udhaar: { type: String }, // e.g., "PKR 450,000"
        udhaarPercent: { type: Number, default: 0 },
        udhaarType: { type: String, default: 'success' }, // e.g., danger, accent, success based on React UI
    },
    {
        timestamps: true,
        collection: 'Customers', // MUST exact match Compass collection name
    }
);

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
