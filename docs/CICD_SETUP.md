# CI/CD Setup Guide

This guide will help you set up automatic deployment for the Voice Project.

## Prerequisites

1. A production server with Ubuntu 20.04+ or similar
2. A GitHub account
3. Domain name (voicecxr.pro) pointing to your server
4. SSL certificate from AlphaSSL

## Step 1: Prepare Your Server

SSH into your production server and run:

```bash
# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/voice-project/main/setup-production.sh | bash
```

Or manually:
1. Copy `setup-production.sh` to your server
2. Run: `chmod +x setup-production.sh && ./setup-production.sh`

This will:
- Install Docker and Docker Compose
- Configure firewall
- Generate SSH keys for GitHub Actions
- Create deployment directory

## Step 2: Configure GitHub Repository

1. Create a new repository on GitHub
2. Push your code:
   ```bash
   cd /mnt/c/Projects/voice_project
   ./init-repo.sh
   git remote add origin https://github.com/YOUR_USERNAME/voice-project.git
   git push -u origin main
   ```

## Step 3: Configure GitHub Secrets

1. Go to your repository → Settings → Secrets and variables → Actions
2. Add the following secrets:

   | Secret Name | Value |
   |------------|-------|
   | SERVER_HOST | Your server IP (e.g., 95.163.152.102) |
   | SERVER_USER | SSH username (e.g., root or deploy) |
   | SERVER_PORT | SSH port (usually 22) |
   | SERVER_SSH_KEY | Private SSH key from setup script |
   | POSTGRES_PASSWORD | Secure database password |
   | JWT_SECRET | Secure JWT secret (32+ chars) |
   | SSL_FULLCHAIN | SSL certificate chain (after getting from AlphaSSL) |

## Step 4: SSL Certificate Setup

1. You already have:
   - Private key: `ssl/private.key`
   - CSR: `ssl/voicecxr.pro.csr`

2. Submit CSR to AlphaSSL and get certificate

3. Once received, add to GitHub Secrets:
   - Combine all certificates into SSL_FULLCHAIN secret

## Step 5: Trigger Deployment

Deployment happens automatically when you:
- Push to `main` branch
- Manually trigger via GitHub Actions tab

## Deployment Flow

1. **Push to GitHub** → Triggers GitHub Actions
2. **Build** → Creates Docker images
3. **Push Images** → To GitHub Container Registry
4. **Deploy** → 
   - Copies files to server
   - Pulls new images
   - Restarts services
   - Runs migrations

## Monitoring

- **GitHub Actions**: Check Actions tab for deployment status
- **Server Logs**: 
  ```bash
  ssh user@server
  cd /opt/voice
  docker-compose logs -f
  ```

## Rollback

If deployment fails:
```bash
ssh user@server
cd /opt/voice
docker-compose down
docker-compose up -d
```

## Troubleshooting

### Permission Denied
- Ensure SSH key is added to server's authorized_keys
- Check file permissions: `chmod 600 ~/.ssh/authorized_keys`

### Docker Not Found
- Run setup-production.sh script
- Or install Docker manually

### SSL Certificate Issues
- Ensure SSL_FULLCHAIN secret contains full certificate chain
- Check certificate dates and domain match

### Database Connection Failed
- Verify POSTGRES_PASSWORD secret
- Check if database container is running
- Review docker-compose logs

## Security Best Practices

1. Use strong passwords for all secrets
2. Regularly update dependencies
3. Monitor server logs
4. Keep backups (use `backup.sh`)
5. Use deploy user instead of root
6. Enable 2FA on GitHub account

## Support

For issues:
1. Check GitHub Actions logs
2. Review server logs
3. Verify all secrets are set correctly
4. Ensure server meets requirements