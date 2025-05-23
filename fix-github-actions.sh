#!/bin/bash

# Script to commit GitHub Actions fixes

echo "📝 Committing GitHub Actions fixes..."

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git not initialized. Run ./init-repo.sh first"
    exit 1
fi

# Add changes
git add .github/workflows/deploy.yml
git add frontend/Dockerfile
git add frontend/next.config.js
git add docs/GITHUB_ACTIONS_FIX.md

# Create commit
git commit -m "Fix: Docker registry lowercase naming and Next.js standalone build

- Fixed Docker image tags to use lowercase (nopass0/voice-*)
- Updated frontend Dockerfile for Next.js standalone output
- Added output: 'standalone' to next.config.js
- Changed frontend CMD to use node server.js

This fixes the GitHub Actions error:
ERROR: invalid tag 'ghcr.io/Nopass0/voice-backend:latest': repository name must be lowercase"

echo "✅ Changes committed!"
echo ""
echo "Push to GitHub to trigger fixed deployment:"
echo "  git push origin main"