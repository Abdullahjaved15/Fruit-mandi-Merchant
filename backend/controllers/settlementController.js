import mongoose from 'mongoose';
import BeypariSettlement from '../models/BeypariSettlement.js';
import Consignment from '../models/Consignment.js';
import Beypari from '../models/Beypari.js';
import ShopSale from '../models/ShopSale.js';
import { sumShopSalesForConsignment } from '../utils/mandiHelpers.js';

export const getSettlements = async (req, res) => {
    try {
        const filter = {};
        if (req.query.beypari) filter.beypari = req.query.beypari;
        if (req.query.status) filter.status = req.query.status;
        const settlements = await BeypariSettlement.find(filter)
            .populate('beypari', 'name partnerId')
            .populate('consignment', 'productName quantityReceived minimumTargetAmount')
            .sort({ createdAt: -1 });
        res.json(settlements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createSettlement = async (req, res) => {
    try {
        const consignment = await Consignment.findById(req.body.consignment);
        if (!consignment) return res.status(404).json({ message: 'Consignment not found' });
        if (consignment.status === 'settled') {
            return res.status(400).json({ message: 'Consignment already settled' });
        }

        const { grossSales } = await sumShopSalesForConsignment(ShopSale, consignment._id);
        const commissionAmount = Number(req.body.commissionAmount) || 0;
        const fuelCost = Number(req.body.fuelCost ?? consignment.fuelCost) || 0;
        const otherDeductions = Number(req.body.otherDeductions) || 0;
        const netPayable = grossSales - commissionAmount - fuelCost - otherDeductions;

        const settlement = await BeypariSettlement.create({
            consignment: consignment._id,
            beypari: consignment.beypari,
            grossSales,
            minimumTarget: consignment.minimumTargetAmount,
            commissionAmount,
            fuelCost,
            otherDeductions,
            netPayable,
            notes: req.body.notes || '',
            status: 'draft',
        });

        const populated = await BeypariSettlement.findById(settlement._id)
            .populate('beypari', 'name partnerId commissionRate')
            .populate('consignment', 'productName minimumTargetAmount fuelCost');

        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getSettlementById = async (req, res) => {
    try {
        const settlement = await BeypariSettlement.findById(req.params.id)
            .populate('beypari', 'name partnerId')
            .populate('consignment', 'productName minimumTargetAmount fuelCost arrivalDate');
        if (!settlement) return res.status(404).json({ message: 'Settlement not found' });
        res.json(settlement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const markSettlementPaid = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const settlement = await BeypariSettlement.findById(req.params.id).session(session);
        if (!settlement) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Settlement not found' });
        }

        settlement.status = 'paid';
        settlement.paidAt = new Date();
        settlement.paymentMethod = req.body.paymentMethod || 'cash';
        await settlement.save({ session });

        await Consignment.findByIdAndUpdate(settlement.consignment, { status: 'settled' }, { session });
        await Beypari.findByIdAndUpdate(settlement.beypari, { status: 'Active' }, { session });

        await session.commitTransaction();
        session.endSession();

        const populated = await BeypariSettlement.findById(settlement._id)
            .populate('beypari', 'name partnerId')
            .populate('consignment', 'productName');

        res.json(populated);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: error.message });
    }
};

export const deleteSettlement = async (req, res) => {
    try {
        const settlement = await BeypariSettlement.findById(req.params.id);
        if (!settlement) return res.status(404).json({ message: 'Settlement not found' });
        if (settlement.status === 'paid') {
            return res.status(400).json({ message: 'Cannot delete a paid settlement' });
        }
        await settlement.deleteOne();
        await Consignment.findByIdAndUpdate(settlement.consignment, { status: 'active' });
        res.json({ message: 'Settlement removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
