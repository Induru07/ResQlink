const mongoose = require('mongoose');

const VictimNeedsSchema = new mongoose.Schema({
    victimId: { 
        type: String, 
        required: true, 
        ref: 'VictimAuth' 
    }, // Links to the Auth ID (e.g., "MTR001")
    
    items: {
        dryRations: { type: Boolean, default: false },
        cookedFood: { type: Boolean, default: false },
        water: { type: Boolean, default: false },
        clothes: { type: Boolean, default: false },
        medicine: { type: Boolean, default: false },
        infantCare: { type: Boolean, default: false }, // Diapers, milk, etc.
        sanitaryItems: { type: Boolean, default: false }
    },
    
    description: { 
        type: String 
    }, // Extra details like "Need insulin" or "Size L clothes"
    
    status: { 
        type: String, 
        enum: ['Pending', 'In Progress', 'Fulfilled'],
        default: 'Pending' 
    },
    
    requestDate: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('VictimNeeds', VictimNeedsSchema);
