const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const Admin = require('../models/Admin');

async function createGN() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('Missing MONGO_URI in environment/.env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Default GN admin details
    const adminData = {
      email: 'gn.kaduwela@resqlink.lk',
      password: 'gn12345',
      name: 'GN Officer Kaduwela',
      role: 'GN',
      district: 'Colombo',
      dsDivision: 'Kaduwela',
      gnDivisionCode: '374-B',
      status: 'active',
      verified: true,
    };

    // Allow simple overrides via CLI args: --email --password --name --district --ds --gn
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
        case '--gn': adminData.gnDivisionCode = val; i++; break;
        default: break;
      }
    }

    const existing = await Admin.findOne({ email: adminData.email });
    if (existing) {
      console.log('Admin with this email already exists:', adminData.email);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    const admin = new Admin({
      email: adminData.email,
      password: hashedPassword,
      name: adminData.name,
      role: adminData.role,
      district: adminData.district,
      dsDivision: adminData.dsDivision,
      gnDivisionCode: adminData.gnDivisionCode,
      status: 'active',
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await admin.save();

    console.log('✅ GN Admin created successfully!');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('Role:', adminData.role);
    console.log('District:', adminData.district);
    console.log('DS Division:', adminData.dsDivision);
    console.log('GN Code:', adminData.gnDivisionCode);
    console.log('\n⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating GN admin:', error);
    process.exit(1);
  }
}

createGN();
