# Deployment Guide

## Firebase Project Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `faculty-attendance-system`
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Services
In your Firebase project, enable the following services:

#### Authentication
1. Go to Authentication → Sign-in method
2. Enable "Email/Password" provider
3. Click "Save"

#### Firestore Database
1. Go to Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" (we'll update rules later)
4. Select a location
5. Click "Enable"

#### Storage
1. Go to Storage
2. Click "Get started"
3. Choose "Start in test mode" (we'll update rules later)
4. Select a location
5. Click "Enable"

### 3. Configure Security Rules

#### Firestore Rules
1. Go to Firestore Database → Rules
2. Replace the contents with the rules from `firestore.rules`
3. Click "Publish"

#### Storage Rules
1. Go to Storage → Rules
2. Replace the contents with the rules from `storage.rules`
3. Click "Publish"

### 4. Get Firebase Configuration
1. Go to Project Settings → General → Your apps
2. Click the web icon (`</>`) to register a web app
3. Enter app name: "Faculty Attendance System"
4. Click "Register app"
5. Copy the `firebaseConfig` object
6. Update your `.env` file with these values

## Local Development Setup

### 1. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` with your Firebase configuration:
```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id_here
```

### 3. Initialize Firebase
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init
```

When prompted:
- Choose "Firestore", "Functions", "Hosting", and "Storage"
- Select your existing Firebase project
- Use the existing `functions` directory
- Use the existing `public` directory (set to `dist`)
- Configure as a single-page app (rewrite all URLs to `/index.html`)
- Don't overwrite existing files

### 4. Run Development Server
```bash
# Start the React development server
npm run dev
```

The application will be available at `http://localhost:3000`

## Production Deployment

### 1. Build the Application
```bash
npm run build
```

### 2. Deploy to Firebase Hosting
```bash
# Deploy the web application
firebase deploy --only hosting

# Deploy Cloud Functions
firebase deploy --only functions

# Deploy security rules
firebase deploy --only firestore:rules
firebase deploy --only storage:rules

# Deploy everything at once
firebase deploy
```

### 3. Verify Deployment
1. Go to Firebase Console → Hosting
2. Click on your site URL to verify it's working
3. Test all functionality:
   - Authentication (login/logout)
   - Faculty dashboard and attendance marking
   - Admin panel (faculty management, schedules, analytics)
   - Camera functionality on mobile devices

## Initial Data Setup

### Create First Admin User
You'll need to create the first admin user. You can do this either:

#### Option 1: Using Firebase Console
1. Go to Authentication → Users
2. Click "Add user"
3. Enter email and password
4. Go to Firestore Database
5. Add a document in the `users` collection with the user's UID as document ID:
```javascript
{
  email: "admin@example.com",
  name: "Admin User",
  role: "admin",
  createdAt: timestamp
}
```

#### Option 2: Using Cloud Functions
Deploy the Cloud Functions first, then call the `createUser` function from your app or use the Firebase Functions shell.

### Test Data
After setting up the admin user:
1. Login as admin
2. Add a few faculty members
3. Create sample schedules
4. Test attendance marking as faculty

## Environment-Specific Configurations

### Development
- Use Firebase emulators for local testing
- Enable debug logging
- Use test data

### Staging
- Use staging Firebase project
- Test with real data
- Validate all functionality

### Production
- Use production Firebase project
- Enable monitoring and alerts
- Set up proper backups
- Configure analytics

## Monitoring and Maintenance

### Firebase Console Monitoring
1. Monitor usage in Firebase Console
2. Check Authentication usage
3. Monitor Firestore reads/writes
4. Track Storage usage

### Performance Optimization
1. Enable caching where appropriate
2. Optimize Firestore queries
3. Compress images before upload
4. Monitor bundle size

### Security Considerations
1. Regularly review security rules
2. Monitor for suspicious activity
3. Keep dependencies updated
4. Use HTTPS in production

## Troubleshooting Deployment Issues

### Common Issues

1. **Build Fails**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Functions Deployment Fails**
   ```bash
   # Check functions logs
   firebase functions:log
   
   # Redeploy functions
   firebase deploy --only functions
   ```

3. **Security Rules Not Working**
   - Verify rules syntax
   - Check that rules are deployed
   - Test with Firestore simulator

4. **Storage Access Denied**
   - Verify storage rules
   - Check bucket permissions
   - Ensure proper authentication

### Getting Help
- Check Firebase documentation
- Review deployment logs
- Use Firebase console debugging tools
- Check browser console for errors

## Backup and Recovery

### Firestore Data Backup
```bash
# Export Firestore data
firebase firestore:export --backup-file backup-$(date +%Y%m%d)
```

### Restore Data
```bash
# Import Firestore data
firebase firestore:import backup-20231201
```

### Automated Backups
Set up automated backups in Firebase Console:
1. Go to Firestore Database → Backups
2. Configure backup schedule
3. Choose backup location
4. Set retention policy

## Custom Domain Setup

### 1. Add Custom Domain
1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Enter your domain name
4. Follow DNS configuration instructions

### 2. SSL Certificate
Firebase automatically provisions SSL certificates for custom domains.

### 3. DNS Configuration
Add the provided DNS records to your domain registrar.

## Scaling Considerations

### Database Scaling
- Monitor Firestore usage
- Optimize queries with indexes
- Consider data sharding for large datasets

### Function Scaling
- Monitor function execution time
- Set appropriate memory limits
- Consider function regions for global users

### Storage Scaling
- Monitor storage usage
- Implement image compression
- Set up lifecycle policies for old files

## Security Best Practices

### Authentication
- Enable email verification
- Implement password strength requirements
- Consider multi-factor authentication for admins

### Data Protection
- Regular security audits
- Principle of least privilege
- Encrypt sensitive data

### Monitoring
- Set up alerts for suspicious activity
- Regular security rule reviews
- Monitor API usage patterns
