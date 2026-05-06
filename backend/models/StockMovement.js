import mongoose from 'mongoose';

const stockMovementSchema = mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
        type: { type: String, enum: ['In', 'Out'], required: true },
        quantity: { type: Number, required: true },
        reason: { type: String }, // e.g., "Restock", "Sale", "Damage"
        date: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        collection: 'Stock_movements',
    }
);

const StockMovement = mongoose.model('StockMovement', stockMovementSchema);
export default StockMovement;
