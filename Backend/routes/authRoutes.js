const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Import Middleware
const { verifyToken, verifyVictim, verifyAdmin, verifySupplier } = require('../middleware/authMiddleware');
const { validateEmailMiddleware, validatePhoneMiddleware } = require('../middleware/validationMiddleware');

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
router.post('/victim/register', validateEmailMiddleware, validatePhoneMiddleware, async (req, res) => {
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
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if email already exists in auth collection
        const existing = await VictimAuth.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already registered' });

        const victimId = await generateVictimId(district);
        if (!victimId) return res.status(400).json({ error: 'Unable to generate victimId' });

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

        return res.json({ 
            msg: 'Victim account created successfully', 
            victimId, 
            authId: authRecord._id 
        });
    } catch (err) {
        console.error('Register victim error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Login Victim using VictimAuth
router.post('/victim/login', validateEmailMiddleware, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const user = await VictimAuth.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user._id, victimId: user.victimId, role: 'victim' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ 
            token, 
            user: { 
                id: user._id, 
                victimId: user.victimId, 
                name: user.fullName, 
                email: user.email,
                district: user.district,
                role: 'victim' 
            } 
        });
    } catch (err) {
        console.error('Login victim error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Get full victim profile (auth + profile + needs) by victimId - PROTECTED
router.get('/victim/profile/:victimId', verifyToken, verifyVictim, async (req, res) => {
    try {
        const { victimId } = req.params;

        // Verify ownership
        if (req.user.victimId !== victimId) {
            return res.status(403).json({ error: 'You can only access your own profile' });
        }

        if (!victimId) return res.status(400).json({ error: 'victimId is required' });

        const auth = await VictimAuth.findOne({ victimId }).select('-password');
        if (!auth) return res.status(404).json({ error: 'Victim not found' });

        const profile = await VictimProfile.findOne({ victimId });
        const needs = await VictimNeeds.findOne({ victimId });

        res.json({ auth, profile, needs });
    } catch (err) {
        console.error('Fetch victim profile error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Update victim profile - PROTECTED
router.put('/victim/profile/:victimId', verifyToken, verifyVictim, validatePhoneMiddleware, async (req, res) => {
    try {
        const { victimId } = req.params;

        // Verify ownership
        if (req.user.victimId !== victimId) {
            return res.status(403).json({ error: 'You can only update your own profile' });
        }

        const { phone, address, familyMembers, location, nationalID } = req.body;

        const profile = await VictimProfile.findOneAndUpdate(
            { victimId },
            { phone, address, familyMembers, location, nationalID, updatedAt: Date.now() },
            { new: true }
        );

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json({ msg: 'Profile updated successfully', profile });
    } catch (err) {
        console.error('Update victim profile error:', err.message);
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
router.post('/supplier/register', validateEmailMiddleware, validatePhoneMiddleware, async (req, res) => {
    try {
        const { organizationName, email, password, phone } = req.body;

        if (!organizationName || !email || !password || !phone) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        
        const existing = await Supplier.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already registered' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newSupplier = new Supplier({
            fullName: organizationName, 
            email, 
            password: hashedPassword, 
            phone
        });
        await newSupplier.save();

        res.json({ msg: 'Supplier account created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login Supplier
router.post('/supplier/login', validateEmailMiddleware, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        
        const user = await Supplier.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user._id, role: 'supplier' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.fullName, 
                email: user.email,
                role: 'supplier' 
            } 
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =======================
// 3. ADMIN ROUTES
// =======================

// Admin Register (Usually you create the first admin manually, but here is the route)
router.post('/admin/register', validateEmailMiddleware, async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const existing = await Admin.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already registered' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newAdmin = new Admin({ name, email, password: hashedPassword });
        await newAdmin.save();

        res.json({ msg: 'Admin account created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Login
router.post('/admin/login', validateEmailMiddleware, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const user = await Admin.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email,
                role: 'admin' 
            } 
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;