import mongoose from 'mongoose';

const dueAccountSchema = mongoose.Schema(
  {},
  {
    timestamps: true,
    strict: false,
    collection: 'Due_Accounts',
  }
);

const DueAccount = mongoose.model('DueAccount', dueAccountSchema);
export default DueAccount;

