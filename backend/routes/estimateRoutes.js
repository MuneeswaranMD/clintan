const express = require("express");
const router = express.Router();
const Estimate = require("../models/Estimate");
const Invoice = require("../models/Invoice");
const tenantMiddleware = require("../middleware/tenant");

router.post("/convert/:id", tenantMiddleware, async (req, res) => {
  try {
    const estimate = await Estimate.findOne({
      _id: req.params.id,
      tenantId: req.tenantId
    });

    if (!estimate) {
      return res.status(404).json({ message: "Estimate not found" });
    }

    const invoice = new Invoice({
      tenantId: estimate.tenantId,
      clientId: estimate.clientId,
      items: estimate.items,
      total: estimate.totalAmount || estimate.total // Handling both naming conventions
    });

    await invoice.save();

    estimate.status = "converted"; // Ensure 'converted' is in enum if strict
    await estimate.save();

    res.json({ message: "Converted to Invoice", invoice });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
