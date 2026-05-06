import mongoose from 'mongoose';

const employeeSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        role: { type: String, required: true }, // Warehouse Manager, etc.
        joined: { type: String }, // e.g., "15-Jan-2024"
        attendance: { type: String, default: '100' },
        salary: { type: String, default: '30000' },
        status: { type: String, default: 'Present' }, // Present, On Field, Absent
        phone: { type: String },
        email: { type: String },
    },
    {
        timestamps: true,
        collection: 'Employee',
    }
);

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
