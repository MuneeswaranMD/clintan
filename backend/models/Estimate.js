const mongoose = require('mongoose');

const estimateSchema = new mongoose.Schema({
    estimateNumber: { type: String, required: true, unique: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: false }, // Made optional
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    items: [{
        name: String,
        quantity: Number,
        price: Number,
        total: Number
    }],
    subTotal: Number,
    tax: Number,
    totalAmount: Number,
    validUntil: Date,
    status: {
        type: String,
        enum: ['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED', 'converted', 'pending'],
        default: 'DRAFT'
    },
    total: Number, // User requested field
    notes: String,
    pdfUrl: String
}, { timestamps: true });

module.exports = mongoose.model('Estimate', estimateSchema);
