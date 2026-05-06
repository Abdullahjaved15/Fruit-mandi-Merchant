import mongoose from 'mongoose';

const partnerSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String },
        phone: { type: String },
        role: { type: String, default: 'Partner' },
        status: { type: String, default: 'Active' },
    },
    {
        timestamps: true,
        collection: 'Partners',
    }
);

const Partner = mongoose.model('Partner', partnerSchema);
export default Partner;
