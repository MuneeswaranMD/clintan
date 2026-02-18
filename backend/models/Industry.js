const mongoose = require('mongoose');

const industrySchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    extensions: [{ type: String }], // Array of module keys (extensions) - e.g. ['expenses', 'projects']
    defaultWorkflow: {
        order: [{ type: String }],
        estimate: [{ type: String }]
    },
    defaultOrderSchema: [{ type: mongoose.Schema.Types.Mixed }],
}, { timestamps: true });

module.exports = mongoose.model('Industry', industrySchema);
