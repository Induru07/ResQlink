# ResQLink Features Roadmap - Phase 4+

**Document Status**: Phase 3 Complete ✅ | Phase 4 Planning 🟡

---

## Executive Summary

The ResQLink platform has completed:
- ✅ **Phase 1**: JWT authentication middleware and CORS security
- ✅ **Phase 2**: Protected victim/contributor/admin routes  
- ✅ **Phase 3**: Frontend dashboards with JWT integration

**Current State**: 30+ protected API endpoints, 3 role-based dashboards, standardized error handling

**Next Focus**: Security enhancements (Phase 4a) + Performance optimizations (Phase 4b) + Additional features (Phase 4c)

---

## Phase 4a: Security Hardening (HIGH PRIORITY)

### Feature 1: Refresh Token Mechanism

**Problem**: Current JWT expires after 7 days, forcing user re-login  
**Solution**: Issue refresh tokens that extend session without full authentication  
**Priority**: 🔴 CRITICAL | **Effort**: 4-6 hours | **Difficulty**: Medium

#### Implementation Plan

**Backend Changes**:

```javascript
// Backend/models/RefreshToken.js (NEW)
const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'VictimAuth'
    },
    token: String,
    expiresAt: Date,
    createdAt: { type: Date, default: Date.now },
    revokedAt: Date,
    role: String
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
```

**Backend Changes**:

```javascript
// Backend/middleware/authMiddleware.js (MODIFY)
const RefreshToken = require('../models/RefreshToken');

exports.verifyRefreshToken = async (req, res, next) => {
    const refreshToken = req.body.refreshToken;
    
    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
    }
    
    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const tokenInDb = await RefreshToken.findOne({ token: refreshToken });
        
        if (!tokenInDb || tokenInDb.revokedAt) {
            return res.status(401).json({ error: 'Invalid or revoked token' });
        }
        
        // Issue new access token
        const newToken = jwt.sign(
            { userId: decoded.userId, role: decoded.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({ token: newToken });
    } catch (error) {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
};
```

**API Endpoint**:

```javascript
// Backend/routes/authRoutes.js (ADD)
router.post('/refresh-token', authMiddleware.verifyRefreshToken);

// Modify login to return both tokens
router.post('/victim/login', async (req, res) => {
    // ... existing login logic ...
    
    // Create refresh token
    const refreshToken = jwt.sign(
        { userId: user._id, role: 'victim' },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '30d' }
    );
    
    // Save to database
    await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        role: 'victim'
    });
    
    res.json({
        token,
        refreshToken,
        user: { ... }
    });
});
```

**Frontend Changes**:

```javascript
// Frontend/src/scripts/authManager.js (MODIFY)
class AuthManager {
    static async refreshToken() {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
            this.logout();
            return false;
        }
        
        try {
            const response = await fetch('http://localhost:5000/api/auth/refresh-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });
            
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                return true;
            } else {
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.logout();
            return false;
        }
    }
    
    static async authenticatedFetch(url, options = {}) {
        let token = localStorage.getItem('token');
        
        let response = await fetch(url, {
            ...options,
            headers: {
                'Authorization': `Bearer ${token}`,
                ...options.headers
            }
        });
        
        // Handle token expiration
        if (response.status === 401) {
            const refreshed = await this.refreshToken();
            if (refreshed) {
                token = localStorage.getItem('token');
                response = await fetch(url, {
                    ...options,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        ...options.headers
                    }
                });
            }
        }
        
        return response;
    }
}
```

**Testing**:
```bash
# Logout/login cycle test
1. Login → Get access & refresh tokens
2. Wait for access token to expire (use short expiry in dev: 1m)
3. Call API with expired token
4. Should auto-refresh and retry
5. Verify new token in localStorage
```

---

### Feature 2: Rate Limiting Middleware

**Problem**: No protection against brute force attacks or API abuse  
**Solution**: Implement per-IP and per-user rate limiting  
**Priority**: 🔴 CRITICAL | **Effort**: 3-4 hours | **Difficulty**: Low

#### Implementation

```javascript
// Backend/middleware/rateLimitMiddleware.js (NEW)
const rateLimit = require('express-rate-limit');
const RedisClient = require('redis').createClient();

// Per-IP limiter
const globalLimiter = rateLimit({
    store: new (require('rate-limit-redis'))({
        client: RedisClient,
        prefix: 'rl:global:'
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false
});

// Per-user limiter (requires authentication)
const authLimiter = rateLimit({
    store: new (require('rate-limit-redis'))({
        client: RedisClient,
        prefix: 'rl:auth:'
    }),
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    keyGenerator: (req, res) => req.user?.id || req.ip,
    skip: (req, res) => !req.user
});

// Login attempt limiter
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 attempts per 15 minutes
    skipSuccessfulRequests: true,
    message: 'Too many login attempts, please try again later'
});

module.exports = {
    globalLimiter,
    authLimiter,
    loginLimiter
};
```

