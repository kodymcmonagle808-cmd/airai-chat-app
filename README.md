# AirAI Chat Application

A modern, feature-rich AI chat application with authentication and multiple AI model support.

## 🌟 Features

- **Secure Authentication**: Login system with session management
- **Modern UI**: Beautiful dark green theme with animated backgrounds
- **Member Key System**: Time-limited access codes (15 minutes for members, unlimited for guests)
- **Multi-Model Support**: Switch between different AI models
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Chat**: Smooth, interactive chat interface

## 📁 Project Structure

```
airai-chat-app/
├── login.html           # Main login/authentication page
├── chat-interface.html  # Chat interface (loaded via iframe)
├── README.md           # This file
└── LICENSE             # MIT License
```

## 🚀 Getting Started

### Prerequisites

- A web browser (Chrome, Firefox, Safari, or Edge)
- Internet connection (for Google Apps Script backend)

### Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/airai-chat-app.git
cd airai-chat-app
```

2. Open `login.html` in your web browser to start the application

### Deployment

#### Option 1: GitHub Pages
1. Push your code to GitHub
2. Go to your repository settings
3. Navigate to "Pages" section
4. Select your branch (usually `main`) and `/root` folder
5. Click "Save"
6. Your site will be available at `https://yourusername.github.io/airai-chat-app/login.html`

#### Option 2: Local Server
```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Then open http://localhost:8000/login.html
```

#### Option 3: Netlify/Vercel
Simply drag and drop the folder onto Netlify or connect your GitHub repo to Vercel for automatic deployment.

## 🔧 Configuration

### Google Apps Script Backend

The application uses Google Apps Script for backend services. The current endpoints are:

- **Session Management**: `https://script.google.com/macros/s/AKfycbzHDXl45MX96gaOlKPeqD4Q75nNeDm1cMUvQpc0GWVXHSE8ErnMbkZ6GSMnO9zTbFO_Bg/exec`
- **Chat Interface**: `https://script.google.com/macros/s/AKfycbwASoycOBwGRnXqXPZyvKJBE29JydxmJqgO24TE2BgVHBPasTMlCK00DawWi7t4OpUZDw/exec`

To use your own backend:
1. Set up Google Apps Script endpoints
2. Replace the URLs in both HTML files
3. Test the connection

## 📖 Usage

1. **Login**: Open `login.html` and choose Member or Guest login
2. **Get Access Code**: After successful authentication, you'll receive a member key
3. **Enter Chat**: Click "Next: Open Chat Interface" to access the chat
4. **Start Chatting**: Use the chat interface to interact with AI models

### Member Key System

- **Members**: 15-minute time-limited access codes
- **Guests**: Unlimited access (no expiration)
- Keys are single-use and must be kept secure

## 🎨 Customization

### Changing Colors

The app uses a dark green theme. To customize:

1. Open the HTML files
2. Find the CSS variables or color codes
3. Replace with your preferred colors

Example color codes used:
- Primary: `#2e7d32` (Green)
- Background: `#0a1f0a` (Dark Green)
- Text: `#c8e6c9` (Light Green)

### Modifying Animations

The app includes several animations:
- Floating gradients
- Bubble effects
- Swimming fish
- Grid patterns

Find these in the `<style>` section and adjust `@keyframes` rules as needed.

## 🛡️ Security Notes

- Never share your member keys
- Keys expire after 15 minutes (for members)
- The app uses HTTPS for all external communications
- Session data is managed server-side

## 🐛 Troubleshooting

**Issue**: Login doesn't work
- Check your internet connection
- Verify Google Apps Script URLs are accessible
- Check browser console for errors

**Issue**: Chat interface doesn't load
- Ensure member key is valid and not expired
- Clear browser cache and try again
- Check if third-party cookies are enabled

**Issue**: Animations are laggy
- Close other browser tabs
- Try a different browser
- Disable some animations in the code

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the troubleshooting section

## 🙏 Acknowledgments

- Font: Inter from Google Fonts
- Icons: SVG-based custom icons
- Backend: Google Apps Script

---

Made with 💚 by the AirAI Team
