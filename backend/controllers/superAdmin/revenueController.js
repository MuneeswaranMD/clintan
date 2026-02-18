const Invoice = require("../../models/Invoice");

exports.getRevenueReport = async (req, res) => {
  try {
    const revenue = await Invoice.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$total" }
        }
      }
    ]);
  
    res.json(revenue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
