const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, required: true, unique: true },
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

module.exports = mongoose.model('Invoice', invoiceSchema);
