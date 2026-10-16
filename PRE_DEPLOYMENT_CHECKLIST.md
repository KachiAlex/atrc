# 📋 Pre-Deployment Checklist

Complete this checklist before deploying to ensure smooth deployment.

---

## ✅ Local Machine Setup

### Node.js & npm
- [ ] Node.js installed
  ```powershell
  node --version  # Should be v14+
  npm --version   # Should be v6+
  ```

- [ ] Global npm packages up to date
  ```powershell
  npm install -g npm@latest
  ```

### SSH & Connection Tools
- [ ] OpenSSH Client installed (Windows 10+)
  ```powershell
  ssh -V  # Should show version
  ```

- [ ] SSH connection to VPS works
  ```powershell
  ssh root@161.97.107.107
  # Should connect (type 'exit' to close)
  ```

- [ ] SSH password-less login ready (optional)
  - [ ] SSH key pair generated: `ssh-keygen -t rsa -b 4096`
  - [ ] Public key copied to VPS

### PowerShell Configuration
- [ ] PowerShell execution policy allows scripts
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
  ```

- [ ] Working in `c:\atrc` directory
  ```powershell
  cd c:\atrc
  pwd  # Should show c:\atrc
  ```

---

## ✅ Application Readiness

### Code Quality
- [ ] No critical console errors in development
  ```powershell
  npm start
  # Check browser console (F12) for red errors
  ```

- [ ] Firebase credentials are valid
  - [ ] Can login to app locally
  - [ ] Database operations work
  - [ ] File uploads work

- [ ] Environment variables documented
  - [ ] Firebase config vars identified
  - [ ] API keys location noted
  - [ ] No hardcoded secrets in code

### Build Testing
- [ ] Production build works locally
  ```powershell
  npm run build
  # Should complete without errors
  ```

- [ ] Build artifacts generated
  - [ ] `build/` folder exists
  - [ ] Contains `index.html`
  - [ ] Contains `js/` and `css/` folders
  - [ ] Build size reasonable (~3-5 MB)

- [ ] No build warnings (ideally)
  ```powershell
  npm run build 2>&1 | Select-String "warning" -i
  ```

---

## ✅ VPS Preparation

### Server Access
- [ ] VPS credentials secured
  - [ ] Password saved securely
  - [ ] IP address noted: 161.97.107.107
  - [ ] Username: root

- [ ] VPS is online and accessible
  ```powershell
  ping 161.97.107.107  # Should respond
  ```

- [ ] Can SSH into VPS without issues
  ```powershell
  ssh root@161.97.107.107 'echo "Connection OK"'
  ```

### Server Prerequisites
- [ ] VPS has sufficient disk space
  ```bash
  df -h  # Should have >1GB free
  ```

- [ ] VPS has sufficient RAM
  ```bash
  free -h  # Should have >1GB available
  ```

- [ ] Ubuntu/Debian OS confirmed
  ```bash
  lsb_release -a  # Should show distribution
  ```

### Port Availability
- [ ] Port 3000 available on VPS
  ```bash
  sudo lsof -i :3000  # Should return nothing
  ```

- [ ] Port 80 available (HTTP)
  ```bash
  sudo lsof -i :80  # Should return nothing
  ```

- [ ] Port 443 available (HTTPS - for later)
  ```bash
  sudo lsof -i :443  # Should return nothing
  ```

---

## ✅ Deployment Strategy

### Choose Method
- [ ] Decision made: Automated or Manual?
  - [ ] Automated: Will use `auto-deploy.ps1`
  - [ ] Manual: Will follow `QUICK_DEPLOY.md` or `DEPLOYMENT_GUIDE.md`

### Backup Strategy
- [ ] Local backup of project
  ```powershell
  Compress-Archive -Path c:\atrc -DestinationPath c:\atrc-backup.zip
  ```

- [ ] Firebase export ready (if using data)
  - [ ] Firestore data backed up
  - [ ] Storage files backed up

### Rollback Plan
- [ ] Know how to rollback:
  - [ ] Keep previous build version
  - [ ] Know PM2 restart commands
  - [ ] Have SSH access to revert

---

## ✅ Security Preparation

### Credentials Management
- [ ] Firebase credentials location identified
  ```
  src/firebase/config.js
  ```

- [ ] Plan to move to environment variables
  - [ ] Will create `.env` file
  - [ ] Will update config.js to use process.env

- [ ] API keys secured
  - [ ] Never commit to git
  - [ ] Added to `.gitignore`
  - [ ] Will be environment variables

### Security Hardening Planned
- [ ] Will change default password after deployment
- [ ] Will setup SSH key authentication
- [ ] Will enable firewall (UFW)
- [ ] Will install SSL certificate (Let's Encrypt)
- [ ] Will setup regular updates

---

## ✅ Documentation & Communication

### Documentation
- [ ] Deployment guide reviewed
  - [ ] `DEPLOYMENT_README.md` read
  - [ ] Chosen method fully understood

- [ ] Troubleshooting guide saved
  - [ ] Common issues documented
  - [ ] Solutions known

- [ ] Deployment steps documented
  - [ ] Your custom configuration noted
  - [ ] API keys locations marked
  - [ ] Firebase settings captured

### Team Communication (if applicable)
- [ ] Team notified of deployment window
- [ ] Downtime expectations communicated
- [ ] Success criteria defined
- [ ] Support contacts established

---

## ✅ Final Pre-Deployment

### Code Review
- [ ] All critical code reviewed
- [ ] No console.log statements in production code
- [ ] Error handling in place
- [ ] Loading states implemented

### Performance Check
- [ ] App loads in <3 seconds locally
- [ ] No memory leaks in console
- [ ] Network requests optimized
- [ ] Images are optimized

### Functionality Test
- [ ] Core features working
  - [ ] Login/Signup works
  - [ ] Dashboard loads
  - [ ] Main features testable
  - [ ] No 404 errors

---

## 🚀 Deployment Day

### Pre-Deployment Hour
- [ ] Close unnecessary applications
- [ ] Stable internet connection verified
- [ ] Phone on silent (no distractions)
- [ ] Deployment script/guide open and ready
- [ ] VPS SSH window ready

### During Deployment
- [ ] Follow chosen deployment method step-by-step
- [ ] Don't skip steps
- [ ] Watch for error messages
- [ ] Take notes of any issues

### Post-Deployment
- [ ] Verify app is running
  ```
  http://161.97.107.107
  ```

- [ ] Test core functionality
  - [ ] Can login
  - [ ] Can view dashboard
  - [ ] Can perform main actions
  - [ ] No errors in browser console

- [ ] Check server logs
  ```bash
  pm2 logs atrc-app
  ```

- [ ] Document deployment
  - [ ] Time deployed
  - [ ] Any issues encountered
  - [ ] Workarounds applied

---

## ✅ Post-Deployment Tasks (Within 24 Hours)

- [ ] Monitor app for errors
- [ ] Setup SSL/HTTPS
- [ ] Configure firewall
- [ ] Change default password
- [ ] Setup monitoring alerts
- [ ] Test backup/restore process

---

## 📊 Deployment Metrics

Record these for future reference:

| Metric | Value |
|--------|-------|
| Deployment Date | ________ |
| Deployment Time (duration) | ________ |
| Build Size | ________ MB |
| Server Uptime | ________ |
| Database Status | ✓ Working |
| First Users Connected | ________ |
| Any Issues? | ☐ Yes ☐ No |

---

## 📝 Notes

Use this space for any deployment-specific notes:

```
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
```

---

## ✅ Final Approval

- [ ] All checklist items completed
- [ ] Ready to proceed with deployment
- [ ] Approved by: _________________ (name/date)

---

**Good luck with your deployment! 🚀**
