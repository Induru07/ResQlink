# Quick Start Guide - ResQLink Frontend

## 📁 Your New Project Structure

```
Frontend/
├── index.html              ← Open this to start (entry point)
├── README.md               ← Full documentation
├── STRUCTURE.txt           ← Detailed structure guide
│
└── src/                    ← All your code here
    ├── pages/              ← HTML pages (6 files)
    ├── styles/             ← CSS files (3 files)
    ├── scripts/            ← JavaScript files (4 files)
    └── assets/
        └── images/         ← Images (6 files)
```

## 🚀 How to Use

### Running Your Project
1. Open `index.html` in a browser or web server
2. Navigate using the menu
3. All internal links are working!

### Adding New Files

**Add a new page:**
```
1. Create: src/pages/mypage.html
2. In HTML, link CSS:   <link rel="stylesheet" href="../../styles/style.css">
3. In HTML, link JS:    <script src="../../scripts/script.js"></script>
4. In HTML, link image: <img src="../../assets/images/photo.jpg">
```

**Add a new style:**
```
1. Create: src/styles/mypage.css
2. In HTML:             <link rel="stylesheet" href="../../styles/mypage.css">
```

**Add a new script:**
```
1. Create: src/scripts/mypage.js
2. In HTML:             <script src="../../scripts/mypage.js"></script>
```

**Add a new image:**
```
1. Copy image to:       src/assets/images/myimage.jpg
2. In HTML:             <img src="../../assets/images/myimage.jpg">
```

## 📋 File List

### Pages (src/pages/)
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

### Scripts (src/scripts/)
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

From **HTML files** in `src/pages/`:
```
CSS:    ../../styles/style.css
JS:     ../../scripts/script.js
Image:  ../../assets/images/header.jpg
```

From **Root index.html**:
```
CSS:    src/styles/style.css
JS:     src/scripts/script.js
Image:  src/assets/images/header.jpg
```

## ❓ Need Help?

- Read **README.md** for complete documentation
- Check **STRUCTURE.txt** for detailed migration info
- Look at existing files for examples
- Use browser DevTools (F12) to debug

## ✅ Verification Checklist

- [x] New src/ folder created
- [x] All HTML files moved and updated
- [x] All CSS files consolidated
- [x] All JS files consolidated  
- [x] All images organized
- [x] All paths corrected
- [x] Documentation created
- [x] Ready for development!

---

**Last Updated**: December 11, 2025  
**Status**: ✅ Ready to Edit and Develop!
