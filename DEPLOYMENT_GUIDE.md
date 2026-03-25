# Deployment Guide - Faculty Attendance System

## Deploy to Render.com (Free Tier)

This guide will help you deploy your Faculty Attendance System as a public website.

### Prerequisites
- GitHub account
- Render.com account (free)

---

## Step 1: Prepare Your Code

### 1.1 Create Production Build Script

The application is already configured. Just ensure you have these files ready.

### 1.2 Update CORS Settings

The backend is already configured to accept requests from any origin in development. For production, you'll update this after deployment.

---

## Step 2: Push to GitHub

### 2.1 Initialize Git Repository

```bash
# In your project root (D:\AttendanceSystem)
git init
git add .
git commit -m "Initial commit - Faculty Attendance System"
```

### 2.2 Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., "faculty-attendance-system")
3. Don't initialize with README (we already have one)

### 2.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/faculty-attendance-system.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy Backend on Render

### 3.1 Create Web Service

1. Go to https://render.com and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

**Settings:**
- **Name:** `faculty-attendance-api`
- **Environment:** `Node`
- **Region:** Choose closest to you
- **Branch:** `main`
- **Root Directory:** Leave empty
- **Build Command:** `npm install`
- **Start Command:** `node server/index.js`

### 3.2 Add Environment Variables

In the "Environment" section, add:

```
PORT=5000
DB_HOST=<your-render-mysql-host>
DB_USER=<your-db-user>
DB_PASSWORD=<your-db-password>
DB_NAME=faculty_attendance
JWT_SECRET=<generate-random-secret-key>
NODE_ENV=production
```

### 3.3 Create MySQL Database

1. In Render dashboard, click **"New +"** → **"PostgreSQL"** or use external MySQL
2. **For MySQL:** Use **PlanetScale** (free tier):
   - Go to https://planetscale.com
   - Create free database
   - Get connection details
   - Add to environment variables above

### 3.4 Deploy

Click **"Create Web Service"** - Render will build and deploy your backend.

Your backend will be available at: `https://faculty-attendance-api.onrender.com`

---

## Step 4: Deploy Frontend on Render

### 4.1 Update API URL

First, update the frontend to use your deployed backend URL.

Create `client/.env.production`:

```env
VITE_API_URL=https://faculty-attendance-api.onrender.com
```

Update `client/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true
      },
      '/uploads': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

### 4.2 Create Static Site

1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Connect same GitHub repository
3. Configure:

**Settings:**
- **Name:** `faculty-attendance-web`
- **Branch:** `main`
- **Root Directory:** `client`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

### 4.3 Add Environment Variable

```
VITE_API_URL=https://faculty-attendance-api.onrender.com
```

### 4.4 Deploy

Click **"Create Static Site"**

Your website will be available at: `https://faculty-attendance-web.onrender.com`

---

## Alternative: Deploy Everything on One Server (VPS)

If you prefer a traditional server approach:

### Using DigitalOcean Droplet ($6/month)

1. **Create Droplet**
   - Ubuntu 22.04
   - Basic plan ($6/month)
   - Choose region

2. **SSH into Server**
   ```bash
   ssh root@your-server-ip
   ```

3. **Install Dependencies**
   ```bash
   # Update system
   apt update && apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt install -y nodejs
   
   # Install MySQL
   apt install -y mysql-server
   
   # Install Nginx
   apt install -y nginx
   
   # Install PM2 (process manager)
   npm install -g pm2
   ```

4. **Setup MySQL**
   ```bash
   mysql_secure_installation
   mysql -u root -p
   ```
   
   ```sql
   CREATE DATABASE faculty_attendance;
   CREATE USER 'attendance_user'@'localhost' IDENTIFIED BY 'strong_password';
   GRANT ALL PRIVILEGES ON faculty_attendance.* TO 'attendance_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

5. **Clone and Setup Application**
   ```bash
   cd /var/www
   git clone https://github.com/YOUR_USERNAME/faculty-attendance-system.git
   cd faculty-attendance-system
   
   # Install dependencies
   npm install
   cd client && npm install && npm run build && cd ..
   
   # Create .env file
   nano .env
   ```
   
   Add your production environment variables.

6. **Start Backend with PM2**
   ```bash
   pm2 start server/index.js --name faculty-attendance
   pm2 startup
   pm2 save
   ```

7. **Configure Nginx**
   ```bash
   nano /etc/nginx/sites-available/faculty-attendance
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # Frontend
       location / {
           root /var/www/faculty-attendance-system/client/dist;
           try_files $uri $uri/ /index.html;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
       
       # Uploads
       location /uploads {
           proxy_pass http://localhost:5000;
       }
   }
   ```
   
   Enable site:
   ```bash
   ln -s /etc/nginx/sites-available/faculty-attendance /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

8. **Setup SSL with Let's Encrypt (Required for Camera)**
   ```bash
   apt install -y certbot python3-certbot-nginx
   certbot --nginx -d your-domain.com
   ```

9. **Configure Firewall**
   ```bash
   ufw allow 'Nginx Full'
   ufw allow OpenSSH
   ufw enable
   ```

---

## Important Production Checklist

Before going live:

- [ ] Change default admin password
- [ ] Update JWT_SECRET to strong random value
- [ ] Enable HTTPS (required for camera access)
- [ ] Configure CORS to only allow your domain
- [ ] Set up database backups
- [ ] Configure file upload size limits
- [ ] Set up monitoring/logging
- [ ] Test camera functionality on HTTPS
- [ ] Create database backup schedule

---

## Domain Setup (Optional)

### Using Custom Domain

1. **Buy domain** from Namecheap, GoDaddy, etc.
2. **Point DNS** to your server:
   - For Render: Add CNAME record
   - For VPS: Add A record to server IP
3. **Update environment variables** with your domain
4. **Setup SSL certificate** (automatic on Render, use Certbot on VPS)

---

## Cost Comparison

| Option | Monthly Cost | Pros | Cons |
|--------|-------------|------|------|
| Render Free | $0 | Easy, HTTPS included | Sleeps after inactivity |
| Render Paid | $7-25 | Always on, better performance | Limited free tier |
| DigitalOcean | $6+ | Full control | Requires server management |
| Railway | $5 credit | Easy deployment | Limited free tier |

---

## Testing Your Deployment

After deployment:

1. Visit your website URL
2. Test login with admin credentials
3. **Test camera access** (only works on HTTPS)
4. Create test faculty account
5. Submit test attendance
6. Generate test reports

---

## Troubleshooting

**Camera not working?**
- Ensure you're using HTTPS (not HTTP)
- Check browser permissions
- Test on different browsers

**Database connection failed?**
- Verify environment variables
- Check database is running
- Verify firewall rules

**Images not loading?**
- Check uploads directory permissions
- Verify static file serving configuration

---

## Support

For deployment issues:
- Render: https://render.com/docs
- DigitalOcean: https://docs.digitalocean.com
- PlanetScale: https://planetscale.com/docs
