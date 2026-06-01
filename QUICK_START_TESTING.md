# Quick Start: Testing & Features - 5 Minutes

Follow these steps to get testing running immediately:

---

## 🚀 Start Testing in 5 Minutes

### Step 1: Install Dependencies (2 minutes)

```bash
cd Backend
npm install
```

This adds jest, supertest, and other testing tools to your project.

---

### Step 2: Start Backend Server (Terminal 1)

```bash
# Still in Backend directory
npm start

# Expected output:
# Server running on port 5000
# MongoDB connected
```

---

### Step 3: Run Tests (Terminal 2)

```bash
# In a new terminal, stay in Backend directory
npm test

# Expected output:
# PASS  tests/middleware.test.js
# ✓ Middleware tests pass
# ✓ Validation tests pass
# 20 passed, 20 total
```

**Congratulations! Your test suite is running! 🎉**

---

## 📊 Understanding Test Results

### If Tests PASS ✅
```
PASS  tests/middleware.test.js
  ✓ Valid token should call next()
  ✓ Missing token should return 401
  ✓ Invalid token should return 401

Test Suites: 1 passed, 1 total
Tests: 20 passed, 20 total
```

**Next**: Skip to API Testing section below

### If Tests FAIL ❌
```
FAIL  tests/middleware.test.js
  ✕ Valid token should call next()

Error: Cannot find module '../middleware/authMiddleware'
```

**Solution**: Ensure all middleware files exist:
- `Backend/middleware/authMiddleware.js` ✓
- `Backend/middleware/validationMiddleware.js` ✓
- `Backend/middleware/errorResponseMiddleware.js` ✓

---

## 🌐 Test API Endpoints (Option A: Postman GUI)

### Step 1: Install Postman
Download from: https://www.postman.com/downloads/

### Step 2: Import Collection
1. Open Postman
2. Click "Import" button
3. Select: `Backend/postman-collection.json`
4. Collection loaded! ✓

### Step 3: Test Endpoints
1. Click "Victim Authentication" folder
2. Click "Register Victim" request
3. Click "Send" button
4. See response: Victim created successfully ✓

**That's it! Your API is tested through Postman GUI.**

---

## 🌐 Test API Endpoints (Option B: cURL Commands)

### Login & Get Token
```bash
curl -X POST http://localhost:5000/api/auth/victim/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Response includes token:
# "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Copy token, then test protected endpoint
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:5000/api/needs/MTR001 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🧪 Manual Dashboard Testing (Option C: Browser)

### Victim Dashboard
1. Open: `Frontend/src/pages/victimDashboard.html`
2. Login with: `email: victim@example.com` | `password: password123`
3. Check:
   - ✓ Dashboard loads
   - ✓ Token saved to localStorage
   - ✓ Can create needs
   - ✓ Can update needs
   - ✓ Can trigger SOS
   - ✓ Logout clears token

### Contributor Dashboard
1. Open: `Frontend/src/pages/contributorDashboard.html`
2. Login and verify
3. Check:
   - ✓ Stats load
   - ✓ Collections work
   - ✓ Distributions work
   - ✓ Inventory displays

### Admin Dashboard
1. Open: `Frontend/src/pages/AdminPages/Devpanel.html`
2. Login and verify
3. Check:
   - ✓ System health displays
   - ✓ Logs viewer works
   - ✓ User management works
   - ✓ Auto-refresh every 30s

---

## 📋 Quick Test Checklist

Run through these to verify everything works:

```
✓ Unit Tests Pass
  npm test → 20 passed

✓ Backend Starts
  npm start → "Server running on port 5000"

✓ API Endpoints Work
  Postman: Send "Register Victim" → Success

✓ Token Management
  Save token from login response

✓ Protected Routes
  Use token in Authorization header

✓ Dashboards Load
  Login on 3 dashboards → All work

✓ Logout Works
  Click logout → Token cleared

✓ Error Handling
  Test with invalid token → 401 response
```

---

## 📊 Generate Coverage Report

See which parts of your code are tested:

```bash
npm run test:coverage

