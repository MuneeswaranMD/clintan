const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    customerId: { type: String, required: true },
    customerName: String,
    customerPhone: String,
    items: [{
        name: String,
        quantity: Number,
        price: Number,
        total: Number
    }],
    totalAmount: { type: Number, required: true },
    
    // Status Flow
    status: {
        type: String,
        enum: ['PENDING', 'ESTIMATE_SENT', 'CONFIRMED', 'PAYMENT_COMPLETED', 'INVOICED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'],
        default: 'PENDING'
    },
    
    // Linked Documents
    // We store explicit IDs but also keep references for population if needed
    estimateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Estimate' },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    
    // Sub-statuses to track granular progress
    estimateStatus: { type: String, default: null }, // SENT, APPROVED, REJECTED, EXPIRED
    paymentStatus: { type: String, enum: ['UNPAID', 'LINK_SENT', 'PAID', 'REFUNDED'], default: 'UNPAID' },
    invoiceStatus: { type: String, default: null }, // GENERATED, SENT
    dispatchStatus: { type: String, default: null }, // DISPATCHED, IN_TRANSIT, DELIVERED
    
    dispatchDetails: {
        courierName: String,
        trackingNumber: String,
        expectedDelivery: Date
    },

    source: { type: String, enum: ['WEBSITE', 'WHATSAPP', 'Manual'], default: 'WEBSITE' },
    
    timeline: [{
        status: String,
        description: String,
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
