import mongoose from 'mongoose';

const consignmentSchema = mongoose.Schema(
  {},
  {
    timestamps: true,
    strict: false,
    collection: 'Consignments',
  }
);

const Consignment = mongoose.model('Consignment', consignmentSchema);
export default Consignment;

