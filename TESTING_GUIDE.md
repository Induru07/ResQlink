# Comprehensive Testing Guide - ResQLink

## Quick Start Testing

### Prerequisites
```bash
# Install dependencies
cd Backend && npm install
cd ../Frontend && npm install

# Environment setup
cp Backend/.env.example Backend/.env
# Edit .env with your settings:
# JWT_SECRET=your_secret_key
# MONGODB_URI=mongodb+srv://...
# NODE_ENV=development
```

### Start Services
```bash
# Terminal 1: Backend
cd Backend
npm start
# Should see: "Server running on port 5000"

# Terminal 2: Frontend (optional - for manual testing)
cd Frontend
npm start
# Or use simple HTTP server:
python -m http.server 8080
```

---

## Unit Testing

### Backend Authentication Tests

**File**: `Backend/tests/auth.test.js`

```javascript
const request = require('supertest');
const app = require('../server');
const VictimAuth = require('../models/VictimAuth');
const Admin = require('../models/Admin');

describe('Victim Authentication', () => {
    
    test('POST /auth/victim/register - Valid registration', async () => {
        const res = await request(app)
            .post('/api/auth/victim/register')
            .send({
                name: 'Test Victim',
                email: 'victim@test.com',
                password: 'password123',
                phone: '0712345678',
                district: 'Matara'
            });
        
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('victimId');
        expect(res.body).toHaveProperty('authId');
    });

    test('POST /auth/victim/register - Duplicate email', async () => {
        // First registration
        await request(app)
            .post('/api/auth/victim/register')
            .send({
                name: 'Test Victim',
                email: 'duplicate@test.com',
                password: 'password123',
                phone: '0712345678',
                district: 'Matara'
            });

        // Second registration with same email
        const res = await request(app)
            .post('/api/auth/victim/register')
            .send({
                name: 'Another Victim',
                email: 'duplicate@test.com',
                password: 'password456',
                phone: '0787654321',
                district: 'Matara'
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('already registered');
    });

    test('POST /auth/victim/register - Invalid email', async () => {
        const res = await request(app)
            .post('/api/auth/victim/register')
            .send({
                name: 'Test Victim',
                email: 'not-an-email',
                password: 'password123',
                phone: '0712345678',
                district: 'Matara'
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('email');
    });

    test('POST /auth/victim/register - Weak password', async () => {
        const res = await request(app)
            .post('/api/auth/victim/register')
            .send({
                name: 'Test Victim',
                email: 'victim@test.com',
                password: 'abc',
                phone: '0712345678',
                district: 'Matara'
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('password');
    });

    test('POST /auth/victim/login - Valid credentials', async () => {
        // Register first
        await request(app)
            .post('/api/auth/victim/register')
            .send({
                name: 'Login Test',
                email: 'login@test.com',
                password: 'password123',
                phone: '0712345678',
                district: 'Matara'
            });

        // Login
        const res = await request(app)
            .post('/api/auth/victim/login')
            .send({
                email: 'login@test.com',
                password: 'password123'
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.token).toMatch(/^eyJ/); // JWT format
        expect(res.body.user).toHaveProperty('victimId');
    });

    test('POST /auth/victim/login - Invalid password', async () => {
        const res = await request(app)
            .post('/api/auth/victim/login')
            .send({
                email: 'login@test.com',
                password: 'wrongpassword'
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('credentials');
    });
});

describe('JWT Token Verification', () => {
    let token;

    beforeAll(async () => {
        const res = await request(app)
            .post('/api/auth/victim/login')
            .send({
                email: 'login@test.com',
                password: 'password123'
            });
        token = res.body.token;
    });

    test('Valid token grants access', async () => {
        const res = await request(app)
            .get('/api/needs/MTR001')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).not.toBe(401);
    });

    test('Missing authorization header returns 401', async () => {
        const res = await request(app)
            .get('/api/needs/MTR001');

        expect(res.status).toBe(401);
        expect(res.body.error).toContain('No token');
    });

    test('Invalid token returns 401', async () => {
        const res = await request(app)
            .get('/api/needs/MTR001')
            .set('Authorization', 'Bearer invalid.token.here');

        expect(res.status).toBe(401);
        expect(res.body.error).toContain('Invalid token');
    });

    test('Expired token returns 401', async () => {
        // Create expired token manually
        const jwt = require('jsonwebtoken');
        const expiredToken = jwt.sign(
            { userId: '123', role: 'victim' },
            process.env.JWT_SECRET,
            { expiresIn: '-1h' } // Already expired
        );

        const res = await request(app)
            .get('/api/needs/MTR001')
            .set('Authorization', `Bearer ${expiredToken}`);

        expect(res.status).toBe(401);
        expect(res.body.error).toContain('expired');
    });
});

describe('Admin Authentication', () => {
    test('POST /admin/login - Valid credentials', async () => {
        const res = await request(app)
            .post('/api/admin/login')
            .send({
                email: 'admin@example.com',
                password: 'admin123',
                role: 'DEV'
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    test('POST /admin/login - Invalid role', async () => {
        const res = await request(app)
            .post('/api/admin/login')
            .send({
                email: 'admin@example.com',
                password: 'admin123',
                role: 'INVALID'
            });

        expect(res.status).toBe(403);
        expect(res.body.error).toContain('role');
    });
});
```

