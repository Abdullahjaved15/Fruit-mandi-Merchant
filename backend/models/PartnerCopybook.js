import mongoose from 'mongoose';

const partnerCopybookSchema = mongoose.Schema(
    {
        partner: { type: String, required: true }, // or Ref to Partner
        date: { type: String, required: true },
        desc: { type: String, required: true },
        debit: { type: Number, default: 0 },
        credit: { type: Number, default: 0 },
        balance: { type: Number, default: 0 },
        debitColor: { type: String },
        creditColor: { type: String },
    },
    {
        timestamps: true,
        collection: 'Partner_Copybook',
    }
);

const PartnerCopybook = mongoose.model('PartnerCopybook', partnerCopybookSchema);
export default PartnerCopybook;
