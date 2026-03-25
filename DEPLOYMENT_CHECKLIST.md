# 🚀 Deployment Checklist

Follow this checklist to deploy your Faculty Attendance System.

---

## ✅ Pre-Deployment Checklist

- [x] Code pushed to GitHub
- [ ] InfinityFree account created
- [ ] Render.com account created

---

## 📋 Step-by-Step Deployment

### Phase 1: Set Up InfinityFree Database (15 minutes)

1. [ ] Login to InfinityFree Control Panel
2. [ ] Create MySQL Database
3. [ ] Note database credentials:
   - [ ] Database Host: `sqlXXX.infinityfree.com`
   - [ ] Database Name: `ifXXXXX_attendance`
   - [ ] Username: `ifXXXXX_attendance`
   - [ ] Password: (your password)
4. [ ] Open phpMyAdmin
5. [ ] Import `database-schema.sql`
6. [ ] Verify tables created (users, subjects, schedules, attendance)
7. [ ] Create admin account (see INFINITYFREE_FRONTEND_DEPLOY.md)

---

### Phase 2: Deploy Backend to Render.com (10 minutes)

1. [ ] Go to https://render.com
2. [ ] Sign up / Login with GitHub
3. [ ] Click "New +" → "Web Service"
4. [ ] Connect GitHub repository: `AttendanceSystem_MaamIvy`
5. [ ] Configure service:
   - [ ] Name: `faculty-attendance-api`
   - [ ] Region: `Singapore`
   - [ ] Build Command: `npm install`
   - [ ] Start Command: `npm start`
   - [ ] Plan: `Free`
6. [ ] Add environment variables:
   - [ ] `NODE_ENV` = `production`
   - [ ] `PORT` = `5000`
   - [ ] `DB_HOST` = (from InfinityFree)
   - [ ] `DB_USER` = (from InfinityFree)
   - [ ] `DB_PASSWORD` = (from InfinityFree)
   - [ ] `DB_NAME` = (from InfinityFree)
   - [ ] `DB_PORT` = `3306`
   - [ ] `JWT_SECRET` = (generate random string)
7. [ ] Click "Create Web Service"
8. [ ] Wait for deployment (3-5 minutes)
9. [ ] Note your backend URL: `https://______.onrender.com`
10. [ ] Test: Visit `https://______.onrender.com/api/health`

---

### Phase 3: Build & Deploy Frontend (20 minutes)

1. [ ] Update `client/src/config.js`:
   - [ ] Change `apiUrl` to your Render URL
2. [ ] Build frontend:
   ```powershell
   cd client
   npm run build
   ```
3. [ ] Download FileZilla FTP client
4. [ ] Get FTP credentials from InfinityFree
5. [ ] Connect to FTP:
   - [ ] Host: `ftpupload.net`
   - [ ] Username: (from InfinityFree)
   - [ ] Password: (from InfinityFree)
   - [ ] Port: `21`
6. [ ] Navigate to `/htdocs` folder
7. [ ] Delete default files
8. [ ] Upload all files from `client/dist` folder
9. [ ] Create `.htaccess` file (see guide)
10. [ ] Upload `.htaccess` to `/htdocs`

---

### Phase 4: Testing (10 minutes)

1. [ ] Open your InfinityFree URL: `http://______.infinityfreeapp.com`
2. [ ] Test login:
   - [ ] School ID: `ADMIN001`
   - [ ] Password: `admin123`
3. [ ] Test admin features:
   - [ ] Create faculty member
   - [ ] Create subject
   - [ ] Create schedule
4. [ ] Test faculty features:
   - [ ] Login as faculty
   - [ ] Submit attendance photo
   - [ ] View schedule
5. [ ] Test reports:
   - [ ] View attendance monitoring
   - [ ] View analytics
   - [ ] Check absence tracking

---

## 🎉 Post-Deployment

- [ ] Change admin password
- [ ] Create faculty accounts
- [ ] Set up subjects and schedules
- [ ] Train users on the system
- [ ] Share URLs with users

---

## 📝 Important URLs

**Frontend (InfinityFree):**
- URL: `http://______.infinityfreeapp.com`
- FTP: `ftpupload.net`
- phpMyAdmin: (via InfinityFree control panel)

**Backend (Render.com):**
- URL: `https://______.onrender.com`
- Dashboard: https://dashboard.render.com

**GitHub Repository:**
- URL: https://github.com/Geo-Hackathon/AttendanceSystem_MaamIvy

---

## 🆘 Need Help?

Refer to detailed guides:
- `RENDER_DEPLOYMENT.md` - Backend deployment
- `INFINITYFREE_FRONTEND_DEPLOY.md` - Frontend deployment
- `INFINITYFREE_DEPLOYMENT.md` - Original deployment guide

---

## ⚠️ Common Issues

**Backend won't start:**
- Check environment variables are set correctly
- Verify database credentials
- Check Render logs for errors

**Frontend shows blank page:**
- Check browser console (F12)
- Verify `.htaccess` file exists
- Check all files uploaded correctly

**Can't login:**
- Verify admin account created in database
- Check backend is running (not sleeping)
- Test API: `https://your-backend.onrender.com/api/health`

**Images won't display:**
- Images are stored on Render backend
- Check backend storage not full
- Verify image paths are correct

---

Good luck with your deployment! 🚀
