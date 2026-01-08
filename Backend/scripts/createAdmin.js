const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const Admin = require('../models/Admin');

async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        // Admin details - CHANGE THESE!
        const adminData = {
            email: 'developer@resqlink.lk',
            password: 'admin123',  // CHANGE THIS PASSWORD!
            name: 'Developer Admin',
            role: 'DEV'
        };
        
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log('Admin with this email already exists!');
            process.exit(0);
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminData.password, salt);
        
        // Create admin
        const admin = new Admin({
            email: adminData.email,
            password: hashedPassword,
            name: adminData.name,
            role: adminData.role,
            status: 'active',
            verified: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        await admin.save();
        
        console.log('✅ Admin created successfully!');
        console.log('Email:', adminData.email);
        console.log('Password:', adminData.password);
        console.log('Role:', adminData.role);
        console.log('\n⚠️  Please change the password after first login!');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();
