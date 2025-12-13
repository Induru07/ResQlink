# ResQLink - System Architecture Documentation

## 1. System Overview

**ResQLink** is a comprehensive flood disaster management and relief coordination platform designed for Sri Lanka. The system connects flood victims, relief contributors, collection point managers, and distributors into a unified network for efficient disaster response and resource allocation.

### 1.1 Core Objectives
- Enable victims to register and request assistance
- Allow contributors to log donations and manage inventory
- Facilitate handover planning to collection points or direct to victims
- Provide real-time mapping of victims and collection points
- Track relief item distribution and impact metrics
- Send notifications to recipients about incoming handovers

---

## 2. Architecture Style

**Three-Tier Client-Server Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│              (HTML/CSS/JavaScript Frontend)                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API (HTTP/JSON)
┌──────────────────────────▼──────────────────────────────────┐
│                    Application Layer                         │
│              (Node.js/Express Backend)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ Mongoose ODM
┌──────────────────────────▼──────────────────────────────────┐
│                      Data Layer                              │
│                   (MongoDB Database)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### 3.1 Frontend
- **Core**: HTML5, CSS3, Vanilla JavaScript
- **Mapping**: Leaflet.js (OpenStreetMap)
- **Styling**: Custom CSS with responsive design
- **Icons**: FontAwesome 6.0
- **Key Features**:
  - Multi-language support (English, Sinhala, Tamil)
  - Responsive mobile-first design
  - Role-based navigation
  - LocalStorage for session management

### 3.2 Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database ODM**: Mongoose
- **Authentication**: JSON Web Tokens (JWT)
- **Security**: bcrypt (password hashing)
- **Environment**: dotenv
- **CORS**: cors middleware

### 3.3 Database
- **Database**: MongoDB (NoSQL document store)
- **Models**: 12 Mongoose schemas
- **Data Patterns**: Referenced and embedded documents

### 3.4 External Services
- **Maps**: OpenStreetMap tile servers
- **Marker Icons**: Leaflet Color Markers (GitHub CDN)

---

## 4. System Components

### 4.1 Backend Architecture

#### 4.1.1 Server Entry Point (`server.js`)
```javascript
Port: 5000 (default)
Middleware:
  - express.json()
  - CORS (configurable origins)
Routes:
  - /api/auth       → Authentication
  - /api/general    → Home/general
  - /api/map        → Map data
  - /api/needs      → Victim needs
  - /api/contributor → Contributor operations
Health Check: /health
```

#### 4.1.2 Database Configuration (`config/db.js`)
- Connection: Mongoose
- URI: `process.env.MONGO_URI`
- Error handling with process exit on failure

#### 4.1.3 Data Models (12 schemas)

**Victim System** (Split schema approach):
```
VictimAuth
├─ victimId (e.g., COL001, MTR002)
├─ fullName
├─ email (unique)
├─ password (hashed)
├─ district
└─ createdAt

VictimProfile
├─ victimId (ref)
├─ phone
├─ nationalID
├─ address
├─ familyMembers []
└─ location { latitude, longitude }

VictimNeeds
├─ victimId (ref)
├─ items { dryRations, cookedFood, water, clothes, medicine, infantCare, sanitaryItems }
├─ description
├─ status (Pending|In Progress|Fulfilled)
└─ requestDate
```

