const mongoose = require('mongoose');

const SecurityLogSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    eventType: { 
        type: String, 
        enum: ['failed_login', 'successful_login', 'suspicious_activity', 'blocked_ip', 'threat_detected'],
        required: true
    },
    ipAddress: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId },
    userEmail: { type: String },
    attemptCount: { type: Number, default: 1 },
    blocked: { type: Boolean, default: false },
    severity: { 
        type: String, 
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low'
    },
    details: { type: String },
    userAgent: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed }
});

// Index for faster queries
SecurityLogSchema.index({ timestamp: -1 });
SecurityLogSchema.index({ ipAddress: 1 });
SecurityLogSchema.index({ eventType: 1 });

module.exports = mongoose.model('SecurityLog', SecurityLogSchema);
