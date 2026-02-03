# 🚀 Quick Start Guide - AirAI Chat App

## What You Have

A complete, ready-to-deploy GitHub repository for your AirAI chat application!

## Files Included

✅ **Core Application Files**
- `index.html` - Landing page
- `login.html` - Authentication page (95 KB)
- `chat-interface.html` - Chat interface (296 KB)

✅ **Documentation**
- `README.md` - Main documentation
- `SETUP.md` - Setup instructions
- `GIT_SETUP.md` - GitHub setup guide
- `PROJECT_STRUCTURE.md` - Architecture overview
- `CONTRIBUTING.md` - Contribution guidelines

✅ **Configuration**
- `LICENSE` - MIT License
- `.gitignore` - Git ignore rules
- `package.json` - Node.js config (optional)

## 🎯 Next Steps (Choose One)

### Option 1: Deploy to GitHub Pages (Easiest)

1. **Create GitHub Repository**
   ```bash
   # In your terminal, navigate to the project folder
   cd airai-chat-app
   
   # Initialize git
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub**
   - Create new repo at https://github.com/new
   - Name it: `airai-chat-app`
   - Don't initialize with README
   - Run these commands:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/airai-chat-app.git
   git branch -M main
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to repo Settings → Pages
   - Select "main" branch and "/ (root)" folder
   - Save and wait 2 minutes
   - Visit: `https://YOUR_USERNAME.github.io/airai-chat-app/`

### Option 2: Test Locally First

```bash
# Using Python
python -m http.server 8000

# Or using Node.js
npx serve

# Then open: http://localhost:8000
```

### Option 3: Deploy to Netlify (Drag & Drop)

1. Go to https://netlify.com
2. Sign up (free)
3. Drag the `airai-chat-app` folder
4. Done! Get instant URL

## 📋 Important URLs in Your Code

Your app connects to these Google Apps Script endpoints:

1. **Session Service** (login.html, line 1275)
   ```
   https://script.google.com/macros/s/AKfycbzHDXl45MX96gaOlKPeqD4Q75nNeDm1cMUvQpc0GWVXHSE8ErnMbkZ6GSMnO9zTbFO_Bg/exec
   ```

2. **Chat Interface** (login.html, line 1376)
   ```
   https://script.google.com/macros/s/AKfycbwASoycOBwGRnXqXPZyvKJBE29JydxmJqgO24TE2BgVHBPasTMlCK00DawWi7t4OpUZDw/exec
   ```

These should work as-is. To use your own backend, replace these URLs.

## ⚡ How It Works

1. User opens `index.html` → redirects to `login.html`
2. User logs in (Member or Guest)
3. System generates session code (15 min for members, unlimited for guests)
4. User clicks "Next" → opens `chat-interface.html` in iframe
5. Chat interface validates member key and enables chat

## 🎨 Customization Tips

**Change Colors:**
Find and replace these in HTML files:
- `#2e7d32` → Your primary color
- `#0a1f0a` → Your background color
- `#c8e6c9` → Your text color

**Change Project Name:**
Replace "AirAI" in:
- `README.md` 
- `package.json`
- Both HTML files (titles, headers)

## 🆘 Need Help?

1. Read `SETUP.md` for detailed instructions
2. Check `GIT_SETUP.md` for Git/GitHub help
3. Review `PROJECT_STRUCTURE.md` for architecture
4. See `README.md` for troubleshooting

## ✅ Checklist

Before deploying:
- [ ] Test locally with a server
- [ ] Verify login works
- [ ] Test chat interface loads
- [ ] Check member key generation
- [ ] Test on mobile device
- [ ] Update GitHub username in README.md
- [ ] Replace "yourusername" in package.json
- [ ] Add your own branding (optional)

## 🎉 You're Ready!

Your repository is complete and ready to deploy. Choose your deployment method above and get started!

---

**Pro Tip:** Start with local testing, then deploy to GitHub Pages for free hosting!
