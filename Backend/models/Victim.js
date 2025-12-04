const mongoose = require('mongoose');

const VictimSchema = new mongoose.Schema({
    // Login Details
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // Personal Details (From Sign Up Page)
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    nationalID: { type: String }, // NIC
    
    // Location & Status (For the Map & Relief)
    province: String,
    district: String,
    addressDetails: String,
    location: {
        latitude: Number,
        longitude: Number
    },
    status: { type: String, default: 'Not Affected' }, // Affected, Safe, etc.
    needs: {
        dryfood: Boolean,
        cookedfood: Boolean,
        water: Boolean,
        medicine: Boolean
    },
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Victim', VictimSchema);