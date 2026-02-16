const mongoose = require('mongoose');

const systemHealthSchema = new mongoose.Schema({
    service: { type: String, required: true }, // API_SERVER, DATABASE, REDIS, etc.
    status: { 
        type: String, 
        enum: ['UP', 'DOWN', 'DEGRADED'], 
        default: 'UP' 
    },
    responseTimeMs: Number,
    lastCheckedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('SystemHealth', systemHealthSchema);
