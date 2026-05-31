import ShopSale from '../models/ShopSale.js';
import Customer from '../models/Customer.js';
import BeypariSettlement from '../models/BeypariSettlement.js';
import Consignment from '../models/Consignment.js';

export const getMandiStats = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todaySales = await ShopSale.aggregate([
            { $match: { saleDate: { $gte: startOfDay } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
        ]);

        const customers = await Customer.find({});
        const totalUdhaar = customers.reduce((s, c) => s + (c.udhaarRaw || 0), 0);

        const pendingSettlements = await BeypariSettlement.countDocuments({ status: 'draft' });
        const activeConsignments = await Consignment.countDocuments({ status: 'active' });

        const recentSales = await ShopSale.find()
            .sort({ saleDate: -1 })
            .limit(7)
            .populate('beypari', 'name')
            .populate('customer', 'name');

        res.json({
            todaySalesTotal: todaySales[0]?.total || 0,
            todaySalesCount: todaySales[0]?.count || 0,
            totalUdhaar,
            pendingSettlements,
            activeConsignments,
            recentSales,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
