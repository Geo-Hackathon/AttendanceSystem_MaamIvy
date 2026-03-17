# Faculty Attendance System - Quick Start Guide

## Overview
This guide will help you get the Faculty Attendance System running in minutes.

## Prerequisites
- Node.js 18+ installed
- Firebase account
- Modern web browser with camera support

## Step 1: Firebase Setup (5 minutes)

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" → Enter project name → Create project

2. **Enable Services**
   - Authentication → Sign-in method → Enable "Email/Password"
   - Firestore Database → Create database → Start in test mode
   - Storage → Get started → Start in test mode

3. **Get Configuration**
   - Project Settings → General → Your apps → Web app (`</>`)
   - Copy the `firebaseConfig` values

## Step 2: Local Setup (3 minutes)

1. **Clone and Install**
   ```bash
   git clone <your-repo>
   cd AttendanceSystem
   npm install
   cd functions && npm install && cd ..
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your Firebase config from Step 1.

3. **Initialize Firebase**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```
   Select: Firestore, Functions, Hosting, Storage → Choose your project

## Step 3: Deploy Security Rules (2 minutes)

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

## Step 4: Run Application (1 minute)

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Step 5: Create Admin Account (2 minutes)

1. **Via Firebase Console (Easiest)**
   - Authentication → Users → Add user
   - Firestore → Collection: `users` → Document: (user UID)
   - Add: `{ email: "admin@example.com", name: "Admin", role: "admin", createdAt: timestamp }`

2. **Test Login**
   - Go to your app → Login with admin credentials
   - You should see the admin dashboard

## Step 6: Add Test Data (2 minutes)

1. **Add Faculty**
   - Admin → Faculty Management → Add Faculty
   - Create a test faculty account

2. **Create Schedule**
   - Admin → Schedule Management → Add Schedule
   - Assign to the faculty member

3. **Test Attendance**
   - Logout → Login as faculty
   - Test camera-based attendance marking

## Production Deployment (5 minutes)

```bash
# Build and deploy
npm run build
firebase deploy --only hosting
firebase deploy --only functions
```

## Common Quick Fixes

**Camera not working?**
- Use HTTPS or localhost
- Check browser permissions
- Try Chrome/Firefox

**Firebase connection issues?**
- Verify `.env` values
- Check Firebase project settings
- Ensure services are enabled

**Build errors?**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Need Help?
- Check the full `README.md` for detailed documentation
- Review `DEPLOYMENT.md` for production setup
- Check browser console for errors

## Success! 🎉
Your Faculty Attendance System is now running! Faculty can mark attendance with photos, and admins can manage everything through the dashboard.
