const express = require('express');
const router = express.Router();
const Victim = require('../models/Victim'); // Keeping for legacy check
const VictimAuth = require('../models/VictimAuth'); // New Auth Model
const VictimNeeds = require('../models/VictimNeeds'); // New Needs Model
const Supplier = require('../models/Supplier');
const Admin = require('../models/Admin');
const Contributor = require('../models/Contributor');
const CollectionPoint = require('../models/CollectionPoint');
const Distribution = require('../models/Distribution');

// @route   GET /api/home/stats
// @desc    Public data for the Home Page
router.get('/stats', async (req, res) => {
    try {
        // 1. Count total victims (Using new Auth model)
        const victimAuthCount = await VictimAuth.countDocuments();
        
        // 2. Count total suppliers registered
        const supplierCount = await Supplier.countDocuments();

        // 3. Count total admins
        const adminCount = await Admin.countDocuments();

        // 4. Count total contributors
        const contributorCount = await Contributor.countDocuments();

        // 5. Count total collection points
        const collectionPointsCount = await CollectionPoint.countDocuments();

        // 6. Count victims in danger (Active needs in new model)
        // We count needs that are NOT resolved.
        const victimsInDanger = await VictimNeeds.countDocuments({ status: { $ne: 'resolved' } });

        // 7. Count victims who had help (unique recipients in Distribution)
        const helpedVictimsList = await Distribution.distinct('recipientId', { recipientType: 'victim' });
        const victimsHelped = helpedVictimsList.length;

        // 8. Total Users
        const totalUsers = victimAuthCount + supplierCount + adminCount + contributorCount;

        // 9. Total Contributors (Contributors + Suppliers)
        const totalContributors = contributorCount + supplierCount;

        // 10. (Optional) Get recent needs to show in a ticker
        const recentNeeds = await VictimNeeds.find({ status: { $ne: 'resolved' } })
                                             .limit(5)
                                             .sort({ createdAt: -1 });

        res.json({
            message: "Welcome to ResQLink API",
            stats: {
                totalUsers,
                victimsInDanger,
                victimsHelped,
                totalVictims: victimAuthCount,
                totalContributors,
                totalCollectionPoints: collectionPointsCount,
                familiesAffected: victimAuthCount, 
                activeSuppliers: supplierCount, 
                districtsCovered: 5 
            },
            recentAlerts: recentNeeds
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error fetching stats" });
    }
});

module.exports = router;