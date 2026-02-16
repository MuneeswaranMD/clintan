const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: ['ERROR', 'INFO', 'WARNING', 'API', 'WEBHOOK', 'PAYMENT'], 
        required: true 
    },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' }, // Optional for system-wide logs
    message: { type: String, required: true },
    metaData: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

logSchema.index({ type: 1, createdAt: -1 });
logSchema.index({ tenantId: 1, createdAt: -1 });

module.exports = mongoose.model('Log', logSchema);
