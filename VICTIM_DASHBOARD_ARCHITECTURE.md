# 🎯 Victim Dashboard - User Flow & Architecture

## 📊 Dashboard Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       VICTIM DASHBOARD                          │
│              http://localhost:8080/victimDashboard.html         │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
           ┌──────────┐ ┌──────────┐ ┌──────────────┐
           │ MY NEEDS │ │MY REQUESTS│ │STATUS UPDATE │
           │   📝     │ │   📦      │ │    🔄       │
           └──────────┘ └──────────┘ └──────────────┘
               │              │              │
               ▼              ▼              ▼
        [Select Items]  [View Requests] [See Timeline]
        [Add Details]   [Edit/Delete]   [Track Status]
        [Submit Form]   [Action BTN]    [Timestamps]
```

---

## 🔄 Form Submission Flow

```
USER FILLS FORM
    │
    ├─ Select Relief Items (Checkboxes)
    ├─ Add Special Conditions (Dropdown)
    ├─ Add Description (Text Area)
    │
    ▼
CLICK "Update My Needs" BUTTON
    │
    ▼
FORM VALIDATION
    │
    ├─ ✓ Items selected?
    ├─ ✓ Description provided?
    ├─ ✓ No API errors?
    │
    ▼
SUBMIT TO API: POST /api/victim/needs
    │
    ├─ Headers:
    │  ├─ Authorization: Bearer <JWT_TOKEN>
    │  └─ Content-Type: application/json
    │
    ├─ Body:
    │  ├─ itemsNeeded: [...]
    │  ├─ specialConditions: [...]
    │  └─ additionalDetails: "..."


    │
    ▼
API RESPONSE (201 Created)
    │
    ├─ Success Response:
    │  ├─ { success: true }
    │  ├─ { message: "Request submitted successfully" }
    │  └─ { data: { requestId, timestamp } }
    │
    ▼
SHOW SUCCESS MESSAGE ✅
    │
    ├─ "✅ Request submitted successfully!"
    ├─ "Switching to your requests..."
    │
    ▼
WAIT 1.5 SECONDS
    │
    ▼
AUTO-SWITCH TAB
    │
    ├─ Hide active tab
    ├─ Remove active class from buttons
    ├─ Show "My Requests" tab
    ├─ Add active class to "My Requests" button
    ├─ Trigger fade-in animation (300ms)
    │
    ▼
LOAD REQUESTS
    │
    ├─ API: GET /api/victim/requests
    ├─ Parse response data
    ├─ Build request cards with:
    │  ├─ Status badge 🎨
    │  ├─ Items list 📦
    │  ├─ Special conditions ⚕️
    │  ├─ Description 📝
    │  ├─ Timestamps 📅 🔄
    │  ├─ Edit button ✏️
    │  └─ View Status button 📊
    │
    ▼
DISPLAY REQUEST IN "MY REQUESTS" TAB
    │
    ▼
✅ FLOW COMPLETE - USER SEES THEIR REQUEST
```

---

## 🎯 Action Button Navigation Flow

```
USER IN "MY REQUESTS" TAB
    │
    ├─ Sees request card
    ├─ Sees two action buttons:
    │  ├─ "✏️ Edit Request"
    │  └─ "📊 View Status"
    │
    ▼
[SCENARIO 1: EDIT REQUEST]
    │
    ├─ Click "✏️ Edit Request" button
    │
    ▼
    ├─ Call switchTab('needs')
    │
    ├─ Hide current tab (My Requests)
    ├─ Show "My Needs" tab
    ├─ Load form with previous data
    ├─ Load needs from API
    │
    ▼
    ├─ Fade-in "My Needs" tab (300ms)
    │
    ▼
    ├─ User can modify form and resubmit
    │
    ▼
    └─ Auto-redirect to "My Requests" again