**Apply Middleware**:

```javascript
// Backend/server.js
const { globalLimiter, authLimiter, loginLimiter } = require('./middleware/rateLimitMiddleware');

app.use(globalLimiter); // Apply to all requests

// Apply to auth routes
app.post('/api/auth/victim/login', loginLimiter, authRoutes);
app.post('/api/contributor/login', loginLimiter, authRoutes);
app.post('/api/admin/login', loginLimiter, authRoutes);

// Apply to API calls
app.use('/api/needs', authLimiter, needsRoutes);
app.use('/api/contributor', authLimiter, contributorRoutes);
```

**Testing**:
```bash
# Send 6 login requests in rapid succession
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/victim/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' &
done

# 6th request should return 429 Too Many Requests
```

---

### Feature 3: Token Blacklist for Early Logout

**Problem**: Logged out tokens could still be used if not expired  
**Solution**: Maintain server-side blacklist of revoked tokens  
**Priority**: 🟡 HIGH | **Effort**: 3-4 hours | **Difficulty**: Medium

#### Implementation

```javascript
// Backend/models/TokenBlacklist.js (NEW)
const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    userId: mongoose.Schema.Types.ObjectId,
    expiresAt: Date,
    reason: String,
    createdAt: { type: Date, default: Date.now, expires: 604800 } // Auto-delete after 7 days
});

module.exports = mongoose.model('TokenBlacklist', tokenBlacklistSchema);
```

**Middleware Update**:

```javascript
// Backend/middleware/authMiddleware.js (MODIFY)
const TokenBlacklist = require('../models/TokenBlacklist');

exports.verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    // Check if token is blacklisted
    const blacklisted = await TokenBlacklist.findOne({ token });
    if (blacklisted) {
        return res.status(401).json({ error: 'Token has been revoked' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
```

**Logout Endpoint**:

```javascript
// Backend/routes/authRoutes.js (ADD)
router.post('/logout', authMiddleware.verifyToken, async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        await TokenBlacklist.create({
            token,
            userId: req.user.userId,
            expiresAt: new Date(decoded.exp * 1000),
            reason: 'User logout'
        });
        
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Logout failed' });
    }
});
```

---

## Phase 4b: Performance Optimizations (MEDIUM PRIORITY)

### Feature 4: Data Pagination & Caching

**Problem**: Large datasets (logs, users) slow down dashboards  
**Solution**: Implement pagination and Redis caching  
**Priority**: 🟡 HIGH | **Effort**: 5-6 hours | **Difficulty**: Medium

#### Pagination Implementation

```javascript
// Backend/middleware/paginationMiddleware.js (NEW)
exports.paginate = (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    req.pagination = {
        page,
        limit,
        skip: (page - 1) * limit
    };
    
    next();
};

// Apply to list endpoints
app.get('/api/admin/users', paginate, (req, res) => {
    const { skip, limit } = req.pagination;
    const users = await Admin.find()
        .skip(skip)
        .limit(limit)
        .lean();
    
    const total = await Admin.countDocuments();
    
    res.json({
        users,
        pagination: {
            page: req.pagination.page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});
```

#### Redis Caching

```javascript
// Backend/middleware/cacheMiddleware.js (NEW)
const redis = require('redis');
const client = redis.createClient();

exports.cacheMiddleware = async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
        const cached = await client.get(key);
        if (cached) {
            return res.json(JSON.parse(cached));
        }
    } catch (error) {
        console.error('Cache error:', error);
    }
    
    const originalJson = res.json;
    res.json = function(data) {
        client.setex(key, 300, JSON.stringify(data)); // Cache for 5 minutes
        originalJson.call(this, data);
    };
    
    next();
};
```

---

## Phase 4c: Additional Features (MEDIUM-LOW PRIORITY)

### Feature 5: Real-Time Notifications (WebSocket)

**Problem**: Users don't know when distributions happen or needs matched  
**Solution**: Real-time notifications via WebSocket  
**Priority**: 🟡 HIGH | **Effort**: 8-10 hours | **Difficulty**: High

#### Architecture

