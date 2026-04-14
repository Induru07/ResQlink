# Admin System Quick Start 🚀

## 3-Step Setup

### Step 1: Create Admin Account
```bash
cd Backend
npm run create-admin
```
✅ Creates developer admin: `developer@resqlink.lk` / `admin123`

### Step 2: Start Backend
```bash
npm start
```
✅ Server runs on `http://localhost:5000`

### Step 3: Login
Open `Frontend/src/pages/AdminPages/Dashboard login.html` in browser
- Email: `developer@resqlink.lk`
- Password: `admin123`
- Role: `Developer (Root Access)`

---

## What You Get

### Developer Panel Features
- 📊 **Real-time System Monitoring** - CPU, RAM, uptime
- 👥 **User Management** - View/ban all users
- 📝 **Live System Logs** - Track all activities
- 🔒 **Security Dashboard** - Monitor failed logins & threats
- 🗄️ **Database Stats** - Collection sizes & performance

---

## Admin Hierarchy

```
DEV (Developer)           → Full system access
  ├── GOV (Government)    → National disaster management  
  ├── DS (Div. Secretary) → Regional management
  └── GN (Grama Niladhari)→ Local area management
```

---

## Backend APIs Created

**Base URL**: `http://localhost:5000/api/admin`

### Available Endpoints
- `/login` - Authenticate admin
- `/system/health` - Get system metrics
- `/system/logs` - View activity logs
- `/users` - List all users
- `/security/failed-logins` - Security monitoring
- `/database/stats` - DB statistics

Full API docs: See `DEVPANEL_SETUP.md`

---

## Files Added

### Backend (4 new files)
```
models/SystemLog.js      - System activity logging
models/SecurityLog.js    - Security event tracking  
routes/adminRoutes.js    - 12 API endpoints
scripts/createAdmin.js   - Admin creation utility
```

### Frontend (1 new file)
```
scripts/adminAPI.js      - Complete API service
```

### Modified
- Admin.js - Enhanced with role hierarchy
- server.js - Added admin routes
- Devpanel.html - Connected to backend
- Dashboard login.html - Backend auth

---

## Test It Works

Open browser console in Devpanel:
```javascript
// Should show system stats
adminAPI.getSystemHealth().then(console.log);

// Should show all users
adminAPI.getAllUsers().then(console.log);

// Should show security logs  
adminAPI.getFailedLogins().then(console.log);
```

---

## Need Help?

📖 **Full Setup Guide**: `DEVPANEL_SETUP.md`
📋 **Feature Summary**: `DEVPANEL_SUMMARY.md`
🔧 **Troubleshooting**: Check console for errors

---

**Status**: ✅ Ready to Use
