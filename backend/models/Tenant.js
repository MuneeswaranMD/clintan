const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    industryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Industry', required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    status: { 
        type: String, 
        enum: ['ACTIVE', 'SUSPENDED', 'TRIAL'], 
        default: 'TRIAL' 
    },
    trialEndsAt: { type: Date },
    subscriptionStatus: { 
        type: String, 
        enum: ['PAID', 'FAILED', 'CANCELLED'], 
        default: 'PAID' 
    },
    ownerId: { type: String, required: true }, // Links to the Firebase UID or User model
    config: {
        currency: { type: String, default: '₹' },
        dateFormat: { type: String, default: 'DD/MM/YYYY' },
        taxName: { type: String, default: 'GST' }
    }
}, { timestamps: true });

// Index for performance
tenantSchema.index({ status: 1 });

module.exports = mongoose.model('Tenant', tenantSchema);