# Output shows:
# File                    | % Stmts | % Branch | % Funcs |
# authMiddleware.js       |  100    |   95     |  100    |
# validationMiddleware.js |   98    |   92     |  100    |

# View HTML report:
open coverage/index.html
```

---

## 🔧 Common Quick Fixes

### Tests failing with "Cannot find module"
**Fix**: Ensure all files exist in Backend/middleware/ directory

### MongoDB connection errors
**Fix**: Check MongoDB is running:
```bash
mongosh --eval "db.adminCommand('ping')"
```

### Port 5000 already in use
**Fix**: Kill existing process:
```bash
lsof -ti:5000 | xargs kill -9
npm start
```

### Postman showing "Socket hang up"
**Fix**: Ensure backend server is running in Terminal 1

### Dashboard not loading
**Fix**: Check browser console (F12) for errors, verify backend URL

---

## 🎯 Next Steps After Testing Works

### If All Tests Pass ✅
1. Review [FEATURES_ROADMAP.md](FEATURES_ROADMAP.md) - Phase 4 enhancements
2. Pick 1-2 features to implement next
3. Follow implementation guides provided

### Recommended Quick Wins (4-6 hours each)
1. **Rate Limiting** - Prevent brute force attacks
2. **Refresh Tokens** - Extend sessions without re-login
3. **Email Alerts** - Notify admins of emergencies

---

## 📚 Documentation Links

**While testing**:
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Complete testing procedures
- [FEATURES_ROADMAP.md](FEATURES_ROADMAP.md) - Phase 4+ features

**After testing**:
- [COMPLETE_IMPLEMENTATION_SUMMARY.md](COMPLETE_IMPLEMENTATION_SUMMARY.md) - Full project overview
- [PHASE3_FRONTEND_INTEGRATION_COMPLETE.md](PHASE3_FRONTEND_INTEGRATION_COMPLETE.md) - Latest code details

---

## 💡 Pro Tips

1. **Keep 2 terminals open**:
   - Terminal 1: `npm start` (keep running)
   - Terminal 2: `npm test` (run commands here)

2. **Watch mode for continuous testing**:
   ```bash
   npm run test:watch
   # Tests re-run automatically when files change
   ```

3. **Test specific file only**:
   ```bash
   npm test -- middleware.test.js
   ```

4. **Clear localStorage in browser**:
   ```javascript
   // Open DevTools console and run:
   localStorage.clear()
   ```

5. **Check token contents**:
   ```javascript
   // In browser console:
   JSON.parse(atob(localStorage.getItem('token').split('.')[1]))
   ```

---

## ✅ Success Indicators

You've successfully completed testing when:

1. ✅ `npm test` runs successfully
2. ✅ All 20 tests pass
3. ✅ Backend responds to API requests
4. ✅ Postman collection runs without errors
5. ✅ All 3 dashboards load and function
6. ✅ Token management works correctly
7. ✅ Error handling returns proper status codes

---

## 🚀 Ready for Phase 4?

Once you've verified all the above, you're ready to start Phase 4 enhancements:

**Phase 4a: Security Hardening** (Priority: CRITICAL)
- Refresh Token Mechanism
- Rate Limiting Middleware
- Token Blacklist System

Estimated time: 2-3 days    
Difficulty: Medium    
Impact: High security improvement    

See [FEATURES_ROADMAP.md](FEATURES_ROADMAP.md) for detailed implementation guides.

---

**Created**: April 14, 2024    
**Status**: Testing Infrastructure Ready ✅    
**Last Updated**: [Current Date]

---

## 📞 Stuck? Try This

| Problem | Solution |
|---------|----------|
| Tests won't run | `rm -rf node_modules && npm install` |
| Backend won't start | Check port 5000 isn't in use |
| API returns 500 errors | Check MongoDB is running & connection string correct |
| Dashboard won't load | Clear browser cache (Ctrl+Shift+Delete) |
| Token not saving | Check localStorage not disabled in browser |
| CORS errors | Check `http://localhost:3000` in CORS whitelist |

**Still stuck?** Review the detailed [TESTING_GUIDE.md](TESTING_GUIDE.md) with full troubleshooting section.

---

🎉 **You're all set! Happy testing!** 🧪
