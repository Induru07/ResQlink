const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
    // Login Details
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Business Details
    fullName: { type: String, required: true },
    contactPerson: String,
    phone: String,
    
    // What they provide
    warehouseAddress: String,
    availableGoods: [String], // e.g. ["Rice", "Water Bottles"]
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Supplier', SupplierSchema);