import mongoose from 'mongoose';

export const resolveById = async (Model, id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Model.findById(id);
};

export const sumShopSalesForConsignment = async (ShopSale, consignmentId) => {
    const result = await ShopSale.aggregate([
        { $match: { consignment: new mongoose.Types.ObjectId(consignmentId) } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, qty: { $sum: '$quantity' } } },
    ]);
    return {
        grossSales: result[0]?.total || 0,
        quantitySold: result[0]?.qty || 0,
    };
};

export const formatPkr = (n) => `PKR ${Number(n || 0).toLocaleString()}`;

export const udhaarTypeFromPercent = (percent) => {
    if (percent > 70) return 'danger';
    if (percent > 0) return 'accent';
    return 'success';
};