**Contributor System**:
```
Contributor
├─ contributorId (CON001, CON002...)
├─ name
├─ email (unique)
├─ password (hashed)
├─ phone
├─ contributorType (individual|organization|ngo|religious|corporate)
├─ verificationStatus (pending|verified|rejected)
├─ serviceAreas []
├─ hasVehicle / vehicleType / vehicleCapacity
├─ hasStorage / storageAddress / storageCapacity
├─ availableDays [] / availableHours {}
├─ totalCollections / totalDistributions
└─ lastActive

Collection
├─ collectionId (COLL0001, COLL0002...)
├─ contributorId (ref)
├─ items [{ category, itemName, quantity, unit, condition, expiryDate }]
├─ collectionDate
├─ collectionLocation { address, district, coordinates }
├─ donorName / donorPhone / donorEmail / isAnonymous
├─ status (collected|in-storage|partially-distributed|fully-distributed)
├─ handoverType (collection-point|victim)
├─ handoverRef (collectionPointId or victimId)
├─ handoverEta
├─ photos [] / notes
└─ createdAt / updatedAt

Inventory
├─ inventoryId (INV0001, INV0002...)
├─ contributorId (ref)
├─ category
├─ itemName
├─ currentQuantity
├─ unit
├─ minimumThreshold
├─ condition (new|good|usable|expired)
├─ expiryDate
├─ storageLocation
├─ isLowStock / isExpiringSoon
├─ sourceCollectionIds []
├─ lastRestocked
└─ createdAt / updatedAt

Distribution
├─ distributionId (DIST0001, DIST0002...)
├─ contributorId (ref)
├─ items [{ inventoryId, category, itemName, quantityDistributed, unit }]
├─ recipientType (victim|relief-center|community|other)
├─ recipientName / recipientPhone / recipientAddress
├─ distributionDate
├─ deliveryMethod (direct-delivery|pickup|relief-center)
├─ vehicleUsed / driverName
├─ familiesBenefited / individualsBenefited
├─ photosBeforeAfter []
├─ recipientSignature
├─ status (pending|in-transit|delivered|confirmed)
├─ notes
└─ createdAt / updatedAt
```

**Collection Point System**:
```
CollectionPoint
├─ collectionPointId (CP001, CP002...)
├─ name
├─ managedByContributorId (ref)
├─ contactPhone / contactEmail
├─ address
├─ district
├─ coordinates { latitude, longitude }
├─ hours
├─ capacityNote
├─ notes
├─ isActive
└─ createdAt / updatedAt
```

**Notification System**:
```
Notification
├─ targetType (victim|collection-point)
├─ targetRef (victimId or collectionPointId)
├─ title
├─ message
├─ items [{ itemName, quantity, unit, category }]
├─ contributorId / contributorName / contributorPhone / contributorEmail
├─ status (pending|delivered|cancelled)
└─ createdAt
```

**Admin & Supplier** (Legacy/future):
```
Admin
├─ name
├─ email
└─ password

Supplier
├─ fullName
├─ email
├─ password
└─ phone
```

#### 4.1.4 API Routes

**Authentication Routes** (`/api/auth`):
```
POST   /victim/register        → Create victim account
POST   /victim/login           → Victim authentication
GET    /victim/profile/:id     → Get victim full profile
GET    /victim/search          → Search victims (autocomplete)
POST   /supplier/register      → Create supplier account
POST   /supplier/login         → Supplier authentication
POST   /admin/register         → Create admin account
POST   /admin/login            → Admin authentication
```

**Contributor Routes** (`/api/contributor`):
```
POST   /register                         → Contributor registration
POST   /login                            → Contributor authentication
GET    /profile/:contributorId           → Get contributor profile
PUT    /profile/:contributorId           → Update contributor profile

POST   /collection                       → Log new collection (with handover)
GET    /collection/:contributorId        → Get contributor's collections
PUT    /collection/:collectionId/status  → Update collection status

GET    /inventory/:contributorId         → Get inventory
PUT    /inventory/:inventoryId           → Update inventory item

POST   /distribution                     → Log distribution
GET    /distribution/:contributorId      → Get distributions
PUT    /distribution/:distributionId/status → Update distribution status

GET    /stats/:contributorId             → Get contributor statistics

POST   /collection-point                 → Create collection point
GET    /collection-points                → List all points (+ ?district filter)
GET    /collection-points/:contributorId → Get contributor's points

GET    /notifications/collection-point/:id → List point notifications
GET    /notifications/victim/:victimId     → List victim notifications
```

**Needs Routes** (`/api/needs`):
```
POST   /                 → Create needs request
GET    /:victimId        → Get needs for victim
PUT    /:victimId        → Update needs
DELETE /:victimId        → Delete needs request
```

**Map Routes** (`/api/map`):
```
GET    /data             → Get map data (victims + collection points)
```

**General Routes** (`/api/general`):
```
GET    /home-stats       → System-wide statistics
```

### 4.2 Frontend Architecture

