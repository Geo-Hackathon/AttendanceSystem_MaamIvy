# Troubleshooting Guide

## 🔧 Common Issues and Solutions

### Issue 1: Dashboard Tabs Show Blank Pages ✅ FIXED

**Problem:** Clicking on tabs in Admin or Faculty dashboard shows blank content.

**Cause:** Layout component had extra padding that pushed content out of view.

**Solution:** Fixed in latest update. The Layout component now properly renders content.

**To verify fix:**
1. Pull latest code: `git pull`
2. Restart server: `npm run dev`
3. Login and click different tabs
4. Content should now display properly

---

### Issue 2: Student Enrollment Not Showing ⚠️ REQUIRES DATABASE MIGRATION

**Problem:** After enrolling a student, they don't appear in the enrolled students list.

**Cause:** Student tables don't exist in the database yet.

**Solution:** Run the database migration to create student tables.

#### Step-by-Step Fix:

1. **Stop the server** (Ctrl+C)

2. **Open MySQL:**
   ```bash
   mysql -u root -p
   ```

3. **Select database:**
   ```sql
   USE faculty_attendance;
   ```

4. **Create student tables:**
   ```sql
   -- Students table
   CREATE TABLE IF NOT EXISTS students (
     id INT AUTO_INCREMENT PRIMARY KEY,
     student_id VARCHAR(50) UNIQUE NOT NULL,
     first_name VARCHAR(100) NOT NULL,
     last_name VARCHAR(100) NOT NULL,
     email VARCHAR(100),
     year_level ENUM('1st Year', '2nd Year', '3rd Year', '4th Year') NOT NULL,
     department ENUM('CTE', 'CBA', 'CLAPA', 'CIT', 'THEO') NOT NULL,
     major VARCHAR(100),
     section VARCHAR(50),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     INDEX idx_student_id (student_id),
     INDEX idx_department (department),
     INDEX idx_year_level (year_level)
   );

   -- Student enrollments table
   CREATE TABLE IF NOT EXISTS student_enrollments (
     id INT AUTO_INCREMENT PRIMARY KEY,
     student_id INT NOT NULL,
     schedule_id INT NOT NULL,
     enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     status ENUM('active', 'dropped') DEFAULT 'active',
     FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
     FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
     UNIQUE KEY unique_enrollment (student_id, schedule_id),
     INDEX idx_student (student_id),
     INDEX idx_schedule (schedule_id)
   );

   -- Student attendance table
   CREATE TABLE IF NOT EXISTS student_attendance (
     id INT AUTO_INCREMENT PRIMARY KEY,
     student_id INT NOT NULL,
     schedule_id INT NOT NULL,
     faculty_attendance_id INT,
     status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
     attendance_date DATE NOT NULL,
     time_recorded TIME,
     notes TEXT,
     recorded_by INT NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
     FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
     FOREIGN KEY (faculty_attendance_id) REFERENCES attendance(id) ON DELETE SET NULL,
     FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE CASCADE,
     INDEX idx_student (student_id),
     INDEX idx_schedule (schedule_id),
     INDEX idx_date (attendance_date),
     INDEX idx_faculty_attendance (faculty_attendance_id)
   );

   -- Add temp_password_plain column (for password viewing feature)
   ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_password_plain VARCHAR(255) AFTER is_temp_password;
   ```

5. **Verify tables created:**
   ```sql
   SHOW TABLES;
   DESCRIBE students;
   DESCRIBE student_enrollments;
   DESCRIBE student_attendance;
   ```

6. **Exit MySQL:**
   ```sql
   EXIT;
   ```

7. **Restart server:**
   ```bash
   npm run dev
   ```

8. **Test enrollment:**
   - Add a student
   - Select a class
   - Enroll the student
   - Student should now appear in the list!

---

### Issue 3: Email Required for Students ✅ ALREADY OPTIONAL

**Problem:** Email field appears to be required when adding students.

**Status:** Email is already optional in the form. No changes needed.

**Verification:**
- The email field has no `required` attribute
- You can submit the form without entering an email
- Email column in database allows NULL values

---

## 🚨 Critical Migrations Checklist

Before using the system, ensure ALL these migrations are run:

### ✅ Migration 1: Add temp_password_plain column
```sql
ALTER TABLE users ADD COLUMN temp_password_plain VARCHAR(255) AFTER is_temp_password;
```

### ✅ Migration 2: Create student tables
```sql
-- Run all three CREATE TABLE statements from Issue 2 above
```

### ✅ Migration 3: Verify all tables exist
```sql
SHOW TABLES;
-- Should show:
-- - users
-- - subjects
-- - schedules
-- - attendance
-- - students
-- - student_enrollments
-- - student_attendance
```

