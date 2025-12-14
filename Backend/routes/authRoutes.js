const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // Tool to hide passwords
const jwt = require('jsonwebtoken'); // Tool to keep users logged in

// Import the Models
const VictimAuth = require('../models/VictimAuth');
const VictimProfile = require('../models/VictimProfile');
const VictimNeeds = require('../models/VictimNeeds');
const Supplier = require('../models/Supplier');
const Admin = require('../models/Admin');

// =======================
// 1. VICTIM ROUTES
// =======================

// Helper: generate victimId based on district prefix (e.g., Matara -> MTR001)
const generateVictimId = async (district) => {
    if (!district || typeof district !== 'string') return null;
    const prefix = district.trim().slice(0, 3).toUpperCase();
    const count = await VictimAuth.countDocuments({ district: new RegExp(`^${district}$`, 'i') });
    const nextNumber = (count + 1).toString().padStart(3, '0');
    return `${prefix}${nextNumber}`;
};

// Register Victim -> creates VictimAuth + VictimProfile
router.post('/victim/register', async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            district,
            nationalID,
            address,
            familyMembers = [],
            location
        } = req.body;

        if (!name || !email || !password || !phone || !district) {
            return res.status(400).json({ msg: 'Missing required fields' });
        }

        // Check if email already exists in auth collection
        const existing = await VictimAuth.findOne({ email });
        if (existing) return res.status(400).json({ msg: 'Email already used' });

        const victimId = await generateVictimId(district);
        if (!victimId) return res.status(400).json({ msg: 'Unable to generate victimId' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const authRecord = await VictimAuth.create({
            victimId,
            fullName: name,
            email,
            password: hashedPassword,
            district
        });

        await VictimProfile.create({
            victimId,
            phone,
            nationalID,
            address,
            familyMembers,
            location
        });

        return res.json({ msg: 'Victim Account Created Successfully', victimId, authId: authRecord._id });
    } catch (err) {
        console.error('Register victim error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Login Victim using VictimAuth
router.post('/victim/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await VictimAuth.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'User email not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Wrong password' });

        const token = jwt.sign({ id: user._id, victimId: user.victimId, role: 'victim' }, process.env.JWT_SECRET);
        res.json({ token, user: { id: user._id, victimId: user.victimId, name: user.fullName, role: 'victim' } });
    } catch (err) {
        console.error('SERVER ERROR:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Get full victim profile (auth + profile + needs) by victimId
router.get('/victim/profile/:victimId', async (req, res) => {
    try {
        const { victimId } = req.params;
        if (!victimId) return res.status(400).json({ msg: 'victimId is required' });

        const auth = await VictimAuth.findOne({ victimId });
        if (!auth) return res.status(404).json({ msg: 'Victim not found' });

        const profile = await VictimProfile.findOne({ victimId });
        const needs = await VictimNeeds.findOne({ victimId });

        res.json({ auth, profile, needs });
    } catch (err) {
        console.error('Fetch victim profile error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Victim search (id/name/email), optional district filter
router.get('/victim/search', async (req, res) => {
    try {
        const { query, district } = req.query;
        const q = (query || '').trim();
        if (!q && !district) {
            return res.status(400).json({ msg: 'Provide query or district' });
        }

        const orConds = [];
        if (q) {
            orConds.push(
                { victimId: new RegExp(q, 'i') },
                { email: new RegExp(q, 'i') },
                { fullName: new RegExp(q, 'i') }
            );
        }

        const filter = {};
        if (orConds.length) filter.$or = orConds;
        if (district) filter.district = new RegExp(`^${district}$`, 'i');

        const victims = await VictimAuth.find(filter).limit(20).select('victimId fullName email district');
        res.json({ victims });
    } catch (err) {
        console.error('Victim search error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// =======================
// 2. SUPPLIER ROUTES
// =======================

// Register Supplier
router.post('/supplier/register', async (req, res) => {
    try {
        const { organizationName, email, password, phone } = req.body;
        
        const existing = await Supplier.findOne({ email });
        if (existing) return res.status(400).json({ msg: "Email already used" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newSupplier = new Supplier({
            fullName: organizationName, email, password: hashedPassword, phone
        });
        await newSupplier.save();

        res.json({ msg: "Supplier Account Created Successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login Supplier
router.post('/supplier/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await Supplier.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Supplier not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role: 'supplier' }, process.env.JWT_SECRET);
        res.json({ token, user: { id: user._id, name: user.fullName, role: 'supplier' } });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =======================
// 3. ADMIN ROUTES
// =======================

// Admin Register (Usually you create the first admin manually, but here is the route)
router.post('/admin/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({ name, email, password: hashedPassword });
        await newAdmin.save();
        res.json({ msg: "Admin Created" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Admin.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Admin not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role: 'admin' }, process.env.JWT_SECRET);
        res.json({ token, user: { id: user._id, name: user.name, role: 'admin' } });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;