# AirAI - Setup Guide

## Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- A text editor (VS Code recommended)
- Git (for version control)
- A Google account (for the Apps Script backend)

## Local Development

### Option 1: Python HTTP Server (Recommended)

If you have Python installed:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open `http://localhost:8000` in your browser.

### Option 2: Node.js

Install a simple HTTP server:

```bash
npm install -g serve
serve .
```

Or use `http-server`:

```bash
npm install -g http-server
http-server -p 8000
```

### Option 3: VS Code Live Server

1. Install the **Live Server** extension in VS Code
2. Right-click `index.html` → **Open with Live Server**
3. The site opens automatically in your browser

## Deployment

### GitHub Pages (Recommended)

1. Push your code to GitHub
2. Go to **Settings** → **Pages**
3. Under **Source**, select **Deploy from a branch**
4. Select the `main` branch and `/ (root)` folder
5. Click **Save**
6. Your site will be live at `https://<username>.github.io/airai-chat-app/`

### Netlify

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click **Add new site** → **Import an existing project**
3. Connect your GitHub repository
4. Leave build settings empty (static site)
5. Click **Deploy site**

### Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **New Project** → Import your GitHub repo
3. Framework Preset: **Other**
4. Click **Deploy**

### Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Pages**
2. Click **Create a project** → **Connect to Git**
3. Select your repository
4. Build settings: leave empty
5. Click **Save and Deploy**

## Backend Configuration

AirAI uses **Google Apps Script** as its backend for session management and AI model access.

### Setting Up Google Apps Script

1. Go to [Google Apps Script](https://script.google.com)
2. Create a new project
3. Add the backend logic for:
   - Session code generation
   - Member key validation
   - AI model API routing
4. Deploy as a **Web App**:
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the deployment URL
6. Update the API endpoint URLs in `login.html` and `chat-interface.html`

### API Endpoints

The application expects these endpoints from your Apps Script backend:

| Endpoint | Purpose |
|----------|---------|
| `GET ?action=generateSession` | Generate a new session code |
| `GET ?action=validateKey&key=...` | Validate a member key |
| `POST ?action=chat` | Send chat messages to AI |

## Environment Variables

This is a static frontend application — no `.env` file is needed. All configuration is done directly in the HTML/JS files.

### Configuration Points

- **API URLs**: Update the Google Apps Script URLs in the JavaScript sections
- **Session Duration**: Modify the timeout values for member sessions (default: 15 minutes)
- **Theme Colors**: Adjust CSS variables in `:root` for custom branding

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Ensure your Apps Script is deployed with "Anyone" access |
| Login not working | Check that the JSONP callback URL is correct |
| Chat not loading | Verify the member key is being passed correctly via URL params |
| Styles broken | Clear browser cache (`Ctrl+Shift+R`) |
| Manifest errors | Ensure `manifest.json` is in the root directory |

## Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 80+ |
| Firefox | 78+ |
| Safari | 13+ |
| Edge | 80+ |
| Mobile Chrome | 80+ |
| Mobile Safari | 13+ |