#### 4.2.1 Page Structure
```
Frontend/
├── index.html                    → Landing page
├── about.html                    → Team information
├── datamap.html                  → Interactive map (victims & points)
│
├── victimSignIn.html             → Victim login
├── victimSignUp.html             → Victim registration
├── victimStatus.html             → Victim dashboard (status + notifications)
├── victimRequests.html           → Victim needs requests
│
├── contributorSignIn.html        → Contributor login
├── contributorSignUp.html        → Contributor registration
├── contributorLog.html           → Contributor dashboard (full workflow)
├── contributor.html              → Legacy contributor page
│
├── css/
│   ├── style.css                 → Global styles
│   └── contributor.css           → Contributor-specific styles
│
├── js/
│   ├── script.js                 → Global utilities (auth menu, footer, language)
│   ├── config.js                 → API_BASE configuration
│   ├── datamap.js                → Map functionality
│   ├── contributor.js            → Legacy contributor JS
│   └── contributorDashboard.js   → Full dashboard logic
│
└── images/                       → Banners, team photos
```

#### 4.2.2 Key JavaScript Modules

**Global Script** (`script.js`):
- Language selection popup (EN/SI/TA)
- Dynamic footer injection
- Authentication menu (role-based)
- Role-based navigation tabs
- Mobile hamburger menu
- LocalStorage session management

**Config** (`config.js`):
```javascript
window.API_BASE = isProd 
  ? 'https://api.resqlink.org' 
  : 'http://localhost:5000';
```

**Data Map** (`datamap.js`):
- Leaflet map initialization
- Victim markers (red) with SOS info
- Collection point markers (green) with contact/hours
- Toggle buttons (Show Victims / Show Collection Points)
- Layer management
- Popup formatting

**Contributor Dashboard** (`contributorDashboard.js`):
- Load stats (collections, stock, distributions, families helped)
- Inventory management
- Collection logging with handover target selection
- Distribution logging with item selection
- Collection point creation
- Victim ID autocomplete
- History tables
- Tab switching

#### 4.2.3 UI/UX Features

**Multi-language Support**:
```html
<span class="lang-en">English Text</span>
<span class="lang-si">සිංහල පෙළ</span>
<span class="lang-ta">தமிழ் உரை</span>
```
- Language stored in `localStorage.siteLang`
- Body classes: `.sinhala-mode`, `.tamil-mode`

**Role-Based Navigation**:
- Victims see: Requests, My Status
- Contributors see: Contributor Log
- Dynamic auth dropdown (Sign In/Out)

**Responsive Design**:
- Mobile-first approach
- Hamburger menu for small screens
- Flexible grids
- Touch-friendly controls

---

## 5. Data Flow & Business Logic

### 5.1 User Registration & Authentication

**Victim Flow**:
```
1. User fills victimSignUp.html form
2. Frontend POST /api/auth/victim/register
   {
     name, email, password, phone, district,
     nationalID, address, familyMembers, location
   }
3. Backend:
   - Generates victimId (district prefix + sequential)
   - Hashes password (bcrypt)
   - Creates VictimAuth doc
   - Creates VictimProfile doc
4. Returns { msg, victimId, authId }
5. User redirects to victimSignIn.html
```

**Contributor Flow**:
```
1. User fills contributorSignUp.html form
2. Frontend POST /api/contributor/register
   {
     name, email, password, phone, contributorType,
     serviceAreas, hasVehicle, vehicleType, etc.
   }
3. Backend:
   - Generates contributorId (CON001, CON002...)
   - Hashes password
   - Creates Contributor doc
4. Returns { msg, contributorId, id }
5. User redirects to contributorSignIn.html
```

**Login Flow**:
```
1. User submits credentials
2. Backend verifies password (bcrypt.compare)
3. Generates JWT token
4. Frontend stores:
   - localStorage.token
   - localStorage.user (JSON)
   - localStorage.userRole
   - localStorage.victimId or contributorId
5. Redirects to role-specific dashboard
```