[SCENARIO 2: VIEW STATUS]
    │
    ├─ Click "📊 View Status" button
    │
    ▼
    ├─ Call switchTab('status')
    │
    ├─ Hide current tab (My Requests)
    ├─ Show "Status Updates" tab
    ├─ Load status timeline from API
    │
    ▼
    ├─ Load status data:
    │  ├─ 📋 Created [date/time]
    │  ├─ ✅ Received [date/time]
    │  ├─ ⚙️ Processing [date/time]
    │  ├─ 🚚 Distribution [date/time]
    │  ├─ 🎉 Completed [date/time]
    │  └─ ✨ Resolved [date/time]
    │
    ▼
    ├─ Fade-in "Status Updates" tab (300ms)
    │
    ▼
    ├─ Display timeline with emojis and dates
    │
    ▼
    └─ User can see request progression
```

---

## 🔐 Authentication Flow

```
LOGIN PAGE
    │
    ├─ User enters email & password
    ├─ Submit to API: POST /api/victim/login
    │
    ▼
BACKEND VALIDATION
    │
    ├─ Check email exists
    ├─ Check password matches (Bcrypt)
    ├─ Generate JWT token
    │  ├─ { userId, role, email, victimId }
    │  ├─ Expiration: 7 days
    │  └─ Secret: process.env.JWT_SECRET
    │
    ▼
RETURN RESPONSE
    │
    ├─ { success: true }
    ├─ { token: "eyJhbGciOiJIUzI1NiI..." }
    ├─ { user: { id, name, email, victimId, role } }
    │
    ▼
STORE IN LOCAL STORAGE
    │
    ├─ localStorage.setItem('token', token)
    ├─ localStorage.setItem('user', JSON.stringify(user))
    ├─ localStorage.setItem('userRole', 'victim')
    │
    ▼
REDIRECT TO DASHBOARD
    │
    ├─ window.location.href = '/victimDashboard.html'
    │
    ▼
DASHBOARD LOADS
    │
    ├─ Check for token in localStorage
    ├─ Verify token format
    ├─ Verify role is 'victim'
    ├─ Render dashboard UI
    │
    ▼
✅ DASHBOARD READY
    │
    └─ All subsequent API calls send token in header:
       Authorization: Bearer <TOKEN>
```

---

## 📱 Tab Switching Architecture

```
HTML STRUCTURE
    │
    ├─ Button: "My Needs"
    │  └─ data-tab="needs"
    │
    ├─ Button: "My Requests"
    │  └─ data-tab="requests"
    │
    ├─ Button: "Status Updates"
    │  └─ data-tab="status"
    │
    │
    ├─ Div: Tab Content "needs"
    │  └─ id="needs"
    │
    ├─ Div: Tab Content "requests"
    │  └─ id="requests"
    │
    └─ Div: Tab Content "status"
       └─ id="status"


JAVASCRIPT FUNCTION: switchTab(tabName)
    │
    ├─ Find all tabs: document.querySelectorAll('.tab-content')
    ├─ Find all buttons: document.querySelectorAll('.tab-btn')
    │
    ├─ Loop through tabs:
    │  └─ Remove class 'active' from each
    │
    ├─ Loop through buttons:
    │  └─ Remove class 'active' from each
    │
    ├─ Find selected tab: document.getElementById(tabName)
    ├─ Find selected button: querySelector(`[data-tab="${tabName}"]`)
    │
    ├─ Add 'active' class to selected tab
    ├─ Add 'active' class to selected button
    │
    ├─ Load data for selected tab:
    │  ├─ if (tabName === 'needs') loadNeeds()
    │  ├─ if (tabName === 'requests') loadRequests()
    │  └─ if (tabName === 'status') loadStatus()
    │
    └─ CSS handles fade-in animation


CSS CLASSES
    │
    ├─ .tab-btn.active
    │  ├─ background: #667eea (blue)
    │  ├─ color: white
    │  ├─ border-bottom: 3px solid #667eea
    │  └─ box-shadow: 0 2px 8px rgba(102,126,234,0.2)
    │
    ├─ .tab-content.active
    │  ├─ display: block
    │  └─ animation: fadeIn 0.3s ease-in
    │
    └─ @keyframes fadeIn
       ├─ from { opacity: 0; }
       └─ to { opacity: 1; }
