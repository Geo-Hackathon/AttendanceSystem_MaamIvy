# Faculty Attendance System

A comprehensive web-based faculty attendance tracking system built with React and Firebase. The system provides role-based access for faculty members to mark attendance using camera capture and administrators to manage faculty, schedules, and view analytics.

## Features

### Faculty Interface
- **Dashboard**: View today's class schedule and attendance status
- **Camera-based Attendance**: Mark attendance using device camera with photo capture
- **Mobile Responsive**: Works seamlessly on both desktop and mobile devices
- **Real-time Updates**: Immediate feedback on attendance submission

### Admin Interface
- **Faculty Management**: Add, edit, and delete faculty accounts
- **Schedule Management**: Create and manage class schedules
- **Analytics Dashboard**: Comprehensive attendance reports with charts
- **Role-based Access**: Secure admin-only functionality

### Technical Features
- **Firebase Authentication**: Secure email/password login with role management
- **Cloud Firestore**: Scalable NoSQL database for data storage
- **Firebase Storage**: Secure photo storage for attendance records
- **Cloud Functions**: Server-side user management and analytics
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Data**: Live updates across all connected clients

## Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Webcam** - Camera access and photo capture
- **Recharts** - Data visualization charts
- **Lucide React** - Modern icon library

### Backend
- **Firebase Authentication** - User authentication and authorization
- **Cloud Firestore** - Real-time database
- **Firebase Storage** - File storage for attendance photos
- **Cloud Functions** - Server-side logic
- **Firebase Hosting** - Web hosting

## Project Structure

```
AttendanceSystem/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable React components
│   │   ├── CameraModal.js
│   │   ├── Layout.js
│   │   └── ProtectedRoute.js
│   ├── context/           # React Context for state management
│   │   └── AuthContext.js
│   ├── firebase/          # Firebase configuration and utilities
│   │   ├── auth.js
│   │   ├── config.js
│   │   └── firestore.js
│   ├── pages/             # Page components
│   │   ├── admin/         # Admin pages
│   │   │   ├── Analytics.js
│   │   │   ├── Dashboard.js
│   │   │   ├── FacultyManagement.js
│   │   │   └── ScheduleManagement.js
│   │   ├── faculty/       # Faculty pages
│   │   │   └── Dashboard.js
│   │   ├── Login.js
│   │   └── DashboardRedirect.js
│   ├── utils/             # Utility functions
│   ├── App.jsx            # Main App component
│   ├── index.css          # Global styles
│   └── main.jsx           # App entry point
├── functions/             # Cloud Functions
│   ├── index.js           # Cloud Functions code
│   └── package.json       # Functions dependencies
├── firebase.json          # Firebase configuration
├── firestore.rules        # Firestore security rules
├── storage.rules          # Firebase Storage security rules
├── package.json           # Project dependencies
└── README.md              # This file
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd AttendanceSystem
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 3. Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password method)
3. Create Firestore database
4. Set up Firebase Storage
5. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

### 4. Configure Firebase
1. Login to Firebase:
```bash
firebase login
```

2. Initialize Firebase in your project:
```bash
firebase init
```

3. Configure your Firebase project settings in `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your Firebase project configuration:
```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id_here
```

### 5. Deploy Security Rules
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### 6. Run Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Deployment

### Deploy to Firebase Hosting
```bash
# Build the application
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy Cloud Functions
firebase deploy --only functions

# Deploy everything
firebase deploy
```

### Environment Configuration
For production, ensure your environment variables are properly configured in your Firebase project settings.

## Database Schema

### Users Collection
```javascript
{
  email: string,
  name: string,
  role: "faculty" | "admin",
  createdAt: timestamp
}
```

### Schedules Collection
```javascript
{
  facultyId: string,
  courseName: string,
  dayOfWeek: string,
  startTime: string,
  endTime: string,
  room: string,
  semester: string (optional),
  createdAt: timestamp
}
```

### Attendance Collection
```javascript
{
  facultyId: string,
  scheduleId: string,
  photoUrl: string,
  timestamp: timestamp,
  createdAt: timestamp
}
```

## Security Rules

### Firestore Rules
- Users can only read their own profile
- Admins can read/write all user data
- Faculty can only read their own schedules
- Faculty can only create their own attendance records
- Admins can read all attendance data

### Storage Rules
- Faculty can only upload to their own attendance folder
- Admins can read all attendance photos
- Public access is restricted

## Cloud Functions

### Available Functions
1. **createUser** - Create new user with role (admin only)
2. **deleteUser** - Delete user account (admin only)
3. **updateUserRole** - Update user role (admin only)
4. **getAttendanceAnalytics** - Fetch attendance analytics (admin only)
5. **sendAttendanceReminder** - Send attendance reminders (admin only)

## Usage Guide

### For Faculty
1. Login with your email and password
2. View today's schedule on the dashboard
3. Click "Mark Attendance" for each class
4. Allow camera access when prompted
5. Take a photo and submit attendance

### For Administrators
1. Login with admin credentials
2. Manage faculty accounts from the Faculty page
3. Create and manage schedules from the Schedules page
4. View attendance analytics and reports from the Analytics page

## Troubleshooting

### Common Issues

1. **Camera Permission Denied**
   - Ensure you're using HTTPS or localhost
   - Check browser permissions for camera access
   - Try refreshing the page and granting permissions

2. **Firebase Connection Issues**
   - Verify your Firebase configuration in `.env`
   - Check that Firestore and Storage are enabled
   - Ensure security rules are properly deployed

3. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for missing environment variables
   - Verify all dependencies are installed

4. **Authentication Issues**
   - Ensure Email/Password auth is enabled in Firebase Console
   - Check that security rules allow the operations
   - Verify user roles are properly set in Firestore

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review Firebase documentation for specific service issues

## Future Enhancements

- Geolocation verification for attendance
- Push notifications for attendance reminders
- Export analytics as PDF/CSV
- Bulk schedule creation
- Advanced filtering and search
- Mobile app development
- Integration with learning management systems
