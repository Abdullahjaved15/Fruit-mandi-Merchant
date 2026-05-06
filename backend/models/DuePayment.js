import mongoose from 'mongoose';

const duePaymentSchema = mongoose.Schema(
  {},
  {
    timestamps: true,
    strict: false,
    collection: 'Due_Payments',
  }
);

const DuePayment = mongoose.model('DuePayment', duePaymentSchema);
export default DuePayment;

