const mongoose = require("mongoose");

const featureFlagSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  enabled: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("FeatureFlag", featureFlagSchema);
