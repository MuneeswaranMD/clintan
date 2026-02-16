const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    globalEnabled: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Module', moduleSchema);
