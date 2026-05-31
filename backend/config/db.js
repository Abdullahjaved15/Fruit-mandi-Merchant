import mongoose from 'mongoose';
import StaffCopybook from '../models/StaffCopybook.js';

const STAFF_SEED = [
    { staffName: 'Person A', staffCode: 'STAFF-A' },
    { staffName: 'Person B', staffCode: 'STAFF-B' },
    { staffName: 'Person C', staffCode: 'STAFF-C' },
    { staffName: 'Person D', staffCode: 'STAFF-D' },
    { staffName: 'Person E', staffCode: 'STAFF-E' },
];

const seedStaffCopybooks = async () => {
    for (const s of STAFF_SEED) {
        await StaffCopybook.findOneAndUpdate({ staffCode: s.staffCode }, s, { upsert: true });
    }
};

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
        await seedStaffCopybooks();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
