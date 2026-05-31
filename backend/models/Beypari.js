import mongoose from 'mongoose';

const beypariSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        partnerId: { type: String, required: true }, // e.g., "B-1021"
        area: { type: String, default: 'Punjab' }, // All partners operate locally in Punjab
        balance: { type: String }, // e.g., "+450K (Cr)"
        rating: { type: Number, default: 0 },
        status: { type: String, default: 'Active' }, // Active, Pending Settlement, Inactive
        phone: { type: String },
        joinDate: { type: String }, // Storing as string based on React UI, wait Date is better but UI uses "12 Jan 2024"
        totalShipments: { type: Number, default: 0 },
        commissionRate: { type: Number, default: 0 },
    },
    {
        timestamps: true,
        collection: 'Beypari', // MUST exact match Compass collection name
    }
);

const Beypari = mongoose.model('Beypari', beypariSchema);
export default Beypari;
