const express = require("express");
const router = express.Router();
const Module = require("../models/Module");
const Tenant = require("../models/Tenant");
const Industry = require("../models/Industry");
const attachUser = require("../middleware/attachUser");
const firebaseAuth = require("../middleware/firebaseAuth");

// Apply middleware to all routes in this file
router.use(firebaseAuth);
router.use(attachUser);

// GET /api/menu - Get dynamic menu based on role, tenant, and industry
router.get("/", async (req, res) => {
  try {
    // 1. Super Admin gets all modules sorted by order
    if (req.user.role === "superadmin") {
      const modules = await Module.find().sort("order");
      return res.json(modules);
    }

    // 2. Fetch Tenant
    const tenant = await Tenant.findById(req.user.tenantId);
    if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
    }

    // 3. Fetch Core Modules
    const coreModules = await Module.find({ type: "core" });

    // 4. Fetch Industry Extensions
    // If tenant has an industry key, fetch the corresponding extensions
    let extensionModules = [];
    if (tenant.industry) {
        const industry = await Industry.findOne({ key: tenant.industry });
        if (industry && industry.extensions && industry.extensions.length > 0) {
            extensionModules = await Module.find({
                key: { $in: industry.extensions },
                type: "extension" // Safety check
            });
        }
    }

    // 5. Combine All Modules
    let allModules = [...coreModules, ...extensionModules];

    // Remove duplicates if any (though keys should be unique across core/extension)
    const uniqueModules = Array.from(new Map(allModules.map(m => [m.key, m])).values());

    // 6. Filter by User Role
    // If rolesAllowed is empty/null, assume permitted (or denied depending on security policy)
    // Here: Empty means permitted for everyone authenticated, or specific checks
    const roleFiltered = uniqueModules.filter(module => {
        if (!module.rolesAllowed || module.rolesAllowed.length === 0) return true;
        return module.rolesAllowed.includes(req.user.role);
    });

    // 7. Apply Tenant Overrides (Enable/Disable, Order)
    const finalModules = roleFiltered
      .filter(module => {
        // Find override for this module in tenant features
        const override = tenant.features?.find(
          f => f.moduleKey === module.key
        );
        // If override exists, use its enabled status. Otherwise default to true.
        return override ? override.enabled : true;
      })
      .map(module => {
          // Map to apply order override if exists, otherwise use default module order
          const override = tenant.features?.find(f => f.moduleKey === module.key);
          return {
              ...module.toObject(),
              order: override?.order !== undefined ? override.order : module.order
          };
      })
      .sort((a, b) => a.order - b.order);

    res.json(finalModules);

  } catch (error) {
    console.error("Menu Fetch Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// PUT /api/menu/tenant/module - Toggle module for tenant
router.put("/tenant/module", async (req, res) => {
  try {
    // Only Admin or Superadmin should be able to do this
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.role !== 'COMPANY_ADMIN') {
        return res.status(403).json({ message: "Access denied" });
    }

    const { moduleKey, enabled, order } = req.body;

    const tenant = await Tenant.findById(req.user.tenantId);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    if (!tenant.features) tenant.features = [];

    const existingIndex = tenant.features.findIndex(
      f => f.moduleKey === moduleKey
    );

    if (existingIndex > -1) {
      if (enabled !== undefined) tenant.features[existingIndex].enabled = enabled;
      if (order !== undefined) tenant.features[existingIndex].order = order;
    } else {
      tenant.features.push({ 
          moduleKey, 
          enabled: enabled !== undefined ? enabled : true,
          order: order !== undefined ? order : 0 
      });
    }

    await tenant.save();

    res.json({ message: "Module updated for tenant", features: tenant.features });

  } catch (error) {
      console.error("Tenant Module Update Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
});

// PUT /api/menu/tenant/reorder - Bulk update order for tenant
router.put("/tenant/reorder", async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.role !== 'COMPANY_ADMIN') {
        return res.status(403).json({ message: "Access denied" });
    }

    const { modules } = req.body; // Expecting array of { key, order, enabled }

    const tenant = await Tenant.findById(req.user.tenantId);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    if (!tenant.features) tenant.features = [];

    // Update or add each module config
    modules.forEach(item => {
        const existingIndex = tenant.features.findIndex(f => f.moduleKey === item.key);
        if (existingIndex > -1) {
            if (item.order !== undefined) tenant.features[existingIndex].order = item.order;
            if (item.enabled !== undefined) tenant.features[existingIndex].enabled = item.enabled;
        } else {
            tenant.features.push({
                moduleKey: item.key,
                order: item.order,
                enabled: item.enabled !== undefined ? item.enabled : true
            });
        }
    });

    await tenant.save();
    res.json({ message: "Menu order updated", features: tenant.features });

  } catch (error) {
    console.error("Tenant Reorder Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// === SUPER ADMIN ROUTES ===

// POST /api/menu/module - Create new module
router.post("/module", async (req, res) => {
    try {
        if (req.user.role !== "superadmin") {
            return res.status(403).json({ message: "Access denied" });
        }

        const { key, name, path, icon, order, rolesAllowed, type, category } = req.body;
        
        const existing = await Module.findOne({ key });
        if (existing) return res.status(400).json({ message: "Module key already exists" });

        const newModule = new Module({
            key, name, path, icon, order, rolesAllowed, type, category
        });

        await newModule.save();
        res.status(201).json(newModule);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/menu/module/:id - Update module
router.put("/module/:id", async (req, res) => {
    try {
        if (req.user.role !== "superadmin") {
            return res.status(403).json({ message: "Access denied" });
        }

        const updates = req.body;
        const module = await Module.findByIdAndUpdate(req.params.id, updates, { new: true });

        if (!module) return res.status(404).json({ message: "Module not found" });

        res.json(module);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/menu/module/:id - Delete module
router.delete("/module/:id", async (req, res) => {
    try {
        if (req.user.role !== "superadmin") {
            return res.status(403).json({ message: "Access denied" });
        }

        const module = await Module.findById(req.params.id);
        if (!module) return res.status(404).json({ message: "Module not found" });
        
        // Prevent deleting core modules
        if (module.type === 'core') {
            return res.status(400).json({ message: "Cannot delete core modules" });
        }

        await Module.deleteOne({ _id: req.params.id });

        res.json({ message: "Module deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/menu/industry - Create Industry (Helper for Super Admin)
router.post("/industry", async (req, res) => {
    try {
        if (req.user.role !== "superadmin") {
            return res.status(403).json({ message: "Access denied" });
        }
        
        const { key, name, extensions } = req.body;
        const newIndustry = new Industry({ key, name, extensions });
        await newIndustry.save();
        res.status(201).json(newIndustry);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
