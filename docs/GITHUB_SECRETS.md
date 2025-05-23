# GitHub Secrets Configuration

To enable automatic deployment via GitHub Actions, you need to configure the following secrets in your GitHub repository settings.

## Required Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add the following secrets:

### 1. Server Connection Secrets

- **SERVER_HOST** - IP address or hostname of your production server
  ```
  Example: 95.163.152.102
  ```

- **SERVER_USER** - SSH username for server access
  ```
  Example: root
  ```

- **SERVER_PORT** - SSH port (default is 22)
  ```
  Example: 22
  ```

- **SERVER_SSH_KEY** - Private SSH key for server access
  ```
  To generate:
  ssh-keygen -t rsa -b 4096 -C "github-actions@voice"
  
  Then add the public key to your server's ~/.ssh/authorized_keys
  and paste the private key content here
  ```

### 2. Application Secrets

- **POSTGRES_PASSWORD** - Production database password
  ```
  Example: your-very-secure-database-password-here
  ```

- **JWT_SECRET** - JWT secret for authentication
  ```
  Example: your-super-secret-jwt-key-minimum-32-characters
  ```

### 3. SSL Certificate (✅ Ready)

- **SSL_FULLCHAIN** - Full SSL certificate chain
  ```
  The certificate is already created in ssl/fullchain.pem
  Copy the entire content of that file and paste it as the secret value.
  
  The certificate is valid until June 24, 2026.
  ```

## How to Add Secrets

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. In the left sidebar, click "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Enter the secret name (e.g., SERVER_HOST)
6. Enter the secret value
7. Click "Add secret"

## Deployment Process

Once all secrets are configured:

1. Any push to `main` or `master` branch will trigger automatic deployment
2. The workflow will:
   - Build Docker images
   - Push them to GitHub Container Registry
   - Deploy to your server
   - Run database migrations
   - Restart all services

## Manual Deployment

You can also trigger deployment manually:
1. Go to Actions tab in your repository
2. Select "Deploy to Production" workflow
3. Click "Run workflow"
4. Select branch and click "Run workflow"

## Monitoring Deployments

- Check the Actions tab to see deployment status
- Green checkmark = successful deployment
- Red X = deployment failed (check logs)

## Server Requirements

Your production server should have:
- Docker and Docker Compose installed
- Port 80 and 443 open for web traffic
- Port 22 (or custom SSH port) for GitHub Actions access
- At least 2GB RAM
- 20GB+ available disk space