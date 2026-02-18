const Tenant = require('../models/Tenant');

module.exports = async (req, res, next) => {
  const host = req.headers.host;
  // Skip domain detection for local development and direct IPs if needed, 
  // or handle them as a specific case.
  
  if (!host) {
    return next();
  }

  try {
    let tenant;

    // Direct mapping for secondary domains or subdomains
    if (host.endsWith("averqon.in") || host.endsWith("onrender.com")) {
      const parts = host.split(".");
      // If it's a subdomain (e.g., client.averqon.in or client.onrender.com)
      if (parts.length >= 3) {
        const subdomain = parts[0];
        // Skip common subdomains
        if (subdomain !== 'billing' && subdomain !== 'app' && subdomain !== 'www') {
          tenant = await Tenant.findOne({ subdomain });
        }
      }
    } 
    
    // If not found by subdomain or if it's a custom domain
    if (!tenant) {
      tenant = await Tenant.findOne({ customDomain: host });
    }

    // Fallback to X-Tenant-Id header if domain mapping doesn't yield a result
    if (!tenant) {
      const tenantId = req.headers["x-tenant-id"];
      if (tenantId) {
        tenant = await Tenant.findById(tenantId);
      }
    }

    if (tenant) {
      req.tenant = tenant;
      req.tenantId = tenant._id.toString();
    }

    next();
  } catch (error) {
    console.error('Tenant detection error:', error);
    res.status(500).json({ error: 'Internal server error during tenant detection' });
  }
};