### Run Unit Tests
```bash
cd Backend
npm test

# Or with coverage
npm run test:coverage

# Or watch mode
npm run test:watch
```

---

## Integration Testing

### API Endpoint Tests with cURL

#### 1. Victim Registration & Login
```bash
# Register new victim
curl -X POST http://localhost:5000/api/auth/victim/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "phone": "0712345678",
    "district": "Matara",
    "address": "123 Main St",
    "nationalID": "123456789V"
  }'

# Expected response:
# {
#   "msg": "Victim account created successfully",
#   "victimId": "MTR001",
#   "authId": "507f1f77bcf86cd799439011"
# }

# Login victim
curl -X POST http://localhost:5000/api/auth/victim/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }'

# Expected response:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {
#     "id": "507f1f77bcf86cd799439011",
#     "victimId": "MTR001",
#     "name": "John Doe",
#     "email": "john.doe@example.com",
#     "role": "victim"
#   }
# }

# Save token for next requests
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 2. Create & Update Needs
```bash
# Create needs (requires token)
curl -X POST http://localhost:5000/api/needs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "victimId": "MTR001",
    "items": {
      "shelter": true,
      "medicine": true,
      "dryRations": true,
      "water": false,
      "clothes": true,
      "sanitaryItems": false,
      "cookedFood": true,
      "infantCare": false,
      "medicalSupport": false
    },
    "specialConditions": {
      "hasDisability": false,
      "isPregnant": false,
      "isElderly": true,
      "hasInfant": false,
      "hasChronicIllness": true
    },
    "description": "Elderly couple with chronic illness, need shelter and medical supplies"
  }'

# Get needs
curl -X GET http://localhost:5000/api/needs/MTR001 \
  -H "Authorization: Bearer $TOKEN"

# Update needs
curl -X PUT http://localhost:5000/api/needs/MTR001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": {
      "shelter": true,
      "medicine": true,
      "water": true
    }
  }'
```

#### 3. Emergency SOS
```bash
# Trigger emergency
curl -X POST http://localhost:5000/api/needs/MTR001/emergency \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "emergencyReason": "House flooding, need immediate evacuation assistance"
  }'

# Expected status: 200 with urgency marked as "critical"
```

#### 4. Contributor Operations
```bash
# Contributor login
curl -X POST http://localhost:5000/api/contributor/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "contributor@example.com",
    "password": "password123"
  }'

CONTRIBUTOR_TOKEN="..."

# Log collection
curl -X POST http://localhost:5000/api/contributor/collection \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CONTRIBUTOR_TOKEN" \
  -d '{
    "contributorId": "CON001",
    "items": [
      {
        "category": "FOOD",
        "itemName": "Rice",
        "quantity": 100,
        "unit": "kg",
        "condition": "good"
      }
    ],
    "collectionDate": "2024-04-14T10:00:00Z",
    "collectionLocation": {
      "address": "Main Donation Center",
      "district": "Matara"
    },
    "donorName": "ABC Store",
    "notes": "From store donation program"
  }'

# Get inventory
curl -X GET http://localhost:5000/api/contributor/inventory/CON001 \
  -H "Authorization: Bearer $CONTRIBUTOR_TOKEN"

