const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
    // Unique Identifier
    collectionId: { 
        type: String, 
        required: true, 
        unique: true 
    }, // Auto-generated: COLL001, COLL002
    
    // Who collected
    contributorId: { 
        type: String, 
        required: true, 
        ref: 'Contributor' 
    },
    
    // What was collected
    items: [{
        category: { 
            type: String, 
            required: true,
            enum: ['food', 'water', 'clothing', 'medicine', 'hygiene', 'shelter', 'other']
        },
        itemName: String, // e.g., "Rice", "Bottled Water"
        quantity: Number,
        unit: String, // kg, liters, pieces, boxes
        condition: { 
            type: String, 
            enum: ['new', 'good', 'usable'],
            default: 'good'
        },
        expiryDate: Date // For perishables
    }],
    
    // Collection Details
    collectionDate: { 
        type: Date, 
        required: true,
        default: Date.now
    },
    collectionLocation: {
        address: String,
        district: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    
    // Donor Info (optional, can be anonymous)
    donorName: String,
    donorPhone: String,
    donorEmail: String,
    isAnonymous: { 
        type: Boolean, 
        default: false 
    },
    
    // Status Workflow
    status: {
        type: String,
        enum: ['collected', 'in-storage', 'partially-distributed', 'fully-distributed'],
        default: 'collected'
    },
    
    // Documentation
    photos: [String], // URLs to uploaded photos
    notes: String,
    
    // Tracking
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Collection', CollectionSchema);
