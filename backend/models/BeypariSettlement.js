import mongoose from 'mongoose';

const beypariSettlementSchema = mongoose.Schema(
    {
        consignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Consignment', required: true },
        beypari: { type: mongoose.Schema.Types.ObjectId, ref: 'Beypari', required: true },
        grossSales: { type: Number, required: true, min: 0 },
        minimumTarget: { type: Number, required: true, min: 0 },
        commissionAmount: { type: Number, default: 0, min: 0 },
        fuelCost: { type: Number, default: 0, min: 0 },
        otherDeductions: { type: Number, default: 0, min: 0 },
        netPayable: { type: Number, required: true },
        notes: { type: String, default: '' },
        status: {
            type: String,
            enum: ['draft', 'paid'],
            default: 'draft',
        },
        paidAt: { type: Date },
        paymentMethod: { type: String, default: '' },
    },
    {
        timestamps: true,
        collection: 'Beypari_Settlements',
    }
);

const BeypariSettlement = mongoose.model('BeypariSettlement', beypariSettlementSchema);
export default BeypariSettlement;
