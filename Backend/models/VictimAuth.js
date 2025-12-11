const mongoose = require('mongoose');

const VictimAuthSchema = new mongoose.Schema({
    victimId: { 
        type: String, 
        required: true, 
        unique: true 
    }, // Custom ID like "MTR001"
    fullName: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    district: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('VictimAuth', VictimAuthSchema);
