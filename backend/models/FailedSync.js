const mongoose = require('mongoose');

const failedSyncSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    retryCount: { type: Number, default: 0 },
    status: { 
        type: String, 
        enum: ['PENDING', 'SUCCESS', 'FAILED'], 
        default: 'PENDING' 
    },
    reason: String,
    lastTriedAt: { type: Date, default: Date.now },
    nextRetryAt: { type: Date } // For scheduling
}, { timestamps: true });

failedSyncSchema.index({ status: 1 });

module.exports = mongoose.model('FailedSync', failedSyncSchema);
