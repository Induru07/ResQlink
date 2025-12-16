const mongoose = require('mongoose');

const VictimNeedsSchema = new mongoose.Schema({
    victimId: { 
        type: String, 
        required: true, 
        ref: 'VictimAuth' 
    }, // Links to the Auth ID (e.g., "MTR001")
    
    items: {
        // Critical items (red marker)
        shelter: { type: Boolean, default: false },
        medicine: { type: Boolean, default: false },
        infantCare: { type: Boolean, default: false }, // Diapers, milk, etc.
        medicalSupport: { type: Boolean, default: false }, // Wheelchair, oxygen, etc.
        
        // High priority (orange marker)
        dryRations: { type: Boolean, default: false },
        cookedFood: { type: Boolean, default: false },
        water: { type: Boolean, default: false },
        
        // Moderate priority (yellow marker)
        clothes: { type: Boolean, default: false },
        sanitaryItems: { type: Boolean, default: false }
    },
    
    // Special conditions for critical priority
    specialConditions: {
        hasDisability: { type: Boolean, default: false },
        isPregnant: { type: Boolean, default: false },
        isElderly: { type: Boolean, default: false },
        hasInfant: { type: Boolean, default: false },
        hasChronicIllness: { type: Boolean, default: false }
    },
    
    description: { 
        type: String 
    }, // Extra details like "Need insulin" or "Size L clothes"
    
    urgency: {
        type: String,
        enum: ['critical', 'high', 'moderate'],
        default: 'moderate'
    },
    
    status: { 
        type: String, 
        enum: ['pending', 'in-progress', 'resolved'],
        default: 'pending' 
    },
    
    // Admin response tracking
    respondedBy: { type: String }, // Admin ID or contributor ID
    responseDate: { type: Date },
    responseNotes: { type: String },
    
    // Emergency flag
    isEmergency: { type: Boolean, default: false },
    emergencyReason: { type: String },
    
    requestDate: { 
        type: Date, 
        default: Date.now 
    },
    
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('VictimNeeds', VictimNeedsSchema);
