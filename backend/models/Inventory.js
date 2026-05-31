import mongoose from 'mongoose';

const inventorySchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        sku: { type: String, required: true }, // e.g., "FR-001"
        stock: { type: Number, default: 0 },
        price: { type: Number, default: 0 },
        isSoldInShop: { type: Boolean, default: false },
        unit: { type: String, default: 'Crates' }, 
        category: { type: String, default: 'Citrus' },
        health: { type: String, default: '100%' }, // e.g., "85%"
        img: { type: String }, // e.g., "https://..."
        status: { type: String, default: 'In Stock' }, // In Stock, Low Stock, Out of Stock
        beypariId: { type: String, default: '' },
        beypariName: { type: String, default: '' },
    },
    {
        timestamps: true,
        collection: 'Products',
    }
);

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
