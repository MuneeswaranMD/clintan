const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
  name: String,
  email: String,
  phone: String,
}, { timestamps: true });

module.exports = mongoose.model("Client", clientSchema);
