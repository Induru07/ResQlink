# Victim Dashboard Testing Guide 🧪

## Quick Start
1. **Backend**: `cd Backend && npm start` (runs on http://localhost:5000)
2. **Frontend**: Open another terminal and `cd Frontend && python -m http.server 8080`
3. **Dashboard**: Open http://localhost:8080/src/pages/victimDashboard.html

## Test Credentials
```
Email: testuser@example.com
Password: password123
```

---

## Test Case 1: Form Submission & Auto-Redirect ✅

**Objective**: Verify that submitting the needs form auto-redirects to requests tab

### Steps:
1. Login to dashboard
2. Click "My Needs" tab (should already be active)
3. Select at least 2-3 relief items from checkboxes (e.g., ☐ Food, ☐ Water, ☐ Medicine)
4. Optionally add special conditions (select Medical Support if available)
5. Add description: "Emergency assistance needed"
6. Click **"Update My Needs"** button (blue button)

### Expected Results:
- ✅ Success message appears: "✅ Request submitted successfully! Switching to your requests..."
- ✅ Dashboard stays on needs tab for 1.5 seconds
- ✅ Message disappears
- ✅ Automatically switches to **"My Requests"** tab
- ✅ Your request appears in the list with all details

### What You Should See:
```
📦 Your Relief Request

🎨 Status: Pending
📦 Items Needed:
   • Food
   • Water
   • Medicine

⚕️ Special Conditions: Medical support may be needed

📝 Additional Details: Emergency assistance needed

📅 Submitted: 2024-01-15 at 2:30 PM
🔄 Last Updated: 2024-01-15 at 2:30 PM

[✏️ Edit Request] [📊 View Status]
```

---

## Test Case 2: Action Button - Edit Request ✏️

**Objective**: Verify "Edit Request" button navigates to My Needs tab

### Steps:
1. Complete Test Case 1 (or find existing request)
2. In "My Requests" tab, look for **"✏️ Edit Request"** button
3. Click the button

### Expected Results:
- ✅ Tab immediately switches to "My Needs" tab
- ✅ Form is pre-filled with your previous selections
- ✅ You can modify items and description
- ✅ Button at bottom reads "Update My Needs"

---

## Test Case 3: Action Button - View Status 📊

**Objective**: Verify "View Status" button navigates to Status Updates tab

### Steps:
1. In "My Requests" tab
2. Look for **"📊 View Status"** button
3. Click the button

### Expected Results:
- ✅ Tab immediately switches to "Status Updates" tab
- ✅ Status timeline is displayed with emoji icons
- ✅ Shows status progression (Created → Received → Processing → Distribution → Completed)
- ✅ Example display:
```
📋 Created - Your request has been received and logged
Date: 2024-01-15 at 2:30 PM

✅ Received - Request acknowledged by admin
Responded by: Admin Dashboard
Date: 2024-01-15 at 2:35 PM

⚙️ Processing - Your request is being processed
Date: 2024-01-15 at 2:45 PM
```

---

## Test Case 4: Tab Navigation (Manual)

**Objective**: Verify all tabs work and display correct content

### Tabs to Test:

#### Tab 1: My Needs 📝
- Checkboxes for relief items
- Text fields for special conditions
- Large text area for additional details
- **"Update My Needs"** button

#### Tab 2: My Requests 📦
- Current relief requests displayed
- Status badges showing request state
- Items, conditions, and descriptions listed
- **"Edit Request"** and **"View Status"** action buttons

#### Tab 3: Status Updates 🔄
- Timeline view of request progression
- Emoji indicators for each status
- Timestamps for each update
- Respondent information if applicable

### Expected Behavior:
- ✅ Clicking any tab button immediately shows that tab's content
- ✅ Only one tab is active at a time (active tab is highlighted in blue)
- ✅ Tab content fades in smoothly
- ✅ Scrolling works within each tab

---

## Test Case 5: Status Badges & Priority Levels

**Objective**: Verify status badges display correctly with proper colors

### Steps:
1. Look at requests in "My Requests" tab
2. Check the status badges next to request titles

### Expected Status Badge Colors:
- 🟤 **Created** - Dark gray
- 🟡 **Pending** - Orange/Yellow
- 🔵 **Received** - Light blue
- 🔵 **In Progress** - Blue
- 🔵 **In Distribution** - Cyan
- 🟢 **Completed** - Green
- 🟢 **Resolved** - Green

### Priority Color Coding in Request Cards:
- 🔴 **CRITICAL** - Red left border, light red background
- 🟠 **HIGH** - Orange left border, orange tint background
- 🟡 **MODERATE** - Yellow left border, light yellow background

---

## Test Case 6: Emergency SOS Button 🚨

**Objective**: Verify emergency functionality

### Steps:
1. Look at the red **"🚨 EMERGENCY SOS"** button at top of page
2. Click it (do NOT do this in production!)

### Expected Results:
- ✅ Button changes to display a loading state briefly
- ✅ Success message appears: "Emergency alert sent to admin"
- ✅ Admin receives notification in admin dashboard
- ✅ Button returns to normal state

---

## Test Case 7: Responsive Design

**Objective**: Verify dashboard works on different screen sizes

### Desktop (1920px):
- [ ] All tabs visible at once
- [ ] Buttons properly spaced
- [ ] Full request details showing

### Tablet (768px):
- [ ] Tabs stack properly if needed
- [ ] Content readable
- [ ] Buttons easily clickable

### Mobile (375px):
- [ ] Single column layout
- [ ] Tabs may scroll horizontally
- [ ] Buttons full width or properly sized
- [ ] Text readable without zooming

---

## Test Case 8: Data Persistence

**Objective**: Verify requests persist after page refresh

### Steps:
1. Submit a request (Test Case 1)
2. Refresh the page (F5 or Ctrl+R)
3. Login again if needed

### Expected Results:
- ✅ Previous requests still appear in "My Requests" tab
- ✅ Status timeline is preserved
- ✅ No data loss

---

## Test Case 9: Multiple Requests

**Objective**: Verify multiple requests display correctly

### Steps:
1. Submit first request with Food + Water
2. Go to "My Needs", change selections to Medicine + Shelter
3. Submit second request
4. View "My Requests" tab

### Expected Results:
- ✅ Both requests appear in list
- ✅ Each has separate status tracking
- ✅ Action buttons work for each request
- ✅ You can edit individual requests

---

## Test Case 10: Logout Functionality

**Objective**: Verify logout clears session and redirects properly

### Steps:
1. Click **"Logout"** button (usually top right)
2. Observe redirect

### Expected Results:
- ✅ localStorage is cleared (token removed)
- ✅ Redirects to login page
- ✅ Cannot access dashboard via browser back button
- ✅ If you try to access dashboard directly, redirects to login

---

## Browser Console Checks 🔧

Open Developer Tools (F12) → Console tab and verify:

### NO ERRORS - Check for:
- ❌ Red error messages about CORS
- ❌ 404 errors for API endpoints
- ❌ Undefined variables or functions
- ❌ Network errors

### EXPECTED LOGS:
- ✅ "Dashboard loaded successfully"
- ✅ "Token found in localStorage"
- ✅ "Request submitted successfully"
- ✅ API responses logged (check Network tab)

---

## Network Tab Checks 🌐

1. Open Developer Tools (F12) → Network tab
2. Refresh page
3. Submit a request
4. Look for these API calls:

### Expected Requests:
1. **GET** `/Backend/routes/victimRoutes.js` - Load routes (200)
2. **POST** `/api/victim/*/checkNeeds` - Load victim needs (200)
3. **POST** `/api/victim/needs` - Submit request (201)
4. **GET** `/api/victim/requests` - Fetch requests (200)
5. **GET** `/api/victim/status` - Fetch status updates (200)

### Check Status Codes:
- ✅ 200 = success
- ✅ 201 = created
- ❌ 401 = unauthorized (check token)
- ❌ 403 = forbidden (check permissions)
- ❌ 500 = server error (check backend logs)

---

## Browser Compatibility

Test in:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if Mac available)
- [ ] Edge

