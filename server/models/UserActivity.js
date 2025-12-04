import mongoose from 'mongoose';

const UserActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    activityType: {
        type: String,
        enum: ['login', 'logout', 'product_view', 'product_add_to_cart', 'product_purchase'],
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    ipAddress: String,
    userAgent: String,
    details: mongoose.Schema.Types.Mixed
}, { timestamps: true });

const UserActivity = mongoose.model('UserActivity', UserActivitySchema);
export default UserActivity;
