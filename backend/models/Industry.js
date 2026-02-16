const mongoose = require('mongoose');

const industrySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    defaultModules: [{ type: String }], // Array of module keys
    defaultWorkflow: {
        order: [{ type: String }],
        estimate: [{ type: String }]
    },
    defaultOrderSchema: [{ type: mongoose.Schema.Types.Mixed }],
}, { timestamps: true });

module.exports = mongoose.model('Industry', industrySchema);
