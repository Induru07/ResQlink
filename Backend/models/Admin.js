const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['DEV', 'GOV', 'DS', 'GN'],
        required: true,
        default: 'GN'
    }, // Developer, Government, Divisional Secretary, Grama Niladhari
    
    // Role-specific fields
    district: { type: String }, // For DS and GN
    dsDivision: { type: String }, // For DS and GN
    gnDivisionCode: { type: String }, // For GN only
    
    // Status and permissions
    status: { 
        type: String, 
        enum: ['active', 'inactive', 'suspended', 'flagged'],
        default: 'active'
    },
    
    // Official ID verification
    officialId: { type: String }, // File path or reference
    verified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    
    // Activity tracking
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lastLoginIp: { type: String },
    
    // Metadata
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp on save
AdminSchema.pre('save', function() {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Admin', AdminSchema);