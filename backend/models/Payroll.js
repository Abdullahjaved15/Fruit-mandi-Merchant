import mongoose from 'mongoose';

const payrollSchema = mongoose.Schema(
    {
        employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
        month: { type: String, required: true },
        year: { type: Number, required: true },
        basicSalary: { type: Number, required: true },
        bonuses: { type: Number, default: 0 },
        deductions: { type: Number, default: 0 },
        netSalary: { type: Number, required: true },
        paymentStatus: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' },
        paymentDate: { type: Date },
    },
    {
        timestamps: true,
        collection: 'Payroll',
    }
);

const Payroll = mongoose.model('Payroll', payrollSchema);
export default Payroll;
