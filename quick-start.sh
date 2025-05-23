#!/bin/bash

# Quick Start Script for Voice Project
# This script automatically installs dependencies and starts the project

set -e

echo "🚀 Voice Project Quick Start"
echo "============================"

# Function to detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/debian_version ]; then
            echo "debian"
        elif [ -f /etc/redhat-release ]; then
            echo "redhat"
        elif [ -f /etc/arch-release ]; then
            echo "arch"
        else
            echo "linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

# Function to run commands with sudo if not root
run_cmd() {
    if [ "$EUID" -ne 0 ]; then
        if command -v sudo &> /dev/null; then
            sudo "$@"
        else
            echo "⚠️  Running without sudo. Some operations may fail."
            "$@"
        fi
    else
        "$@"
    fi
}

OS=$(detect_os)
echo "🖥️  Detected OS: $OS"

# Install Git if not installed
if ! command -v git &> /dev/null; then
    echo "📦 Installing Git..."
    case "$OS" in
        debian)
            run_cmd apt-get update && run_cmd apt-get install -y git
            ;;
        redhat)
            run_cmd yum install -y git
            ;;
        arch)
            run_cmd pacman -S --noconfirm git
            ;;
        macos)
            if command -v brew &> /dev/null; then
                brew install git
            else
                echo "❌ Please install Homebrew first: https://brew.sh"
                exit 1
            fi
            ;;
        *)
            echo "❌ Please install Git manually"
            exit 1
            ;;
    esac
fi

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    
    case "$OS" in
        debian|ubuntu)
            # Install prerequisites
            run_cmd apt-get update
            run_cmd apt-get install -y ca-certificates curl gnupg lsb-release
            
            # Add Docker's official GPG key
            run_cmd mkdir -p /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/ubuntu/gpg | run_cmd gpg --dearmor -o /etc/apt/keyrings/docker.gpg
            
            # Set up repository
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | run_cmd tee /etc/apt/sources.list.d/docker.list > /dev/null
            
            # Install Docker
            run_cmd apt-get update
            run_cmd apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            ;;
            
        redhat|centos)
            run_cmd yum install -y yum-utils
            run_cmd yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            run_cmd yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
            ;;
            
        arch)
            run_cmd pacman -S --noconfirm docker docker-compose
            ;;
            
        macos)
            echo "📋 Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
            echo "   Then restart this script"
            exit 1
            ;;
            
        windows)
            echo "📋 Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
            echo "   Then restart this script in WSL or Git Bash"
            exit 1
            ;;
            
        *)
            # Generic installation
            curl -fsSL https://get.docker.com -o get-docker.sh
            run_cmd sh get-docker.sh
            rm get-docker.sh
            ;;
    esac
    
    # Start Docker service (Linux only)
    if [[ "$OS" != "macos" ]] && [[ "$OS" != "windows" ]]; then
        run_cmd systemctl start docker 2>/dev/null || true
        run_cmd systemctl enable docker 2>/dev/null || true
        
        # Add user to docker group
        if [ "$EUID" -ne 0 ]; then
            sudo usermod -aG docker $USER
            echo "ℹ️  Added $USER to docker group. You may need to log out and back in."
        fi
    fi
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    
    if docker compose version &> /dev/null; then
        echo "✅ Docker Compose v2 is available"
    else
        # Install standalone docker-compose
        COMPOSE_VERSION="2.24.0"
        run_cmd curl -L "https://github.com/docker/compose/releases/download/v${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        run_cmd chmod +x /usr/local/bin/docker-compose
    fi
fi

# Check .env file
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration"
    ${EDITOR:-nano} .env
fi

# Check SSL certificate
if [ ! -f "ssl/fullchain.pem" ]; then
    echo "⚠️  SSL certificate not found!"
    echo "   Please obtain certificate from AlphaSSL using ssl/voicecxr.pro.csr"
    echo "   Then create ssl/fullchain.pem"
    read -p "Continue without SSL? (development only) [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Choose environment
echo ""
echo "Select environment:"
echo "1) Development (local)"
echo "2) Production (with SSL)"
read -p "Enter choice [1-2]: " ENV_CHOICE

case $ENV_CHOICE in
    1)
        echo "🔧 Starting in development mode..."
        if [[ "$OS" == "windows" ]]; then
            ./dev.bat
        else
            ./dev.sh
        fi
        ;;
    2)
        echo "🚀 Starting in production mode..."
        ./deploy.sh
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac