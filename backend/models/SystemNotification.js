const mongoose = require('mongoose');

const systemNotificationSchema = new mongoose.Schema({
    type: { type: String, required: true }, // e.g., PAYMENT_FAILED, SYSTEM_MAINTENANCE
    severity: { 
        type: String, 
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], 
        default: 'MEDIUM' 
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' }, // Null if for Super Admin
}, { timestamps: true });

module.exports = mongoose.model('SystemNotification', systemNotificationSchema);
