# DevPanel Setup & Usage Guide

## 🚀 Quick Start

### 1. Start Backend
```bash
cd Backend
npm install  # if not already done
npm run create-admin  # Creates: developer@resqlink.lk / admin123
npm start  # Runs on http://localhost:5000
```

### 2. Access Admin Panel
1. Open: `Frontend/src/pages/AdminPages/Dashboard login.html` in browser
2. Login as:
   - **Email**: developer@resqlink.lk
   - **Password**: admin123
   - **Role**: Developer (Root Access)
3. You'll be redirected to the DevPanel

---

## 📊 DevPanel Features

### **System Health Tab** (Active by default)
- Real-time CPU usage
- Memory (RAM) statistics
- System uptime
- Refresh button for manual update
- Auto-refreshes every 30 seconds

### **User Management Table**
- Lists all users (Admins, Victims, Contributors)
- Shows last login time
- User status (active, flagged, suspended)
- Action buttons:
  - **BAN**: Suspend active users
  - **ACTIVATE**: Reactivate suspended users

### **Live System Logs**
- Real-time system activity
- Color-coded by severity (errors, warnings, success)
- Timestamps for each event
- Auto-updates every 30 seconds

### **Database Logs Tab**
- Collection statistics
- Document count per collection
- Storage size (MB)
- Average object size (KB)

### **Security Monitor Tab**
- Failed login attempts (last hour)
- IP addresses with attempt counts
- Total security logs count
- IP blocking capability

---

## 🔗 API Endpoints Reference

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/register` - Request access

### System Monitoring
- `POST /api/admin/system/health` - CPU, memory, uptime
- `POST /api/admin/system/logs` - Activity logs

### User Management (DEV only)
- `POST /api/admin/users` - List all users
- `PUT /api/admin/users/:id/status` - Update status

### Security (DEV only)
- `POST /api/admin/security/logs` - Security events
- `POST /api/admin/security/failed-logins` - Failed login summary
- `POST /api/admin/security/block-ip` - Block IP

### Database (DEV only)
- `POST /api/admin/database/stats` - Collection stats

---

## 🔐 Session Management

- Session stored in: `localStorage.adminSession`
- Auto-logout: Clear from sidebar with "Exit Root" button
- Auto-redirect to login if session expires
- Session includes: id, email, name, role, district, division

---

## 🛠️ Developer Information

### File Structure
```
Frontend/
├── src/
│   ├── scripts/
│   │   ├── adminAPI.js          (API service)
│   │   └── config.js            (API configuration)
│   └── pages/AdminPages/
│       ├── Dashboard login.html  (Login form)
│       ├── Devpanel.html        (DEV panel)
│       ├── GNpanel.html         (GN panel)
│       ├── DSpanel.html         (DS panel)
│       └── govpanel.html        (GOV panel)

Backend/
├── routes/
│   └── adminRoutes.js           (All admin endpoints)
├── models/
│   ├── Admin.js                 (Admin schema)
│   ├── SystemLog.js             (System activity logs)
│   └── SecurityLog.js           (Security events)
└── server.js                    (Express app setup)
```

### Key Classes & Functions

**AdminAPI Class** (`adminAPI.js`)
```javascript
adminAPI.login(email, password, role)
adminAPI.getSystemHealth()
adminAPI.getSystemLogs(limit)
adminAPI.getAllUsers()
adminAPI.updateUserStatus(userId, userType, status)
adminAPI.getSecurityLogs(hours)
adminAPI.getFailedLogins()
adminAPI.getDatabaseStats()
```

---

## 🐛 Troubleshooting

### Devpanel shows "Error loading data"
- ✅ Backend running on port 5000?
- ✅ Admin authenticated?
- ✅ Check browser console for details
- ✅ Verify API_BASE_URL in config.js

### "Unauthorized" error
- ✅ Admin session valid?
- ✅ Try logging in again
- ✅ Clear localStorage and retry
- ✅ Verify admin role is "DEV"

### Data not loading
- ✅ Backend connection working?
- ✅ Database connected?
- ✅ Check MongoDB connection in console
- ✅ Verify routes are registered

---

## 📝 Notes

- All timestamps use browser locale
- Data auto-refreshes every 30-60 seconds
- Failed login attempts shown from last hour only
- Developer role has full system access
- Other roles (GOV, DS, GN) have limited dashboard access