```

---

## 📊 Data Flow Diagram

```
FRONTEND         API CALLS         BACKEND         DATABASE
   │                 │                 │                │
   │    Login Form   │                 │                │
   ├──────POST────────>                │                │
   │   /login         │                 │                │
   │                  │       Check Email               │
   │                  ├──────SELECT──────>              │
   │                  │     FROM users    │              │
   │                  │    WHERE email=X  │              │
   │                  │<─────Row Data─────┤              │
   │                  │                   │              │
   │                  │ Validate Password │              │
   │                  │ & Generate JWT    │              │
   │                  │                   │              │
   │    JWT Token     │                   │              │
   │<──────Response───┤                   │              │
   │                  │                   │              │
   │  Store in        │                   │              │
   │  localStorage    │                   │              │
   │                  │                   │              │
   │   Dashboard      │                   │              │
   │   Page Loads     │                   │              │
   │                  │                   │              │
   │  Load Requests   │                   │              │
   ├──────GET────────>                    │              │
   │  /victims/requests
   │  [Header: Bearer JWT]
   │                  │    Verify JWT     │              │
   │                  │    Check Role     │              │
   │                  │    Query Requests │              │
   │                  ├──────SELECT──────>              │
   │                  │   FROM requests   │              │
   │                  │   WHERE victimId=X
   │                  │<─────Array Data───┤              │
   │                  │                   │              │
   │  Request Array   │                   │              │
   │<──────Response───┤                   │              │
   │                  │                   │              │
   │  Parse & Display │                   │              │
   │  Request Cards   │                   │              │
   │  with Details    │                   │              │
   │                  │                   │              │
   │  Load Status     │                   │              │
   ├──────GET────────>                    │              │
   │  /victims/status │                   │              │
   │  [Header: Bearer JWT]
   │                  │    Query Status   │              │
   │                  ├──────SELECT──────>              │
   │                  │   FROM status_    │              │
   │                  │   updates WHERE   │              │
   │                  │   requestId=X     │              │
   │                  │<─────Array Data───┤              │
   │                  │                   │              │
   │  Status Array    │                   │              │
   │<──────Response───┤                   │              │
   │                  │                   │              │
   │  Parse & Display │                   │              │
   │  Timeline with   │                   │              │
   │  Emojis & Dates  │                   │              │
   │                  │                   │              │
   ▼                  ▼                   ▼              ▼
```

---

## 🎨 CSS Styling Cascade

```
GLOBAL STYLES
    │
    ├─ Body: Arial, sans-serif, #f5f5f5 background
    │
    ├─ Container: max-width 1200px, margin: auto
    │
    └─ Links: no text-decoration, blue color

TAB SYSTEM
    │
    ├─ .dashboard-tabs (Flex container)
    │  ├─ display: flex
    │  ├─ gap: 10px
    │  ├─ border-bottom: 2px solid #ddd
    │  └─ flex-wrap: wrap
    │
    ├─ .tab-btn (Individual button)
    │  ├─ padding: 12px 24px
    │  ├─ background: #f8f9fa
    │  ├─ border: none
    │  ├─ cursor: pointer
    │  ├─ font-weight: 600
    │  ├─ border-bottom: 3px solid transparent
    │  └─ transition: all 0.3s
    │
    ├─ .tab-btn.active (Active state)
    │  ├─ background: #667eea
    │  ├─ color: white
    │  ├─ border-bottom-color: #667eea
    │  └─ box-shadow: 0 2px 8px rgba(102,126,234,0.2)
    │
    └─ .tab-btn:hover
       ├─ background: #e9ecef
       └─ cursor: pointer

TAB CONTENT
    │
    ├─ .tab-content (All tabs, hidden by default)
    │  ├─ display: none
    │  └─ animation: fadeIn 0.3s ease-in
    │
    └─ .tab-content.active (Visible when active)
       └─ display: block

