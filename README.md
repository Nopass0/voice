# Voice P2P Payment Platform

A secure P2P payment platform with cryptocurrency integration built with Bun, Elysia.js (backend) and Next.js (frontend).

## 🚀 Quick Start (Auto-Install)

### One-Command Setup

The project automatically installs all required dependencies!

#### Linux/macOS:
```bash
./quick-start.sh
```

#### Windows:
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\install-windows.ps1
```

### Manual Quick Start

### Development

```bash
# Install dependencies
cd backend && bun install
cd ../frontend && npm install

# Run in development mode
./dev.sh  # Linux/Mac
# or
dev.bat   # Windows
```

The application will be available at:
- Backend API: http://localhost:3000
- Frontend: http://localhost:3001

### Production Deployment

1. **Setup SSL Certificate**:
   ```bash
   ./setup-ssl.sh
   ```
   Follow the instructions to complete SSL setup.

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

3. **Deploy**:
   ```bash
   ./deploy.sh
   ```

## 📁 Project Structure

```
voice_project/
├── backend/          # Elysia.js API server
├── frontend/         # Next.js web application  
├── nginx/           # Nginx configuration
├── ssl/             # SSL certificates
├── docker-compose.yml
└── deploy.sh        # Deployment script
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
POSTGRES_PASSWORD=your_secure_password

# JWT Secret
JWT_SECRET=your_jwt_secret

# Domain
DOMAIN=voicecxr.pro
```

### SSL Certificate

Place your SSL certificate files in the `ssl/` directory:
- `ssl/private.key` - Private key (already included)
- `ssl/fullchain.pem` - Full certificate chain (obtain from AlphaSSL)

## 🛠️ Scripts

- `./dev.sh` - Start development environment
- `./deploy.sh` - Deploy to production
- `./backup.sh` - Create backup of database and files
- `./setup-ssl.sh` - SSL setup instructions

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (Admin, Merchant, Trader)
- IP whitelisting for admin access
- SSL/TLS encryption
- Secure password hashing
- CORS protection

## 📊 Features

- Multi-role user system
- Transaction management (IN/OUT)
- Cryptocurrency wallet integration (USDT/TRX)
- Bank detail management
- Receipt verification
- Real-time notifications
- Admin dashboard
- Mobile-responsive UI

## 🐳 Docker Services

- **postgres** - PostgreSQL database
- **backend** - Elysia.js API server
- **frontend** - Next.js application
- **nginx** - Reverse proxy with SSL

## 📝 Maintenance

### Backup
```bash
./backup.sh
```

### View Logs
```bash
docker-compose logs -f [service_name]
```

### Database Migrations
```bash
docker-compose exec backend bun run prisma migrate deploy
```

## 🤝 Support

For issues or questions, please check the documentation or create an issue in the repository.