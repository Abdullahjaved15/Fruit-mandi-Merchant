import mongoose from 'mongoose';

const beypariSettlementSchema = mongoose.Schema(
  {},
  {
    timestamps: true,
    strict: false,
    collection: 'Beypari_Settlements',
  }
);

const BeypariSettlement = mongoose.model('BeypariSettlement', beypariSettlementSchema);
export default BeypariSettlement;

