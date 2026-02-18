const mongoose = require("mongoose");

const automationSchema = new mongoose.Schema({
  name: String,
  trigger: String,
  action: String,
  enabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Automation", automationSchema);