### 5.2 Collection & Handover Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Contributor logs collection in contributorLog.html       │
│    - Fills items (category, name, quantity, unit)           │
│    - Chooses handover target:                               │
│      • Drop at Collection Point → selects from dropdown     │
│      • Deliver to Victim → enters/autocompletes victimId    │
│    - Sets handover ETA (optional)                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Frontend POST /api/contributor/collection                │
│    {                                                         │
│      contributorId, items, collectionLocation,              │
│      handoverType, handoverRef, handoverEta                 │
│    }                                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Backend validation:                                      │
│    - If handoverType = 'collection-point':                  │
│      → Verify handoverRef exists in CollectionPoint         │
│    - If handoverType = 'victim':                            │
│      → Verify handoverRef exists in VictimAuth              │
│    - Returns 400 if not found                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Backend creates Collection document                      │
│    - Generates collectionId (COLL0001, COLL0002...)         │
│    - Stores handover details                                │
│    - Updates Contributor.totalCollections                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Backend updates Inventory                                │
│    - For each item:                                         │
│      • If exists: increment quantity, add collectionId      │
│      • If new: create inventory entry                       │
│      • Calculate low-stock alerts                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Backend creates Notification                             │
│    - targetType: 'victim' or 'collection-point'             │
│    - targetRef: victimId or collectionPointId               │
│    - items: list of collected items                         │
│    - contributor contact info                               │
│    - status: 'pending'                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Target receives notification                             │
│    - Victim: views in victimStatus.html                     │
│    - Collection Point Manager: views in contributorLog.html │
│      (Overview tab → Incoming Handovers)                    │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Distribution Flow

```
1. Contributor selects items from inventory
2. Fills recipient details (type, name, address)
3. POST /api/contributor/distribution
4. Backend:
   - Creates Distribution document
   - Deducts quantities from Inventory
   - Updates low-stock alerts
   - Updates contributor stats
5. Returns distributionId
```

### 5.4 Map Data Flow

```
1. Frontend loads datamap.html
2. JavaScript fetches GET /api/map/data
3. Backend:
   - Queries VictimAuth, VictimProfile, VictimNeeds
   - Queries CollectionPoint (isActive: true)
   - Builds victim array with coordinates + needs
   - Builds collection points array with contact/hours
   - Applies jitter to prevent marker overlap
4. Returns { victims: [...], collections: [...] }
5. Frontend renders:
   - Red markers (victims) → victimLayer
   - Green markers (collection points) → collectionLayer
6. User toggles visibility with buttons
```

### 5.5 Notification Flow

```
Trigger: Collection created with handover target

1. Backend queries Contributor for contact info
2. Creates Notification document:
   {
     targetType: 'victim' or 'collection-point',
     targetRef: 'VIC123' or 'CP001',
     title: 'Incoming Relief Items',
     message: 'Contributor XYZ plans a handover',
     items: [{ itemName, quantity, unit, category }],
     contributorName, contributorPhone, contributorEmail,
     status: 'pending'
   }
3. Target queries notifications:
   - Victim: GET /api/contributor/notifications/victim/:victimId
   - Collection Point: GET /api/contributor/notifications/collection-point/:id
4. Frontend displays in:
   - victimStatus.html → "Incoming Handovers" section
   - contributorLog.html → "Incoming Handovers to My Points"
```

---

## 6. Security & Authentication

### 6.1 Password Security
- **Hashing**: bcrypt with salt rounds (10)
- **Storage**: Never stored in plain text
- **Validation**: bcrypt.compare() for login

### 6.2 JWT Authentication
```javascript
Token Payload:
{
  id: user._id,
  victimId/contributorId: 'VIC123' or 'CON001',
  role: 'victim' | 'contributor' | 'supplier' | 'admin'
}

Secret: process.env.JWT_SECRET
Storage: localStorage.token
Usage: Authorization header (future implementation)
```

### 6.3 CORS Configuration
```javascript
allowedOrigins: [
  process.env.CLIENT_URL,
  process.env.SIGNUP_URL
]
credentials: true
```

### 6.4 Environment Variables
```
MONGO_URI=mongodb://...
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
SIGNUP_URL=http://localhost:3000/signup
PORT=5000
```

### 6.5 Input Validation
- Required field checks in routes
- Enum validation in Mongoose schemas
- Email uniqueness constraints
- RegExp search validation
- handoverRef existence verification

---

## 7. State Management

### 7.1 Client-Side Storage
```javascript
localStorage.token           → JWT token
localStorage.user            → JSON user object
localStorage.userRole        → 'victim' | 'contributor' | etc.
localStorage.victimId        → 'VIC123'
localStorage.contributorId   → 'CON001'
localStorage.siteLang        → 'en' | 'si' | 'ta'
```

