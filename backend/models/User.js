const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    role: { 
        type: String, 
        enum: ['COMPANY_ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'SALES', 'WAREHOUSE', 'VIEWER'], 
        required: true 
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date
}, { timestamps: true });

// Multi-tenant indexing
userSchema.index({ tenantId: 1 });
userSchema.index({ email: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
