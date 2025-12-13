const mongoose = require('mongoose');

const VictimProfileSchema = new mongoose.Schema({
    victimId: { 
        type: String, 
        required: true, 
        ref: 'VictimAuth' 
    }, // Links to the Auth ID (e.g., "MTR001")
    
    phone: { 
        type: String, 
        required: true 
    },
    nationalID: { 
        type: String 
    },
    address: { 
        type: String 
    },
    
    // Family Details
    familyMembers: [{
        name: String,
        age: Number,
        relationship: String,
        specialNeeds: String // Optional: if they need specific medicine/care
    }],

    // Location for Map
    location: {
        latitude: Number,
        longitude: Number
    },
    
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('VictimProfile', VictimProfileSchema);
