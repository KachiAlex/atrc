# ATRC Deployment - Complete Guide

## 📋 Overview

This directory contains everything you need to deploy the ATRC application to your VPS (161.97.107.107).

### Deployment Options

| Option | Difficulty | Time | Automation |
|--------|-----------|------|-----------|
| **[Option 1: Automated](#option-1-fully-automated-recommended)** | ⭐ Easy | 5 min | Full |
| **[Option 2: Quick Manual](#option-2-quick-manual)** | ⭐⭐ Medium | 15 min | Partial |
| **[Option 3: Step-by-Step](#option-3-step-by-step-manual)** | ⭐⭐⭐ Advanced | 30 min | None |

---

## ✨ Option 1: Fully Automated (Recommended)

**Best for:** First-time deployers, fastest deployment

### What it does:
- ✓ Builds the React app locally
- ✓ Uploads files to VPS via SSH
- ✓ Installs dependencies on VPS
- ✓ Starts the app with PM2
- ✓ Verifies everything works

### Prerequisites:
- Node.js installed on local machine
- OpenSSH Client for Windows (built-in on Windows 10+)
- SSH access to VPS

### How to run:

**In PowerShell:**

```powershell
cd c:\atrc
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
.\auto-deploy.ps1
```

**That's it!** The script handles everything. When complete:
- Your app is live at `http://161.97.107.107`
- PM2 manages the process
- Auto-restart on VPS reboot

### Troubleshooting automated script:

**SSH fails:**
```powershell
# Test SSH connection
ssh root@161.97.107.107

# Check if SSH client is installed
ssh -V
```

**npm not found:**
```powershell
# Install Node.js from https://nodejs.org/
# Then restart PowerShell
```

---

## 🚀 Option 2: Quick Manual

**Best for:** Users who want to understand each step, or if automated script fails

### Prerequisites:
- Node.js installed
- SSH/SCP tools available
- Read: QUICK_DEPLOY.md

### Time: ~15 minutes

### Steps:

#### 1. Build locally (2 min)
```powershell
cd c:\atrc
npm install
npm run build
```

#### 2. SSH to VPS and install dependencies (3 min)
```powershell
ssh root@161.97.107.107
```

```bash
sudo apt-get update
sudo apt-get install -y nodejs npm nginx curl
sudo npm install -g pm2
mkdir -p /var/www/atrc
```

#### 3. Upload files (3 min)
*In new PowerShell window:*
```powershell
cd c:\atrc
scp -r build root@161.97.107.107:/var/www/atrc/
scp package.json root@161.97.107.107:/var/www/atrc/
scp package-lock.json root@161.97.107.107:/var/www/atrc/
```

#### 4. Start the app (5 min)
*Back in VPS window:*
```bash
cd /var/www/atrc
npm install --production
pm2 start npm --name "atrc-app" -- start -- --port 3000
pm2 save
pm2 startup
```

#### 5. Verify
```bash
pm2 status
curl http://localhost:3000
```

**Done!** App is at `http://161.97.107.107`

---

## 📖 Option 3: Step-by-Step Manual

**Best for:** Learning, debugging, custom configurations

See `DEPLOYMENT_GUIDE.md` for detailed explanations of each step.

---

## 🔧 After Deployment

### Monitor Application

```bash
# Check status
ssh root@161.97.107.107 'pm2 status'

# View logs
ssh root@161.97.107.107 'pm2 logs atrc-app'

# Real-time monitor
ssh root@161.97.107.107 'pm2 monit'
```

### Restart Application

After code changes:

```powershell
# Local machine
cd c:\atrc
npm run build
scp -r build root@161.97.107.107:/var/www/atrc/
```

```bash
# On VPS
cd /var/www/atrc
pm2 restart atrc-app
```

### View Application Logs

```bash
ssh root@161.97.107.107 'pm2 logs atrc-app --lines 50'
```

### Stop/Start Application

```bash
# Stop
ssh root@161.97.107.107 'pm2 stop atrc-app'

# Start
ssh root@161.97.107.107 'pm2 start atrc-app'

# Restart
ssh root@161.97.107.107 'pm2 restart atrc-app'
```

---

## 🔐 Security Hardening

### 1. Change Default Password
```bash
sudo passwd root
```

### 2. Setup SSH Key Authentication
```powershell
# Generate key pair on Windows
ssh-keygen -t rsa -b 4096

# Copy to VPS
scp $env:USERPROFILE\.ssh\id_rsa.pub root@161.97.107.107:~/
```

```bash
# On VPS
cat ~/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### 3. Setup Firewall
```bash
sudo ufw enable
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS (if using SSL)
```

### 4. Install SSL Certificate (Let's Encrypt)
```bash
sudo apt-get install -y certbot
sudo certbot certonly --standalone -d your-domain.com
```

### 5. Setup Nginx Reverse Proxy with SSL
See `DEPLOYMENT_GUIDE.md` for detailed Nginx configuration

### 6. Move Firebase Credentials to Environment Variables
Update `src/firebase/config.js` to use environment variables instead of hardcoded values

---

## 🚨 Troubleshooting

### Can't connect to VPS

**Problem:** SSH connection refused
```bash
# Solution 1: Check if SSH is enabled
ping 161.97.107.107

# Solution 2: Check firewall
# Contact VPS provider to ensure port 22 is open

# Solution 3: Test connection with verbose output
ssh -v root@161.97.107.107
```

### App won't start

**Problem:** PM2 shows "errored" status
```bash
# Check logs
pm2 logs atrc-app

# Verify dependencies
npm install --production

# Check Node version
node --version  # Should be v14+
```

### Port already in use

**Problem:** Can't start app on port 3000
```bash
# Find process using port
sudo lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
pm2 start npm --name "atrc-app" -- start -- --port 3001
```

### Build upload fails

**Problem:** SCP doesn't work
```powershell
# Option 1: Install OpenSSH
# Settings > Apps > Optional features > Add OpenSSH Client

# Option 2: Use WinSCP GUI
# Download from https://winscp.net/

# Option 3: Use Putty PSCP
# Download from https://www.putty.org/
```

### Firebase credentials not working

**Problem:** Authentication fails in the app
```bash
# Verify Firebase config on VPS
grep -n "REACT_APP_FIREBASE" /var/www/atrc/build/index.html

# Update environment variables
export REACT_APP_FIREBASE_API_KEY=xxx
pm2 restart atrc-app
```

---

## 📊 Monitoring & Maintenance

### Regular Checks
```bash
# Weekly: Check app status
pm2 status

# Weekly: Check disk space
df -h

# Monthly: Update packages
sudo apt-get update && sudo apt-get upgrade -y

# Monthly: Check logs for errors
pm2 logs atrc-app --lines 200
```

### Backup Strategy
```bash
# Backup app files
tar -czf atrc-backup.tar.gz /var/www/atrc/

# Backup Firestore (via Firebase console)
# Automated exports: https://firebase.google.com/docs/firestore/backups
```

### Log Management
```bash
# View PM2 logs
pm2 logs atrc-app

# Rotate logs
pm2 save
pm2 kill
pm2 resurrect

# Clear old logs
pm2 logs atrc-app --nostream
```

---

## 🎯 Next Steps After Deployment

1. **✓ Test the app**
   - Visit `http://161.97.107.107`
   - Test core functionality

2. **Setup HTTPS/SSL**
   - Install Let's Encrypt certificate
   - Update Nginx configuration
   - Enable HTTPS

3. **Setup Domain Name**
   - Point your domain to the VPS IP
   - Update SSL certificate for domain

4. **Configure Monitoring**
   - Setup alerts for app crashes
   - Monitor CPU/memory usage
   - Setup log aggregation

5. **Setup Backups**
   - Automate daily Firestore exports
   - Backup server config files
   - Test restore procedures

6. **Performance Optimization**
   - Enable gzip compression
   - Setup CDN for static assets
   - Optimize image serving

---

## 📞 Support Resources

- **PM2 Documentation**: https://pm2.keymetrics.io/
- **Nginx Documentation**: https://nginx.org/
- **Node.js Best Practices**: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
- **Firebase Deployment**: https://firebase.google.com/docs
- **Linux Commands**: https://linux.com/training/

---

## 📝 Deployment Checklist

- [ ] Node.js installed locally (`node --version`)
- [ ] SSH access to VPS working (`ssh root@161.97.107.107`)
- [ ] App builds successfully (`npm run build`)
- [ ] Deployment script runs without errors
- [ ] App accessible at `http://161.97.107.107`
- [ ] Firebase credentials working (login/signup)
- [ ] Database operations working (create/read/update)
- [ ] PM2 auto-restart on reboot configured
- [ ] Firewall rules configured (ports 80, 443)
- [ ] SSL certificate installed
- [ ] Domain DNS pointing to VPS
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured

---

## 🎉 Success!

Your ATRC application is now deployed and running on your VPS!

**Access:** `http://161.97.107.107`

**Questions?** Check the troubleshooting section above or review the specific deployment guide for your chosen method.

---

**Last Updated:** October 15, 2026
**Version:** 1.0
