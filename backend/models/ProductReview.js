import mongoose from 'mongoose';

const productReviewSchema = mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
    },
    {
        timestamps: true,
        collection: 'Product_Reviews',
    }
);

const ProductReview = mongoose.model('ProductReview', productReviewSchema);
export default ProductReview;
