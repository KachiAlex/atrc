# ATRC Quick Deployment Guide

## 🚀 Fast Track to Deployment (15 minutes)

### Prerequisites Checklist
- [ ] Node.js installed locally (`node --version`)
- [ ] SSH access to VPS (161.97.107.107)
- [ ] SSH key or password ready

---

## Phase 1: Local Build (5 minutes)

### Open PowerShell and run:

```powershell
cd c:\atrc
npm install
npm run build
```

✓ This creates a `build` folder with optimized production files

---

## Phase 2: VPS Server Setup (5 minutes)

### SSH into your VPS:

```powershell
ssh root@161.97.107.107
# Password: kpGf78?9CWdlaguk
```

### Run this command block on the VPS:

```bash
# Update and install dependencies
sudo apt-get update && sudo apt-get install -y nodejs npm nginx curl git

# Install PM2 globally
sudo npm install -g pm2

# Create deployment directory
sudo mkdir -p /var/www/atrc
sudo chown -R $USER:$USER /var/www/atrc
cd /var/www/atrc
```

---

## Phase 3: Upload Files (3 minutes)

### In a NEW PowerShell window (keep VPS window open):

```powershell
cd c:\atrc

# Upload build folder
scp -r build root@161.97.107.107:/var/www/atrc/

# Upload package files
scp package.json root@161.97.107.107:/var/www/atrc/
scp package-lock.json root@161.97.107.107:/var/www/atrc/
```

**If SCP doesn't work:**
- Download WinSCP: https://winscp.net/
- Connect to VPS and drag-drop `build`, `package.json`, `package-lock.json` to `/var/www/atrc/`

---

## Phase 4: Start Application (2 minutes)

### Back in your VPS window, run:

```bash
cd /var/www/atrc

# Install production dependencies
npm install --production

# Start with PM2
pm2 start npm --name "atrc-app" -- start -- --port 3000

# Save PM2 config
pm2 save

# Auto-start on reboot
pm2 startup

# View status
pm2 status
```

---

## Phase 5: Configure Nginx (Optional but Recommended)

### Still on VPS:

```bash
# Create nginx config
sudo tee /etc/nginx/sites-available/atrc > /dev/null <<'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable and test
sudo ln -sf /etc/nginx/sites-available/atrc /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## ✅ Done! Your app is live

Visit: **http://161.97.107.107**

---

## Quick Reference Commands

| Command | Purpose |
|---------|---------|
| `pm2 status` | Check if app is running |
| `pm2 logs atrc-app` | View application logs |
| `pm2 restart atrc-app` | Restart the app |
| `pm2 stop atrc-app` | Stop the app |
| `pm2 monit` | Real-time monitoring |
| `curl http://localhost:3000` | Test locally |

---

## 🔧 Troubleshooting

### App won't start
```bash
pm2 logs atrc-app
npm install --production  # Try reinstalling
```

### Can't connect to VPS
```bash
# Check SSH connection
ssh -v root@161.97.107.107

# Check if port 22 is open
telnet 161.97.107.107 22
```

### SCP upload fails
- Use WinSCP GUI instead
- Or connect via VPS and manually create folders, then upload

### Port 3000 in use
```bash
sudo lsof -i :3000
kill -9 <PID>
```

---

## 📝 Update After Changes

When you make code changes and want to redeploy:

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

---

## 🔐 Production Considerations

### Security Hardening

1. **Change default password:**
   ```bash
   sudo passwd root
   ```

2. **Setup SSH keys:**
   - Disable password authentication
   - Use SSH key pairs instead

3. **Enable firewall:**
   ```bash
   sudo ufw enable
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

4. **Install SSL (Let's Encrypt):**
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

5. **Move Firebase credentials to env variables:**
   - Update `src/firebase/config.js`
   - Create `.env` file with Firebase keys
   - Reference them in config

---

## 📊 Monitoring

### Check app is serving traffic
```bash
curl -I http://161.97.107.107
```

### Monitor real-time
```bash
pm2 monit
```

### View full logs
```bash
pm2 logs atrc-app --lines 100
```

---

## 🎯 Next Steps

1. Test the app at http://161.97.107.107
2. Configure your domain DNS if you have one
3. Setup SSL certificate (Let's Encrypt)
4. Configure backup strategy
5. Setup monitoring/alerting

---

**Ready to deploy? Start with Phase 1!**
