const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');
const admin = require('../config/firebase');

// Middleware to verify Firebase ID Token (if not globally applied)
// Assuming we have an auth middleware
const verifyAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) return res.status(401).json({ message: 'Unauthorized' });
        const decoded = await admin.auth().verifyIdToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid Token' });
    }
};

router.post('/generate', verifyAuth, apiKeyController.generateKey);
router.get('/', verifyAuth, apiKeyController.getKey);
router.post('/revoke', verifyAuth, apiKeyController.revokeKey);

module.exports = router;
