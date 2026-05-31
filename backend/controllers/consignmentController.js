import mongoose from 'mongoose';
import Consignment from '../models/Consignment.js';
import ShopSale from '../models/ShopSale.js';
import Beypari from '../models/Beypari.js';
import Inventory from '../models/Inventory.js';
import { sumShopSalesForConsignment } from '../utils/mandiHelpers.js';

export const getConsignments = async (req, res) => {
    try {
        const filter = {};
        if (req.query.beypari) filter.beypari = req.query.beypari;
        if (req.query.status) filter.status = req.query.status;
        const consignments = await Consignment.find(filter)
            .populate('beypari', 'name partnerId commissionRate status')
            .sort({ createdAt: -1 });
        res.json(consignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createConsignment = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const consignmentDocs = await Consignment.create([req.body], { session });
        const consignment = consignmentDocs[0];

        const beypari = await Beypari.findById(consignment.beypari).session(session);

        await Inventory.create([{
            name: consignment.productName,
            sku: `INV-${Date.now().toString().slice(-5)}`,
            stock: consignment.quantityReceived,
            price: 0,
            unit: consignment.unit || 'Crates',
            status: 'In Stock',
            isSoldInShop: true,
            beypariId: beypari?._id.toString() || '',
            beypariName: beypari?.name || ''
        }], { session });

        await session.commitTransaction();
        session.endSession();

        const populated = await Consignment.findById(consignment._id).populate('beypari', 'name partnerId');
        res.status(201).json(populated);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: error.message });
    }
};

export const getConsignmentById = async (req, res) => {
    try {
        const consignment = await Consignment.findById(req.params.id).populate(
            'beypari',
            'name partnerId commissionRate status phone'
        );
        if (!consignment) return res.status(404).json({ message: 'Consignment not found' });
        res.json(consignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getConsignmentSummary = async (req, res) => {
    try {
        const consignment = await Consignment.findById(req.params.id).populate('beypari', 'name partnerId commissionRate');
        if (!consignment) return res.status(404).json({ message: 'Consignment not found' });

        const { grossSales, quantitySold } = await sumShopSalesForConsignment(ShopSale, consignment._id);
        const targetMet = grossSales >= consignment.minimumTargetAmount;

        if (targetMet && consignment.status === 'active') {
            await Beypari.findByIdAndUpdate(consignment.beypari._id || consignment.beypari, {
                status: 'Pending Settlement',
            });
        }

        res.json({
            consignment,
            grossSales,
            quantitySold,
            minimumTargetAmount: consignment.minimumTargetAmount,
            targetMet,
            remainingToTarget: Math.max(0, consignment.minimumTargetAmount - grossSales),
            fuelCost: consignment.fuelCost,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateConsignment = async (req, res) => {
    try {
        const consignment = await Consignment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate('beypari', 'name partnerId');
        if (!consignment) return res.status(404).json({ message: 'Consignment not found' });
        res.json(consignment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteConsignment = async (req, res) => {
    try {
        const saleCount = await ShopSale.countDocuments({ consignment: req.params.id });
        if (saleCount > 0) {
            return res.status(400).json({ message: 'Cannot delete consignment with existing shop sales' });
        }
        const consignment = await Consignment.findByIdAndDelete(req.params.id);
        if (!consignment) return res.status(404).json({ message: 'Consignment not found' });
        res.json({ message: 'Consignment removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
