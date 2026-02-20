const ApiKey = require('../models/ApiKey');
const Tenant = require('../models/Tenant');
const crypto = require('crypto');

/**
 * Generate a new API Key for the authenticated user's tenant
 */
exports.generateKey = async (req, res) => {
    try {
        const userId = req.user.uid; // From auth middleware
        
        // Find Tenant by User ID
        // Assuming Tenant model has ownerId (userId) or similar
        // The Tenant model was recently updated to use `userId` as the owner UID.
        // Wait, the backend uses `Tenant.js` model.
        // Let's verify `Tenant` checks user ID.
        
        const tenant = await Tenant.findOne({ ownerId: userId }); // Updated check: Check model first
        
        if (!tenant) {
            return res.status(404).json({ success: false, message: 'Tenant not found for this user.' });
        }

        // Generate a random key
        const newKey = `ak_${crypto.randomBytes(16).toString('hex')}`;

        // Upsert the key (replace if exists, creates if new)
        const apiKeyDoc = await ApiKey.findOneAndUpdate(
            { tenantId: tenant._id },
            { 
                apiKey: newKey,
                isActive: true,
                tenantId: tenant._id
            },
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, apiKey: apiKeyDoc.apiKey });
    } catch (error) {
        console.error('Error generating API key:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

/**
 * Revoke existing API Key
 */
exports.revokeKey = async (req, res) => {
    try {
        const userId = req.user.uid;
        const tenant = await Tenant.findOne({ ownerId: userId });
        
        if (!tenant) {
            return res.status(404).json({ success: false, message: 'Tenant not found.' });
        }

        await ApiKey.findOneAndUpdate(
            { tenantId: tenant._id },
            { isActive: false }
        );

        res.status(200).json({ success: true, message: 'API Key revoked successfully.' });
    } catch (error) {
        console.error('Error revoking API key:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

/**
 * Get current API Key
 */
exports.getKey = async (req, res) => {
    try {
        const userId = req.user.uid;
        // Tenant lookup by ownerId
        let tenant = await Tenant.findOne({ ownerId: userId });
        
        // If not found by ownerId, try finding by userId (if field name differs)
        if (!tenant) {
             tenant = await Tenant.findOne({ userId: userId });
        }

        if (!tenant) {
            return res.status(404).json({ success: false, message: 'Tenant not found.' });
        }

        const apiKeyDoc = await ApiKey.findOne({ tenantId: tenant._id, isActive: true });

        if (!apiKeyDoc) {
            return res.status(200).json({ success: true, apiKey: null });
        }

        res.status(200).json({ success: true, apiKey: apiKeyDoc.apiKey });
    } catch (error) {
        console.error('Error fetching API key:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
