# Git Repository Setup Commands

This file contains the commands to initialize your GitHub repository.

## Step 1: Initialize Local Git Repository

Open your terminal/command prompt in the project folder and run:

```bash
# Initialize git repository
git init

# Add all files to staging
git add .

# Make your first commit
git commit -m "Initial commit: AirAI Chat Application"
```

## Step 2: Create GitHub Repository

1. Go to https://github.com
2. Click the "+" icon in the top right
3. Select "New repository"
4. Name it: `airai-chat-app` (or your preferred name)
5. Choose "Public" or "Private"
6. DO NOT initialize with README (we already have one)
7. Click "Create repository"

## Step 3: Connect to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add GitHub as remote origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/airai-chat-app.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Alternative: Using SSH (if you have SSH keys set up)

```bash
git remote add origin git@github.com:YOUR_USERNAME/airai-chat-app.git
git branch -M main
git push -u origin main
```

## Step 4: Verify

Go to your GitHub repository page:
```
https://github.com/YOUR_USERNAME/airai-chat-app
```

You should see all your files listed!

## Future Updates

After making changes to your code:

```bash
# Check what changed
git status

# Add specific files
git add filename.html

# Or add all changes
git add .

# Commit with a message
git commit -m "Description of changes"

# Push to GitHub
git push
```

## Common Git Commands

```bash
# View current status
git status

# View commit history
git log

# Create a new branch
git checkout -b feature-name

# Switch branches
git checkout main

# Merge a branch
git merge feature-name

# Pull latest changes
git pull

# Undo local changes
git checkout -- filename.html

# Remove file from git (but keep locally)
git rm --cached filename.html
```

## Troubleshooting

### Problem: "fatal: remote origin already exists"
Solution:
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/airai-chat-app.git
```

### Problem: Authentication failed
Solution:
- Use a Personal Access Token instead of password
- Or set up SSH keys
- See: https://docs.github.com/en/authentication

### Problem: Can't push to repository
Solution:
```bash
# Make sure you're on the right branch
git branch

# Pull any changes first
git pull origin main --rebase

# Then push
git push origin main
```

## GitHub Pages Deployment

To enable GitHub Pages:

1. Go to repository Settings
2. Click "Pages" in the left sidebar
3. Under "Source", select "main" branch
4. Select "/ (root)" folder
5. Click "Save"
6. Wait 1-2 minutes
7. Visit: `https://YOUR_USERNAME.github.io/airai-chat-app/`

## Tips

- Commit often with clear messages
- Use branches for new features
- Pull before you push
- Never commit sensitive data (API keys, passwords)
- Use `.gitignore` to exclude files

## Need More Help?

- GitHub Docs: https://docs.github.com
- Git Guide: https://rogerdudler.github.io/git-guide/
- GitHub Desktop App: https://desktop.github.com/ (GUI alternative)
