// routes/auth.js
const express = require('express');
const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user (Sign In page)
router.post('/register', (req, res) => {
    // 1. Get name, email, password from the frontend
    const { name, email, password, role } = req.body; 
    
    // TODO: Logic to save user to MongoDB goes here later
    
    res.json({ msg: "User registered successfully (Placeholder)" });
});

// @route   POST /api/auth/login
// @desc    Authenticate user (Login page)
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    // TODO: Logic to check password goes here later
    
    res.json({ msg: "User logged in successfully (Placeholder)" });
});

module.exports = router;