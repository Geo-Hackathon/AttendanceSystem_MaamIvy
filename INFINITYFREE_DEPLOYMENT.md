# InfinityFree Deployment Guide

## Overview

This guide will help you deploy the Faculty Attendance System using:
- **InfinityFree:** Frontend (React app) + MySQL Database
- **Render.com:** Backend (Node.js API) - Free tier

---

## ⚠️ Important Notes

- InfinityFree **does not support Node.js**
- We'll use InfinityFree for static frontend and MySQL database
- Backend will be hosted on Render.com (free tier)
- Total cost: **$0** (completely free)

---

## 📋 Prerequisites

- [x] InfinityFree account
- [ ] GitHub account (for Render deployment)
- [ ] Git installed on your computer

---

## Part 1: Setup InfinityFree

### Step 1: Create MySQL Database on InfinityFree

1. **Login to InfinityFree Control Panel**
   - Go to https://infinityfree.net
   - Login to your account

2. **Go to MySQL Databases**
   - Click "MySQL Databases" in control panel
   - Click "Create Database"

3. **Note Your Database Credentials:**
   ```
   Database Name: epiz_XXXXXXXX_attendance
   Database User: epiz_XXXXXXXX
   Database Password: [your password]
   Database Host: sqlXXX.infinityfree.com
   ```
   
   **IMPORTANT:** Save these credentials - you'll need them later!

4. **Access phpMyAdmin**
   - Click "phpMyAdmin" button
   - Login with your database credentials

