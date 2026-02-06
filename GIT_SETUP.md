# AirAI - Git & GitHub Setup

## Initial Setup

### 1. Install Git

Download and install Git from [git-scm.com](https://git-scm.com).

Verify installation:

```bash
git --version
```

### 2. Configure Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

### 3. Initialize the Repository

If starting from scratch:

```bash
cd airai-chat-app
git init
git add .
git commit -m "Initial commit: AirAI chat application"
```

### 4. Connect to GitHub

1. Create a new repository on [github.com](https://github.com/new)
   - Name: `airai-chat-app`
   - Visibility: Public or Private
   - **Do NOT** initialize with README (you already have one)

2. Connect your local repo:

```bash
git remote add origin https://github.com/your-username/airai-chat-app.git
git branch -M main
git push -u origin main
```

## Common Git Commands

### Daily Workflow

```bash
# Check what's changed
git status

# Stage all changes
git add .

# Stage specific files
git add login.html chat-interface.html

# Commit with a message
git commit -m "Add feature: dark mode toggle"

# Push to GitHub
git push
```

### Branching

```bash
# Create and switch to a new branch
git checkout -b feature/new-feature

# Switch back to main
git checkout main

# Merge a branch into main
git checkout main
git merge feature/new-feature

# Delete a branch after merging
git branch -d feature/new-feature
```

### Undoing Changes

```bash
# Discard changes in a file
git checkout -- filename.html

# Unstage a file
git reset HEAD filename.html

# Undo the last commit (keep changes)
git reset --soft HEAD~1

# Undo the last commit (discard changes) ⚠️
git reset --hard HEAD~1
```

### Viewing History

```bash
# View commit history
git log --oneline

# View changes in a commit
git show <commit-hash>

# View file history
git log --follow filename.html
```

## Commit Message Guidelines

Use clear, descriptive commit messages:

```
feat: Add member key validation
fix: Correct session timeout countdown
style: Update chat bubble colors
docs: Add setup instructions
refactor: Clean up authentication flow
```

### Format

```
<type>: <short description>

<optional longer description>
```

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `style` — CSS/visual changes
- `docs` — Documentation only
- `refactor` — Code restructuring
- `chore` — Maintenance tasks

## GitHub Pages Deployment

After pushing to GitHub:

1. Go to your repo → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / `/ (root)`
4. Save — site will be live in ~1 minute

Your site URL: `https://your-username.github.io/airai-chat-app/`

## Useful GitHub Features

- **Issues**: Track bugs and feature requests
- **Pull Requests**: Review code changes before merging
- **Actions**: Automate testing and deployment
- **Releases**: Tag stable versions of your app