```javascript
// Backend/websocket/notificationManager.js (NEW)
const io = require('socket.io');

class NotificationManager {
    constructor(server) {
        this.io = io(server, {
            cors: { origin: 'http://localhost:3000' }
        });
        this.setupListeners();
    }
    
    setupListeners() {
        this.io.on('connection', (socket) => {
            // User joins their notification room
            socket.on('join', (userId) => {
                socket.join(`user:${userId}`);
            });
            
            // Send notification to specific user
            this.io.to(`user:${userId}`).emit('notification', {
                type: 'distribution_matched',
                message: 'Your needs have been matched!',
                data: { ... }
            });
        });
    }
    
    notifyVictim(victimId, data) {
        this.io.to(`user:${victimId}`).emit('notification', data);
    }
    
    notifyContributor(contributorId, data) {
        this.io.to(`user:${contributorId}`).emit('notification', data);
    }
}

module.exports = NotificationManager;
```

---

### Feature 6: Email Alerts for Emergency SOS

**Problem**: Admins/contributors don't know about emergencies in real-time  
**Solution**: Email notifications when SOS triggered  
**Priority**: 🟡 HIGH | **Effort**: 3-4 hours | **Difficulty**: Low

#### Implementation

```javascript
// Backend/services/emailService.js (NEW)
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

class EmailService {
    static async sendEmergencyAlert(victimData) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: `🚨 EMERGENCY SOS - ${victimData.name}`,
            html: `
                <h2>Emergency Alert</h2>
                <p><strong>Victim:</strong> ${victimData.name}</p>
                <p><strong>Location:</strong> ${victimData.district}</p>
                <p><strong>Reason:</strong> ${victimData.emergencyReason}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                <a href="http://localhost:3000/admin/emergency/${victimData.id}">View Details</a>
            `
        };
        
        return transporter.sendMail(mailOptions);
    }
}

module.exports = EmailService;
```

**Trigger on SOS**:

```javascript
// Backend/routes/needsRoutes.js (MODIFY)
router.post('/:victimId/emergency', verifyToken, verifyVictim, async (req, res) => {
    // ... existing logic ...
    
    // Send email alert
    await EmailService.sendEmergencyAlert(victimData);
    
    res.json({ success: true, message: 'Emergency alert sent' });
});
```

---

### Feature 7: Session Timeout Warnings

**Problem**: Users don't know their session is about to expire  
**Solution**: Warning popup before auto-logout  
**Priority**: 🟢 MEDIUM | **Effort**: 2-3 hours | **Difficulty**: Low

#### Frontend Implementation

```javascript
// Frontend/src/scripts/sessionManager.js (NEW)
class SessionManager {
    constructor(warningTime = 5 * 60 * 1000) { // 5 minutes before expiry
        this.warningTime = warningTime;
        this.setupTimeout();
    }
    
    setupTimeout() {
        const token = localStorage.getItem('token');
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const expiresAt = decoded.exp * 1000;
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;
        
        if (timeUntilExpiry > 0) {
            setTimeout(() => {
                this.showWarning(timeUntilExpiry);
            }, timeUntilExpiry - this.warningTime);
        }
    }
    
    showWarning(timeRemaining) {
        const modal = document.createElement('div');
        modal.className = 'session-warning-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Session Expiring Soon</h2>
                <p>Your session will expire in ${Math.round(timeRemaining / 1000)} seconds</p>
                <button onclick="SessionManager.extendSession()">Extend Session</button>
                <button onclick="AuthManager.logout()">Logout</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    static async extendSession() {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await fetch('http://localhost:5000/api/auth/refresh-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            location.reload();
        }
    }
}

// Initialize in dashboards
new SessionManager();
```

---

### Feature 8: Two-Factor Authentication (2FA)

**Problem**: Accounts vulnerable to credential compromise  
**Solution**: Optional 2FA via email/SMS  
**Priority**: 🟢 LOW | **Effort**: 8-10 hours | **Difficulty**: Medium

#### Architecture

```javascript
// Backend/models/TwoFactorAuth.js (NEW)
const mongoose = require('mongoose');

const twoFactorSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    method: { type: String, enum: ['email', 'sms'] },
    secret: String, // TOTP secret if using authenticator app
    enabled: Boolean,
    backupCodes: [String],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TwoFactorAuth', twoFactorSchema);
```

**Verification Flow**:

```javascript
// 1. User enables 2FA
router.post('/enable-2fa', verifyToken, async (req, res) => {
    const secret = speakeasy.generateSecret({ name: 'ResQLink' });
    
    await TwoFactorAuth.create({
        userId: req.user.userId,
        method: req.body.method,
        secret: secret.base32,
        enabled: false,
        backupCodes: generateBackupCodes()
    });
    
    res.json({ qrCode: secret.otpauth_url });
});

// 2. User verifies code
router.post('/verify-2fa', async (req, res) => {
    const twoFa = await TwoFactorAuth.findOne({ userId: req.body.userId });
    
    const isValid = speakeasy.totp.verify({
        secret: twoFa.secret,
        encoding: 'base32',
        token: req.body.code
    });
    
    if (isValid) {
        twoFa.enabled = true;
        await twoFa.save();
        res.json({ success: true });
    }
});
```

