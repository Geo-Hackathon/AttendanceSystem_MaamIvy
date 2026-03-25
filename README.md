# Faculty Attendance System

A secure and user-friendly web-based Faculty Attendance System with real-time camera-based verification to monitor and manage teaching faculty attendance.

## 🎯 Core Features

### 📷 Camera-Based Verification
- **Strict camera-only capture** - File uploads from local storage are completely disabled
- Real-time image capture using device camera
- Secure storage with timestamps
- Prevents attendance fraud through live verification

### 👤 User Roles

#### 🛠️ ADMIN
- Add and manage teaching faculty users
- Use School ID as username with auto-generated temporary passwords
- Create and assign class schedules for each faculty
- Monitor attendance with timestamps and captured images
- Generate weekly and monthly analytics
- Export and print reports in PDF format

#### 👨‍🏫 FACULTY USERS
- Secure login using School ID and password
- Upload attendance proof via camera capture only
- View personal dashboard with assigned schedules
- Track personal attendance history
- Change password anytime

### 📊 Analytics & Reporting
- Attendance rate per faculty
- Late/missed attendance tracking
- Weekly and monthly summaries
- Visual charts and graphs
- Printable PDF reports for administrative use

## 💻 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **MySQL** - Relational database
- **JWT** - Secure authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **PDFKit** - PDF generation

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn package manager

### Step 1: Clone or Download the Project
```bash
cd AttendanceSystem
```

### Step 2: Install Dependencies

#### Install root dependencies
```bash
npm install
```

#### Install client dependencies
```bash
cd client
npm install
cd ..
```

### Step 3: Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE faculty_attendance;
```

2. Copy the environment file:
```bash
copy .env.example .env
```

3. Edit `.env` file with your database credentials:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=faculty_attendance
JWT_SECRET=your_secret_key_change_this
NODE_ENV=development
```

**Important:** Change `JWT_SECRET` to a strong random string in production!

### Step 4: Initialize Database
The database tables will be created automatically when you first start the server. A default admin account will also be created.

### Step 5: Start the Application

#### Development Mode (Recommended)
Run both frontend and backend concurrently:
```bash
npm run dev
```

This will start:
- Backend API on `http://localhost:5000`
- Frontend on `http://localhost:3000`

#### Production Mode
```bash
# Build the frontend
npm run build

# Start the server
npm start
```

## 🔐 Default Login Credentials

### Admin Account
- **School ID:** `ADMIN001`
- **Password:** `admin123`

**⚠️ Important:** Change the admin password immediately after first login!

## 📖 User Guide

### For Administrators

#### 1. Faculty Management
- Navigate to **Faculty Management** tab
- Click **Add Faculty** to create new faculty accounts
- System generates temporary passwords automatically
- Share credentials with faculty members
- Use **Reset Password** to generate new temporary passwords
- Edit or delete faculty members as needed

#### 2. Schedule Management
- Go to **Class Schedules** tab
- Click **Add Schedule** to create class schedules
- Assign faculty, subject, day, time, and room
- Edit or delete schedules as needed
- View all schedules in organized table format

#### 3. Attendance Monitoring
- Access **Attendance Monitoring** tab
- Filter by faculty, date range, or status
- View all attendance records with photos
- Click on photos to view full size
- Monitor late arrivals and absences

#### 4. Analytics & Reports
- Visit **Analytics & Reports** tab
- Select period (weekly/monthly)
- Filter by specific faculty or view all
- View visual charts and statistics
- Click **Download PDF Report** to export data
- Print reports for administrative use

### For Faculty Members

#### 1. First Login
- Use School ID and temporary password provided by admin
- System will prompt to change password
- Set a secure password (minimum 6 characters)

#### 2. Submit Attendance
- Click **Capture Photo** button
- Allow camera access when prompted
- Position yourself in frame
- Click **Capture Photo**
- Review the captured image
- Click **Confirm & Submit** to record attendance
- Or click **Retake** if needed

#### 3. View Schedule
- Check **My Schedule** section for all assigned classes
- View today's classes in **Submit Attendance** section
- Click on a class to submit attendance for that specific schedule

#### 4. Track History
- Scroll to **Attendance History** table
- View all past attendance submissions
- Check status (Present/Late)
- Click photos to view full size

## 🔒 Security Features

### Authentication & Authorization
- JWT-based secure authentication
- Role-based access control (Admin/Faculty)
- Password hashing with bcrypt
- Protected API endpoints
- Session management

### Camera Security
- **Strict camera-only policy** - File upload inputs are completely disabled
- Uses WebRTC MediaDevices API for live camera access
- No file selection dialogs
- Real-time capture verification
- Prevents pre-recorded or edited images

### Data Protection
- Secure password storage with bcrypt hashing
- Environment variables for sensitive data
- SQL injection prevention with parameterized queries
- CORS configuration
- Input validation and sanitization

