# Developer Panel Backend Integration - Setup Guide

## Overview
This document describes the backend integration for the Developer Panel (Devpanel) and other admin hierarchies in ResQLink.

## What Was Created

### 1. New Database Models

#### SystemLog Model (`Backend/models/SystemLog.js`)
Stores all system activity logs including API requests, errors, and system events.

**Fields:**
- `timestamp`: Date of the log entry
- `level`: info, warning, error, success
- `message`: Log message
- `source`: Origin (API endpoint, controller, etc.)
- `statusCode`: HTTP status code
- `ipAddress`: Request IP address
- `userId`: Reference to User
- `metadata`: Additional data

#### SecurityLog Model (`Backend/models/SecurityLog.js`)
Tracks security-related events for monitoring threats and suspicious activities.

**Fields:**
- `timestamp`: Date of the event
- `eventType`: failed_login, successful_login, suspicious_activity, blocked_ip, threat_detected
- `ipAddress`: IP address involved
- `userId`: User ID if applicable
- `userEmail`: Email if applicable
- `attemptCount`: Number of attempts
- `blocked`: Whether IP is blocked
- `severity`: low, medium, high, critical
- `details`: Event description
- `userAgent`: Browser/client info
- `metadata`: Additional data

#### Updated Admin Model (`Backend/models/Admin.js`)
Enhanced to support role hierarchy and better tracking.

**New Fields:**
- `role`: DEV, GOV, DS, GN (Developer, Government, Divisional Secretary, Grama Niladhari)
- `district`: For DS and GN roles
- `dsDivision`: For DS and GN roles
- `gnDivisionCode`: For GN role only
- `status`: active, inactive, suspended, flagged
- `officialId`: Verification document reference
- `verified`: Boolean verification status
- `verifiedBy`: Admin who verified
- `lastLogin`: Last login timestamp
- `loginAttempts`: Failed login counter
- `lastLoginIp`: Last login IP address
- `updatedAt`: Last update timestamp

### 2. API Routes (`Backend/routes/adminRoutes.js`)

All routes are prefixed with `/api/admin`

#### Authentication Routes
- `POST /login` - Admin login with role verification
- `POST /register` - Admin registration request

#### System Monitoring Routes  
- `GET /system/health` - Get CPU, memory, uptime stats
- `GET /system/logs` - Get system activity logs

#### User Management Routes (Developer Only)
- `GET /users` - Get all users (admins, victims, contributors)
- `PUT /users/:id/status` - Update user status (ban, activate, flag)

#### Security Routes (Developer Only)
- `GET /security/logs` - Get security event logs
- `GET /security/failed-logins` - Get failed login attempts summary
- `POST /security/block-ip` - Block an IP address

#### Database Routes (Developer Only)
- `GET /database/stats` - Get database collection statistics

### 3. Frontend Integration

#### Admin API Service (`Frontend/src/scripts/adminAPI.js`)
JavaScript service for all admin API calls with:
- Session management
- Authentication methods
- System monitoring methods
- User management methods
- Security monitoring methods
- Database operations methods

#### Updated Files
- `Devpanel.html` - Connected to backend APIs for real-time data
- `Dashboard login.html` - Uses backend authentication

## Database Setup Requirements

### Step 1: Install Required npm Packages
```bash
cd Backend
npm install bcryptjs
```

### Step 2: Create Initial Admin Users

You need to manually create at least one developer admin in the database to access the system.

**Option A: Using MongoDB Compass or mongo shell**
```javascript
// First, hash a password using bcrypt (you can use an online bcrypt tool)
// Example: password "admin123" -> bcrypt hash

db.admins.insertOne({
    email: "developer@resqlink.lk",
    password: "$2a$10$YourBcryptHashedPasswordHere",  // Replace with actual bcrypt hash
    name: "Developer Admin",
    role: "DEV",
    status: "active",
    verified: true,
    createdAt: new Date(),
    updatedAt: new Date()
});
```

**Option B: Create a setup script**

Create `Backend/scripts/createAdmin.js`:
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Admin = require('../models/Admin');

async function createAdmin() {
    await mongoose.connect(process.env.MONGO_URI);
    
    const password = 'admin123'; // Change this
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const admin = new Admin({
        email: 'developer@resqlink.lk',
        password: hashedPassword,
        name: 'Developer Admin',
        role: 'DEV',
        status: 'active',
        verified: true
    });
    
    await admin.save();
    console.log('Admin created successfully');
    process.exit(0);
}

createAdmin().catch(err => {
    console.error(err);
    process.exit(1);
});
```

Run it:
```bash
node Backend/scripts/createAdmin.js
```

### Step 3: Start the Backend Server
```bash
cd Backend
npm start
```

The server should start on `http://localhost:5000`

### Step 4: Test the Integration

1. Open `Frontend/src/pages/AdminPages/Dashboard login.html` in a browser
2. Enter the admin credentials you created
3. Select role: Developer (Root Access)
4. Click "Access Dashboard"
5. You should be redirected to the Devpanel with live data

## API Endpoint Examples

### Login
```bash
POST http://localhost:5000/api/admin/login
Content-Type: application/json

{
    "email": "developer@resqlink.lk",
    "password": "admin123",
    "role": "DEV"
}
```

### Get System Health
```bash
GET http://localhost:5000/api/admin/system/health
Content-Type: application/json

{
    "adminId": "your-admin-id-here"
}
```

### Get All Users
```bash
GET http://localhost:5000/api/admin/users?limit=100
```

## Security Notes

1. **JWT Implementation**: The current implementation uses a simple adminId check. For production, implement JWT (JSON Web Tokens) for secure authentication.

2. **Password Requirements**: Add password strength validation in production.

3. **Rate Limiting**: Add rate limiting to prevent brute force attacks.

4. **CORS**: Update CORS settings in production to only allow your frontend domain.

5. **Environment Variables**: Never commit `.env` file with real credentials.

## Troubleshooting

### Issue: "CORS Error"
**Solution**: Make sure the backend server is running and CORS is enabled in `server.js`

### Issue: "Cannot connect to database"
**Solution**: Check your `MONGO_URI` in `.env` file

### Issue: "Admin not found"
**Solution**: Create an admin user in the database first (see Step 2)

### Issue: "Failed to fetch"
**Solution**: 
- Check if backend server is running on port 5000
- Verify API_BASE_URL in `adminAPI.js` matches your backend URL
- Check browser console for detailed error messages

## Next Steps

1. Implement JWT authentication
2. Add more granular permissions for each admin role
3. Create APIs for other admin panels (GOV, DS, GN)
4. Add data visualization charts for system monitoring
5. Implement real-time updates using WebSockets
6. Add audit trail for all admin actions
7. Create backup and restore functionality

## Database Collections Created

After running the system, these collections will be created automatically:
- `admins` - Admin user accounts
- `systemlogs` - System activity logs
- `securitylogs` - Security event logs
- Plus existing collections: `victims`, `contributors`, `inventory`, etc.

## File Structure

```
Backend/
├── models/
│   ├── Admin.js (updated)
│   ├── SystemLog.js (new)
│   └── SecurityLog.js (new)
├── routes/
│   └── adminRoutes.js (new)
└── server.js (updated)

Frontend/
└── src/
    ├── pages/
    │   └── AdminPages/
    │       ├── Dashboard login.html (updated)
    │       └── Devpanel.html (updated)
    └── scripts/
        └── adminAPI.js (new)
```
