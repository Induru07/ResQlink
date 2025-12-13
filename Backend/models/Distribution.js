const mongoose = require('mongoose');

const DistributionSchema = new mongoose.Schema({
    // Unique Identifier
    distributionId: { 
        type: String, 
        required: true, 
        unique: true 
    }, // Auto-generated: DIST001, DIST002
    
    // Who distributed
    contributorId: { 
        type: String, 
        required: true, 
        ref: 'Contributor' 
    },
    
    // What was distributed
    items: [{
        inventoryId: { 
            type: String, 
            ref: 'Inventory' 
        },
        category: String,
        itemName: String,
        quantityDistributed: Number,
        unit: String
    }],
    
    // Who received
    recipientType: { 
        type: String, 
        enum: ['victim', 'relief-center', 'community', 'other'],
        default: 'victim'
    },
    recipientId: String, // victimId or center ID
    recipientName: String,
    recipientPhone: String,
    recipientAddress: String,
    recipientLocation: {
        district: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    
    // Delivery Details
    distributionDate: { 
        type: Date, 
        required: true,
        default: Date.now
    },
    deliveryMethod: { 
        type: String, 
        enum: ['direct-delivery', 'pickup', 'relief-center'],
        default: 'direct-delivery'
    },
    
    // Verification
    deliveryProof: [String], // Photo URLs
    recipientSignature: String, // Image URL or digital signature
    recipientConfirmation: { 
        type: Boolean, 
        default: false 
    },
    
    // Impact Tracking
    familiesBenefited: Number,
    individualsBenefited: Number,
    
    // Link to Needs
    fulfilledNeedId: { 
        type: String, 
        ref: 'VictimNeeds' 
    }, // If this distribution fulfilled a specific victim need
    
    // Notes & Status
    notes: String,
    status: {
        type: String,
        enum: ['pending', 'in-transit', 'delivered', 'confirmed'],
        default: 'pending'
    },
    
    // Timestamps
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Distribution', DistributionSchema);