## 📁 Project Structure

```
AttendanceSystem/
├── client/                      # Frontend React application
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── admin/         # Admin-specific components
│   │   │   ├── CameraCapture.jsx
│   │   │   └── Navbar.jsx
│   │   ├── context/           # React context providers
│   │   │   └── AuthContext.jsx
│   │   ├── pages/             # Page components
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── FacultyDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── ChangePassword.jsx
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                     # Backend Node.js application
│   ├── config/
│   │   └── database.js        # Database configuration
│   ├── middleware/
│   │   ├── auth.js            # Authentication middleware
│   │   └── upload.js          # File upload middleware
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── faculty.js         # Faculty management routes
│   │   ├── schedules.js       # Schedule management routes
│   │   ├── attendance.js      # Attendance routes
│   │   └── reports.js         # Report generation routes
│   └── index.js               # Server entry point
├── uploads/                    # Uploaded attendance images
├── .env                        # Environment variables (create from .env.example)
├── .env.example               # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🗄️ Database Schema

### users
- `id` - Primary key
- `school_id` - Unique identifier (username)
- `name` - Full name
- `email` - Email address (optional)
- `password` - Hashed password
- `role` - admin or faculty
- `is_temp_password` - Boolean flag
- `created_at`, `updated_at` - Timestamps

### schedules
- `id` - Primary key
- `faculty_id` - Foreign key to users
- `subject` - Subject name
- `day_of_week` - Day of the week
- `start_time`, `end_time` - Class timing
- `room` - Room number (optional)
- `created_at` - Timestamp

### attendance
- `id` - Primary key
- `faculty_id` - Foreign key to users
- `schedule_id` - Foreign key to schedules (optional)
- `image_path` - Path to captured image
- `captured_at` - Timestamp
- `status` - present or late
- `notes` - Additional notes (optional)

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/me` - Get current user

### Faculty Management (Admin only)
- `GET /api/faculty` - List all faculty
- `POST /api/faculty` - Create faculty
- `PUT /api/faculty/:id` - Update faculty
- `DELETE /api/faculty/:id` - Delete faculty
- `POST /api/faculty/:id/reset-password` - Reset password

### Schedules
- `GET /api/schedules` - List schedules
- `POST /api/schedules` - Create schedule (Admin)
- `PUT /api/schedules/:id` - Update schedule (Admin)
- `DELETE /api/schedules/:id` - Delete schedule (Admin)

### Attendance
- `POST /api/attendance/submit` - Submit attendance (Faculty)
- `GET /api/attendance` - List attendance records
- `GET /api/attendance/analytics` - Get analytics (Admin)

### Reports
- `GET /api/reports/pdf` - Generate PDF report (Admin)

## 🎨 UI Features

- **Modern Design** - Clean, professional interface with TailwindCSS
- **Responsive Layout** - Works on desktop, tablet, and mobile devices
- **Real-time Updates** - Instant feedback on actions
- **Visual Analytics** - Charts and graphs for data visualization
- **Intuitive Navigation** - Tab-based admin dashboard
- **Accessible** - Keyboard navigation and screen reader support

## 🐛 Troubleshooting

### Camera Not Working
- Ensure browser has camera permissions
- Use HTTPS in production (required for camera access)
- Check if camera is being used by another application
- Try a different browser (Chrome/Edge recommended)

### Database Connection Error
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists
- Check MySQL user permissions

### Port Already in Use
- Change `PORT` in `.env` file
- Or stop the process using the port

### Images Not Displaying
- Check `uploads/` directory exists
- Verify file permissions
- Check server static file serving configuration

## 📝 Development Notes

### Adding New Features
1. Backend: Add routes in `server/routes/`
2. Frontend: Create components in `client/src/components/`
3. Update API calls in respective pages
4. Test thoroughly before deployment

### Database Migrations
- Modify schema in `server/config/database.js`
- Backup database before changes
- Test migrations in development first

## 🚀 Deployment

### Production Checklist
- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Update database credentials
- [ ] Set `NODE_ENV=production`
- [ ] Build frontend: `cd client && npm run build`
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Enable HTTPS (required for camera access)
- [ ] Set up database backups
- [ ] Configure firewall rules
- [ ] Change default admin password

## 📄 License

MIT License - Feel free to use this project for educational or commercial purposes.

## 👥 Support

For issues or questions:
1. Check this README thoroughly
2. Review the troubleshooting section
3. Check browser console for errors
4. Verify database connection and credentials

## ✨ Future Enhancements

- Email notifications for attendance
- SMS alerts for missed classes
- Biometric verification integration
- Mobile app (React Native)
- Advanced reporting with custom date ranges
- Attendance export to Excel
- Multi-language support
- Dark mode theme
