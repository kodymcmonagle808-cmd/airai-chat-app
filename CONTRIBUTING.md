# Contributing to AirAI

Thank you for your interest in contributing to AirAI! This guide will help you get started.

## How to Contribute

### 1. Fork the Repository

Click the **Fork** button on the GitHub repository page to create your own copy.

### 2. Clone Your Fork

```bash
git clone https://github.com/your-username/airai-chat-app.git
cd airai-chat-app
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 4. Make Your Changes

Edit the files, test locally, and make sure everything works.

### 5. Commit Your Changes

```bash
git add .
git commit -m "feat: Add your feature description"
```

### 6. Push and Create a Pull Request

```bash
git push origin feature/your-feature-name
```

Then go to the original repository and click **New Pull Request**.

## Code Style Guidelines

### HTML

- Use 2-space indentation
- Use semantic HTML elements where possible
- Include `alt` attributes on images
- Keep accessibility in mind (ARIA labels, keyboard navigation)

### CSS

- Use CSS custom properties (variables) defined in `:root`
- Follow the existing naming conventions
- Group related properties together
- Add comments for complex selectors or animations

```css
/* ✅ Good */
.chat-message {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 12px 16px;
}

/* ❌ Avoid */
.chat-message {
  background: #0a0a0a;
  border: 1px solid #1a2e1a;
  border-radius: 12px;
  padding: 12px 16px;
}
```

### JavaScript

- Use `const` and `let` (never `var`)
- Use arrow functions for callbacks
- Add JSDoc comments for functions
- Handle errors gracefully with try/catch

```javascript
// ✅ Good
const sendMessage = async (message) => {
  try {
    const response = await fetch(apiUrl, { method: 'POST', body: message });
    return await response.json();
  } catch (error) {
    console.error('Failed to send message:', error);
    showError('Message failed to send. Please try again.');
  }
};
```

## What to Contribute

### 🐛 Bug Fixes

- Check the **Issues** tab for reported bugs
- Include steps to reproduce in your PR description

### ✨ New Features

- Discuss the feature in an Issue first
- Keep changes focused and minimal
- Update documentation if needed

### 🎨 UI/UX Improvements

- Match the existing green theme and design language
- Test on mobile and desktop
- Ensure animations are smooth (60fps)

### 📝 Documentation

- Fix typos or unclear instructions
- Add examples or screenshots
- Update outdated information

## Testing Checklist

Before submitting a PR, please verify:

- [ ] Page loads without console errors
- [ ] Login flow works (both Member and Guest)
- [ ] Chat interface loads correctly in the iframe
- [ ] Responsive design works on mobile (375px width)
- [ ] Dark theme looks correct
- [ ] Light theme looks correct (if applicable)
- [ ] All animations are smooth
- [ ] No broken links or missing assets

## Reporting Bugs

When reporting a bug, please include:

1. **Browser & Version** (e.g., Chrome 120)
2. **Device** (e.g., Desktop Windows 11, iPhone 15)
3. **Steps to Reproduce**
4. **Expected Behavior**
5. **Actual Behavior**
6. **Screenshots** (if applicable)

## Pull Request Guidelines

- Keep PRs focused on a single change
- Write a clear description of what changed and why
- Reference any related Issues (`Closes #123`)
- Ensure no merge conflicts with `main`
- Be open to feedback and code review

## Code of Conduct

- Be respectful and constructive
- Welcome newcomers and help them learn
- Focus on the code, not the person
- Assume good intentions

## Questions?

Open an Issue with the **question** label, and we'll help you out!

---

Thank you for helping make AirAI better! 🚀