# Log distribution
curl -X POST http://localhost:5000/api/contributor/distribution \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CONTRIBUTOR_TOKEN" \
  -d '{
    "contributorId": "CON001",
    "items": [
      {
        "itemName": "Rice",
        "quantity": 20,
        "unit": "kg"
      }
    ],
    "recipientType": "victim",
    "recipientName": "John Doe",
    "recipientPhone": "0712345678",
    "recipientAddress": "123 Main St",
    "distributionDate": "2024-04-14T11:00:00Z",
    "familiesBenefited": 1,
    "individualsBenefited": 2,
    "notes": "Family with elderly members"
  }'
```

#### 5. Admin Operations
```bash
# Admin login
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "role": "DEV"
  }'

ADMIN_TOKEN="..."

# Get system health
curl -X POST http://localhost:5000/api/admin/system/health \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Expected response includes CPU, memory, uptime metrics

# Get system logs
curl -X POST http://localhost:5000/api/admin/system/logs?limit=50 \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Get failed login attempts
curl -X POST http://localhost:5000/api/admin/security/failed-logins \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Get users
curl -X POST http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Update user status
curl -X PUT http://localhost:5000/api/admin/users/507f1f77bcf86cd799439011/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "status": "active",
    "userType": "victim"
  }'
```

#### 6. Error Scenarios
```bash
# Missing authorization header
curl -X GET http://localhost:5000/api/needs/MTR001
# Expected: 401 Unauthorized

# Invalid token
curl -X GET http://localhost:5000/api/needs/MTR001 \
  -H "Authorization: Bearer invalid.token"
# Expected: 401 Invalid token

# Accessing other user's data
curl -X GET http://localhost:5000/api/needs/SOMEONE_ELSE_ID \
  -H "Authorization: Bearer $VICTIM_TOKEN"
# Expected: 403 Forbidden (ownership error)

# Invalid email format
curl -X POST http://localhost:5000/api/auth/victim/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "not-an-email",
    "password": "password123",
    "phone": "0712345678",
    "district": "Matara"
  }'
# Expected: 400 Bad Request
```

---

## Frontend Testing

### Manual Testing Checklist

#### Victim Dashboard
- [ ] Victim can login with correct credentials
- [ ] Failed login shows error message
- [ ] Token saved to localStorage
- [ ] Dashboard loads victim data
- [ ] Can update needs with form
- [ ] Tab switching works (Needs/Requests/Status)
- [ ] Emergency SOS button triggers alert
- [ ] Logout clears token and redirects

#### Contributor Dashboard
- [ ] Contributor can login
- [ ] Stats load correctly
- [ ] Can add collection items
- [ ] Can log collection with handover
- [ ] Can view inventory
- [ ] Can create distribution
- [ ] Can view history
- [ ] Logout works

#### Admin Dashboard
- [ ] Admin can login
- [ ] System health metrics display
- [ ] Logs viewer shows entries
- [ ] Failed logins displayed with IPs
- [ ] User list loads
- [ ] Can update user status
- [ ] Database stats display
- [ ] Auto-refresh works every 30s

### Browser DevTools Testing

#### Check Network Requests
```javascript
// Open DevTools (F12) → Network tab

// Check JWT token in requests:
// Headers tab should show:
// Authorization: Bearer eyJ...

// Check response status codes:
// 200 OK - Success
// 400 Bad Request - Validation error
// 401 Unauthorized - Missing/invalid token
// 403 Forbidden - Insufficient permissions
```

#### Check Storage
```javascript
// Open DevTools → Application → localStorage

// Should contain:
// token - JWT token
// user - User JSON
// userRole - Role string
// victimId/contributorId - User ID
```

#### Console Testing
```javascript
// Test token expiration in console:

// Get current token
const token = localStorage.getItem('token');

// Decode JWT (use jwt-decode library or manual):
const decoded = JSON.parse(atob(token.split('.')[1]));
console.log('Token expires at:', new Date(decoded.exp * 1000));

