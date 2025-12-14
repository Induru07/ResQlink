# Quick Start Guide - ResQLink Frontend

## 📁 Your New Project Structure

```
Frontend/
├── index.html              ← Open this to start (entry point)
├── README.md               ← Full documentation
├── STRUCTURE.txt           ← Detailed structure guide
│
├── css/                    ← Stylesheets (canonical)
├── js/                     ← JavaScript (canonical)
├── images/                 ← Images (canonical)
└── src/                    ← Legacy assets/styles (kept for now)
    ├── styles/             ← CSS files (3 files)
    └── assets/
        └── images/         ← Images
```

## 🚀 How to Use

### Running Your Project
1. Open `index.html` in a browser or web server
2. Navigate using the menu
3. All internal links are working!

### Adding New Files

**Add a new page:**
```
1. Create: Frontend/mypage.html
2. In HTML, link CSS:   <link rel="stylesheet" href="css/style.css">
3. In HTML, link JS:    <script src="js/script.js"></script>
4. In HTML, link image: <img src="images/photo.jpg">
```

**Add a new style:**
```
1. Create: css/mypage.css
2. In HTML:             <link rel="stylesheet" href="css/mypage.css">
```

**Add a new script:**
```
1. Create: js/mypage.js
2. In HTML:             <script src="js/mypage.js"></script>
```

**Add a new image:**
```
1. Copy image to:       images/myimage.jpg
2. In HTML:             <img src="images/myimage.jpg">
```

## 📋 File List

### Pages (root Frontend/)
- ✅ index.html - Homepage
- ✅ about.html - About page  
- ✅ datamap.html - Interactive map
- ✅ contributor.html - Contributor portal
- ✅ victimSignIn.html - Login page
- ✅ victimSignUp.html - Registration page

### Styles (src/styles/)
- ✅ style.css - Main styles (702 lines)
- ✅ contributor.css - Contributor portal styles
- ✅ victim-auth.css - Login/signup styles (NEW)

### Scripts (js/)
- ✅ script.js - Main JavaScript
- ✅ datamap.js - Map functionality
- ✅ contributor.js - Contributor features
- ✅ dashboard.js - Dashboard logic

### Images (src/assets/images/)
- ✅ header.jpg
- ✅ chamath.jpg
- ✅ devindi.jpg
- ✅ induru.jpg
- ✅ thisandi.jpg
- ✅ thiseni.jpg

## 🎯 What Changed

### ✨ Improvements Made
- **Removed duplicates**: No more repeated chamath/ folder
- **Unified styles**: All CSS in one place (3 files, not 6)
- **Unified scripts**: All JS in one place (4 files, not 8)
- **Organized images**: All images in one folder
- **Extracted styles**: victim-auth.css extracted from HTML
- **Updated paths**: All file references updated
- **Added docs**: README.md and STRUCTURE.txt

### 🗑️ Old Structure (Removed)
- ❌ Duplicate files in chamath/
- ❌ Duplicate css/
- ❌ Duplicate js/
- ❌ Scattered images/
- ❌ Inline styles in HTML

## 💡 Tips

1. **Use VS Code**: File tree will help you navigate
2. **Use search**: Ctrl+Shift+F to search code
3. **Keep it organized**: Follow the folder structure
4. **Use comments**: Add comments in code
5. **Test locally**: Use a local server to test

## 🔗 Common Paths

From **root HTML files** in `Frontend/`:
```
CSS:    css/style.css
JS:     js/script.js
Image:  images/header.jpg
```

## ❓ Need Help?

- Read **README.md** for complete documentation
- Check **STRUCTURE.txt** for detailed migration info
- Look at existing files for examples
- Use browser DevTools (F12) to debug

## ✅ Verification Checklist

- [x] Root `css/`, `js/`, `images/` in use
- [x] HTML pages at Frontend root
- [x] Paths updated to root folders
- [x] Documentation updated
- [x] Ready for development!

---

**Last Updated**: December 11, 2025  
**Status**: ✅ Ready to Edit and Develop!