5. **Create Database Tables**
   - Copy the SQL from `database-schema.sql` (we'll create this file)
   - Paste into phpMyAdmin SQL tab
   - Click "Go" to execute

---

## Part 2: Prepare Your Code

### Step 1: Create Production Environment File

Create `.env.production` in your project root:

```env
# Backend API URL (we'll update this after deploying to Render)
VITE_API_URL=https://your-app-name.onrender.com

# Database credentials from InfinityFree
DB_HOST=sqlXXX.infinityfree.com
DB_USER=epiz_XXXXXXXX
DB_PASSWORD=your_password_here
DB_NAME=epiz_XXXXXXXX_attendance
DB_PORT=3306

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_random_key_change_this_123456

# Node environment
NODE_ENV=production
PORT=5000
```

### Step 2: Build Frontend for Production

```bash
# Navigate to client folder
cd client

# Install dependencies (if not already done)
npm install

# Build for production
npm run build
```

This creates a `client/dist` folder with optimized static files.

---

## Part 3: Deploy Backend to Render.com

### Step 1: Push Code to GitHub

```bash
# In project root (D:\AttendanceSystem)
git init
git add .
git commit -m "Initial commit - Faculty Attendance System"

# Create repository on GitHub
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/faculty-attendance.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Render.com

1. **Go to Render.com**
   - Visit https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select "faculty-attendance" repo

3. **Configure Service:**
   ```
   Name: faculty-attendance-api
   Environment: Node
   Region: Singapore (closest to Philippines)
   Branch: main
   Root Directory: (leave empty)
   Build Command: npm install
   Start Command: node server/index.js
   ```

4. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable"
   
   Add each of these:
   ```
   DB_HOST=sqlXXX.infinityfree.com
   DB_USER=epiz_XXXXXXXX
   DB_PASSWORD=your_infinityfree_db_password
   DB_NAME=epiz_XXXXXXXX_attendance
   DB_PORT=3306
   JWT_SECRET=your_super_secret_random_key
   NODE_ENV=production
   PORT=5000
   ```

5. **Create Web Service**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Your API will be at: `https://faculty-attendance-api.onrender.com`

6. **Test Backend**
   - Visit: `https://faculty-attendance-api.onrender.com/api/health`
   - Should see: `{"status":"OK","message":"Faculty Attendance System API is running"}`

---

## Part 4: Deploy Frontend to InfinityFree

### Step 1: Update Frontend API URL

1. **Edit `client/.env.production`:**
   ```env
   VITE_API_URL=https://faculty-attendance-api.onrender.com
   ```

2. **Rebuild Frontend:**
   ```bash
   cd client
   npm run build
   ```

### Step 2: Update Vite Config for Production

Edit `client/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

### Step 3: Create .htaccess for React Router

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

# Enable CORS
<IfModule mod_headers.c>
  Header set Access-Control-Allow-Origin "*"
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

### Step 4: Upload to InfinityFree via FTP

1. **Get FTP Credentials**
   - In InfinityFree control panel
   - Go to "FTP Details"
   - Note:
     ```
     FTP Hostname: ftpupload.net
     FTP Username: epiz_XXXXXXXX
     FTP Password: [your password]
     ```

2. **Download FTP Client**
   - Download FileZilla: https://filezilla-project.org/
   - Install and open

3. **Connect to InfinityFree**
   - Host: `ftpupload.net`
   - Username: `epiz_XXXXXXXX`
   - Password: [your FTP password]
   - Port: `21`
   - Click "Quickconnect"

4. **Upload Frontend Files**
   - Navigate to `htdocs` folder on server (right panel)
   - Delete default files (index.html, etc.)
   - Upload ALL files from `client/dist` folder to `htdocs`
   - Make sure `.htaccess` is uploaded too

5. **Set Permissions**
   - Right-click on `htdocs` folder
   - File permissions: `755`

---

## Part 5: Configure Backend for InfinityFree Database

### Update Backend Database Connection

Since InfinityFree MySQL has some limitations, update `server/config/database.js`:

```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'faculty_attendance',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 5, // InfinityFree has lower limits
  queueLimit: 0,
  connectTimeout: 60000, // Increase timeout for free hosting
  acquireTimeout: 60000
});
```

### Redeploy Backend

```bash
git add .
git commit -m "Update database config for InfinityFree"
git push
```

Render will automatically redeploy.

---

## Part 6: Initialize Database

### Option 1: Via phpMyAdmin (Recommended)

1. **Login to phpMyAdmin** on InfinityFree
2. **Select your database**
3. **Go to SQL tab**
4. **Copy and paste this SQL:**

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'faculty') NOT NULL DEFAULT 'faculty',
  is_temp_password BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_code VARCHAR(50) NOT NULL,
  course_name VARCHAR(200) NOT NULL,
  year_level ENUM('1st Year', '2nd Year', '3rd Year', '4th Year') NOT NULL,
  major VARCHAR(100),
  department ENUM('CTE', 'CBA', 'CLAPA', 'CIT', 'THEO') NOT NULL,
  section VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_subject (course_code, year_level, major, section)
);

-- Schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  faculty_id INT NOT NULL,
  subject_id INT NOT NULL,
  day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  faculty_id INT NOT NULL,
  schedule_id INT,
  image_path VARCHAR(255) NOT NULL,
  captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('present', 'late') DEFAULT 'present',
  notes TEXT,
  FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE SET NULL
);

-- Create default admin (password: admin123)
INSERT INTO users (school_id, name, password, role, is_temp_password) 
VALUES ('ADMIN001', 'System Administrator', '$2a$10$8K1p/a0dL3LKzOWR7nY9V.q3KZo.8oyYQXqZJZQQZ5Z5Z5Z5Z5Z5Z', 'admin', FALSE);
```

5. **Click "Go"**

### Option 2: Via Backend API

The backend will auto-create tables on first run, but you need to create admin manually via phpMyAdmin.

---

## Part 7: Test Your Deployment

### Test Checklist

1. **Frontend Access**
   - Visit: `http://your-username.infinityfree.com`
   - Should see login page
   - Check browser console for errors

2. **Backend API**
   - Visit: `https://faculty-attendance-api.onrender.com/api/health`
   - Should return JSON status

