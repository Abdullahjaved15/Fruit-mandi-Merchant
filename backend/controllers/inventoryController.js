import Inventory from '../models/Inventory.js';
import StockMovement from '../models/StockMovement.js';

// @desc    Get all inventory items
// @route   GET /api/inventory
export const getInventory = async (req, res) => {
    try {
        const inventory = await Inventory.find({});
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create/Update inventory item
// @route   POST /api/inventory
export const createInventory = async (req, res) => {
    try {
        let payload = { ...req.body };

        if (!payload.sku || String(payload.sku).trim() === '') {
            const count = await Inventory.countDocuments();
            const generatedSku = `INV-${String(count + 1).padStart(3, '0')}`;
            payload.sku = generatedSku;
        }

        const item = await Inventory.create(payload);
        
        // Log stock movement
        if (item.stock > 0) {
            await StockMovement.create({
                product: item._id,
                type: 'In',
                quantity: item.stock,
                reason: 'Initial Stock'
            });
        }
        
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
export const deleteInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await Inventory.findByIdAndDelete(id);
        
        if (!item) {
            return res.status(404).json({ message: 'Product not found in database' });
        }

        // Safely clean up associated stock movements
        try {
            await StockMovement.deleteMany({ product: id });
        } catch (movementErr) {
            console.error("Non-critical: Failed to clean up stock movements:", movementErr);
            // We don't return an error here because the product is already deleted
        }

        res.json({ success: true, message: 'Product successfully removed' });
    } catch (error) {
        console.error("Critical: Inventory delete fail:", error);
        res.status(500).json({ message: "Server error while deleting product" });
    }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
export const updateInventory = async (req, res) => {
    try {
        const oldItem = await Inventory.findById(req.params.id);
        const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        if (item && oldItem && req.body.stock !== undefined) {
            const diff = req.body.stock - oldItem.stock;
            if (diff !== 0) {
                await StockMovement.create({
                    product: item._id,
                    type: diff > 0 ? 'In' : 'Out',
                    quantity: Math.abs(diff),
                    reason: diff > 0 ? 'Restock' : 'Adjustment/Sale'
                });
            }
        }
        
        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
