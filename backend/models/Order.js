const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    orderId: { type: String, required: true }, // Removed unique: true here as it should be unique per tenant
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
    }],

    // External Sync Fields
    externalOrderId: { type: String }, // ID from external system (e.g. Website)
    syncStatus: { 
        type: String, 
        enum: ['PENDING', 'SYNCED', 'FAILED'], 
        default: 'PENDING' 
    },
    syncLog: [{
        status: String,
        reason: String,
        timestamp: { type: Date, default: Date.now }
    }],
    customerRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }, // Link to Customer model
    idempotencyKey: { type: String } // For preventing duplicate requests
}, { timestamps: true });

orderSchema.index({ tenantId: 1 });
orderSchema.index({ tenantId: 1, orderId: 1 }, { unique: true });
orderSchema.index({ tenantId: 1, externalOrderId: 1 }, { unique: true, partialFilterExpression: { externalOrderId: { $exists: true } } }); // Partial index for orders that have externalOrderId

module.exports = mongoose.model('Order', orderSchema);
