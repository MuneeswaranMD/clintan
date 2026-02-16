const mongoose = require('mongoose');

const usageTrackingSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, unique: true },
    invoicesCreatedThisMonth: { type: Number, default: 0 },
    branchesCount: { type: Number, default: 0 },
    usersCount: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: Date.now }
}, { timestamps: true });

usageTrackingSchema.index({ tenantId: 1 });

module.exports = mongoose.model('UsageTracking', usageTrackingSchema);