---

## Implementation Priority Matrix

| Priority | Feature | Effort | Impact | Timeline |
|----------|---------|--------|--------|----------|
| 🔴 CRITICAL | Refresh Tokens | 4-6h | HIGH | Week 1 |
| 🔴 CRITICAL | Rate Limiting | 3-4h | HIGH | Week 1 |
| 🔴 CRITICAL | Token Blacklist | 3-4h | MEDIUM | Week 1 |
| 🟡 HIGH | Pagination/Caching | 5-6h | HIGH | Week 2 |
| 🟡 HIGH | WebSocket Notifications | 8-10h | MEDIUM | Week 3 |
| 🟡 HIGH | Email Alerts | 3-4h | HIGH | Week 2 |
| 🟢 MEDIUM | Session Warnings | 2-3h | LOW | Week 2 |
| 🟢 LOW | 2FA Authentication | 8-10h | MEDIUM | Week 4+ |

---

## Quick Wins (Start Here!)

**Week 1 - Security Foundation** (15 hours total):
1. ✅ Rate Limiting - Protect against brute force
2. ✅ Token Blacklist - Immediate logout support
3. ✅ Refresh Tokens - Extended session support

**Week 2 - Performance & User Experience** (10 hours):
4. ✅ Pagination - Handle large datasets
5. ✅ Email Alerts - Notify admins of emergencies
6. ✅ Session Warnings - Better UX

**Week 3+ - Advanced Features** (18+ hours):
7. ✅ WebSocket Notifications - Real-time updates
8. ✅ 2FA - Enhanced security

---

## Testing Checklist for Each Feature

### Refresh Tokens Test
- [ ] User can login and receive both access and refresh tokens
- [ ] Access token expires after 7 days
- [ ] Refresh token extends access without re-login
- [ ] Refresh token expires after 30 days
- [ ] Invalid/expired refresh token returns 401

### Rate Limiting Test
- [ ] 100+ requests/15min from same IP allowed
- [ ] 101st request returns 429 Too Many Requests
- [ ] Login attempts limited to 5 per 15 minutes
- [ ] 6th failed login attempt returns 429

### Token Blacklist Test
- [ ] Logout adds token to blacklist
- [ ] Blacklisted token cannot be used (401)
- [ ] Normal token still works after logout

### Pagination Test
- [ ] ?page=1&limit=10 returns first 10 items
- [ ] Response includes pagination metadata (total, pages)
- [ ] ?page=2 returns items 11-20
- [ ] Out of range page returns empty array

### Email Alerts Test
- [ ] Emergency SOS triggers email to admin
- [ ] Email contains victim name, location, reason
- [ ] Multiple SOS sends multiple emails

### Session Warnings Test
- [ ] Warning modal appears 5 minutes before expiry
- [ ] "Extend Session" button refreshes token
- [ ] "Logout" button clears storage

---

## Deployment Checklist

Before deploying Phase 4 features:

- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] Load test (50 concurrent users) successful
- [ ] Security audit completed
- [ ] Database optimizations in place
- [ ] Redis/caching configured
- [ ] Email service configured
- [ ] WebSocket tested with 100+ concurrent connections
- [ ] Environment variables updated (.env)
- [ ] Documentation updated
- [ ] Rollback plan documented

---

## Success Metrics

After Phase 4 implementation, validate:

✅ **Security**: Zero brute force attacks, session compromise eliminated  
✅ **Performance**: API response <200ms average, DB queries <50ms  
✅ **User Experience**: Auto-refresh sessions transparently, no unexpected logouts  
✅ **Reliability**: 99.9% uptime, email alerts 100% delivery rate  
✅ **Scalability**: Support 1000+ concurrent users without degradation  

---

## Next Steps

1. **Week 1**: Implement Phase 4a (Security Hardening)
   - Create refresh token system
   - Add rate limiting middleware
   - Implement token blacklist

2. **Week 2**: Implement Phase 4b (Performance)
   - Add pagination to list endpoints
   - Setup Redis caching
   - Implement email alert system

3. **Week 3+**: Implement Phase 4c (Advanced Features)
   - WebSocket infrastructure
   - Session timeout warnings
   - Optional 2FA

---

## Questions? Issues?

For implementation guidance on any feature, refer to the code snippets above or check:
- `TESTING_GUIDE.md` - Testing procedures
- `Backend/README.md` - Backend architecture
- `Frontend/README.md` - Frontend structure
