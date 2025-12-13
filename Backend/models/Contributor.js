const mongoose = require('mongoose');

const ContributorSchema = new mongoose.Schema({
    // Unique Identifier
    contributorId: { 
        type: String, 
        required: true, 
        unique: true 
    }, // Auto-generated: CON001, CON002, etc.
    
    // Auth Details
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    
    // Basic Info
    name: { 
        type: String, 
        required: true 
    }, // Person or Organization name
    phone: { 
        type: String, 
        required: true 
    },
    
    // Type & Verification
    contributorType: { 
        type: String, 
        enum: ['individual', 'organization', 'ngo', 'religious', 'corporate'],
        default: 'individual'
    },
    verificationStatus: { 
        type: String, 
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    
    // Service Details
    serviceAreas: [{ 
        province: String,
        district: String
    }], // Districts they can collect from
    
    // Logistics
    hasVehicle: { 
        type: Boolean, 
        default: false 
    },
    vehicleType: String, // van, truck, bike, car
    vehicleCapacity: String, // e.g., "500kg" or "10 boxes"
    
    // Storage
    hasStorage: { 
        type: Boolean, 
        default: false 
    },
    storageAddress: String,
    storageCapacity: String,
    
    // Contact & Availability
    alternatePhone: String,
    availableDays: [String], // ["Monday", "Tuesday", ...]
    availableHours: String, // "9AM-5PM"
    
    // Stats (auto-calculated)
    totalCollections: { 
        type: Number, 
        default: 0 
    },
    totalDistributions: { 
        type: Number, 
        default: 0 
    },
    
    // Timestamps
    registeredAt: { 
        type: Date, 
        default: Date.now 
    },
    lastActive: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Contributor', ContributorSchema);
