// Middleware to ensure tenantId is present for tenant-level operations
const tenantMiddleware = (req, res, next) => {
    // If the user is a super admin, they might not have a fixed tenantId
    // unless they are impersonating one or performing platform-level tasks.
    
    if (req.user.role === 'SUPER_ADMIN') {
        // Super admin might provide tenantId in headers or query for cross-tenant operations
        const targetTenantId = req.headers['x-tenant-id'] || req.query.tenantId;
        if (targetTenantId) {
            req.tenantId = targetTenantId;
        }
        return next();
    }

    if (!req.user.tenantId) {
        return res.status(403).json({ error: 'Forbidden: No tenant context found for this user' });
    }

    // Force the tenantId from the authenticated token to prevent cross-tenant attacks
    req.tenantId = req.user.tenantId;
    next();
};

module.exports = tenantMiddleware;
