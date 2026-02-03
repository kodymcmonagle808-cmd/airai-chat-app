# Setup Guide for AirAI Chat Application

This guide will help you set up and deploy your AirAI chat application.

## Quick Start

### 1. Clone or Download

If using Git:
```bash
git clone https://github.com/yourusername/airai-chat-app.git
cd airai-chat-app
```

Or download and extract the ZIP file.

### 2. Test Locally

The simplest way to test:
1. Double-click `index.html` (or `login.html`)
2. Your browser should open the application

For better testing with a local server:

**Using Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Using Node.js (with npx):**
```bash
npx serve
```

**Using PHP:**
```bash
php -S localhost:8000
```

Then open: http://localhost:8000

### 3. Deploy Online

#### Option A: GitHub Pages (Free & Easy)

1. Create a GitHub account if you don't have one
2. Create a new repository called `airai-chat-app`
3. Upload all files to the repository
4. Go to Settings → Pages
5. Select your main branch and root folder
6. Save and wait a few minutes
7. Access at: `https://yourusername.github.io/airai-chat-app/`

#### Option B: Netlify (Free)

1. Sign up at https://netlify.com
2. Drag and drop your project folder
3. Done! You get a URL like: `https://your-site.netlify.app`

#### Option C: Vercel (Free)

1. Sign up at https://vercel.com
2. Import your GitHub repository or upload folder
3. Deploy with one click
4. Get URL: `https://your-site.vercel.app`

## File Structure Explained

```
airai-chat-app/
│
├── index.html              # Entry point (redirects to login)
├── login.html              # Main login page
├── chat-interface.html     # Chat interface (embedded)
│
├── README.md              # Project documentation
├── LICENSE                # MIT License
├── CONTRIBUTING.md        # Contribution guidelines
├── SETUP.md              # This file
└── .gitignore            # Git ignore rules
```

## Configuration

### Updating Backend URLs

The application currently uses these Google Apps Script endpoints:

1. **Session Service** (in `login.html` around line 1275):
   ```javascript
   script.src = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?...'
   ```

2. **Chat Interface** (in `login.html` around line 1376):
   ```javascript
   iframe.src = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?...'
   ```

To use your own backend:
1. Set up Google Apps Script
2. Find the script URLs in the HTML files
3. Replace with your script IDs
4. Test thoroughly

### Customizing Appearance

**Colors**: Search for these hex codes and replace:
- `#2e7d32` - Primary green
- `#0a1f0a` - Dark background
- `#c8e6c9` - Light text
- `#81c784` - Secondary green

**Fonts**: The app uses Inter from Google Fonts. To change:
```html
<link href="https://fonts.googleapis.com/css2?family=YourFont&display=swap" rel="stylesheet">
```

Then update CSS:
```css
font-family: 'YourFont', sans-serif;
```

## Troubleshooting

### Problem: Files won't load locally
**Solution**: Use a local server instead of opening files directly

### Problem: Chat interface doesn't show
**Solution**: 
- Check browser console for errors
- Verify Google Apps Script URLs are correct
- Enable third-party cookies in browser

### Problem: Animations are slow
**Solution**:
- Test in a different browser
- Close other tabs
- Reduce animation complexity in CSS

### Problem: Login doesn't work
**Solution**:
- Check internet connection
- Verify backend URLs are accessible
- Check browser console for errors

## Browser Support

The application works best in modern browsers:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Security Considerations

- All communications use HTTPS
- Member keys expire after 15 minutes
- Session data is server-side
- Never commit sensitive API keys to Git

## Need Help?

- Check the main [README.md](README.md)
- Open an issue on GitHub
- Review [CONTRIBUTING.md](CONTRIBUTING.md) for development help

## Next Steps

1. ✅ Set up locally
2. ✅ Test all features
3. ✅ Customize appearance (optional)
4. ✅ Deploy to hosting service
5. ✅ Configure your own backend (if needed)
6. ✅ Share with users!

Happy coding! 🚀
