# AirAI Chat Application - Project Structure

```
airai-chat-app/
│
├── 📄 index.html              # Entry point - redirects to login
│   └── Purpose: Default landing page for easy deployment
│
├── 🔐 login.html              # Main login and authentication page
│   ├── Features:
│   │   ├── Member/Guest login options
│   │   ├── Session code generation
│   │   ├── Animated background (gradients, bubbles, fish)
│   │   ├── Terms of Service modal
│   │   └── Integration with Google Apps Script backend
│   └── Opens: chat-interface.html in iframe
│
├── 💬 chat-interface.html     # Main chat interface (10,833 lines)
│   ├── Features:
│   │   ├── Multi-model AI chat support
│   │   ├── Real-time messaging
│   │   ├── Member key validation
│   │   ├── Rich message formatting
│   │   ├── File attachments (likely)
│   │   └── Message history
│   └── Loaded via: iframe from login.html
│
├── 📖 README.md               # Main documentation
│   └── Contents: Features, installation, usage, deployment
│
├── 🛠️ SETUP.md                # Detailed setup guide
│   └── Contents: Local testing, deployment options, configuration
│
├── 📝 GIT_SETUP.md            # Git and GitHub setup instructions
│   └── Contents: Repository initialization, common commands
│
├── 🤝 CONTRIBUTING.md         # Contribution guidelines
│   └── Contents: How to contribute, code style, PR process
│
├── 📜 LICENSE                 # MIT License
│   └── Open source licensing terms
│
├── 🚫 .gitignore             # Git ignore rules
│   └── Excludes: node_modules, .env, IDE files, etc.
│
└── 📦 package.json           # Node.js package configuration (optional)
    └── Scripts for local development server

```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User's Browser                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌────────────────────────────────────────────────┐    │
│  │           index.html (Landing)                  │    │
│  │                    ↓                            │    │
│  │           login.html (Authentication)           │    │
│  │                    ↓                            │    │
│  │   ┌──────────────────────────────────────┐    │    │
│  │   │  Generate Session Code (JSONP)       │    │    │
│  │   │         ↓                             │    │    │
│  │   │  Google Apps Script Backend          │    │    │
│  │   │  (Session Management)                 │    │    │
│  │   └──────────────────────────────────────┘    │    │
│  │                    ↓                            │    │
│  │   Display Member Key (15 min / unlimited)      │    │
│  │                    ↓                            │    │
│  │   ┌──────────────────────────────────────┐    │    │
│  │   │  <iframe> chat-interface.html        │    │    │
│  │   │  + memberKey parameter               │    │    │
│  │   │         ↓                             │    │    │
│  │   │  Google Apps Script Backend          │    │    │
│  │   │  (Chat Interface + AI Models)        │    │    │
│  │   └──────────────────────────────────────┘    │    │
│  └────────────────────────────────────────────────┘    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

1. **User Access**
   - User opens `index.html` → redirects to `login.html`

2. **Authentication**
   - User chooses Member or Guest login
   - JavaScript calls Google Apps Script (JSONP)
   - Backend generates session code
   - Code displayed with countdown timer

3. **Chat Access**
   - User clicks "Open Chat Interface"
   - `chat-interface.html` loaded in iframe
   - Member key passed as URL parameter
   - Backend validates key and grants access

4. **Chat Session**
   - User sends messages
   - Backend processes with AI models
   - Responses displayed in real-time
   - Session expires after timeout (members only)

## Key Technologies

- **Frontend**: Pure HTML, CSS, JavaScript (no frameworks)
- **Backend**: Google Apps Script
- **Authentication**: JSONP with session codes
- **Styling**: Custom CSS with animations
- **Fonts**: Google Fonts (Inter)
- **Icons**: SVG-based

## File Sizes

- `login.html`: ~95 KB (1,410 lines)
- `chat-interface.html`: ~296 KB (10,833 lines)
- Total project: ~391 KB

## External Dependencies

1. **Google Apps Script** (Backend)
   - Session management endpoint
   - Chat interface endpoint

2. **Google Fonts** (Frontend)
   - Inter font family

3. **Browser APIs** (Frontend)
   - DOM manipulation
   - iframe communication
   - localStorage (possibly)
   - Fetch/JSONP for API calls

## Customization Points

🎨 **Visual**
- Color scheme (green theme)
- Animations (gradients, bubbles, fish)
- Fonts and typography
- Layout and spacing

⚙️ **Functional**
- Session timeout duration
- Backend API endpoints
- Login methods (member/guest)
- AI model selection

🔐 **Security**
- Session key expiration
- Backend validation
- CORS policies
- Input sanitization

## Deployment Options

1. **Static Hosting** (Recommended)
   - GitHub Pages ✅
   - Netlify ✅
   - Vercel ✅
   - Cloudflare Pages ✅

2. **Traditional Hosting**
   - Any web server
   - Shared hosting
   - VPS

3. **Local Development**
   - Python HTTP server
   - Node.js serve
   - PHP built-in server
