import mongoose from 'mongoose';

const systemSettingSchema = mongoose.Schema(
    {
        key: { type: String, required: true, unique: true },
        value: { type: mongoose.Schema.Types.Mixed, required: true },
        category: { type: String, default: 'General' },
        description: { type: String },
    },
    {
        timestamps: true,
        collection: 'System_Settings',
    }
);

const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);
export default SystemSetting;
