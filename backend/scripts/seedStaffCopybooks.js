import mongoose from 'mongoose';
import dotenv from 'dotenv';
import StaffCopybook from '../models/StaffCopybook.js';

dotenv.config();

const STAFF = [
    { staffName: 'Person A', staffCode: 'STAFF-A' },
    { staffName: 'Person B', staffCode: 'STAFF-B' },
    { staffName: 'Person C', staffCode: 'STAFF-C' },
    { staffName: 'Person D', staffCode: 'STAFF-D' },
    { staffName: 'Person E', staffCode: 'STAFF-E' },
];

const seed = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    for (const s of STAFF) {
        await StaffCopybook.findOneAndUpdate({ staffCode: s.staffCode }, s, { upsert: true, new: true });
    }
    console.log('Staff copybooks seeded (A–E)');
    await mongoose.disconnect();
};

seed().catch((e) => {
    console.error(e);
    process.exit(1);
});
