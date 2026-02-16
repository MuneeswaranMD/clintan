const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // FREE, PRO, ENTERPRISE
    priceMonthly: { type: Number, required: true },
    maxBranches: { type: Number, default: 1 },
    maxUsers: { type: Number, default: 2 },
    maxInvoicesPerMonth: { type: Number, default: 50 },
    allowedModules: [{ type: String }],
    trialDays: { type: Number, default: 14 },
}, { timestamps: true });

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
