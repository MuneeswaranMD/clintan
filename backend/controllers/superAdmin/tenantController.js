const Tenant = require("../../models/Tenant");

exports.getAllTenants = async (req, res) => {
  const tenants = await Tenant.find().sort({ createdAt: -1 });
  res.json(tenants);
};

exports.suspendTenant = async (req, res) => {
  const tenant = await Tenant.findByIdAndUpdate(
    req.params.id,
    { status: "suspended" },
    { new: true }
  );
  res.json(tenant);
};

exports.activateTenant = async (req, res) => {
  const tenant = await Tenant.findByIdAndUpdate(
    req.params.id,
    { status: "active" },
    { new: true }
  );
  res.json(tenant);
};
