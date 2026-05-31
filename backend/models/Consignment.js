import mongoose from 'mongoose';

const consignmentSchema = mongoose.Schema(
    {
        beypari: { type: mongoose.Schema.Types.ObjectId, ref: 'Beypari', required: true },
        productName: { type: String, required: true },
        unit: { type: String, default: 'crate' },
        quantityReceived: { type: Number, required: true, min: 0 },
        quantitySold: { type: Number, default: 0 },
        minimumTargetAmount: { type: Number, required: true, min: 0 },
        fuelCost: { type: Number, default: 0, min: 0 },
        status: {
            type: String,
            enum: ['active', 'settled', 'closed'],
            default: 'active',
        },
        arrivalDate: { type: Date, default: Date.now },
        notes: { type: String, default: '' },
    },
    {
        timestamps: true,
        collection: 'Consignments',
    }
);

const Consignment = mongoose.model('Consignment', consignmentSchema);
export default Consignment;
