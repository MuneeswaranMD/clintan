const mongoose = require('mongoose');

const platformUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['SUPER_ADMIN', 'SUPPORT_AGENT', 'BILLING_ADMIN'], 
        default: 'SUPER_ADMIN' 
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date
}, { timestamps: true });

module.exports = mongoose.model('PlatformUser', platformUserSchema);
