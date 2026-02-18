const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    path: String,
    icon: String,
    order: { type: Number, default: 0 },
    rolesAllowed: [{ type: String }], // 'superadmin', 'admin', 'staff', etc.
    type: { 
        type: String, 
        enum: ['core', 'extension'], 
        default: 'extension',
        required: true 
    },
    category: { 
        type: String, 
        enum: ['core', 'sales', 'finance', 'operations', 'hr', 'marketing', 'support', 'settings', 'reports', 'super_admin', 'other'],
        default: 'other' 
    },
    description: String,
    globalEnabled: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Module', moduleSchema);
