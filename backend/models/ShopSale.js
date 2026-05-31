import mongoose from 'mongoose';

const shopSaleSchema = mongoose.Schema(
    {
        saleDate: { type: Date, default: Date.now },
        consignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Consignment' },
        beypari: { type: mongoose.Schema.Types.ObjectId, ref: 'Beypari' },
        inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
        customerName: { type: String, default: '' },
        productName: { type: String, default: '' },
        quantity: { type: Number, required: true, min: 0 },
        ratePerUnit: { type: Number, required: true, min: 0 },
        totalAmount: { type: Number, required: true, min: 0 },
        commissionRate: { type: Number, default: 0 },
        commissionAmount: { type: Number, default: 0 },
        paymentMode: {
            type: String,
            enum: ['spot', 'udhaar', 'mixed'],
            required: true,
        },
        spotAmount: { type: Number, default: 0, min: 0 },
        udhaarAmount: { type: Number, default: 0, min: 0 },
        copybookStaff: { type: String, required: true },
        recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    {
        timestamps: true,
        collection: 'Shop_Sales',
    }
);

const ShopSale = mongoose.model('ShopSale', shopSaleSchema);
export default ShopSale;
