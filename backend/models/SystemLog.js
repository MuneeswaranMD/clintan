const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  action: String,
  userId: String,
  metadata: Object
}, { timestamps: true });

module.exports = mongoose.model("SystemLog", logSchema);
