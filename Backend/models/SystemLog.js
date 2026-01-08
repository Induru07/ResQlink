const mongoose = require('mongoose');

const SystemLogSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    level: { 
        type: String, 
        enum: ['info', 'warning', 'error', 'success'], 
        default: 'info' 
    },
    message: { type: String, required: true },
    source: { type: String, required: true }, // API endpoint, controller, etc.
    statusCode: { type: Number },
    ipAddress: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    metadata: { type: mongoose.Schema.Types.Mixed } // Additional data
});

// Index for faster queries
SystemLogSchema.index({ timestamp: -1 });
SystemLogSchema.index({ level: 1 });

module.exports = mongoose.model('SystemLog', SystemLogSchema);
