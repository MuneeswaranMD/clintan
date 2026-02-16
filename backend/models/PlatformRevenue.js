const mongoose = require('mongoose');

const platformRevenueSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { 
        type: String, 
        enum: ['SUCCESS', 'FAILED', 'PENDING'], 
        default: 'SUCCESS' 
    },
    paymentGatewayId: String,
    paidAt: { type: Date, default: Date.now }
}, { timestamps: true });

platformRevenueSchema.index({ tenantId: 1 });

module.exports = mongoose.model('PlatformRevenue', platformRevenueSchema);