---

## Success Criteria ✅

Dashboard is working if:

1. ✅ Can login and load dashboard
2. ✅ Form submission works
3. ✅ Auto-redirect to requests tab works (1.5s delay)
4. ✅ Request appears in history with all details
5. ✅ Action buttons navigate to correct tabs
6. ✅ Status timeline displays with emojis and dates
7. ✅ Tab switching is smooth and responsive
8. ✅ No console errors
9. ✅ No network errors
10. ✅ Logout clears session properly

---

## Troubleshooting 🔧

### Issue: "Error: Not allowed by CORS"
**Solution**: Check Backend/server.js CORS setting is in development mode
```bash
# In Backend/server.js, verify:
const NODE_ENV = process.env.NODE_ENV || 'development';
# Should allow localhost in development
```

### Issue: "Unauthorized" (401 error)
**Solution**: 
1. Check token is stored in localStorage
2. Verify token is being sent in Authorization header
3. Try logging in again

### Issue: Request doesn't appear after submit
**Solution**:
1. Check backend console for errors
2. Verify MongoDB connection is active
3. Check API response in Network tab shows 201 status
4. Try refreshing page to see if data persists

### Issue: Tabs not switching
**Solution**:
1. Open Console (F12)
2. Type: `switchTab('requests')` and press Enter
3. If tab switches, there's a JavaScript issue
4. Check for typos in HTML data-tab attributes

### Issue: CSS not loading properly
**Solution**:
1. Hard refresh browser (Shift+F5 or Ctrl+Shift+R)
2. Clear browser cache
3. Check Network tab for CSS loading errors

---

## Performance Tips 📈

To optimize dashboard performance:

1. **Local Storage**: Token stored locally - no re-login for 7 days
2. **Pagination**: Consider adding for requests if list grows large
3. **Caching**: Implement request list caching to reduce API calls
4. **Lazy Loading**: Status timeline loads on-demand when tab clicked

---

## Next Steps 🚀

After successful testing:
1. Test with other user roles (contributor, admin)
2. Test integration with notification system
3. Deploy to production server
4. Monitor performance in production
5. Implement Phase 4 features (refresh tokens, rate limiting)

---

## Questions or Issues?

If you encounter any problems:
1. Check browser console for errors
2. Check backend server logs
3. Verify MongoDB is running
4. Verify backend is on port 5000
5. Verify frontend is accessible at port 8080

Good luck testing! 🎉
