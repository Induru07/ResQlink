const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const SystemLog = require('../models/SystemLog');
const SecurityLog = require('../models/SecurityLog');
const VictimAuth = require('../models/VictimAuth');
const Contributor = require('../models/Contributor');
const VictimNeeds = require('../models/VictimNeeds');
const os = require('os');

// Import JWT Middleware
const { verifyToken, verifyAdmin: verifyAdminRole } = require('../middleware/authMiddleware');
const { validateEmailMiddleware } = require('../middleware/validationMiddleware');

// Developer-only middleware
const verifyDeveloper = (req, res, next) => {
    if (req.user.role !== 'DEV') {
        return res.status(403).json({ error: 'Developer access required' });
    }
    next();
};

// ============ AUTHENTICATION ============

// Admin Login
router.post('/login', validateEmailMiddleware, async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        // Find admin by email
        const admin = await Admin.findOne({ email });
        
        if (!admin) {
            // Log failed attempt
            await SecurityLog.create({
                eventType: 'failed_login',
                ipAddress: req.ip,
                userEmail: email,
                severity: 'medium',
                details: 'Admin not found'
            });
            
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Verify password
        const isMatch = await bcrypt.compare(password, admin.password);
        
        if (!isMatch) {
            // Increment failed attempts
            admin.loginAttempts += 1;
            await admin.save();
            
            await SecurityLog.create({
                eventType: 'failed_login',
                ipAddress: req.ip,
                userId: admin._id,
                userEmail: email,
                attemptCount: admin.loginAttempts,
                severity: admin.loginAttempts > 3 ? 'high' : 'medium',
                details: 'Incorrect password'
            });
            
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Check if role matches
        if (admin.role !== role) {
            return res.status(403).json({ error: 'Role mismatch' });
        }
        
        // Check admin status
        if (admin.status !== 'active') {
            return res.status(403).json({ error: `Account is ${admin.status}` });
        }
        
        // Successful login
        admin.lastLogin = new Date();
        admin.lastLoginIp = req.ip;
        admin.loginAttempts = 0;
        await admin.save();
        
        await SecurityLog.create({
            eventType: 'successful_login',
            ipAddress: req.ip,
            userId: admin._id,
            userEmail: email,
            severity: 'low',
            details: `${admin.role} admin logged in`
        });
        
        await SystemLog.create({
            level: 'info',
            message: `Admin login: ${admin.name} (${admin.role})`,
            source: 'AuthController',
            statusCode: 200,
            ipAddress: req.ip,
            userId: admin._id
        });
        
        // Generate JWT token (7 days expiration)
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { 
                userId: admin._id, 
                role: admin.role,
                email: admin.email 
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            token,
            admin: {
                id: admin._id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
                district: admin.district,
                dsDivision: admin.dsDivision,
                gnDivisionCode: admin.gnDivisionCode
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin Registration (Request Access)
router.post('/register', validateEmailMiddleware, async (req, res) => {
    try {
        const { email, password, name, role, district, dsDivision, gnDivisionCode } = req.body;
        
        // Validate password (at least 6 characters with letters and numbers)
        if (!password || password.length < 6 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
            return res.status(400).json({ error: 'Password must be at least 6 characters with letters and numbers' });
        }
        
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Admin already exists' });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create new admin (pending verification)
        const admin = new Admin({
            email,
            password: hashedPassword,
            name,
            role,
            district,
            dsDivision,
            gnDivisionCode,
            status: 'inactive', // Requires approval
            verified: false
        });
        
        await admin.save();
        
        // Generate JWT token (7 days expiration)
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { 
                userId: admin._id, 
                role: admin.role,
                email: admin.email 
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        await SystemLog.create({
            level: 'info',
            message: `New admin registration request: ${name} (${role})`,
            source: 'AuthController',
            statusCode: 201,
            ipAddress: req.ip,
            userId: admin._id
        });
        
        res.status(201).json({
            success: true,
            token,
            message: 'Registration request submitted. Awaiting approval.',
            admin: {
                id: admin._id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
                district: admin.district
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============ SYSTEM HEALTH & MONITORING ============

// Get System Health (CPU, Memory, etc.)
router.post('/system/health', verifyToken, verifyAdminRole, async (req, res) => {
    try {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        
        const cpus = os.cpus();
        let totalIdle = 0;
        let totalTick = 0;
        
        cpus.forEach(cpu => {
            for (let type in cpu.times) {
                totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
        });
        
        const cpuUsage = 100 - ~~(100 * totalIdle / totalTick);
        
        const uptime = os.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        
        res.json({
            cpu: {
                usage: cpuUsage,
                cores: cpus.length
            },
            memory: {
                total: (totalMem / 1024 / 1024 / 1024).toFixed(2) + ' GB',
                used: (usedMem / 1024 / 1024 / 1024).toFixed(2) + ' GB',
                free: (freeMem / 1024 / 1024 / 1024).toFixed(2) + ' GB',
                usagePercent: ((usedMem / totalMem) * 100).toFixed(2)
            },
            uptime: {
                days,
                hours,
                formatted: `${days}d ${hours}h`
            },
            platform: os.platform(),
            hostname: os.hostname()
        });
        
    } catch (error) {
        console.error('System health error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Live System Logs
router.post('/system/logs', verifyToken, verifyAdminRole, async (req, res) => {
    try {
        const { limit = 50, level } = req.query;
        
        const query = level ? { level } : {};
        
        const logs = await SystemLog.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit));
        
        res.json({ logs });
        
    } catch (error) {
        console.error('System logs error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============ USER MANAGEMENT ============

// Get All Users (Admins, Victims, Contributors)
router.post('/users', verifyToken, verifyAdminRole, async (req, res) => {
    try {
        const { role, status, limit = 100 } = req.query;
        
        let users = [];
        
        // Only DEV role can access admin data
        if (!role || role === 'admin') {
            if (req.admin.role === 'DEV') {
                const admins = await Admin.find(status ? { status } : {})
                    .select('-password')
                    .limit(parseInt(limit))
                    .sort({ lastLogin: -1 });
                
                users.push(...admins.map(a => ({
                    ...a.toObject(),
                    userType: 'admin',
                    userId: 'adm_' + a._id.toString().slice(-4)
                })));
            }
        }
        
        // All admin roles can access victim data (GN, DS, GOV, DEV)
        if (!role || role === 'victim') {
            const victims = await Victim.find({})
                .limit(parseInt(limit))
                .sort({ createdAt: -1 });
            
            users.push(...victims.map(v => ({
                ...v.toObject(),
                userType: 'victim',
                userId: 'vic_' + v._id.toString().slice(-4),
                status: v.status || 'active'
            })));
        }
        
        // All admin roles can access contributor data
        if (!role || role === 'contributor') {
            const contributors = await Contributor.find({})
                .limit(parseInt(limit))
                .sort({ createdAt: -1 });
            
            users.push(...contributors.map(c => ({
                ...c.toObject(),
                userType: 'contributor',
                userId: 'con_' + c._id.toString().slice(-4),
                status: c.status || 'active'
            })));
        }
        
        res.json({ users });
        
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update User Status (Ban, Activate, Flag)
router.put('/users/:id/status', verifyToken, verifyAdminRole, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, userType } = req.body;
        
        let user;
        
        // Only DEV can update admin status
        if (userType === 'admin') {
            if (req.user.role !== 'DEV') {
                return res.status(403).json({ error: 'Developer access required to modify admin accounts' });
            }
            user = await Admin.findByIdAndUpdate(id, { status }, { new: true });
        } else if (userType === 'victim') {
            // GN, DS, GOV, and DEV can update victim status
            user = await Victim.findByIdAndUpdate(id, { status }, { new: true });
        } else if (userType === 'contributor') {
            // All roles can update contributor status
            user = await Contributor.findByIdAndUpdate(id, { status }, { new: true });
        }
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        await SystemLog.create({
            level: 'warning',
            message: `User status updated: ${id} -> ${status}`,
            source: 'UserManagement',
            statusCode: 200,
            userId: req.user.userId,
            metadata: { targetUser: id, newStatus: status, userType }
        });
        
        res.json({ success: true, user });
        
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============ SECURITY MONITORING ============

// Get Security Logs
router.post('/security/logs', verifyToken, verifyAdminRole, verifyDeveloper, async (req, res) => {
    try {
        const { hours = 1, eventType } = req.query;
        
        const timeLimit = new Date(Date.now() - hours * 60 * 60 * 1000);
        
        const query = { timestamp: { $gte: timeLimit } };
        if (eventType) query.eventType = eventType;
        
        const logs = await SecurityLog.find(query)
            .sort({ timestamp: -1 })
            .limit(100);
        
        res.json({ logs });
        
    } catch (error) {
        console.error('Security logs error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Failed Login Attempts Summary
router.post('/security/failed-logins', verifyToken, verifyAdminRole, verifyDeveloper, async (req, res) => {
    try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        const failedAttempts = await SecurityLog.aggregate([
            {
                $match: {
                    eventType: 'failed_login',
                    timestamp: { $gte: oneHourAgo }
                }
            },
            {
                $group: {
                    _id: '$ipAddress',
                    count: { $sum: 1 },
                    lastAttempt: { $max: '$timestamp' }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 20
            }
        ]);
        
        res.json({ failedAttempts });
        
    } catch (error) {
        console.error('Failed logins error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Block IP Address
router.post('/security/block-ip', verifyToken, verifyAdminRole, verifyDeveloper, async (req, res) => {
    try {
        const { ipAddress } = req.body;
        
        await SecurityLog.create({
            eventType: 'blocked_ip',
            ipAddress,
            blocked: true,
            severity: 'high',
            details: `IP blocked by admin: ${req.user.email}`,
            metadata: { blockedBy: req.user.userId }
        });
        
        // In production, add to firewall/IP blacklist
        
        res.json({ success: true, message: 'IP blocked successfully' });
        
    } catch (error) {
        console.error('Block IP error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============ DATABASE OPERATIONS ============

// Get Database Stats
router.post('/database/stats', verifyToken, verifyAdminRole, async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const db = mongoose.connection.db;
        
        const collections = await db.listCollections().toArray();
        const stats = [];
        
        for (const collection of collections) {
            try {
                // Use aggregation to get collection stats
                const collectionObj = db.collection(collection.name);
                const statsResult = await collectionObj.aggregate([
                    { $collStats: { latencyHistograms: false } }
                ]).toArray();
                
                // Count documents
                const count = await collectionObj.countDocuments();
                
                // Calculate approximate size (fallback method)
                const stats_obj = statsResult.length > 0 ? statsResult[0] : {};
                const size = stats_obj.size || 0;
                const avgObjSize = count > 0 ? (size / count) : 0;
                
                stats.push({
                    name: collection.name,
                    count: count,
                    size: (size / 1024 / 1024).toFixed(2) + ' MB',
                    avgObjSize: (avgObjSize / 1024).toFixed(2) + ' KB'
                });
            } catch (collError) {
                // Fallback for collections that don't support collStats
                const collectionObj = db.collection(collection.name);
                const count = await collectionObj.countDocuments();
                stats.push({
                    name: collection.name,
                    count: count,
                    size: 'N/A',
                    avgObjSize: 'N/A'
                });
            }
        }
        
        res.json({ collections: stats });
        
    } catch (error) {
        console.error('Database stats error:', error);
        res.status(500).json({ error: 'Failed to retrieve database statistics' });
    }
});

module.exports = router;
