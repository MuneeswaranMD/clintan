const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    role: { 
        type: String, 
        enum: ['COMPANY_ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'SALES', 'WAREHOUSE', 'VIEWER', 'admin', 'superadmin', 'staff'], 
        default: 'admin' 
    },
    firebaseUid: { type: String, unique: true, sparse: true }, // Sparse allows null for existing users without firebaseUid
    name: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: false }, // Made optional to support simple password field
    password: { type: String }, // User requested field
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date
}, { timestamps: true });

// Multi-tenant indexing
userSchema.index({ tenantId: 1 });
userSchema.index({ email: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
