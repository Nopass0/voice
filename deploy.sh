#!/bin/bash

# Production deployment script for Voice Project

set -e

echo "🚀 Deploying Voice Project to production..."

# Function to detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/debian_version ]; then
            echo "debian"
        elif [ -f /etc/redhat-release ]; then
            echo "redhat"
        else
            echo "linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
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
            echo "❌ This script requires sudo privileges. Please run as root or install sudo."
            exit 1
        fi
    else
        "$@"
    fi
}

OS=$(detect_os)

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "📦 Docker not found. Installing Docker..."
    
    if [ "$OS" == "debian" ]; then
        # Update package index
        run_cmd apt-get update
        
        # Install prerequisites
        run_cmd apt-get install -y \
            ca-certificates \
            curl \
            gnupg \
            lsb-release
        
        # Add Docker's official GPG key
        run_cmd mkdir -p /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | run_cmd gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        
        # Set up repository
        echo \
          "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
          $(lsb_release -cs) stable" | run_cmd tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        # Install Docker
        run_cmd apt-get update
        run_cmd apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        
    elif [ "$OS" == "redhat" ]; then
        # Install Docker on RedHat/CentOS
        run_cmd yum install -y yum-utils
        run_cmd yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
        run_cmd yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
        run_cmd systemctl start docker
        run_cmd systemctl enable docker
        
    else
        # Generic installation
        curl -fsSL https://get.docker.com -o get-docker.sh
        run_cmd sh get-docker.sh
        rm get-docker.sh
    fi
    
    # Start Docker service
    run_cmd systemctl start docker 2>/dev/null || true
    run_cmd systemctl enable docker 2>/dev/null || true
    
    # Add current user to docker group if not root
    if [ "$EUID" -ne 0 ]; then
        sudo usermod -aG docker $USER
        echo "ℹ️  Added $USER to docker group. You may need to log out and back in."
    fi
    
    echo "✅ Docker installed successfully"
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Docker Compose not found. Installing Docker Compose..."
    
    # Check if docker compose (v2) is available
    if docker compose version &> /dev/null; then
        echo "ℹ️  Docker Compose v2 is available as 'docker compose'"
        # Create alias for compatibility
        run_cmd ln -sf /usr/bin/docker /usr/local/bin/docker-compose
        echo '#!/bin/bash' | run_cmd tee /usr/local/bin/docker-compose > /dev/null
        echo 'docker compose "$@"' | run_cmd tee -a /usr/local/bin/docker-compose > /dev/null
        run_cmd chmod +x /usr/local/bin/docker-compose
    else
        # Install standalone docker-compose
        COMPOSE_VERSION="2.24.0"
        run_cmd curl -L "https://github.com/docker/compose/releases/download/v${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        run_cmd chmod +x /usr/local/bin/docker-compose
    fi
    
    echo "✅ Docker Compose installed successfully"
fi

# Verify installations
echo "🔍 Verifying installations..."
docker --version
docker-compose --version || docker compose version

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Copying from .env.example..."
    cp .env.example .env
    echo "📝 Please update .env with your production values before continuing."
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p nginx/logs
mkdir -p backend/uploads
mkdir -p ssl

# Check if SSL certificate exists
if [ ! -f "ssl/fullchain.pem" ] || [ ! -f "ssl/private.key" ]; then
    echo "⚠️  SSL certificate files not found in ssl/ directory."
    echo "   Please place your SSL certificate files:"
    echo "   - ssl/fullchain.pem (certificate chain)"
    echo "   - ssl/private.key (private key)"
    exit 1
fi

# Set proper permissions for SSL files
chmod 600 ssl/private.key
chmod 644 ssl/fullchain.pem

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main || true

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start containers
echo "🔨 Building Docker images..."
docker-compose build --no-cache

echo "🚀 Starting containers..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec backend bun run prisma migrate deploy

# Check deployment status
echo "✅ Checking deployment status..."
docker-compose ps

echo "🎉 Deployment complete!"
echo ""
echo "🌐 Your application is now available at:"
echo "   https://voicecxr.pro"
echo ""
echo "📊 To view logs:"
echo "   docker-compose logs -f [service_name]"
echo ""
echo "🛑 To stop the application:"
echo "   docker-compose down"