import mongoose from 'mongoose';

const staffCopybookSchema = mongoose.Schema(
    {
        staffName: { type: String, required: true },
        staffCode: { type: String, required: true, unique: true },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        collection: 'Staff_Copybooks',
    }
);

const StaffCopybook = mongoose.model('StaffCopybook', staffCopybookSchema);
export default StaffCopybook;
