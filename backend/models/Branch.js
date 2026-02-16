const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    name: { type: String, required: true },
    branchCode: { type: String, required: true },
    address: {
        street: String,
        city: String,
        state: String,
        zip: String
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

branchSchema.index({ tenantId: 1 });

module.exports = mongoose.model('Branch', branchSchema);
