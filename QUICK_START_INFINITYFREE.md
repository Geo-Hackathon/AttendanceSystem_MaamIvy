# Quick Start: Deploy to InfinityFree

## ✅ Pre-Deployment Checklist

- [ ] InfinityFree account created
- [ ] GitHub account ready
- [ ] Git installed on computer
- [ ] FileZilla (FTP client) installed

---

## 🚀 5-Step Deployment Process

### **Step 1: Setup InfinityFree Database (10 minutes)**

1. Login to InfinityFree control panel
2. Click **MySQL Databases** → **Create Database**
3. **Save these credentials:**
   ```
   Host: sqlXXX.infinityfree.com
   User: epiz_XXXXXXXX
   Password: [save this!]
   Database: epiz_XXXXXXXX_attendance
   ```
4. Click **phpMyAdmin** → Login
5. Click **SQL** tab
6. Copy ALL content from `database-schema.sql`
7. Paste and click **Go**
8. ✅ Database created!

---

### **Step 2: Deploy Backend to Render (15 minutes)**

1. **Push to GitHub:**
   ```bash
   cd D:\AttendanceSystem
   git init
   git add .
   git commit -m "Initial commit"
   ```
   
   Create repo on GitHub, then:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/faculty-attendance.git
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Go to https://render.com
   - Sign up with GitHub
   - Click **New +** → **Web Service**
   - Select your repository
   - Configure:
     ```
     Name: faculty-attendance-api
     Environment: Node
     Build Command: npm install
     Start Command: node server/index.js
     ```

3. **Add Environment Variables:**
   ```
   DB_HOST=sqlXXX.infinityfree.com
   DB_USER=epiz_XXXXXXXX
   DB_PASSWORD=your_infinityfree_password
   DB_NAME=epiz_XXXXXXXX_attendance
   DB_PORT=3306
   JWT_SECRET=random_secret_key_123456789
   NODE_ENV=production
   ```

4. Click **Create Web Service**
5. Wait 5-10 minutes
6. **Test:** Visit `https://your-app.onrender.com/api/health`
7. ✅ Backend deployed!

---

### **Step 3: Build Frontend (5 minutes)**

1. **Update API URL:**
   
   Edit `client/.env.production`:
   ```env
   VITE_API_URL=https://your-app.onrender.com
   ```

2. **Build:**
   ```bash
   cd client
   npm install
   npm run build
   ```

3. **Create .htaccess:**
   
   Create `client/dist/.htaccess`:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

4. ✅ Frontend built!

---

### **Step 4: Upload to InfinityFree (10 minutes)**

1. **Get FTP credentials:**
   - InfinityFree control panel → **FTP Details**
   - Note: Host, Username, Password

2. **Connect with FileZilla:**
   ```
   Host: ftpupload.net
   Username: epiz_XXXXXXXX
   Password: [your FTP password]
   Port: 21
   ```

3. **Upload files:**
   - Navigate to `htdocs` folder (server side)
   - Delete all default files
   - Upload ALL files from `client/dist` folder
   - Make sure `.htaccess` is uploaded

4. ✅ Frontend uploaded!

---

### **Step 5: Test Everything (5 minutes)**

1. **Visit your site:**
   - `http://your-username.infinityfree.com`

2. **Test login:**
   - Username: `ADMIN001`
   - Password: `admin123`

3. **Test features:**
   - Add a faculty member
   - Create a subject
   - Create a schedule
   - Login as faculty
   - Submit attendance (camera test)

4. ✅ **LIVE!** 🎉

---

## 🔧 Common Issues & Quick Fixes

### "Cannot connect to database"
- Check Render environment variables
- Verify InfinityFree database is active
- Check database credentials match

### "Frontend shows blank page"
- Check `.htaccess` uploaded
- Clear browser cache
- Check browser console for errors

### "API not found"
- Verify `VITE_API_URL` in `.env.production`
- Rebuild frontend: `npm run build`
- Re-upload to InfinityFree

### "Camera not working"
- Camera requires HTTPS
- Enable SSL in InfinityFree control panel
- Access via `https://` not `http://`

---

## 📞 Need Help?

1. Check `INFINITYFREE_DEPLOYMENT.md` for detailed guide
2. Check Render logs for backend errors
3. Check browser console for frontend errors
4. InfinityFree forum: https://forum.infinityfree.net/

---

## 🎯 Post-Deployment

- [ ] Change admin password
- [ ] Enable HTTPS/SSL
- [ ] Add faculty members
- [ ] Create subjects
- [ ] Create schedules
- [ ] Test attendance submission
- [ ] Monitor storage usage

---

## 💰 Costs

- InfinityFree: **FREE**
- Render.com: **FREE**
- **Total: $0/month**

---

**Congratulations! Your Faculty Attendance System is now LIVE!** 🚀

Access at: `http://your-username.infinityfree.com`
