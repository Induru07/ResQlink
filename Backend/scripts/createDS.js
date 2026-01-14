const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const Admin = require('../models/Admin');

async function createDS() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('Missing MONGO_URI in environment/.env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Default DS admin details
    const adminData = {
      email: 'ds.kaduwela@resqlink.lk',
      password: 'ds12345',
      name: 'DS Officer Kaduwela',
      role: 'DS',
      district: 'Colombo',
      dsDivision: 'Kaduwela',
      status: 'active',
      verified: true,
    };

    // Allow simple overrides via CLI args: --email --password --name --district --ds
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
      const key = args[i];
      const val = args[i + 1];
      if (!val || val.startsWith('--')) continue;
      switch (key) {
        case '--email': adminData.email = val; i++; break;
        case '--password': adminData.password = val; i++; break;
        case '--name': adminData.name = val; i++; break;
        case '--district': adminData.district = val; i++; break;
        case '--ds': adminData.dsDivision = val; i++; break;
        default: break;
      }
    }

    const existing = await Admin.findOne({ email: adminData.email });
    if (existing) {
      console.log('Admin with this email already exists:', adminData.email);
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Create new DS admin
    const admin = new Admin({
      email: adminData.email,
      password: hashedPassword,
      name: adminData.name,
      role: adminData.role,
      district: adminData.district,
      dsDivision: adminData.dsDivision,
      status: adminData.status,
      verified: adminData.verified,
    });

    await admin.save();

    console.log('\n✅ DS Admin Created Successfully!');
    console.log('===================================');
    console.log(`Email:       ${adminData.email}`);
    console.log(`Password:    ${adminData.password}`);
    console.log(`Name:        ${adminData.name}`);
    console.log(`Role:        ${adminData.role}`);
    console.log(`District:    ${adminData.district}`);
    console.log(`DS Division: ${adminData.dsDivision}`);
    console.log(`Status:      ${adminData.status}`);
    console.log(`Verified:    ${adminData.verified}`);
    console.log('===================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error creating DS admin:', error);
    process.exit(1);
  }
}

createDS();