3. **Database Connection**
   - Try logging in with: `ADMIN001` / `admin123`
   - Should successfully login

4. **Camera Access**
   - Login as admin
   - Add a test faculty
   - Login as faculty
   - Try submitting attendance
   - **Note:** Camera only works on HTTPS!

5. **Image Upload**
   - Check if images are being saved
   - Verify storage usage

---

## 🔧 Troubleshooting

### Frontend Not Loading

**Check:**
- `.htaccess` file uploaded
- All files in `htdocs` folder
- File permissions (755)

**Fix:**
- Re-upload all files
- Clear browser cache

### Backend Connection Error

**Check:**
- Render service is running
- Environment variables set correctly
- Database credentials correct

**Fix:**
- Check Render logs
- Verify InfinityFree database is active

### Database Connection Failed

**Check:**
- Database host, user, password correct
- InfinityFree database is active
- Connection limit not exceeded

**Fix:**
- Verify credentials in phpMyAdmin
- Reduce `connectionLimit` to 3
- Wait a few minutes (InfinityFree has rate limits)

### Images Not Uploading

**Issue:** InfinityFree doesn't support file uploads from external sources

**Solution:**
You'll need to use cloud storage for images:

1. **Option A: Cloudinary (Free tier - 25GB)**
   - Sign up at cloudinary.com
   - Use their upload API
   - Store image URLs in database

2. **Option B: ImgBB (Free)**
   - Use ImgBB API for image hosting
   - Store URLs in database

### CORS Errors

**Fix:** Update backend CORS settings in `server/index.js`:

```javascript
app.use(cors({
  origin: ['http://your-username.infinityfree.com', 'https://your-username.infinityfree.com'],
  credentials: true
}));
```

Redeploy to Render.

---

## 📊 InfinityFree Limitations

Be aware of these limits:

- **Storage:** 5GB (perfect for your needs!)
- **Bandwidth:** Unlimited
- **MySQL:** 400 connections/hour
- **File Upload:** Not supported from external sources
- **Node.js:** Not supported (that's why we use Render)
- **Ads:** Free plan shows ads (can upgrade to remove)

---

## 🎯 Post-Deployment Checklist

- [ ] Frontend accessible at InfinityFree URL
- [ ] Backend API working on Render
- [ ] Database connected and tables created
- [ ] Admin login working
- [ ] Faculty can be added
- [ ] Schedules can be created
- [ ] Attendance submission works
- [ ] Camera access works (HTTPS only)
- [ ] Storage optimization active

---

## 🔐 Security Recommendations

1. **Change Default Admin Password**
   - Login as ADMIN001
   - Go to Change Password
   - Set a strong password

2. **Update JWT Secret**
   - Generate random string: https://randomkeygen.com/
   - Update in Render environment variables

3. **Enable HTTPS**
   - InfinityFree provides free SSL
   - Enable in control panel

4. **Backup Database**
   - Export via phpMyAdmin weekly
   - Download to local storage

---

## 💰 Cost Breakdown

| Service | Cost | What For |
|---------|------|----------|
| InfinityFree | $0 | Frontend + MySQL |
| Render.com | $0 | Backend API |
| **Total** | **$0/month** | Everything! |

**Optional Upgrades:**
- InfinityFree Premium: $2-5/month (removes ads, more resources)
- Render Paid: $7/month (always-on, faster)

---

## 📞 Support

**InfinityFree Issues:**
- Forum: https://forum.infinityfree.net/
- Support ticket in control panel

**Render Issues:**
- Docs: https://render.com/docs
- Community: https://community.render.com/

**Application Issues:**
- Check browser console
- Check Render logs
- Review this guide

---

## 🎉 Success!

Once everything is working:

1. Share your URL: `http://your-username.infinityfree.com`
2. Login with ADMIN001
3. Add faculty members
4. Create subjects and schedules
5. Start tracking attendance!

**Your Faculty Attendance System is now LIVE!** 🚀
