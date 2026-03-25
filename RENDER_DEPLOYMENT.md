# Deploy Backend to Render.com - Step by Step

## Prerequisites
- GitHub repository: https://github.com/Geo-Hackathon/AttendanceSystem_MaamIvy
- InfinityFree account with MySQL database ready

---

## Step 1: Sign Up for Render.com

1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

---

## Step 2: Create New Web Service

1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Connect GitHub"** (if not already connected)
4. Authorize Render to access your repositories
5. Find and select: **`AttendanceSystem_MaamIvy`**
6. Click **"Connect"**

---

## Step 3: Configure Web Service

Fill in the following settings:

### Basic Settings:
- **Name:** `faculty-attendance-api` (or your choice)
- **Region:** `Singapore` (closest to Philippines)
- **Branch:** `main`
- **Root Directory:** Leave blank
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### Instance Type:
- **Plan:** Select **"Free"** ($0/month)
  - Note: Free tier sleeps after 15 min of inactivity
  - First request after sleep takes ~30 seconds

---

## Step 4: Set Environment Variables

Click **"Advanced"** and add these environment variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `5000` | Required |
| `DB_HOST` | `sql123.infinityfree.com` | Get from InfinityFree MySQL settings |
| `DB_USER` | `ifXXXXX_attendance` | Your InfinityFree DB username |
| `DB_PASSWORD` | `your-db-password` | Your InfinityFree DB password |
| `DB_NAME` | `ifXXXXX_attendance` | Your InfinityFree DB name |
| `DB_PORT` | `3306` | Default MySQL port |
| `JWT_SECRET` | `generate-random-string` | Use: https://randomkeygen.com/ |

**Important:** Get your InfinityFree database credentials from:
- InfinityFree Control Panel → MySQL Databases → View Details

---

## Step 5: Deploy

1. Click **"Create Web Service"** button
2. Wait for deployment (3-5 minutes)
3. Watch the build logs for any errors
4. Once deployed, you'll see: **"Your service is live 🎉"**

---

## Step 6: Get Your Backend URL

After deployment completes:
- Your API URL will be: `https://faculty-attendance-api.onrender.com`
- Test it: `https://faculty-attendance-api.onrender.com/api/health`
- Should return: `{"status":"OK","message":"Faculty Attendance System API is running"}`

---

## Step 7: Important Notes

### Free Tier Limitations:
- ⚠️ Service sleeps after 15 minutes of inactivity
- ⚠️ First request after sleep takes ~30 seconds to wake up
- ⚠️ 750 hours/month free (enough for one service)
- ✅ Automatic HTTPS
- ✅ Automatic deploys on git push

### Keep Service Awake (Optional):
Use a service like UptimeRobot to ping your API every 10 minutes:
- URL to ping: `https://your-service.onrender.com/api/health`
- Interval: 10 minutes

---

## Troubleshooting

### Build Fails:
- Check build logs for errors
- Ensure `package.json` has correct dependencies
- Verify Node version compatibility

### Database Connection Fails:
- Verify InfinityFree DB credentials
- Check if DB_HOST is correct (usually `sqlXXX.infinityfree.com`)
- Ensure database exists and is accessible

### Service Won't Start:
- Check start command is `npm start`
- Verify `package.json` has `"start": "node server/index.js"`
- Check environment variables are set correctly

---

## Next Steps

Once backend is deployed:
1. ✅ Note your Render URL: `https://your-service.onrender.com`
2. 🔄 Set up InfinityFree MySQL database
3. 🎨 Build and deploy frontend to InfinityFree
4. 🔗 Connect frontend to backend API

Continue to: **INFINITYFREE_FRONTEND_DEPLOY.md**
