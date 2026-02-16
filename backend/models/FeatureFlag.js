const mongoose = require('mongoose');

const featureFlagSchema = new mongoose.Schema({
    featureKey: { type: String, required: true, unique: true },
    enabledForTenants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' }],
    globalEnabled: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('FeatureFlag', featureFlagSchema);
