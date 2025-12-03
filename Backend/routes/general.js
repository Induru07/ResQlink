// routes/general.js
const express = require('express');
const router = express.Router();

// @route   GET /api/general/dashboard-stats
// @desc    Send data for the Home Page / Dashboard
router.get('/dashboard-stats', (req, res) => {
    // This is the data your frontend friends will grab to display on the Home Page
    const mockData = {
        totalFlooded: 150,
        activeVolunteers: 25,
        urgentRequests: 12
    };
    
    res.json(mockData);
});

module.exports = router;