const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, unique: true }, // One key per tenant for simplicity, can change to unique: false
    apiKey: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    lastUsedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('ApiKey', apiKeySchema);