REQUEST CARDS
    │
    ├─ .request-item (Base card)
    │  ├─ background: #f8f9fa
    │  ├─ padding: 15px
    │  ├─ border-radius: 6px
    │  ├─ margin-bottom: 12px
    │  ├─ border-left: 4px solid #667eea
    │  └─ Hover: raises slightly
    │
    ├─ .request-item.critical (Priority: Critical)
    │  ├─ border-left-color: #dc3545 (red)
    │  └─ background: rgba(220,53,69,0.05)
    │
    ├─ .request-item.high (Priority: High)
    │  ├─ border-left-color: #ff8c00 (orange)
    │  └─ background: rgba(255,140,0,0.05)
    │
    └─ .request-item.moderate (Priority: Moderate)
       ├─ border-left-color: #ffc107 (yellow)
       └─ background: rgba(255,193,7,0.05)

BUTTONS
    │
    ├─ .btn (Primary button)
    │  ├─ padding: 12px 24px
    │  ├─ background: #667eea
    │  ├─ color: white
    │  ├─ border: none
    │  ├─ border-radius: 6px
    │  ├─ cursor: pointer
    │  ├─ font-weight: 600
    │  └─ transition: all 0.3s
    │
    ├─ .btn:hover (Hover effect)
    │  ├─ background: #5568d3
    │  ├─ transform: translateY(-2px) (move up)
    │  └─ box-shadow: 0 4px 12px rgba(102,126,234,0.3)
    │
    ├─ .emergency-btn (Emergency button)
    │  ├─ background: #dc3545 (red)
    │  ├─ padding: 15px 30px
    │  ├─ font-size: 18px
    │  ├─ font-weight: bold
    │  ├─ width: 100%
    │  └─ margin-bottom: 20px
    │
    └─ .emergency-btn:hover
       ├─ background: #c82333
       └─ transform: scale(1.02) (scale up)

STATUS BADGES
    │
    ├─ .status-badge (Base badge)
    │  ├─ display: inline-block
    │  ├─ padding: 6px 14px
    │  ├─ border-radius: 12px
    │  ├─ font-size: 13px
    │  ├─ font-weight: 600
    │  ├─ margin-left: 10px
    │  ├─ text-transform: uppercase
    │  └─ letter-spacing: 0.5px
    │
    ├─ .status-created → #e9ecef (dark gray)
    ├─ .status-pending → #fff3cd (yellow)
    ├─ .status-received → #cfe2ff (light blue)
    ├─ .status-in-process → #007bff + white (blue)
    ├─ .status-in-distribution → #0dcaf0 + white (cyan)
    ├─ .status-completed → #28a745 + white (green)
    └─ .status-resolved → #28a745 + white (green)

ALERTS
    │
    ├─ .alert (Base alert)
    │  ├─ padding: 12px 16px
    │  ├─ border-radius: 6px
    │  ├─ margin-bottom: 15px
    │  ├─ display: none
    │  └─ border-left: 4px solid
    │
    ├─ .alert.success (Success alert)
    │  ├─ background: #d4edda
    │  ├─ color: #155724
    │  ├─ border-left-color: #28a745
    │  └─ display: block
    │
    └─ .alert.error (Error alert)
       ├─ background: #f8d7da
       ├─ color: #721c24
       ├─ border-left-color: #dc3545
       └─ display: block
```

---

## 🔄 API Endpoint Reference

```
┌─────────────────────────────────────────────────────────┐
│            VICTIM DASHBOARD API ENDPOINTS                │
└─────────────────────────────────────────────────────────┘

1. POST /api/victim/checkNeeds
   ├─ Purpose: Load current victim needs/form data
   ├─ Headers: Authorization: Bearer <TOKEN>
   ├─ Request: { victimId: "..." }
   ├─ Response: { itemsNeeded: [...], specialConditions: [...] }
   └─ Used in: loadNeeds() function

2. POST /api/victim/needs
   ├─ Purpose: Submit/update relief request
   ├─ Headers: Authorization: Bearer <TOKEN>
   ├─ Request: {
   │   itemsNeeded: ["Food", "Water"],
   │   specialConditions: ["Medical"],
   │   additionalDetails: "..."
   │ }
   ├─ Response 201: { success: true, requestId: "..." }
   └─ Used in: setupFormSubmission() function

