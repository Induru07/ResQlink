const express = require('express');
const router = express.Router();
const VictimNeeds = require('../models/VictimNeeds');

// Create or update needs for a victim
router.post('/', async (req, res) => {
    try {
        const { victimId, items = {}, specialConditions = {}, description, isEmergency, emergencyReason } = req.body;
        if (!victimId) return res.status(400).json({ msg: 'victimId is required' });

        // Auto-calculate urgency based on items and conditions
        let urgency = 'moderate';
        
        // Critical if has special conditions or critical items
        if (specialConditions.hasDisability || specialConditions.isPregnant || 
            specialConditions.isElderly || specialConditions.hasInfant || 
            specialConditions.hasChronicIllness ||
            items.shelter || items.medicine || items.medicalSupport) {
            urgency = 'critical';
        } 
        // High if needs food/water
        else if (items.dryRations || items.cookedFood || items.water) {
            urgency = 'high';
        }

        const existing = await VictimNeeds.findOne({ victimId });
        if (existing) {
            existing.items = { ...existing.items, ...items };
            existing.specialConditions = { ...existing.specialConditions, ...specialConditions };
            if (description !== undefined) existing.description = description;
            existing.urgency = urgency;
            existing.isEmergency = isEmergency || false;
            if (emergencyReason) existing.emergencyReason = emergencyReason;
            existing.lastUpdated = Date.now();
            await existing.save();
            return res.json({ msg: 'Needs updated', needs: existing });
        }

        const created = await VictimNeeds.create({ 
            victimId, 
            items, 
            specialConditions,
            description,
            urgency,
            isEmergency: isEmergency || false,
            emergencyReason
        });
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

// Update status (admin only - should add auth middleware)
router.put('/:victimId/status', async (req, res) => {
    try {
        const { victimId } = req.params;
        const { status, respondedBy, responseNotes } = req.body;

        if (!['pending', 'in-progress', 'resolved'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        const needs = await VictimNeeds.findOne({ victimId });
        if (!needs) return res.status(404).json({ msg: 'Needs not found' });

        needs.status = status;
        if (respondedBy) needs.respondedBy = respondedBy;
        if (responseNotes) needs.responseNotes = responseNotes;
        if (status !== 'pending') needs.responseDate = Date.now();
        needs.lastUpdated = Date.now();

        await needs.save();
        res.json({ msg: 'Status updated', needs });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Emergency SOS trigger
router.post('/:victimId/emergency', async (req, res) => {
    try {
        const { victimId } = req.params;
        const { emergencyReason } = req.body;

        const needs = await VictimNeeds.findOne({ victimId });
        if (!needs) {
            return res.status(404).json({ msg: 'Needs not found. Please create a needs request first.' });
        }

        needs.isEmergency = true;
        needs.emergencyReason = emergencyReason || 'Emergency SOS triggered';
        needs.urgency = 'critical';
        needs.lastUpdated = Date.now();

        await needs.save();

        // TODO: Send SMS/notification to admin
        res.json({ msg: 'Emergency alert sent', needs });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all needs (for admin dashboard)
router.get('/', async (req, res) => {
    try {
        const { urgency, status } = req.query;
        const filter = {};
        if (urgency) filter.urgency = urgency;
        if (status) filter.status = status;

        const needs = await VictimNeeds.find(filter).sort({ urgency: -1, requestDate: -1 });
        res.json(needs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
