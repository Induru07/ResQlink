# ResQLink Frontend - Project Structure

## Overview
This is a clean, organized frontend project for the ResQLink Flood Management System. The code is now properly organized for easy maintenance and scalability.

## Directory Structure

```
Frontend/
├── src/                          # Source code directory
│   ├── pages/                    # HTML pages
│   │   ├── index.html           # Homepage
│   │   ├── about.html           # About page
│   │   ├── datamap.html         # Interactive data map
│   │   ├── contributor.html     # Contributor portal
│   │   ├── victimSignIn.html    # Victim login
│   │   └── victimSignUp.html    # Victim registration
│   │
│   ├── styles/                   # CSS stylesheets
│   │   ├── style.css            # Main global styles
│   │   ├── contributor.css      # Contributor portal styles
│   │   └── victim-auth.css      # Victim auth page styles
│   │
│   ├── scripts/                  # JavaScript files
│   │   ├── script.js            # Main global script
│   │   ├── datamap.js           # Data map functionality
│   │   ├── contributor.js       # Contributor features
│   │   └── dashboard.js         # Dashboard logic
│   │
│   ├── assets/                   # Static assets
│   │   ├── images/              # Image files
│   │   │   ├── header.jpg
│   │   │   ├── chamath.jpg
│   │   │   ├── devindi.jpg
│   │   │   ├── induru.jpg
│   │   │   ├── thisandi.jpg
│   │   │   └── thiseni.jpg
│   │   └── fonts/               # Custom fonts (reserved for future use)
│   │
│   └── components/              # Reusable components (reserved for future use)
│
├── public/                       # Static files to serve (reserved for build output)
├── index.html                    # Main entry point (serves src/pages/index.html)
└── README.md                     # This file

```

## Quick Start

### To Run the Project
1. Open `index.html` in a web browser (or your local development server)
2. The main page will load and display the flood management system

### To Navigate Pages
- All internal links are configured correctly to work with the new structure
- Pages reference stylesheets and scripts with proper relative paths

## File Locations Guide

### Adding New Pages
1. Create `.html` file in `src/pages/`
2. Link CSS: `<link rel="stylesheet" href="../../styles/filename.css">`
3. Link JS: `<script src="../../scripts/filename.js"></script>`
4. Images: `<img src="../../assets/images/filename.jpg">`

### Adding New Styles
1. Create `.css` file in `src/styles/`
2. If it's page-specific, name it after the page: `pagename.css`
3. Import in the HTML file: `<link rel="stylesheet" href="../../styles/pagename.css">`

### Adding New Scripts
1. Create `.js` file in `src/scripts/`
2. If it's page-specific, name it after the page: `pagename.js`
3. Import in the HTML file: `<script src="../../scripts/pagename.js"></script>`

### Adding New Images
1. Place images in `src/assets/images/`
2. Reference in HTML: `<img src="../../assets/images/filename.jpg">`

## Path Reference Table

From **`src/pages/`** (HTML files):
- CSS files: `../../styles/`
- JS files: `../../scripts/`
- Images: `../../assets/images/`

From **`src/styles/`** (CSS files):
- Images: `../assets/images/`

From **`src/scripts/`** (JS files):
- Images: `../assets/images/`

## Best Practices

1. **Keep related files together**: Group CSS, JS, and assets by feature
2. **Use meaningful names**: File names should clearly indicate purpose
3. **Consistent structure**: Follow the established folder organization
4. **Minimize inline styles**: Move styles to external CSS files (like victim-auth.css)
5. **Comment your code**: Add comments explaining complex logic
6. **Use relative paths**: Always use relative paths for internal resources

## Pages Overview

| Page | Purpose | Key Features |
|------|---------|--------------|
| `index.html` | Homepage | Navigation hub, essential links |
| `about.html` | About page | Information about the system and contributors |
| `datamap.html` | Interactive Map | Flood data visualization with Leaflet.js |
| `contributor.html` | Contributor Portal | Allows users to contribute flood information |
| `victimSignIn.html` | Victim Login | Authentication for victims to access assistance |
| `victimSignUp.html` | Victim Registration | Create new victim accounts |

## Technologies Used

- **HTML5**: Page structure and semantics
- **CSS3**: Styling and responsive design
- **JavaScript**: Interactivity and dynamic features
- **Leaflet.js**: Interactive mapping library (for datamap)
- **Multilingual Support**: English, Sinhala, Tamil translations

## Future Improvements

1. Move components to separate `src/components/` folder as the project grows
2. Add build tools (Webpack, Vite) for optimization
3. Implement asset minification and bundling
4. Add TypeScript for better code reliability
5. Create reusable component library

## Notes

- Old redundant files from `chamath/` folder have been consolidated
- Duplicate CSS files have been merged into the main `styles/` directory
- All path references have been updated to work with the new structure
- The project maintains compatibility with the existing backend API

---

**Last Updated**: December 11, 2025
**Project**: ResQLink - Flood Management System
