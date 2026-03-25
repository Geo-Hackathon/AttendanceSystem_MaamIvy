# Quick Setup Guide

## Step-by-Step Installation

### 1. Install Dependencies

Open terminal in the project root directory and run:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Setup Database

1. Open MySQL and create the database:
```sql
CREATE DATABASE faculty_attendance;
```

2. Create `.env` file in the root directory with these contents:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=faculty_attendance
JWT_SECRET=change_this_to_a_random_secret_key
NODE_ENV=development
```

**Important:** Replace `your_mysql_password_here` with your actual MySQL password!

### 3. Start the Application

```bash
npm run dev
```

This will start:
- Backend on http://localhost:5000
- Frontend on http://localhost:3000

### 4. Login

Open your browser and go to http://localhost:3000

**Default Admin Login:**
- School ID: `ADMIN001`
- Password: `admin123`

### 5. First Steps

1. Change the admin password immediately
2. Add faculty members
3. Create class schedules
4. Faculty can now login and submit attendance

## Troubleshooting

**Database connection error?**
- Make sure MySQL is running
- Check your database credentials in `.env`
- Verify the database `faculty_attendance` exists

**Port already in use?**
- Change the PORT in `.env` to another number (e.g., 5001)

**Camera not working?**
- Allow camera permissions in your browser
- Make sure no other app is using the camera

## Need Help?

Check the full README.md for detailed documentation.
