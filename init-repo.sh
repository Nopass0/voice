#!/bin/bash

# Initialize Git Repository for Voice Project

echo "🚀 Initializing Voice Project repository..."

# Initialize git if not already initialized
if [ ! -d .git ]; then
    git init
    echo "✅ Git repository initialized"
else
    echo "ℹ️  Git repository already exists"
fi

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Voice P2P Payment Platform

- Backend: Elysia.js + Prisma + PostgreSQL
- Frontend: Next.js + Tailwind CSS
- Docker configuration for production
- Nginx with SSL support
- GitHub Actions CI/CD pipeline
- Development and deployment scripts"

echo ""
echo "📋 Next steps:"
echo ""
echo "1. Create a new repository on GitHub"
echo "2. Add the remote origin:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/voice-project.git"
echo ""
echo "3. Push to GitHub:"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. Configure GitHub Secrets (see docs/GITHUB_SECRETS.md)"
echo ""
echo "5. Your CI/CD pipeline will automatically deploy on push to main!"