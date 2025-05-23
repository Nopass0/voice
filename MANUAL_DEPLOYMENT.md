# Manual Deployment Guide (Network Issues)

Since you're having connection issues with GitHub, here are alternative deployment methods:

## Option 1: Use Different Network

Try:
- Different WiFi network
- Mobile hotspot
- VPN connection
- Proxy server

## Option 2: Manual File Transfer

1. **Create archive of the project**:
   ```bash
   cd /mnt/c/Projects
   tar -czf voice_project.tar.gz voice_project/ --exclude='node_modules' --exclude='.next' --exclude='uploads'
   ```

2. **Transfer to server directly**:
   - Use USB drive
   - Use cloud storage (Google Drive, Dropbox)
   - Use file transfer service

3. **On the server**:
   ```bash
   # Extract archive
   tar -xzf voice_project.tar.gz
   cd voice_project
   
   # Run deployment
   ./deploy.sh
   ```

## Option 3: Direct Server Git Setup

1. **SSH to your production server**:
   ```bash
   ssh user@your-server-ip
   ```

2. **Clone directly on server**:
   ```bash
   cd /opt
   git clone https://github.com/Nopass0/voice.git voice
   cd voice
   ```

3. **Copy your local changes via SCP**:
   ```bash
   # From local machine
   scp -r /mnt/c/Projects/voice_project/* user@server:/opt/voice/
   ```

4. **Run deployment on server**:
   ```bash
   cd /opt/voice
   ./deploy.sh
   ```

## Option 4: Use GitHub Web Interface

1. **Create repository on GitHub.com**
2. **Upload files manually**:
   - Use GitHub's web upload feature
   - Drag and drop files
   - Create files directly in browser

## Option 5: Git Bundle Method

1. **Create bundle**:
   ```bash
   cd /mnt/c/Projects/voice_project
   git bundle create ../voice-complete.bundle --all
   ```

2. **Upload bundle** to file sharing service

3. **On another machine or server**:
   ```bash
   git clone voice-complete.bundle voice_project
   cd voice_project
   git remote set-url origin https://github.com/Nopass0/voice.git
   git push origin main
   ```

## Quick Server Deployment (Without GitHub)

If you just want to deploy without GitHub CI/CD:

```bash
# 1. Archive project
cd /mnt/c/Projects
tar -czf voice.tar.gz voice_project/ \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='uploads'

# 2. Copy to server
scp voice.tar.gz user@server:/tmp/

# 3. On server
ssh user@server
cd /opt
tar -xzf /tmp/voice.tar.gz
mv voice_project voice
cd voice

# 4. Deploy
./deploy.sh
```

## Network Troubleshooting

Try these commands to diagnose:

```bash
# Test DNS
nslookup github.com

# Test connection
ping github.com

# Test HTTPS
curl -v https://github.com

# Use different DNS
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
```

## Contact Your Network Admin

If in corporate/university network, you may need to:
- Configure proxy settings
- Request firewall exception
- Use VPN access