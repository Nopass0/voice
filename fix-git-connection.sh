#!/bin/bash

echo "🔧 Fixing Git connection issues..."

# Test GitHub connectivity
echo "Testing GitHub connection..."
if ! curl -s https://github.com > /dev/null; then
    echo "❌ Cannot connect to GitHub via HTTPS"
    echo ""
    echo "Try these solutions:"
    echo ""
    echo "1. Use SSH instead of HTTPS:"
    echo "   git remote set-url origin git@github.com:Nopass0/voice.git"
    echo ""
    echo "2. Configure Git to use system proxy (if behind proxy):"
    echo "   git config --global http.proxy http://proxy.example.com:8080"
    echo "   git config --global https.proxy http://proxy.example.com:8080"
    echo ""
    echo "3. Try using GitHub CLI:"
    echo "   gh repo clone Nopass0/voice"
    echo ""
    echo "4. Use personal access token:"
    echo "   git remote set-url origin https://YOUR_TOKEN@github.com/Nopass0/voice.git"
    echo ""
else
    echo "✅ GitHub is accessible"
    
    # Try different git configurations
    echo ""
    echo "Trying to fix git configuration..."
    
    # Option 1: Increase buffer size
    git config --global http.postBuffer 524288000
    
    # Option 2: Use IPv4 only
    git config --global core.gitproxy '"proxy-command" for kernel.org'
    
    # Option 3: Disable SSL verification (temporary, not recommended for production)
    read -p "Temporarily disable SSL verification? (not recommended) [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git config --global http.sslVerify false
        echo "⚠️  SSL verification disabled. Remember to re-enable it later:"
        echo "   git config --global http.sslVerify true"
    fi
    
    echo ""
    echo "Try pushing again:"
    echo "   git push origin main"
fi

# Alternative: Create a bundle for manual transfer
echo ""
read -p "Create a git bundle for manual transfer? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Creating git bundle..."
    git bundle create voice-project.bundle --all
    echo "✅ Bundle created: voice-project.bundle"
    echo ""
    echo "You can:"
    echo "1. Upload this file manually to GitHub"
    echo "2. Transfer to another machine with better connectivity"
    echo "3. Import with: git clone voice-project.bundle"
fi