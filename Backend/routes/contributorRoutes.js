const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Import Models
const Contributor = require('../models/Contributor');
const Collection = require('../models/Collection');
const Inventory = require('../models/Inventory');
const Distribution = require('../models/Distribution');

// ========================================
// HELPER FUNCTIONS
// ========================================

// Generate unique contributorId (CON001, CON002, ...)
const generateContributorId = async () => {
    const count = await Contributor.countDocuments();
    return `CON${(count + 1).toString().padStart(3, '0')}`;
};

// Generate unique collectionId
const generateCollectionId = async () => {
    const count = await Collection.countDocuments();
    return `COLL${(count + 1).toString().padStart(4, '0')}`;
};

// Generate unique inventoryId
const generateInventoryId = async () => {
    const count = await Inventory.countDocuments();
    return `INV${(count + 1).toString().padStart(4, '0')}`;
};

// Generate unique distributionId
const generateDistributionId = async () => {
    const count = await Distribution.countDocuments();
    return `DIST${(count + 1).toString().padStart(4, '0')}`;
};

// ========================================
// 1. CONTRIBUTOR AUTH & PROFILE
// ========================================

// Register Contributor
router.post('/register', async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            contributorType,
            serviceAreas,
            hasVehicle,
            vehicleType,
            vehicleCapacity,
            hasStorage,
            storageAddress,
            storageCapacity,
            availableDays,
            availableHours
        } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({ msg: 'Missing required fields' });
        }

        // Check if email exists
        const existing = await Contributor.findOne({ email });
        if (existing) {
            return res.status(400).json({ msg: 'Email already registered' });
        }

        const contributorId = await generateContributorId();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const contributor = await Contributor.create({
            contributorId,
            name,
            email,
            password: hashedPassword,
            phone,
            contributorType,
            serviceAreas,
            hasVehicle,
            vehicleType,
            vehicleCapacity,
            hasStorage,
            storageAddress,
            storageCapacity,
            availableDays,
            availableHours
        });

        res.json({ 
            msg: 'Contributor registered successfully', 
            contributorId,
            id: contributor._id 
        });
    } catch (err) {
        console.error('Contributor registration error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Login Contributor
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const contributor = await Contributor.findOne({ email });
        if (!contributor) {
            return res.status(400).json({ msg: 'Contributor not found' });
        }

        const isMatch = await bcrypt.compare(password, contributor.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Update last active
        contributor.lastActive = Date.now();
        await contributor.save();

        const token = jwt.sign(
            { id: contributor._id, contributorId: contributor.contributorId, role: 'contributor' },
            process.env.JWT_SECRET
        );

        res.json({
            token,
            user: {
                id: contributor._id,
                contributorId: contributor.contributorId,
                name: contributor.name,
                role: 'contributor',
                verificationStatus: contributor.verificationStatus
            }
        });
    } catch (err) {
        console.error('Contributor login error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Get Contributor Profile
router.get('/profile/:contributorId', async (req, res) => {
    try {
        const { contributorId } = req.params;
        const contributor = await Contributor.findOne({ contributorId }).select('-password');
        
        if (!contributor) {
            return res.status(404).json({ msg: 'Contributor not found' });
        }

        res.json(contributor);
    } catch (err) {
        console.error('Get contributor profile error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Update Contributor Profile
router.put('/profile/:contributorId', async (req, res) => {
    try {
        const { contributorId } = req.params;
        const updates = req.body;
        
        // Don't allow updating sensitive fields
        delete updates.contributorId;
        delete updates.email;
        delete updates.password;
        delete updates.verificationStatus;

        const contributor = await Contributor.findOneAndUpdate(
            { contributorId },
            { ...updates, lastActive: Date.now() },
            { new: true }
        ).select('-password');

        if (!contributor) {
            return res.status(404).json({ msg: 'Contributor not found' });
        }

        res.json({ msg: 'Profile updated', contributor });
    } catch (err) {
        console.error('Update contributor profile error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ========================================
// 2. COLLECTION MANAGEMENT
// ========================================

// Log a new collection
router.post('/collection', async (req, res) => {
    try {
        const {
            contributorId,
            items,
            collectionDate,
            collectionLocation,
            donorName,
            donorPhone,
            donorEmail,
            isAnonymous,
            photos,
            notes
        } = req.body;

        if (!contributorId || !items || items.length === 0) {
            return res.status(400).json({ msg: 'Missing required fields' });
        }

        const collectionId = await generateCollectionId();

        const collection = await Collection.create({
            collectionId,
            contributorId,
            items,
            collectionDate: collectionDate || Date.now(),
            collectionLocation,
            donorName,
            donorPhone,
            donorEmail,
            isAnonymous,
            photos,
            notes
        });

        // Update contributor's total collections
        await Contributor.findOneAndUpdate(
            { contributorId },
            { 
                $inc: { totalCollections: 1 },
                lastActive: Date.now()
            }
        );

        // Add collected items to inventory
        for (const item of items) {
            await addToInventory(contributorId, item, collectionId);
        }

        res.json({ 
            msg: 'Collection logged successfully', 
            collectionId,
            collection 
        });
    } catch (err) {
        console.error('Log collection error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Get all collections for a contributor
router.get('/collection/:contributorId', async (req, res) => {
    try {
        const { contributorId } = req.params;
        const collections = await Collection.find({ contributorId }).sort({ collectionDate: -1 });
        
        res.json({ collections, count: collections.length });
    } catch (err) {
        console.error('Get collections error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Update collection status
router.put('/collection/:collectionId/status', async (req, res) => {
    try {
        const { collectionId } = req.params;
        const { status } = req.body;

        const collection = await Collection.findOneAndUpdate(
            { collectionId },
            { status, updatedAt: Date.now() },
            { new: true }
        );

        if (!collection) {
            return res.status(404).json({ msg: 'Collection not found' });
        }

        res.json({ msg: 'Status updated', collection });
    } catch (err) {
        console.error('Update collection status error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ========================================
// 3. INVENTORY MANAGEMENT
// ========================================

// Helper: Add item to inventory
async function addToInventory(contributorId, item, collectionId) {
    const { category, itemName, quantity, unit, condition, expiryDate } = item;

    // Check if item already exists in inventory
    let inventory = await Inventory.findOne({ contributorId, itemName });

    if (inventory) {
        // Update existing inventory
        inventory.currentQuantity += quantity;
        inventory.sourceCollectionIds.push(collectionId);
        inventory.lastRestocked = Date.now();
        inventory.updatedAt = Date.now();
        
        // Update alerts
        inventory.isLowStock = inventory.currentQuantity < inventory.minimumThreshold;
        
        await inventory.save();
    } else {
        // Create new inventory entry
        const inventoryId = await generateInventoryId();
        
        inventory = await Inventory.create({
            inventoryId,
            contributorId,
            category,
            itemName,
            currentQuantity: quantity,
            unit,
            condition,
            expiryDate,
            sourceCollectionIds: [collectionId],
            isLowStock: quantity < 10
        });
    }

    return inventory;
}

// Get inventory for a contributor
router.get('/inventory/:contributorId', async (req, res) => {
    try {
        const { contributorId } = req.params;
        const inventory = await Inventory.find({ contributorId }).sort({ category: 1 });
        
        // Calculate totals by category
        const summary = inventory.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = 0;
            acc[item.category] += item.currentQuantity;
            return acc;
        }, {});

        res.json({ 
            inventory, 
            count: inventory.length,
            summary,
            alerts: {
                lowStock: inventory.filter(i => i.isLowStock).length,
                expiringSoon: inventory.filter(i => i.isExpiringSoon).length
            }
        });
    } catch (err) {
        console.error('Get inventory error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Update inventory manually (adjust quantity, set alerts, etc.)
router.put('/inventory/:inventoryId', async (req, res) => {
    try {
        const { inventoryId } = req.params;
        const { currentQuantity, minimumThreshold, condition, expiryDate, storageLocation } = req.body;

        const updates = { updatedAt: Date.now() };
        if (currentQuantity !== undefined) updates.currentQuantity = currentQuantity;
        if (minimumThreshold !== undefined) updates.minimumThreshold = minimumThreshold;
        if (condition) updates.condition = condition;
        if (expiryDate) updates.expiryDate = expiryDate;
        if (storageLocation) updates.storageLocation = storageLocation;

        const inventory = await Inventory.findOneAndUpdate(
            { inventoryId },
            updates,
            { new: true }
        );

        if (!inventory) {
            return res.status(404).json({ msg: 'Inventory item not found' });
        }

        // Update alerts
        inventory.isLowStock = inventory.currentQuantity < inventory.minimumThreshold;
        await inventory.save();

        res.json({ msg: 'Inventory updated', inventory });
    } catch (err) {
        console.error('Update inventory error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ========================================
// 4. DISTRIBUTION MANAGEMENT
// ========================================

// Log a distribution
router.post('/distribution', async (req, res) => {
    try {
        const {
            contributorId,
            items,
            recipientType,
            recipientId,
            recipientName,
            recipientPhone,
            recipientAddress,
            recipientLocation,
            distributionDate,
            deliveryMethod,
            deliveryProof,
            familiesBenefited,
            individualsBenefited,
            fulfilledNeedId,
            notes
        } = req.body;

        if (!contributorId || !items || items.length === 0) {
            return res.status(400).json({ msg: 'Missing required fields' });
        }

        const distributionId = await generateDistributionId();

        // Validate and deduct from inventory
        for (const item of items) {
            const inventory = await Inventory.findOne({ 
                inventoryId: item.inventoryId 
            });

            if (!inventory) {
                return res.status(400).json({ 
                    msg: `Inventory item ${item.inventoryId} not found` 
                });
            }

            if (inventory.currentQuantity < item.quantityDistributed) {
                return res.status(400).json({ 
                    msg: `Insufficient stock for ${inventory.itemName}. Available: ${inventory.currentQuantity}, Requested: ${item.quantityDistributed}` 
                });
            }

            // Deduct from inventory
            inventory.currentQuantity -= item.quantityDistributed;
            inventory.isLowStock = inventory.currentQuantity < inventory.minimumThreshold;
            inventory.updatedAt = Date.now();
            await inventory.save();
        }

        const distribution = await Distribution.create({
            distributionId,
            contributorId,
            items,
            recipientType,
            recipientId,
            recipientName,
            recipientPhone,
            recipientAddress,
            recipientLocation,
            distributionDate: distributionDate || Date.now(),
            deliveryMethod,
            deliveryProof,
            familiesBenefited,
            individualsBenefited,
            fulfilledNeedId,
            notes
        });

        // Update contributor's total distributions
        await Contributor.findOneAndUpdate(
            { contributorId },
            { 
                $inc: { totalDistributions: 1 },
                lastActive: Date.now()
            }
        );

        res.json({ 
            msg: 'Distribution logged successfully', 
            distributionId,
            distribution 
        });
    } catch (err) {
        console.error('Log distribution error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Get all distributions for a contributor
router.get('/distribution/:contributorId', async (req, res) => {
    try {
        const { contributorId } = req.params;
        const distributions = await Distribution.find({ contributorId }).sort({ distributionDate: -1 });
        
        res.json({ distributions, count: distributions.length });
    } catch (err) {
        console.error('Get distributions error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Update distribution status
router.put('/distribution/:distributionId/status', async (req, res) => {
    try {
        const { distributionId } = req.params;
        const { status, recipientConfirmation } = req.body;

        const updates = { updatedAt: Date.now() };
        if (status) updates.status = status;
        if (recipientConfirmation !== undefined) updates.recipientConfirmation = recipientConfirmation;

        const distribution = await Distribution.findOneAndUpdate(
            { distributionId },
            updates,
            { new: true }
        );

        if (!distribution) {
            return res.status(404).json({ msg: 'Distribution not found' });
        }

        res.json({ msg: 'Distribution status updated', distribution });
    } catch (err) {
        console.error('Update distribution status error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ========================================
// 5. ANALYTICS & STATS
// ========================================

// Get contributor dashboard stats
router.get('/stats/:contributorId', async (req, res) => {
    try {
        const { contributorId } = req.params;

        const contributor = await Contributor.findOne({ contributorId });
        if (!contributor) {
            return res.status(404).json({ msg: 'Contributor not found' });
        }

        const collections = await Collection.find({ contributorId });
        const inventory = await Inventory.find({ contributorId });
        const distributions = await Distribution.find({ contributorId });

        // Calculate totals
        const totalItemsCollected = collections.reduce((sum, c) => 
            sum + c.items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0), 0
        );

        const totalItemsInStock = inventory.reduce((sum, i) => 
            sum + i.currentQuantity, 0
        );

        const totalItemsDistributed = distributions.reduce((sum, d) => 
            sum + d.items.reduce((itemSum, item) => itemSum + (item.quantityDistributed || 0), 0), 0
        );

        const totalFamiliesBenefited = distributions.reduce((sum, d) => 
            sum + (d.familiesBenefited || 0), 0
        );

        res.json({
            contributor: {
                name: contributor.name,
                contributorId: contributor.contributorId,
                verificationStatus: contributor.verificationStatus,
                totalCollections: contributor.totalCollections,
                totalDistributions: contributor.totalDistributions
            },
            stats: {
                totalItemsCollected,
                totalItemsInStock,
                totalItemsDistributed,
                totalFamiliesBenefited,
                collectionsCount: collections.length,
                inventoryItemsCount: inventory.length,
                distributionsCount: distributions.length,
                lowStockAlerts: inventory.filter(i => i.isLowStock).length,
                expiringSoonAlerts: inventory.filter(i => i.isExpiringSoon).length
            }
        });
    } catch (err) {
        console.error('Get stats error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
