const express = require('express');
const router = express.Router();
const Victim = require('../models/Victim');
const Supplier = require('../models/supplier');
const Admin = require('../models/admin');

// @route   GET /api/home/stats
// @desc    Public data for the Home Page
router.get('/stats', async (req, res) => {
    try {
        // 1. Count total victims registered
        const victimCount = await Victim.countDocuments();
        
        // 2. Count total suppliers registered
        const supplierCount = await Supplier.countDocuments();

        // 3. (Optional) Get recent needs to show in a ticker
        const recentVictims = await Victim.find().select('district needs').limit(5).sort({ createdAt: -1 });

        res.json({
            message: "Welcome to ResQLink API",
            stats: {
                familiesAffected: victimCount,
                activeSuppliers: supplierCount,
                districtsCovered: 5 // You can calculate this dynamically later
            },
            recentAlerts: recentVictims
        });
    } catch (err) {
        res.status(500).json({ error: "Server Error fetching stats" });
    }
});

module.exports = router;