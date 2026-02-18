const Tenant = require("../../models/Tenant");
const User = require("../../models/User");
const Invoice = require("../../models/Invoice");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalTenants = await Tenant.countDocuments();
    const activeTenants = await Tenant.countDocuments({ status: "active" });
    const totalUsers = await User.countDocuments();

    const revenueData = await Invoice.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } }
    ]);

    res.json({
      totalTenants,
      activeTenants,
      totalUsers,
      totalRevenue: revenueData[0]?.totalRevenue || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
