import mongoose from 'mongoose';

const copybookEntrySchema = mongoose.Schema(
    {
        copybook: { type: mongoose.Schema.Types.ObjectId, ref: 'StaffCopybook', required: true },
        type: { type: String, enum: ['sale', 'payment', 'manual'], required: true },
        shopSale: { type: mongoose.Schema.Types.ObjectId, ref: 'ShopSale' },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
        customerName: { type: String, default: '' },
        description: { type: String, default: '' },
        debit: { type: Number, default: 0, min: 0 },
        credit: { type: Number, default: 0, min: 0 },
        balanceAfter: { type: Number, default: 0 },
        entryDate: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        collection: 'Copybook_Entries',
    }
);

const CopybookEntry = mongoose.model('CopybookEntry', copybookEntrySchema);
export default CopybookEntry;
