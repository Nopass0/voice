#!/bin/bash

# Production Setup Script for Voice Project

echo "🔧 Setting up Voice Project for production deployment..."

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ] && ! command -v sudo &> /dev/null; then 
    echo "⚠️  Please run as root or install sudo"
    exit 1
fi

# Function to run commands with sudo if not root
run_cmd() {
    if [ "$EUID" -ne 0 ]; then
        sudo "$@"
    else
        "$@"
    fi
}

# Update system
echo "📦 Updating system packages..."
run_cmd apt-get update

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    run_cmd sh get-docker.sh
    rm get-docker.sh
    
    # Add current user to docker group
    if [ "$EUID" -ne 0 ]; then
        sudo usermod -aG docker $USER
        echo "ℹ️  You may need to log out and back in for docker group changes to take effect"
    fi
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Installing Docker Compose..."
    run_cmd curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    run_cmd chmod +x /usr/local/bin/docker-compose
fi

# Create application directory
echo "📁 Creating application directory..."
run_cmd mkdir -p /opt/voice
run_cmd chown -R $USER:$USER /opt/voice 2>/dev/null || true

# Setup firewall
echo "🔒 Configuring firewall..."
if command -v ufw &> /dev/null; then
    run_cmd ufw allow 22/tcp
    run_cmd ufw allow 80/tcp
    run_cmd ufw allow 443/tcp
    echo "y" | run_cmd ufw enable || true
fi

# Generate SSH key for GitHub Actions if it doesn't exist
if [ ! -f ~/.ssh/github_actions ]; then
    echo "🔑 Generating SSH key for GitHub Actions..."
    ssh-keygen -t rsa -b 4096 -C "github-actions@voice" -f ~/.ssh/github_actions -N ""
    
    # Add to authorized_keys
    cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
    
    echo ""
    echo "📋 SSH Key Generated!"
    echo "Add this private key to GitHub Secrets as SERVER_SSH_KEY:"
    echo "=================================================="
    cat ~/.ssh/github_actions
    echo "=================================================="
    echo ""
fi

# Create deployment user (optional)
read -p "Create dedicated deployment user 'deploy'? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if ! id "deploy" &>/dev/null; then
        run_cmd useradd -m -s /bin/bash deploy
        run_cmd usermod -aG docker deploy
        
        # Setup SSH for deploy user
        run_cmd mkdir -p /home/deploy/.ssh
        run_cmd cp ~/.ssh/github_actions.pub /home/deploy/.ssh/authorized_keys
        run_cmd chown -R deploy:deploy /home/deploy/.ssh
        run_cmd chmod 700 /home/deploy/.ssh
        run_cmd chmod 600 /home/deploy/.ssh/authorized_keys
        
        # Give deploy user access to /opt/voice
        run_cmd chown -R deploy:deploy /opt/voice
        
        echo "✅ Deployment user 'deploy' created"
    fi
fi

# Check Docker installation
echo ""
echo "🔍 Checking installations..."
docker --version
docker-compose --version

echo ""
echo "✅ Production setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure GitHub Secrets (see docs/GITHUB_SECRETS.md)"
echo "2. Obtain SSL certificate from AlphaSSL"
echo "3. Push code to GitHub to trigger automatic deployment"
echo ""
echo "🌐 Server Information:"
echo "   IP Address: $(curl -s ifconfig.me || echo "Could not determine")"
echo "   SSH Port: ${SSH_PORT:-22}"
echo "   App Directory: /opt/voice"
echo ""

# Save server info for reference
cat > server-info.txt << EOL
Voice Project Server Information
================================
IP Address: $(curl -s ifconfig.me || echo "Could not determine")
SSH Port: ${SSH_PORT:-22}
App Directory: /opt/voice
User: ${USER}
Date: $(date)
EOL

echo "Server information saved to server-info.txt"