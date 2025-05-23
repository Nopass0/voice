# Deployment Setup Instructions

## Prerequisites

Before deploying, you need to add the following secrets to your GitHub repository:

### Required GitHub Secrets

1. **SSL_PRIVATE_KEY** - Your SSL private key
2. **SSL_FULLCHAIN** - Your SSL certificate chain (optional if copying via SCP)
3. **POSTGRES_PASSWORD** - PostgreSQL database password
4. **JWT_SECRET** - JWT secret for authentication
5. **SERVER_HOST** - Your server IP address (e.g., 194.58.105.224)
6. **SERVER_USER** - SSH user (usually `root`)
7. **SERVER_PORT** - SSH port (usually `22`)
8. **SERVER_SSH_KEY** - Your SSH private key for server access

### How to Add GitHub Secrets

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the appropriate name and value

### SSL Certificate Secrets

For **SSL_PRIVATE_KEY**, copy the entire content including the BEGIN and END lines:
```
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA0xxJKlCKTm6s9CkyJKMj3GO4wEYdP4OdFKAbYZ7OzzdAdHhy
... (your key content) ...
Jp9MrqSyKRJLyU6R0kNlz2vfD7G5fF4h6vHQ6n7qN0eV/e8kNQ8y
-----END RSA PRIVATE KEY-----
```

For **SSL_FULLCHAIN**, copy the entire certificate chain including all certificates.

### Manual SSL Fix (if needed)

If the deployment fails due to SSL issues, you can manually fix it:

1. SSH to your server:
   ```bash
   ssh root@194.58.105.224
   ```

2. Create the SSL private key:
   ```bash
   cat > /opt/voice/ssl/private.key << 'EOF'
   -----BEGIN RSA PRIVATE KEY-----
   (paste your private key here)
   -----END RSA PRIVATE KEY-----
   EOF
   ```

3. Set correct permissions:
   ```bash
   chmod 600 /opt/voice/ssl/private.key
   chown root:root /opt/voice/ssl/private.key
   ```

4. Restart services:
   ```bash
   cd /opt/voice
   docker-compose down
   docker-compose up -d
   ```

5. Run database migrations:
   ```bash
   docker-compose exec -T backend bun run prisma db push
   ```

## Deployment Process

Once all secrets are configured, the deployment will automatically:

1. Build Docker images for frontend and backend
2. Push images to GitHub Container Registry
3. Copy necessary files to the server
4. Create SSL certificates from secrets
5. Pull and run the latest Docker images
6. Run database migrations
7. Start all services with SSL enabled

The site will be available at: https://voicecxr.pro