### 7.2 Session Management
- No server-side session store
- Stateless JWT-based authentication
- Client handles token expiration (future)

### 7.3 Database Indexing
```javascript
Indexes (via schema):
- victimId (unique)
- contributorId (unique)
- collectionId (unique)
- inventoryId (unique)
- distributionId (unique)
- collectionPointId (unique)
- email (unique for all user types)
```

---

## 8. Integration Points

### 8.1 External APIs
- **OpenStreetMap**: Tile server for map rendering
- **Leaflet CDN**: Mapping library
- **FontAwesome CDN**: Icon library
- **Leaflet Color Markers**: Custom marker icons (GitHub)

### 8.2 Future Integration Opportunities
- SMS gateway for notifications
- Email service (SendGrid, AWS SES)
- Government disaster APIs (DMC, Meteorology)
- Payment gateways for donations
- Google Maps (alternative)
- Cloud storage for photos (AWS S3, Cloudinary)

---

## 9. Deployment Architecture

### 9.1 Development Setup
```
Frontend: Static files served via file:// or local server
Backend: Node.js on localhost:5000
Database: MongoDB Atlas or local MongoDB
```

### 9.2 Production Recommendations
```
┌─────────────────────────────────────────────────────────────┐
│                         Users                                │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    CDN / Static Host                         │
│              (Netlify, Vercel, GitHub Pages)                 │
│                   Frontend Assets                            │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS API calls
┌──────────────────────────▼──────────────────────────────────┐
│                   Load Balancer / Proxy                      │
│                   (Nginx, AWS ALB)                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  Node.js Backend Cluster                     │
│                 (PM2, Docker, Kubernetes)                    │
│                  Heroku, AWS EC2, GCP                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   MongoDB Atlas                              │
│                 (Managed Cloud DB)                           │
│              Replica Set for HA                              │
└─────────────────────────────────────────────────────────────┘
```

### 9.3 Environment Configuration
```bash
# Development
API_BASE=http://localhost:5000

# Production
API_BASE=https://api.resqlink.org
```

---

## 10. Scalability Considerations

### 10.1 Database Optimization
- **Indexes**: victimId, contributorId, collectionId, email
- **Sharding**: District-based sharding for victims
- **Aggregation**: Pre-calculated stats in contributor documents
- **Caching**: Redis for map data (future)

### 10.2 API Performance
- **Pagination**: Limit queries (e.g., 20 victims in search)
- **Selective Fields**: `.select()` to reduce payload
- **Parallel Queries**: Promise.all() for independent data
- **Rate Limiting**: Express middleware (future)

### 10.3 Frontend Optimization
- **Lazy Loading**: Load map markers on demand
- **Debouncing**: Victim search autocomplete (250ms)
- **Layer Management**: Toggle visibility, not re-render
- **LocalStorage**: Cache user data, reduce API calls

---

## 11. Monitoring & Observability

### 11.1 Current Health Checks
```
GET /health → { status: 'ok' }
```

### 11.2 Recommended Additions
- **Logging**: Winston, Morgan for HTTP logs
- **Error Tracking**: Sentry, Rollbar
- **Performance**: New Relic, DataDog
- **Uptime Monitoring**: Pingdom, UptimeRobot
- **Database Monitoring**: MongoDB Atlas metrics

---

## 12. Testing Strategy

### 12.1 Recommended Test Pyramid
```
                    ▲
                   / \
                  /E2E\          (Selenium, Cypress)
                 /─────\
                /       \
               / Integration \   (Supertest, Mocha)
              /───────────────\
             /                 \
            /   Unit Tests      \  (Jest, Mocha/Chai)
           /─────────────────────\
```

### 12.2 Test Coverage Areas
- **Unit**: Mongoose models, helper functions, ID generators
- **Integration**: API endpoints, database operations
- **E2E**: User flows (signup → login → collection → notification)
- **Load**: Apache Bench, k6 for API stress testing

---

## 13. Error Handling

### 13.1 Backend Error Patterns
```javascript
try {
  // Operation
} catch (err) {
  console.error('Context:', err.message);
  res.status(500).json({ error: err.message });
}
```

