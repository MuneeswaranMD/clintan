const admin = require('firebase-admin');

// Authenticate user and attach tenant/role info
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: decodedToken.role, // Custom claims expected
            tenantId: decodedToken.tenantId, // Custom claims expected
            branchId: decodedToken.branchId // Custom claims expected
        };

        next();
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

// Authorize based on roles
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};

module.exports = { authMiddleware, checkRole };
