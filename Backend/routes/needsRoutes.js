const express = require('express');
const router = express.Router();
const VictimNeeds = require('../models/VictimNeeds');

// Create or update needs for a victim
router.post('/', async (req, res) => {
    try {
        const { victimId, items = {}, description } = req.body;
        if (!victimId) return res.status(400).json({ msg: 'victimId is required' });

        const existing = await VictimNeeds.findOne({ victimId });
        if (existing) {
            existing.items = { ...existing.items, ...items };
            if (description !== undefined) existing.description = description;
            await existing.save();
            return res.json({ msg: 'Needs updated', needs: existing });
        }

        const created = await VictimNeeds.create({ victimId, items, description });
        return res.json({ msg: 'Needs created', needs: created });
    } catch (err) {
        console.error('Needs error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Get needs by victimId
router.get('/:victimId', async (req, res) => {
    try {
        const { victimId } = req.params;
        const needs = await VictimNeeds.findOne({ victimId });
        if (!needs) return res.status(404).json({ msg: 'No needs found for this victim' });
        res.json(needs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
