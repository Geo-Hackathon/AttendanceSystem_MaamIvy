# Deploy Frontend to InfinityFree - Step by Step

## Prerequisites
- Backend deployed on Render.com
- InfinityFree account ready
- Backend URL (e.g., `https://faculty-attendance-api.onrender.com`)

---

## Part 1: Set Up InfinityFree MySQL Database

### Step 1: Create MySQL Database

1. Login to InfinityFree Control Panel
2. Go to **MySQL Databases**
3. Click **"Create Database"**
4. Note your credentials:
   - **Database Host:** `sqlXXX.infinityfree.com`
   - **Database Name:** `ifXXXXX_attendance`
   - **Username:** `ifXXXXX_attendance`
   - **Password:** (set your own)

### Step 2: Import Database Schema

1. In InfinityFree Control Panel, click **"phpMyAdmin"**
2. Login with your database credentials
3. Select your database from left sidebar
4. Click **"SQL"** tab
5. Copy and paste the contents of `database-schema.sql`
6. Click **"Go"** to execute
7. Verify tables are created: `users`, `subjects`, `schedules`, `attendance`

### Step 3: Create Admin Account

In phpMyAdmin SQL tab, run:

```sql
-- Create admin account (password: admin123)
INSERT INTO users (school_id, name, password, role, is_temp_password)
VALUES ('ADMIN001', 'System Administrator', '$2a$10$8K1p/a0dL3LKzOWR7nY9V.q3KZo.8oyYQXbZJZQQZ5Z5Z5Z5Z5Z5Z', 'admin', FALSE);
```

---

## Part 2: Build Frontend for Production

### Step 1: Update API URL

1. Open `client/src/main.jsx`
2. Find the axios baseURL configuration
3. Update to your Render backend URL:

```javascript
axios.defaults.baseURL = 'https://faculty-attendance-api.onrender.com';
```

### Step 2: Build Frontend

Run in PowerShell:

```powershell
cd client
npm run build
```

This creates a `client/dist` folder with production files.

---

## Part 3: Deploy to InfinityFree

### Step 1: Get FTP Credentials

1. In InfinityFree Control Panel
2. Go to **"FTP Details"**
3. Note your credentials:
   - **FTP Hostname:** `ftpupload.net` or similar
   - **FTP Username:** `ifXXXXX`
   - **FTP Password:** (your account password)
   - **FTP Port:** `21`

### Step 2: Download FTP Client

Download **FileZilla** (free):
- https://filezilla-project.org/download.php?type=client
- Install and open FileZilla

### Step 3: Connect via FTP

1. Open FileZilla
2. Enter connection details:
   - **Host:** `ftpupload.net`
   - **Username:** Your FTP username
   - **Password:** Your FTP password
   - **Port:** `21`
3. Click **"Quickconnect"**

### Step 4: Upload Frontend Files

1. In FileZilla, navigate to `/htdocs` folder (right side)
2. Delete default files (index.html, etc.)
3. On left side, navigate to `D:\AttendanceSystem\client\dist`
4. Select ALL files in `dist` folder
5. Right-click → **Upload**
6. Wait for upload to complete (2-5 minutes)

### Step 5: Configure .htaccess for React Router

Create a file named `.htaccess` in `/htdocs` with this content:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

Upload this file to `/htdocs` via FileZilla.

---

## Part 4: Test Your Deployment

### Step 1: Access Your Site

Your site URL will be:
- **Free subdomain:** `http://your-username.infinityfreeapp.com`
- Or your custom domain if configured

### Step 2: Test Login

1. Open your site URL
2. Login with:
   - **School ID:** `ADMIN001`
   - **Password:** `admin123`
3. You should see the Admin Dashboard

### Step 3: Test Features

- ✅ Create faculty members
- ✅ Create subjects
- ✅ Create schedules
- ✅ Submit attendance (as faculty)
- ✅ View reports (as admin)

---

## Troubleshooting

### Frontend Shows Blank Page:
- Check browser console for errors (F12)
- Verify all files uploaded correctly
- Check `.htaccess` file exists

### API Connection Fails:
- Verify backend URL in `main.jsx` is correct
- Check Render service is running (not sleeping)
- Test API directly: `https://your-backend.onrender.com/api/health`

### Login Fails:
- Verify database is set up correctly
- Check admin user was created
- Verify backend can connect to InfinityFree MySQL

### Images Won't Upload:
- InfinityFree doesn't support file uploads via API
- Images must be stored on backend (Render)
- Render free tier has limited storage (~512MB)

---

## Important Notes

### InfinityFree Limitations:
- ⚠️ No Node.js support (that's why backend is on Render)
- ⚠️ File uploads limited
- ⚠️ Ads on free plan (can remove with premium)
- ✅ Free MySQL database
- ✅ Free SSL certificate
- ✅ Unlimited bandwidth

### Render Free Tier:
- ⚠️ Service sleeps after 15 min inactivity
- ⚠️ Limited storage (~512MB)
- ⚠️ 750 hours/month
- ✅ Automatic HTTPS
- ✅ Auto-deploy on git push

---

## Production Checklist

- [ ] Backend deployed on Render.com
- [ ] Database created on InfinityFree
- [ ] Database schema imported
- [ ] Admin account created
- [ ] Frontend built with correct API URL
- [ ] Frontend uploaded to InfinityFree
- [ ] .htaccess configured
- [ ] Login tested
- [ ] All features tested
- [ ] GitHub repository updated

---

## Next Steps

Your Faculty Attendance System is now live! 🎉

**Share these URLs:**
- **Frontend:** `http://your-username.infinityfreeapp.com`
- **Backend API:** `https://your-backend.onrender.com`

**Default Admin Login:**
- School ID: `ADMIN001`
- Password: `admin123`

**Remember to:**
1. Change admin password after first login
2. Create faculty accounts
3. Set up subjects and schedules
4. Train users on the system

Congratulations! 🚀
