const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true }, // Phone is often unique per tenant
    address: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String
    },
    metadata: { type: Map, of: String }, // Flexible storage
    source: { type: String, default: 'WEBSITE' }
}, { timestamps: true });

// Make phone unique per tenant for accurate lookup
customerSchema.index({ tenantId: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);
