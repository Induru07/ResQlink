# Page Navigation Guide

## All Available Pages

### Entry Point
- **index.html** (root) - Main homepage

### User Portals & Authentication

#### Victim Pages
- `src/pages/victimSignIn.html` - Victim login page
- `src/pages/victimSignUp.html` - Victim registration
- `src/pages/victimDashboard.html` - Victim dashboard (main dashboard)
- `src/pages/victimRequests.html` - View/manage requests
- `src/pages/victimStatus.html` - Check relief status

#### Contributor Pages
- `src/pages/contributorSignIn.html` - Contributor login
- `src/pages/contributorSignUp.html` - Contributor registration
- `src/pages/contributorLog.html` - Contribution log

#### Admin Pages
- `src/pages/adminSignIn.html` - Admin login
- `src/pages/adminDashboard.html` - Admin dashboard

#### Donor Pages
- `src/pages/donorDashboard.html` - Donor dashboard

### Public Pages
- `src/pages/index.html` - Alternative homepage
- `src/pages/about.html` - About page
- `src/pages/datamap.html` - Interactive data map
- `src/pages/contributor.html` - Contributor info page

## How to Link to Pages

### From Root index.html
```html
<a href="src/pages/victimDashboard.html">Victim Dashboard</a>
<a href="src/pages/datamap.html">Data Map</a>
<a href="src/pages/adminSignIn.html">Admin Login</a>
```

### From any src/pages/ file
```html
<a href="index.html">Home</a>
<a href="victimDashboard.html">Victim Dashboard</a>
<a href="victimSignIn.html">Victim Sign In</a>
```

## Navigation Structure

```
index.html (ROOT)
│
├── src/pages/
│   ├── Victim Portal
│   │   ├── victimSignIn.html
│   │   ├── victimSignUp.html
│   │   ├── victimDashboard.html ← MAIN DASHBOARD
│   │   ├── victimRequests.html
│   │   └── victimStatus.html
│   │
│   ├── Contributor Portal
│   │   ├── contributorSignIn.html
│   │   ├── contributorSignUp.html
│   │   └── contributorLog.html
│   │
│   ├── Admin Portal
│   │   ├── adminSignIn.html
│   │   └── adminDashboard.html
│   │
│   ├── Donor Portal
│   │   └── donorDashboard.html
│   │
│   └── Public Pages
│       ├── about.html
│       ├── datamap.html
│       └── contributor.html
```

## File Reference Paths

All pages in `src/pages/` have correct paths for:
- CSS files: `../styles/`
- JavaScript: `../scripts/`
- Images: `../assets/images/`

Root `index.html` has correct paths for:
- CSS files: `src/styles/`
- JavaScript: `src/scripts/`
- Images: `src/assets/images/`

---

**Last Updated**: December 13, 2025
