const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // Tool to hide passwords
const jwt = require('jsonwebtoken'); // Tool to keep users logged in

// Import the 3 Models
const Victim = require('../models/Victim');
const Supplier = require('../models/Supplier');
const Admin = require('../models/Admin');

// =======================
// 1. VICTIM ROUTES
// =======================

// Register Victim
router.post('/victim/register', async (req, res) => {
    try {
        const { name, email, password, phone, district } = req.body;
        
        // Check if email already exists
        const existing = await Victim.findOne({ email });
        if (existing) return res.status(400).json({ msg: "Email already used" });

        // Hash the password (Security)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save to Database
        const newVictim = new Victim({
            fullName: name, email, password: hashedPassword, phone, district
        });
        await newVictim.save();

        res.json({ msg: "Victim Account Created Successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login Victim (Debug Version)
router.post('/victim/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log("--------------------------------");
        console.log("LOGIN ATTEMPT FOR:", email);
        console.log("PASSWORD SENT:", password);

        // 1. Check if user exists
        const user = await Victim.findOne({ email });
        
        if (!user) {
            console.log("❌ ERROR: User not found in 'victims' collection");
            return res.status(400).json({ msg: "User email not found" });
        }
        console.log("✅ User found in DB:", user.name);
        console.log("Stored Hashed Password:", user.password);

        // 2. Check Password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.log("❌ ERROR: Password did not match the hash");
            return res.status(400).json({ msg: "Wrong password" });
        }
        
        console.log("✅ SUCCESS: Password Matched!");

        // 3. Send Token
        const token = jwt.sign({ id: user._id, role: 'victim' }, process.env.JWT_SECRET);
        res.json({ token, user: { id: user._id, name: user.name, role: 'victim' } });

    } catch (err) {
        console.error("SERVER ERROR:", err.message);
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