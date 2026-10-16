# ATRC Application Deployment Guide

## Prerequisites

Before deploying, ensure you have:
1. **Node.js and npm installed locally** (for building the app)
2. **SSH access** to your VPS (161.97.107.107)
3. **SCP or WinSCP** (for file transfer to VPS)

---

## Step 1: Install Node.js & npm (Local Machine - Windows)

If you don't have Node.js installed:

1. Download from: https://nodejs.org/
2. Install LTS version (v18 or later)
3. Open PowerShell and verify:
   ```powershell
   node --version
   npm --version
   ```

---

## Step 2: Build the Application (Local Machine)

Navigate to the project directory and build:

```powershell
cd c:\atrc
npm install
npm run build
```

This creates a `build` folder with optimized production files (~3-5 MB).

---

## Step 3: Prepare Your VPS Server

SSH into your server and run:

```bash
# Connect to server
ssh root@161.97.107.107
# Password: kpGf78?9CWdlaguk

# Update system
sudo apt-get update
sudo apt-get install -y nodejs npm nginx curl git

# Install PM2 (process manager)
sudo npm install -g pm2

# Create deployment directory
mkdir -p /var/www/atrc
cd /var/www/atrc
```

---

## Step 4: Upload Build Files to VPS

In a new PowerShell window, upload the build folder:

```powershell
# Navigate to project root
cd c:\atrc

# Upload build folder using SCP
scp -r build root@161.97.107.107:/var/www/atrc/

# Upload package.json and package-lock.json
scp package.json root@161.97.107.107:/var/www/atrc/
scp package-lock.json root@161.97.107.107:/var/www/atrc/
```

**Note:** If SCP doesn't work, use **WinSCP** GUI application instead.

---

## Step 5: Install Dependencies on VPS and Start App

Back on your VPS SSH session:

```bash
cd /var/www/atrc

# Install production dependencies
npm install --production

# Start the app with PM2
pm2 start npm --name "atrc-app" -- start -- --port 3000

# Save PM2 configuration
pm2 save

# Make PM2 start on reboot
pm2 startup
```

---

## Step 6: Configure Nginx Reverse Proxy

Still on VPS, create nginx config:

```bash
# Create nginx configuration
sudo tee /etc/nginx/sites-available/atrc > /dev/null <<'EOF'
server {
    listen 80;
    server_name _;
    client_max_body_size 50M;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/atrc /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Enable nginx to start on reboot
sudo systemctl enable nginx
```

---

## Step 7: Verify Deployment

Check that everything is running:

```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs atrc-app

# Test nginx
curl http://localhost:3000

# Check if accessible from outside
curl http://161.97.107.107
```

---

## Step 8: SSL/HTTPS Setup (Optional but Recommended)

Install Let's Encrypt SSL certificate:

```bash
# Install certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain if you have one)
sudo certbot certonly --standalone -d 161.97.107.107

# Or if using with nginx:
sudo certbot --nginx -d 161.97.107.107
```

---

## Deployment Complete!

Your ATRC application is now live at:
- **HTTP**: http://161.97.107.107
- **HTTPS**: https://161.97.107.107 (if SSL installed)

---

## Useful PM2 Commands

```bash
# View app status
pm2 status

# View logs
pm2 logs atrc-app

# Restart app
pm2 restart atrc-app

# Stop app
pm2 stop atrc-app

# Start app
pm2 start atrc-app

# Delete app from PM2
pm2 delete atrc-app

# Monitor in real-time
pm2 monit
```

---

## Troubleshooting

### App won't start
```bash
pm2 logs atrc-app  # Check what's wrong
npm install --production  # Reinstall dependencies
```

### Nginx not working
```bash
sudo nginx -t  # Test config
sudo systemctl status nginx  # Check status
sudo systemctl restart nginx  # Restart
```

### Port 3000 already in use
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Update application after changes

When you make changes locally and want to redeploy:

```powershell
# On local machine
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

## Firebase Configuration

The app uses Firebase. Ensure your Firebase credentials are properly configured in `src/firebase/config.js`. 

For security, consider:
1. Moving credentials to environment variables
2. Using Firebase Environment Config feature
3. Restricting security rules on Firestore

---

## Additional Resources

- PM2 Documentation: https://pm2.keymetrics.io/
- Nginx Documentation: https://nginx.org/
- Firebase Deployment: https://firebase.google.com/docs
- Node.js Deployment: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

---

**Deployment Date**: October 15, 2026
**App Version**: Check package.json for current version
