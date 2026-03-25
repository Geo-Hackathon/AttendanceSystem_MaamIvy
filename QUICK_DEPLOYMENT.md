# Quick Deployment Guide - Get Online in 30 Minutes! 🚀

## Overview

Deploy your Faculty Attendance System online so others can access it via a web URL.

**Best Options for `.online` or similar domains:**

1. **Render.com** (Recommended) - Free tier includes `.onrender.com` domain
2. **Railway.app** - Free tier includes `.railway.app` domain  
3. **Vercel** - Free tier includes `.vercel.app` domain
4. **Custom .online domain** - Purchase from Namecheap/GoDaddy (~$5/year)

---

## 🎯 Recommended: Deploy to Render.com (Completely Free)

### What You'll Get:
- Frontend: `https://your-app.onrender.com`
- Backend API: `https://your-app-api.onrender.com`
- Free PostgreSQL or MySQL database
- SSL certificate (HTTPS) included
- **Total Cost: $0**

---

## 📋 Step-by-Step Deployment

### Step 1: Prepare Your Code (5 minutes)

**1. Create `.env.production` file in project root:**

```env
# Database (Render will provide these)
DB_HOST=your-db-host.render.com
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=faculty_attendance
DB_PORT=5432

# JWT Secret (generate random string)
JWT_SECRET=change_this_to_random_string_123456789

# Environment
NODE_ENV=production
PORT=5000

# Frontend URL (update after deployment)
VITE_API_URL=https://your-app-api.onrender.com
```

**2. Update `client/.env.production`:**

```env
VITE_API_URL=https://your-app-api.onrender.com
```

**3. Commit your changes:**

```bash
git add .
git commit -m "Prepare for deployment"
git push
```

---

### Step 2: Deploy Backend to Render (10 minutes)

