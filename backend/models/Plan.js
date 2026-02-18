const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  name: String,
  price: Number,
  modules: [String],
  maxUsers: Number
}, { timestamps: true });

module.exports = mongoose.model("Plan", planSchema);
