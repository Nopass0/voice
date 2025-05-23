# 🚀 Voice Project Deployment Guide

## ✅ Prerequisites Checklist

- [x] SSL Certificate installed (valid until June 24, 2026)
- [ ] GitHub repository created
- [ ] Production server ready
- [ ] Domain voicecxr.pro pointing to server

## 📋 Step-by-Step Deployment

### 1. Initialize Git Repository

```bash
cd /mnt/c/Projects/voice_project
./init-repo.sh
```

### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Create repository named `voice-project` (or your preferred name)
3. Don't initialize with README

### 3. Push Code to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/voice-project.git
git branch -M main
git push -u origin main
```

### 4. Configure GitHub Secrets

Go to: Settings → Secrets and variables → Actions

Add these secrets:

| Secret | Value |
|--------|-------|
| SERVER_HOST | Your server IP |
| SERVER_USER | root (or deploy user) |
| SERVER_PORT | 22 |
| SERVER_SSH_KEY | (see below) |
| POSTGRES_PASSWORD | (generate secure password) |
| JWT_SECRET | (generate 32+ char secret) |
| SSL_FULLCHAIN | (copy from ssl/fullchain.pem) |

#### Generate SSH Key for GitHub Actions:
```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_actions -N ""
cat ~/.ssh/github_actions  # Copy this as SERVER_SSH_KEY
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
```

#### Copy SSL Certificate:
```bash
cat ssl/fullchain.pem  # Copy entire content as SSL_FULLCHAIN
```

### 5. Prepare Production Server

SSH into your server and run:

```bash
curl -fsSL https://raw.githubusercontent.com/Nopass0/voice/main/setup-production.sh | bash
```

Or manually setup Docker.

### 6. Trigger Deployment

#### Option A: Automatic (push to main)
```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

#### Option B: Manual (GitHub Actions)
1. Go to Actions tab
2. Select "Deploy to Production"
3. Click "Run workflow"

### 7. Monitor Deployment

Check GitHub Actions for deployment status.

After successful deployment:
- Frontend: https://voicecxr.pro
- API: https://voicecxr.pro/api

### 8. Verify Deployment

```bash
# Check services
curl https://voicecxr.pro
curl https://voicecxr.pro/api/info/health

# Check SSL
curl -I https://voicecxr.pro
```

## 🔧 Post-Deployment

### Database Migrations
```bash
ssh user@server
cd /opt/voice
docker-compose exec backend bun run prisma migrate deploy
```

### View Logs
```bash
docker-compose logs -f
```

### Backup
```bash
./backup.sh
```

## 🚨 Troubleshooting

### SSL Issues
```bash
./check-ssl.sh  # Run locally
docker-compose exec nginx nginx -t  # Test nginx config
```

### Database Connection
```bash
docker-compose exec backend bun run prisma db push
```

### Container Issues
```bash
docker-compose ps
docker-compose restart [service]
```

## 📅 Maintenance

- SSL Certificate expires: June 24, 2026
- Regular backups: Setup cron job for `./backup.sh`
- Monitor disk space: Docker images can accumulate

## 🎉 Success!

Your Voice P2P Payment Platform is now live at https://voicecxr.pro!
