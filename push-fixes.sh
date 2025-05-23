#!/bin/bash

echo "🚀 Pushing fixes to GitHub..."

# Try to push with different methods
echo "Attempting to push changes..."

# Method 1: Standard push
if git push origin main; then
    echo "✅ Successfully pushed to GitHub!"
    exit 0
fi

echo "❌ Standard push failed. Trying alternative methods..."

# Method 2: Force push (be careful!)
read -p "Try force push? This will overwrite remote changes [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if git push -f origin main; then
        echo "✅ Force push successful!"
        exit 0
    fi
fi

# Method 3: Create patch files
echo "Creating patch files for manual application..."
git format-patch origin/main --stdout > voice-fixes.patch
echo "✅ Created voice-fixes.patch"
echo "You can apply this patch on another machine with:"
echo "  git am < voice-fixes.patch"

# Method 4: Create bundle
echo ""
echo "Creating git bundle..."
git bundle create voice-project-complete.bundle --all
echo "✅ Created voice-project-complete.bundle"
echo ""
echo "Transfer this file and on another machine run:"
echo "  git clone voice-project-complete.bundle voice"
echo "  cd voice"
echo "  git remote set-url origin https://github.com/Nopass0/voice.git"
echo "  git push origin main"

echo ""
echo "📋 Summary of fixes included:"
echo "- Backend and frontend are now regular directories (not submodules)"
echo "- All Dockerfiles are included"
echo "- GitHub Actions will now find the Dockerfile"
echo "- Docker registry names are lowercase"
echo ""
echo "If network issues persist, use the bundle or patch file to push from another location."