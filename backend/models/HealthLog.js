const mongoose = require('mongoose');

const healthLogSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    responseTime: { type: Number, required: true },
    status: { type: String, enum: ['online', 'slow', 'offline'], required: true },
    nodeUrl: { type: String }
}, { expires: '7d' }); // Automatically clean up old logs after 7 days

module.exports = mongoose.model('HealthLog', healthLogSchema);
