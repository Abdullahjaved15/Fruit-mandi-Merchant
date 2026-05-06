import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') }); // UP ONE FOLDER FOR .env

const updateAdmin = async () => {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'holymoiz2520@gmail.com';
        let user = await User.findOne({ email: email });
        
        if (user) {
            console.log('User found. Updating role and password...');
            user.role = 'admin';
            user.password = 'HAFIZ2520MOIZ'; // RESET PASSWORD HERE TO SYNC
            await user.save();
            console.log('User updated to admin with correct password!');
        } else {
            console.log('User not found. Creating user as admin...');
            // In a real app we'd need a hashed password, but User model has a pre-save hook for that.
            user = await User.create({
                username: 'Moiz Admin',
                email: email,
                password: 'HAFIZ2520MOIZ',
                role: 'admin'
            });
            console.log('User created as admin!');
        }

        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

updateAdmin();
