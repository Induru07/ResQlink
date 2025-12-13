const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    // Unique Identifier
    inventoryId: { 
        type: String, 
        required: true, 
        unique: true 
    }, // Auto-generated: INV001, INV002
    
    // Owner
    contributorId: { 
        type: String, 
        required: true, 
        ref: 'Contributor' 
    },
    
    // Item Details
    category: { 
        type: String, 
        required: true,
        enum: ['food', 'water', 'clothing', 'medicine', 'hygiene', 'shelter', 'other']
    },
    itemName: { 
        type: String, 
        required: true 
    }, // "Rice", "Bottled Water", "Blankets"
    
    // Quantity Tracking
    currentQuantity: { 
        type: Number, 
        required: true,
        default: 0
    },
    unit: { 
        type: String, 
        required: true 
    }, // kg, liters, pieces, boxes
    minimumThreshold: { 
        type: Number, 
        default: 10 
    }, // Alert when stock falls below this
    
    // Storage Details
    storageLocation: String,
    shelfLife: String, // "6 months", "1 year"
    expiryDate: Date,
    condition: { 
        type: String, 
        enum: ['new', 'good', 'usable', 'expired'],
        default: 'good'
    },
    
    // Source Tracking
    sourceCollectionIds: [{ 
        type: String, 
        ref: 'Collection' 
    }], // Which collections contributed to this inventory
    
    // Alerts
    isLowStock: { 
        type: Boolean, 
        default: false 
    }, // Auto-set when currentQuantity < minimumThreshold
    isExpiringSoon: { 
        type: Boolean, 
        default: false 
    }, // Auto-set when expiryDate is within 30 days
    
    // Timestamps
    lastRestocked: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Inventory', InventorySchema);