**1. Go to [Render.com](https://render.com)**
   - Sign up with GitHub
   - Authorize Render to access your repositories

**2. Create PostgreSQL Database (Free)**
   - Click "New +" → "PostgreSQL"
   - Name: `faculty-attendance-db`
   - Database: `faculty_attendance`
   - User: `faculty_user`
   - Region: `Singapore` (closest to Philippines)
   - Instance Type: `Free`
   - Click "Create Database"
   - **Save the connection details!**

**3. Create Web Service for Backend**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your `AttendanceSystem` repo
   - Configure:
     ```
     Name: faculty-attendance-api
     Environment: Node
     Region: Singapore
     Branch: main
     Root Directory: (leave empty)
     Build Command: npm install
     Start Command: node server/index.js
     Instance Type: Free
     ```

**4. Add Environment Variables**
   
   Click "Advanced" → Add these variables:
   ```
   DB_HOST=<from database connection string>
   DB_USER=<from database connection string>
   DB_PASSWORD=<from database connection string>
   DB_NAME=faculty_attendance
   DB_PORT=5432
   JWT_SECRET=your_random_secret_key_here
   NODE_ENV=production
   PORT=5000
   ```

**5. Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes
   - Your API will be at: `https://faculty-attendance-api.onrender.com`

**6. Test Backend**
   - Visit: `https://faculty-attendance-api.onrender.com/api/health`
   - Should see: `{"status":"OK"}`

---

### Step 3: Deploy Frontend to Render (10 minutes)

**1. Update Frontend API URL**

Edit `client/.env.production`:
```env
VITE_API_URL=https://faculty-attendance-api.onrender.com
```

**2. Update `client/vite.config.js` for production:**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
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

**3. Commit and push:**

```bash
git add .
git commit -m "Configure for Render deployment"
git push
```

**4. Create Static Site on Render**
   - Click "New +" → "Static Site"
   - Connect same GitHub repository
   - Configure:
     ```
     Name: faculty-attendance
     Branch: main
     Root Directory: client
     Build Command: npm install && npm run build
     Publish Directory: dist
     ```

**5. Add Environment Variable**
   ```
   VITE_API_URL=https://faculty-attendance-api.onrender.com
   ```

**6. Deploy**
   - Click "Create Static Site"
   - Wait 5-10 minutes
   - Your app will be at: `https://faculty-attendance.onrender.com`

---

### Step 4: Initialize Database (5 minutes)

**Option A: Via Render Dashboard**

1. Go to your PostgreSQL database on Render
2. Click "Connect" → "External Connection"
3. Use provided credentials with a database client (like DBeaver)
4. Run the SQL from your schema file

**Option B: Via Backend API (Automatic)**

Your backend should auto-create tables on first run. Just need to create admin user manually.

**Create Admin User via SQL:**

```sql
INSERT INTO users (school_id, name, password, role, is_temp_password) 
VALUES ('ADMIN001', 'System Administrator', 
  '$2a$10$YourHashedPasswordHere', 'admin', FALSE);
```

---

## 🎉 You're Live!

**Your URLs:**
- **Frontend:** `https://faculty-attendance.onrender.com`
- **Backend API:** `https://faculty-attendance-api.onrender.com`

**Share these URLs with your users!**

---

## 🌐 Get a Custom .online Domain (Optional)

### Option 1: Purchase Domain

1. **Buy domain from Namecheap/GoDaddy**
   - Search for `yourschool.online`
   - Cost: ~$5-10/year

2. **Point to Render**
   - In Render dashboard, go to your Static Site
   - Click "Settings" → "Custom Domains"
   - Add your domain: `yourschool.online`
   - Follow DNS configuration instructions
   - Add CNAME record pointing to Render

### Option 2: Use Free Subdomain

Render provides free subdomains:
- `faculty-attendance.onrender.com`
- You can customize the first part

---

## 🔧 Important Configuration

### Update CORS in Backend

Edit `server/index.js`:

```javascript
app.use(cors({
  origin: [
    'https://faculty-attendance.onrender.com',
    'http://localhost:3000' // for local development
  ],
  credentials: true
}));
```

### Update Database Config for PostgreSQL

If using PostgreSQL instead of MySQL, update `server/config/database.js`:

```javascript
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false
  }
});
```

---

## ⚠️ Free Tier Limitations

**Render Free Tier:**
- ✅ 750 hours/month (enough for 24/7)
- ✅ Automatic HTTPS
- ✅ Auto-deploy from GitHub
- ⚠️ Spins down after 15 min inactivity (first request takes ~30 sec)
- ⚠️ 512MB RAM
- ⚠️ Shared CPU

**For Production Use:**
- Upgrade to paid tier ($7/month) for always-on
- Or use Railway.app which has better free tier

---

## 🚀 Alternative: Railway.app (Better Free Tier)

Railway offers:
- $5 free credit/month
- No sleep/spin-down
- Faster performance
- Similar setup process

**Quick Railway Deploy:**

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub"
4. Select your repository
5. Railway auto-detects and deploys!
6. Add environment variables
7. Get URL: `https://your-app.railway.app`

---

## 📱 Test Your Deployment

**Checklist:**
- [ ] Frontend loads at your URL
- [ ] Can login with admin credentials
- [ ] Can create faculty users
- [ ] Can create schedules
- [ ] Camera works (HTTPS required)
- [ ] Attendance submission works
- [ ] Images upload successfully

---

## 🆘 Troubleshooting

### "Cannot connect to database"
- Check environment variables in Render
- Verify database is running
- Check database credentials

### "API not responding"
- Check if backend service is running
- View logs in Render dashboard
- Verify VITE_API_URL is correct

### "Camera not working"
- Camera requires HTTPS (Render provides this)
- Check browser permissions
- Try different browser

### "Images not uploading"
- Check file size limits
- Verify upload directory permissions
- Consider using Cloudinary for image storage

---

## 💡 Pro Tips

1. **Enable Auto-Deploy**
   - Render auto-deploys on git push
   - Perfect for continuous updates

2. **Monitor Usage**
   - Check Render dashboard for usage
   - Free tier is usually enough for small schools

3. **Backup Database**
   - Export database weekly via Render dashboard
   - Download to local storage

4. **Use Environment Variables**
   - Never commit secrets to git
   - Always use .env files

---

## 📞 Need Help?

**Render Support:**
- Docs: https://render.com/docs
- Community: https://community.render.com

**Railway Support:**
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway

---

## 🎯 Next Steps

After deployment:

1. **Share your URL** with faculty members
2. **Create admin account** and login
3. **Add faculty users**
4. **Create subjects and schedules**
5. **Test attendance submission**
6. **Monitor and maintain**

**Your Faculty Attendance System is now accessible online!** 🎉

---

## 💰 Cost Summary

| Option | Monthly Cost | Features |
|--------|--------------|----------|
| Render Free | $0 | Good for testing |
| Render Paid | $7 | Always-on, better performance |
| Railway Free | $0 | $5 credit/month |
| Railway Paid | $5+ | Pay as you go |
| Custom .online domain | ~$0.50 | Professional URL |

**Recommended for schools:** Railway Free or Render Paid ($7/month)