### 13.2 Frontend Error Handling
```javascript
try {
  const res = await fetch(url);
  if (!res.ok) {
    const data = await res.json();
    showAlert(data.msg || 'Error', 'error');
  }
} catch (err) {
  showAlert('Cannot connect to server', 'error');
}
```

### 13.3 Validation Errors
```javascript
// Missing fields
if (!name || !email) {
  return res.status(400).json({ msg: 'Missing required fields' });
}

// Not found
if (!victim) {
  return res.status(404).json({ msg: 'Victim not found' });
}

// Duplicate
if (existing) {
  return res.status(400).json({ msg: 'Email already used' });
}
```

---

## 14. Data Consistency & Integrity

### 14.1 Referential Integrity
- **Foreign Keys**: victimId, contributorId (string refs, not ObjectId)
- **Orphan Prevention**: No cascade deletes (future: soft delete)
- **Validation**: Check existence before creating references

### 14.2 Inventory Synchronization
```
Collection → Adds to Inventory
Distribution → Deducts from Inventory
Low Stock Alert → Triggered on threshold
```

### 14.3 Notification Lifecycle
```
pending → (collection created)
delivered → (manual update, future)
cancelled → (handover cancelled, future)
```

---

## 15. Key Design Decisions

### 15.1 Split Schema for Victims
**Why**: Separate authentication, profile, and needs for flexible querying and security.

### 15.2 String IDs vs ObjectId
**Why**: Human-readable IDs (VIC123, CON001) for better UX and debugging.

### 15.3 Handover Planning vs Direct Distribution
**Why**: Allows contributors to plan logistics before actual delivery.

### 15.4 Notification Model
**Why**: Decoupled communication layer for future SMS/email integration.

### 15.5 Collection Points as First-Class Entities
**Why**: Enables drop-off infrastructure management and public visibility.

### 15.6 Embedded Items Arrays
**Why**: Items are not standalone entities; they belong to collections/distributions.

### 15.7 No Real-Time WebSockets
**Why**: Polling sufficient for current scale; WebSockets for future live updates.

---

## 16. Future Enhancements

### 16.1 Planned Features
- [ ] Real-time notifications (Socket.io)
- [ ] SMS/Email alerts (Twilio, SendGrid)
- [ ] Photo upload for collections/distributions
- [ ] QR code scanning for victim verification
- [ ] Admin dashboard with analytics
- [ ] Route optimization for distributors
- [ ] Mobile apps (React Native)
- [ ] Offline mode (PWA)
- [ ] Multi-tenant support for NGOs
- [ ] Volunteer management module
- [ ] Donation tracking (monetary)

### 16.2 Technical Debt
- [ ] Add API authentication middleware (JWT verification)
- [ ] Implement rate limiting
- [ ] Add input sanitization (XSS prevention)
- [ ] Migrate to TypeScript
- [ ] Add comprehensive logging
- [ ] Implement pagination for all list endpoints
- [ ] Add soft delete for data retention
- [ ] Optimize map markers (clustering)
- [ ] Add API versioning (/api/v1/)
- [ ] Implement background jobs (Bull, Agenda)

---

## 17. Glossary

| Term | Definition |
|------|------------|
| **Victim** | Flood-affected individual registered in the system |
| **Contributor** | Organization or individual donating relief items |
| **Collection** | Act of gathering donations from a source |
| **Distribution** | Delivery of relief items to recipients |
| **Collection Point** | Drop-off location managed by contributors |
| **Handover** | Planned transfer of items to victim or collection point |
| **Inventory** | Stock of items held by a contributor |
| **Needs** | List of required items submitted by a victim |
| **Notification** | Alert sent to victim or collection point about incoming items |

---

## 18. Contact & Support

**Project**: ResQLink - Flood Management System  
**Repository**: github.com/Induru07/ResQLink  
**Branch**: main-clone  
**Last Updated**: December 13, 2025

**Developers**:
- Adeesha W. G. I (Backend)
- Jayasinghe M. D. S. C (Frontend)
- Wickramarathna W. W. N. D.
- Rajapaksha W. T. D
- Abeykoon T. B

---

**End of System Architecture Document**
