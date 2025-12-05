const express = require('express');
const router = express.Router();
const Victim = require('../models/Victim');

// @route   GET /api/map/data
// @desc    Send all victim locations to the map
router.get('/data', async (req, res) => {
    try {
        // 1. Get all victims from MongoDB
        const victims = await Victim.find().select('name needs district phone');

        // 2. Format them for the Map (Leaflet.js)
        // NOTE: Since your Sign Up form doesn't capture GPS (Lat/Lng) yet,
        // we will use "Approximate" locations for the districts just to show it works.
        const districtCoords = {
            'Colombo': { lat: 6.9271, lng: 79.8612 },
            'Gampaha': { lat: 7.0840, lng: 79.9939 },
            'Kalutara': { lat: 6.5854, lng: 79.9607 },
            'Galle': { lat: 6.0535, lng: 80.2210 },
            'Matara': { lat: 5.9549, lng: 80.5550 },
            'Hambantota': { lat: 6.1429, lng: 81.1212 },
            'Kandy': { lat: 7.2906, lng: 80.6337 },
            'Matale': { lat: 7.4675, lng: 80.6234 },
            'Nuwara Eliya': { lat: 6.9497, lng: 80.7891 },
            'Jaffna': { lat: 9.6615, lng: 80.0255 },
            'Mannar': { lat: 8.9766, lng: 79.9043 },
            'Vavuniya': { lat: 8.7542, lng: 80.4982 },
            'Mullaitivu': { lat: 9.2671, lng: 80.8142 },
            'Kilinochchi': { lat: 9.3803, lng: 80.4150 },
            'Batticaloa': { lat: 7.7310, lng: 81.6747 },
            'Ampara': { lat: 7.2817, lng: 81.6747 },
            'Trincomalee': { lat: 8.5874, lng: 81.2152 },
            'Kurunegala': { lat: 7.4863, lng: 80.3647 },
            'Puttalam': { lat: 8.0408, lng: 79.8394 },
            'Anuradhapura': { lat: 8.3114, lng: 80.4037 },
            'Polonnaruwa': { lat: 7.9403, lng: 81.0188 },
            'Badulla': { lat: 6.9934, lng: 81.0550 },
            'Monaragala': { lat: 6.8714, lng: 81.3487 },
            'Ratnapura': { lat: 6.6828, lng: 80.3992 },
            'Kegalle': { lat: 7.2513, lng: 80.3464 },
            'Western': { lat: 6.9271, lng: 79.8612 }//fallback bro
        };

        const mapData = victims.map(v => {
            const coords = districtCoords[v.district] || { lat: 7.8731, lng: 80.7718 }; // Default to center if unknown
            
            // Add a small random offset so dots don't stack exactly on top of each other
            const offsetLat = (Math.random() - 0.5) * 0.05;
            const offsetLng = (Math.random() - 0.5) * 0.05;

            return {
                lat: coords.lat + offsetLat,
                lng: coords.lng + offsetLng,
                people: v.familyCount || 1, // Default to 1 if missing
                needs: Object.keys(v.needs || {}).filter(k => v.needs[k]).join(', ') || "Help Needed",
                name: v.name,
                phone: v.phone
            };
        });

        res.json({ victims: mapData });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;