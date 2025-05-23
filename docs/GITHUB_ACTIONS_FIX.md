# GitHub Actions Fix

## Issue: Docker Registry Tag Name

The error occurred because Docker registry requires lowercase repository names.

### Original Error:
```
ERROR: invalid tag "ghcr.io/Nopass0/voice-backend:latest": repository name must be lowercase
```

### Solution Applied:

1. **Updated `.github/workflows/deploy.yml`**:
   - Changed from: `${{ github.repository }}-backend` (which was `Nopass0/voice`)
   - Changed to: `nopass0/voice-backend` (all lowercase)

2. **Fixed Docker image tags**:
   ```yaml
   # Backend
   tags: ${{ env.REGISTRY }}/nopass0/voice-backend:latest
   
   # Frontend  
   tags: ${{ env.REGISTRY }}/nopass0/voice-frontend:latest
   ```

3. **Updated Frontend Dockerfile** for Next.js standalone mode:
   - Added `output: 'standalone'` to `next.config.js`
   - Updated Dockerfile to use standalone build
   - Changed CMD to use `node server.js` instead of `npm start`

## To Apply These Changes:

1. Commit and push the changes:
   ```bash
   git add .
   git commit -m "Fix: Docker registry lowercase naming and Next.js standalone build"
   git push origin main
   ```

2. The GitHub Actions workflow will now:
   - Build images with correct lowercase names
   - Push to `ghcr.io/nopass0/voice-backend:latest`
   - Push to `ghcr.io/nopass0/voice-frontend:latest`

## Verify Fix:

After pushing, check GitHub Actions tab to ensure:
- ✅ Build completes without errors
- ✅ Images are pushed to registry
- ✅ Deployment succeeds

## Additional Notes:

- Docker registry names must always be lowercase
- GitHub username in registry path is automatically lowercased
- The standalone Next.js build reduces Docker image size