3. GET /api/victim/requests
   ├─ Purpose: Fetch all victim relief requests
   ├─ Headers: Authorization: Bearer <TOKEN>
   ├─ Request: None
   ├─ Response: [{
   │   _id: "...",
   │   itemsNeeded: [...],
   │   specialConditions: [...],
   │   urgency: "critical|high|moderate",
   │   status: "created|pending|received|processing|",
   │   timestamp: "2024-01-15T14:30:00Z",
   │   lastUpdated: "2024-01-15T14:35:00Z"
   │ }]
   └─ Used in: loadRequests() function

4. GET /api/victim/status
   ├─ Purpose: Fetch request status timeline
   ├─ Headers: Authorization: Bearer <TOKEN>
   ├─ Request: None
   ├─ Response: [{
   │   status: "created|received|processing|distribution|completed",
   │   timestamp: "2024-01-15T14:30:00Z",
   │   message: "...",
   │   respondedBy: "Admin Name" (optional)
   │ }]
   └─ Used in: loadStatus() function

5. POST /api/victim/emergency
   ├─ Purpose: Trigger emergency SOS alert
   ├─ Headers: Authorization: Bearer <TOKEN>
   ├─ Request: None
   ├─ Response: { success: true, message: "..." }
   └─ Used in: setupEmergencySOS() function
```

---

## 📋 Component Hierarchy

```
victimDashboard.html
│
├─ <head>
│  ├─ Meta tags (charset, viewport, etc.)
│  ├─ Title: "Victim Dashboard - ResQLink"
│  └─ <style> (Embedded CSS - all styling)
│
└─ <body>
   ├─ Header
   │  ├─ Logo/Title
   │  ├─ User Info
   │  └─ Logout Button
   │
   ├─ Emergency Button (Full Width)
   │
   ├─ Main Container
   │  │
   │  ├─ Tab Buttons
   │  │  ├─ Button: "My Needs" (active = blue)
   │  │  ├─ Button: "My Requests"
   │  │  └─ Button: "Status Updates"
   │  │
   │  ├─ Alert Container (for success/error messages)
   │  │
   │  ├─ TAB 1: My Needs (id="needs")
   │  │  ├─ Form Section
   │  │  ├─ Checkboxes (Relief Items)
   │  │  ├─ Dropdown (Special Conditions)
   │  │  ├─ Text Area (Details)
   │  │  └─ Button (Update My Needs)
   │  │
   │  ├─ TAB 2: My Requests (id="requests")
   │  │  ├─ Request Cards (generated dynamically)
   │  │  │  ├─ Status Badge
   │  │  │  ├─ Items List
   │  │  │  ├─ Special Conditions
   │  │  │  ├─ Description
   │  │  │  ├─ Timestamps
   │  │  │  ├─ Edit Request Button
   │  │  │  └─ View Status Button
   │  │  │
   │  │  └─ Empty State (if no requests)
   │  │
   │  └─ TAB 3: Status Updates (id="status")
   │     ├─ Timeline Container
   │     ├─ Status Items (generated dynamically)
   │     │  ├─ Emoji Icon
   │     │  ├─ Status Text
   │     │  ├─ Timestamp
   │     │  └─ Respondent Info
   │     │
   │     └─ Empty State (if no updates)
   │
   └─ <script>
      ├─ victimDashboard.js (External file)
      │
      ├─ Functions:
      │  ├─ switchTab(tabName)
      │  ├─ setupTabSwitching()
      │  ├─ setupFormSubmission()
      │  ├─ loadNeeds()
      │  ├─ loadRequests()
      │  ├─ loadStatus()
      │  ├─ showAlert(msg, type)
      │  ├─ setupLogout()
      │  ├─ setupEmergencySOS()
      │  └─ updateUIElements()
      │
      └─ Initialization:
         ├─ Check for token
         ├─ Verify role
         ├─ Setup event listeners
         └─ Load initial data
```

---

This architecture provides a clear, maintainable, and scalable dashboard for victim request management! 🎉
