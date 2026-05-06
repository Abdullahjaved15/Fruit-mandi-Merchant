import mongoose from 'mongoose';

const expenseSchema = mongoose.Schema(
  {},
  {
    timestamps: true,
    strict: false,
    collection: 'Expenses',
  }
);

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;

