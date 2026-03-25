# Railway.app Deployment Guide (Easiest Option!)

## Why Railway?

✅ Supports MySQL natively  
✅ No code changes needed  
✅ Simpler than Render  
✅ Better free tier ($5 credit/month)  
✅ No sleep/spin-down  
✅ Auto-deploy from GitHub  

---

## 🚀 Deploy in 10 Minutes

### Step 1: Sign Up

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Sign in with **GitHub**
4. Authorize Railway

---

### Step 2: Create MySQL Database

1. Click **"New Project"**
2. Select **"Provision MySQL"**
3. Database is created instantly!
4. Click on MySQL service
5. Go to **"Variables"** tab
6. Copy these values:
   ```
   MYSQLHOST
   MYSQLPORT
   MYSQLDATABASE
   MYSQLUSER
   MYSQLPASSWORD
   ```

---

### Step 3: Deploy Your App

1. In same project, click **"New"**
2. Select **"GitHub Repo"**
3. Choose: `AttendanceSystem_MaamIvy`
4. Railway auto-detects Node.js!
5. Click **"Deploy"**

---

### Step 4: Add Environment Variables

1. Click on your web service
2. Go to **"Variables"** tab
3. Click **"New Variable"**
4. Add these:

```
DB_HOST=${{MySQL.MYSQLHOST}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
DB_PORT=${{MySQL.MYSQLPORT}}
JWT_SECRET=your_random_secret_key_here
NODE_ENV=production
PORT=5000
```

**Note:** Railway automatically connects services with `${{MySQL.VARIABLE}}` syntax!

---

### Step 5: Configure Build

1. Go to **"Settings"** tab
2. Set:
   ```
   Root Directory: (leave empty)
   Build Command: npm install
   Start Command: node server/index.js
   ```
3. Click **"Save"**

---

### Step 6: Get Your URL

1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. You'll get: `https://your-app.up.railway.app`
4. **Copy this URL!**

---

## ✅ That's It!

Your app is now live at:
```
https://your-app.up.railway.app
```

Test it:
```
https://your-app.up.railway.app/
https://your-app.up.railway.app/api/health
```

---

## 💰 Cost

- **Free tier:** $5 credit/month
- **Your app usage:** ~$2-3/month
- **Remaining credit:** Enough for 24/7 uptime!

---

## 🎯 Next: Deploy Frontend

After backend is working:

1. Create **new service** in same project
2. Select **"GitHub Repo"** again
3. Configure:
   ```
   Root Directory: client
   Build Command: npm install && npm run build
   Start Command: npm run preview
   ```
4. Add environment variable:
   ```
   VITE_API_URL=https://your-app.up.railway.app
   ```
5. Generate domain for frontend
6. Done!

---

## 🔥 Why Railway is Better for You

| Feature | Railway | Render |
|---------|---------|--------|
| MySQL Support | ✅ Built-in | ❌ PostgreSQL only |
| Code Changes | ✅ None needed | ❌ Must convert to PostgreSQL |
| Setup Time | ✅ 10 minutes | ❌ 30+ minutes |
| Sleep/Spin-down | ✅ No | ❌ Yes (15 min) |
| Free Credit | ✅ $5/month | ❌ Limited hours |

---

## 🆘 Troubleshooting

### Database Connection Failed

**Check:**
- Variables use `${{MySQL.VARIABLE}}` syntax
- MySQL service is running
- Both services in same project

**Fix:**
- Verify variable names match exactly
- Restart deployment

### Port Binding Error

**Already fixed!** ✅ Your code binds to `0.0.0.0`

### Build Failed

**Check:**
- `package.json` exists in root
- `node_modules` not in git

---

## 📞 Support

**Railway Discord:** https://discord.gg/railway  
**Docs:** https://docs.railway.app

---

## 🎉 Success Checklist

- [ ] MySQL database created
- [ ] Web service deployed
- [ ] Environment variables added
- [ ] Domain generated
- [ ] API responding at `/api/health`
- [ ] Can login with ADMIN001

**Your Faculty Attendance System is LIVE on Railway!** 🚀
