const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    invoiceNumber: { type: String, required: true }, // Removed unique: true here as it should be unique per tenant
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    estimateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Estimate' },
    items: [{
        name: String,
        quantity: Number,
        price: Number,
        total: Number
    }],
    subTotal: Number,
    tax: Number,
    totalAmount: Number,
    status: {
        type: String,
        enum: ['DRAFT', 'GENERATED', 'SENT', 'PAID', 'VOID'],
        default: 'GENERATED'
    },
    pdfUrl: String,
    paymentLink: String
}, { timestamps: true });

invoiceSchema.index({ tenantId: 1 });
invoiceSchema.index({ tenantId: 1, invoiceNumber: 1 }, { unique: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