---

## 🔍 Debugging Steps

### If dashboards still show blank pages:

1. **Check browser console:**
   - Press F12
   - Look for JavaScript errors
   - Common errors and fixes:
     - "Cannot read property..." → Clear cache and hard refresh (Ctrl+Shift+R)
     - "Failed to fetch" → Check if backend server is running
     - "401 Unauthorized" → Login again

2. **Check server logs:**
   - Look at terminal where `npm run dev` is running
   - Look for error messages
   - Common errors:
     - "Unknown column" → Run database migrations
     - "ECONNREFUSED" → MySQL not running
     - "ER_NO_SUCH_TABLE" → Tables don't exist, run migrations

3. **Clear browser cache:**
   ```
   Ctrl+Shift+Delete → Clear cache → Hard refresh (Ctrl+Shift+R)
   ```

### If student enrollment fails:

1. **Check if student exists:**
   ```sql
   SELECT * FROM students WHERE student_id = 'YOUR_STUDENT_ID';
   ```

2. **Check if schedule exists:**
   ```sql
   SELECT * FROM schedules WHERE id = YOUR_SCHEDULE_ID;
   ```

3. **Check enrollment table:**
   ```sql
   SELECT * FROM student_enrollments WHERE student_id = X AND schedule_id = Y;
   ```

4. **Check for errors in browser console and server logs**

### If bulk upload fails:

1. **Verify file format:**
   - Must be .xlsx, .xls, or .csv
   - Must have header row
   - Column names must match exactly

2. **Check validation errors:**
   - Year Level must be: `1st Year`, `2nd Year`, `3rd Year`, or `4th Year`
   - Department must be: `CTE`, `CBA`, `CLAPA`, `CIT`, or `THEO`
   - Required fields: Student ID, First Name, Last Name, Year Level, Department

3. **Check server logs for detailed error messages**

---

## 📊 Database Health Check

Run these queries to verify your database is set up correctly:

```sql
-- Check all tables exist
SHOW TABLES;

-- Check users table structure
DESCRIBE users;
-- Should have: temp_password_plain column

-- Check students table exists
DESCRIBE students;

-- Check enrollments table exists
DESCRIBE student_enrollments;

-- Check student attendance table exists
DESCRIBE student_attendance;

-- Count records
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Students', COUNT(*) FROM students
UNION ALL
SELECT 'Enrollments', COUNT(*) FROM student_enrollments
UNION ALL
SELECT 'Student Attendance', COUNT(*) FROM student_attendance;
```

---

## 🆘 Emergency Reset

If everything is broken and you need to start fresh:

### Option 1: Reset Database (CAUTION: Deletes all data)

```sql
DROP DATABASE faculty_attendance;
CREATE DATABASE faculty_attendance;
USE faculty_attendance;
-- Then run all CREATE TABLE statements from database-schema.sql
```

### Option 2: Reset Just Student Tables

```sql
DROP TABLE IF EXISTS student_attendance;
DROP TABLE IF EXISTS student_enrollments;
DROP TABLE IF EXISTS students;
-- Then recreate them with CREATE TABLE statements above
```

### Option 3: Clear Browser Data

1. Press Ctrl+Shift+Delete
2. Select "All time"
3. Check: Cookies, Cache, Local Storage
4. Clear data
5. Close and reopen browser
6. Login again

---

## ✅ Verification Checklist

After running all fixes, verify:

- [ ] Server starts without errors
- [ ] Can login as admin
- [ ] Can login as faculty
- [ ] Admin dashboard tabs all show content
- [ ] Faculty dashboard shows content
- [ ] Can navigate using sidebar
- [ ] Can add a student
- [ ] Can select a class
- [ ] Can enroll student in class
- [ ] Enrolled student appears in list
- [ ] Can take student attendance
- [ ] Can bulk upload students
- [ ] Admin can see temporary passwords

---

## 📞 Still Having Issues?

1. **Check all migrations are run** (see Critical Migrations Checklist above)
2. **Restart both frontend and backend servers**
3. **Clear browser cache completely**
4. **Check MySQL is running:** `mysql -u root -p`
5. **Verify database exists:** `SHOW DATABASES;`
6. **Check server logs for specific error messages**
7. **Check browser console for JavaScript errors**

---

## 🎯 Quick Fix Summary

**For blank dashboard tabs:**
- Pull latest code: `git pull`
- Restart server: `npm run dev`

**For student enrollment not showing:**
- Run student table migrations (see Issue 2 above)
- Restart server
- Test enrollment again

**For any database errors:**
- Run ALL migrations from Critical Migrations Checklist
- Restart server
- Clear browser cache

---

**Most issues are solved by running the database migrations!** 🚀