// Test authenticated fetch
const res = await fetch('http://localhost:5000/api/needs/MTR001', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
console.log(res.status, await res.json());
```

---

## Automated Testing Suite

### Create test file: `Backend/tests/integration.test.js`

```javascript
const request = require('supertest');
const app = require('../server');

describe('Integration Tests - Full User Flows', () => {
    let victimToken, victimId, contributorToken, contributorId, adminToken;

    // Setup: Register and login users
    beforeAll(async () => {
        // Victim registration and login
        const victimReg = await request(app)
            .post('/api/auth/victim/register')
            .send({
                name: 'Integration Test Victim',
                email: 'integration.victim@test.com',
                password: 'password123',
                phone: '0712345678',
                district: 'Matara'
            });
        
        victimId = victimReg.body.victimId;

        const victimLogin = await request(app)
            .post('/api/auth/victim/login')
            .send({
                email: 'integration.victim@test.com',
                password: 'password123'
            });
        
        victimToken = victimLogin.body.token;

        // Contributor registration and login
        const contribReg = await request(app)
            .post('/api/contributor/register')
            .send({
                name: 'Integration Test Contributor',
                email: 'integration.contrib@test.com',
                password: 'password123',
                phone: '0787654321'
            });
        
        contributorId = contribReg.body.contributorId;

        const contribLogin = await request(app)
            .post('/api/contributor/login')
            .send({
                email: 'integration.contrib@test.com',
                password: 'password123'
            });
        
        contributorToken = contribLogin.body.token;

        // Admin login
        const adminLogin = await request(app)
            .post('/api/admin/login')
            .send({
                email: 'admin@example.com',
                password: 'admin123',
                role: 'DEV'
            });
        
        adminToken = adminLogin.body.token;
    });

    describe('Victim Flow', () => {
        test('Victim creates and updates needs', async () => {
            // Create needs
            const createRes = await request(app)
                .post('/api/needs')
                .set('Authorization', `Bearer ${victimToken}`)
                .send({
                    victimId,
                    items: { shelter: true, medicine: true },
                    description: 'Need shelter'
                });

            expect(createRes.status).toBe(200);
            expect(createRes.body.data.status).toBe('created');

            // Get needs
            const getRes = await request(app)
                .get(`/api/needs/${victimId}`)
                .set('Authorization', `Bearer ${victimToken}`);

            expect(getRes.status).toBe(200);
            expect(getRes.body.data.items.shelter).toBe(true);
        });

        test('Victim can trigger emergency', async () => {
            const res = await request(app)
                .post(`/api/needs/${victimId}/emergency`)
                .set('Authorization', `Bearer ${victimToken}`)
                .send({
                    emergencyReason: 'Immediate help needed'
                });

            expect(res.status).toBe(200);
            expect(res.body.data.isEmergency).toBe(true);
            expect(res.body.data.urgency).toBe('critical');
        });
    });

    describe('Contributor Flow', () => {
        test('Contributor logs collection and distribution', async () => {
            // Log collection
            const collRes = await request(app)
                .post('/api/contributor/collection')
                .set('Authorization', `Bearer ${contributorToken}`)
                .send({
                    contributorId,
                    items: [{ category: 'FOOD', itemName: 'Rice', quantity: 100, unit: 'kg' }],
                    collectionDate: new Date(),
                    collectionLocation: { address: 'Test Center', district: 'Matara' }
                });

            expect(collRes.status).toBe(200);
            expect(collRes.body).toHaveProperty('collectionId');

            // Log distribution
            const distRes = await request(app)
                .post('/api/contributor/distribution')
                .set('Authorization', `Bearer ${contributorToken}`)
                .send({
                    contributorId,
                    items: [{ itemName: 'Rice', quantity: 20, unit: 'kg' }],
                    recipientType: 'victim',
                    recipientName: 'Victim Name',
                    distributionDate: new Date(),
                    familiesBenefited: 1
                });

            expect(distRes.status).toBe(200);
            expect(distRes.body).toHaveProperty('distributionId');
        });
    });

    describe('Admin Operations', () => {
        test('Admin can view system health', async () => {
            const res = await request(app)
                .post('/api/admin/system/health')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('cpu');
            expect(res.body).toHaveProperty('memory');
            expect(res.body).toHaveProperty('uptime');
        });

        test('Admin can view and manage users', async () => {
            const usersRes = await request(app)
                .post('/api/admin/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(usersRes.status).toBe(200);
            expect(Array.isArray(usersRes.body.users)).toBe(true);
        });
    });

    describe('Cross-User Access Prevention', () => {
        test('Victim cannot access other victim data', async () => {
            const res = await request(app)
                .get('/api/needs/DIFFERENT_VICTIM_ID')
                .set('Authorization', `Bearer ${victimToken}`);

            expect(res.status).toBe(403);
            expect(res.body.error).toContain('Unauthorized');
        });

        test('Role violation prevented', async () => {
            const res = await request(app)
                .post('/api/admin/system/health')
                .set('Authorization', `Bearer ${victimToken}`);

            expect(res.status).toBe(403);
            expect(res.body.error).toContain('Only admins');
        });
    });
});
```

### Run Integration Tests
```bash
npm test -- integration.test.js
```

---

## Performance Testing

### Load Testing with Artillery

```bash
# Install artillery
npm install -g artillery

# Create artillery-config.yml
cat > artillery-config.yml << 'EOF'
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: 'Warm up'
    - duration: 120
      arrivalRate: 50
      name: 'Ramp up'
    - duration: 60
      arrivalRate: 100
      name: 'Spike'

scenarios:
  - name: 'Victim Login Flow'
    flow:
      - post:
          url: '/api/auth/victim/login'
          json:
            email: 'test@example.com'
            password: 'password123'

  - name: 'Get Needs'
    flow:
      - get:
          url: '/api/needs/MTR001'
          headers:
            Authorization: 'Bearer {{ token }}'

  - name: 'Admin Health Check'
    flow:
      - post:
          url: '/api/admin/system/health'
          headers:
            Authorization: 'Bearer {{ adminToken }}'
EOF

# Run load test
artillery run artillery-config.yml
```

---

## Monitoring & Debugging

### Enable Debug Logging

**Backend debug:**
```bash
DEBUG=app:* npm start
```

**Frontend console monitoring:**
```javascript
// Add to victimDashboard.js or any dashboard
window.DEBUG = true;

// In your functions:
if (window.DEBUG) {
  console.log('Token:', localStorage.getItem('token'));
  console.log('API Response:', data);
  console.log('User:', localStorage.getItem('user'));
}
```

### Common Issues & Fixes

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Missing/invalid token | Check localStorage, verify token format |
| CORS Error | Frontend domain not whitelisted | Add domain to CORS whitelist in server.js |
| Token Expired | Token older than 7 days | User must login again |
| 403 Forbidden | Insufficient permissions | Check user role, verify ownership |
| 400 Bad Request | Invalid input | Check email format, password strength |
| 500 Server Error | Database connection issue | Check MongoDB connection string |

---

## Continuous Integration

### GitHub Actions Workflow

**File**: `.github/workflows/test.yml`

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:5.0
        options: >-
          --health-cmd "mongo --eval 'db.adminCommand(\"ping\")'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v2
      
      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: |
          cd Backend && npm install
          cd ../Frontend && npm install

      - name: Run tests
        env:
          JWT_SECRET: test_secret
          MONGODB_URI: mongodb://localhost:27017/resqlink-test
          NODE_ENV: test
        run: |
          cd Backend && npm test

      - name: Check coverage
        run: cd Backend && npm run test:coverage
```

---

## Test Report Template

Create `TESTING_REPORT.md`:

```markdown
# Testing Report - ResQLink

**Date**: 2024-04-14
**Tester**: [Your Name]
**Environment**: Development / Staging / Production
**Build Version**: v1.0.0

## Test Summary
- Total Tests: 50
- Passed: 48
- Failed: 2
- Skipped: 0
- Coverage: 85%

## Test Coverage

### Unit Tests
- Authentication: ✅ 10/10 passed
- Validation: ✅ 8/8 passed
- Error Handling: ✅ 5/5 passed

### Integration Tests
- Victim Flow: ✅ 5/5 passed
- Contributor Flow: ⚠️ 3/4 passed
- Admin Flow: ✅ 4/4 passed

### Frontend Tests
- Dashboard Loading: ✅ Pass
- Form Submission: ✅ Pass
- Token Management: ✅ Pass
- Logout: ✅ Pass

## Issues Found

### Critical
- None

### High
- Distribution list slow to load (investigate pagination)

### Medium
- UI improvement: Add loading spinner on submission

### Low
- Typo in error message (user -> User)

## Performance Results
- Average API response: 120ms
- Longest response: 450ms (admin logs with 100 entries)
- Database query avg: 50ms

## Recommendations
1. Implement pagination for large datasets
2. Add request timeout handling
3. Cache frequently accessed data
```

---

## Conclusion

This testing guide covers:
✅ Unit tests for authentication and authorization  
✅ Integration tests for complete user flows  
✅ API endpoint testing with cURL  
✅ Frontend manual testing checklist  
✅ Performance testing with Artillery  
✅ CI/CD integration with GitHub Actions  
✅ Debugging and troubleshooting notes  

**Next Step**: Run the test suite and fix any issues before deploying to production.
