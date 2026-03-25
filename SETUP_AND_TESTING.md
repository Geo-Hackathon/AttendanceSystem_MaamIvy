# Setup and Testing Guide

## ⚠️ CRITICAL: Database Migration Required

Before testing any features, you **MUST** run the database migration to add the `temp_password_plain` column.

### Quick Migration Steps:

1. **Stop the server** (Ctrl+C)

2. **Run MySQL:**
   ```bash
   mysql -u root -p
   ```

3. **Execute migration:**
   ```sql
   USE faculty_attendance;
   ALTER TABLE users ADD COLUMN temp_password_plain VARCHAR(255) AFTER is_temp_password;
   EXIT;
   ```

4. **Restart server:**
   ```bash
   npm run dev
   ```

---

## 🎯 What's New - Complete Feature List

### 1. ✅ Revised Attendance Time Window
- **Old:** 5 min before → until class ends
- **New:** 5 min before → 15 min after start time
- Status badges show: "Available Now", "X min left", "Window Closed"

### 2. 📱 Collapsible Sidebar Navigation
- **Desktop:** Sidebar with collapse button
- **Mobile:** Hamburger menu with overlay
- **Role-based menus** for admin and faculty
- **Responsive design** for all devices

### 3. 👨‍🎓 Student Management System
- Add individual students
- Enroll students in classes
- Take attendance for students
- View attendance statistics
- **NEW: Bulk upload via Excel/CSV**

### 4. 📊 Bulk Student Upload
- Upload Excel (.xlsx, .xls) or CSV files
- Downloadable template
- Validation and error reporting
- Update existing or create new students
- Process hundreds of students in minutes

### 5. 🔐 Admin Password Viewing
- View temporary passwords in Faculty Management
- Passwords shown for admin-generated temp passwords
- Hidden once user changes password

---

## 🚀 Testing Checklist

### ✅ Step 1: Run Database Migration
- [ ] Stop server
- [ ] Run ALTER TABLE command
- [ ] Verify column added (`DESCRIBE users;`)
- [ ] Restart server
- [ ] No more "Unknown column" errors

### ✅ Step 2: Test Sidebar Navigation

**Admin Dashboard:**
- [ ] Sidebar appears on left
- [ ] Click collapse button (works)
- [ ] Resize to mobile (<1024px)
- [ ] Hamburger menu appears
- [ ] Click menu items to navigate
- [ ] All 6 menu items work

**Faculty Dashboard:**
- [ ] Sidebar appears
- [ ] See "My Students" menu item
- [ ] Click to navigate to Student Management
- [ ] All menu items functional

### ✅ Step 3: Test Student Management

**Add Individual Student:**
- [ ] Click "Add Student"
- [ ] Fill in form
- [ ] Submit successfully
- [ ] Student appears in list

**Bulk Upload:**
- [ ] Click "Bulk Upload"
- [ ] Click "Download Template"
- [ ] Template downloads
- [ ] Fill in template with test data
- [ ] Upload file
- [ ] See success/error results
- [ ] Students appear in database

**Enroll Students:**
- [ ] Select a class from dropdown
- [ ] Click "Enroll Student"
- [ ] Search and select student
- [ ] Student added to class

**Take Attendance:**
- [ ] Select class with enrolled students
- [ ] Click "Take Attendance"
- [ ] Mark students (Present/Late/Absent/Excused)
- [ ] Save attendance
- [ ] Verify saved successfully

### ✅ Step 4: Test Attendance Window

**Create Test Schedule:**
- [ ] Create schedule starting in ~10 minutes
- [ ] Watch status badge change over time
- [ ] Try submitting at different times:
  - [ ] 6 min before (too early)
  - [ ] 4 min before (available)
  - [ ] At start time (late but accepted)
  - [ ] 10 min after (late but accepted)
  - [ ] 16 min after (window closed)

### ✅ Step 5: Test Password Viewing (Admin)

**Create New Faculty:**
- [ ] Login as admin
- [ ] Go to Faculty Management
- [ ] Create new faculty
- [ ] See temp password in table

**Reset Password:**
- [ ] Click reset password icon
- [ ] See new password displayed
- [ ] Password visible in table

**User Changes Password:**
- [ ] Login as that faculty
- [ ] Change password
- [ ] Logout, login as admin
- [ ] Password now shows as ●●●●●●●●

---

## 📁 File Structure

### New Files Created:
```
d:\AttendanceSystem\
├── client/src/
│   ├── components/
│   │   ├── Layout.jsx (NEW)
│   │   └── Sidebar.jsx (NEW)
│   └── pages/
│       └── StudentManagement.jsx (NEW)
├── server/routes/
│   ├── students.js (NEW)
│   └── studentAttendance.js (NEW)
├── public/templates/
│   └── student-upload-template.csv (NEW)
├── add-temp-password-column.sql (NEW)
├── student-schema.sql (NEW)
├── FEATURE_UPDATES.md (NEW)
├── BULK_UPLOAD_GUIDE.md (NEW)
├── MIGRATION_INSTRUCTIONS.md (NEW)
└── SETUP_AND_TESTING.md (NEW - this file)
```

### Modified Files:
```
├── client/src/
│   ├── App.jsx (added student route)
│   ├── pages/
│   │   ├── AdminDashboard.jsx (uses Layout)
│   │   └── FacultyDashboard.jsx (uses Layout)
│   └── components/admin/
│       └── FacultyManagement.jsx (password column)
├── server/
│   ├── index.js (registered new routes)
│   ├── config/database.js (student tables)
│   └── routes/
│       ├── auth.js (clear temp password)
│       ├── faculty.js (store temp password)
│       └── attendance.js (time window logic)
└── package.json (added xlsx dependency)
```

---

## 🔧 Troubleshooting

### Issue: "Unknown column 'temp_password_plain'"
**Solution:** Run the database migration (see top of this document)

### Issue: Sidebar not showing
**Solution:** 
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check console for errors

### Issue: Bulk upload fails
**Solution:**
- Verify file format (Excel or CSV)
- Check column names match exactly
- Ensure Year Level and Department values are valid
- Review error messages in upload results

### Issue: Student Management page not found
**Solution:**
- Verify route added to App.jsx
- Check URL: `/faculty/students`
- Restart development server

### Issue: Layout looks broken
**Solution:**
- Check if Tailwind CSS is loaded
- Verify Layout component imported correctly
- Check browser console for errors

---

## 📊 Test Data

### Sample Students for Bulk Upload:

Save this as `test-students.csv`:

```csv
Student ID,First Name,Last Name,Email,Year Level,Department,Major,Section
TEST-001,Test,Student One,test1@example.com,1st Year,CIT,IT,A
TEST-002,Test,Student Two,test2@example.com,1st Year,CIT,IT,A
TEST-003,Test,Student Three,test3@example.com,2nd Year,CBA,Business,B
TEST-004,Test,Student Four,test4@example.com,2nd Year,CBA,Business,B
TEST-005,Test,Student Five,test5@example.com,3rd Year,CTE,Education,C
```

### Test Faculty Account:
- **School ID:** Create via admin panel
- **Temp Password:** Shown in Faculty Management table

### Test Admin Account:
- **School ID:** `ADMIN001`
- **Password:** `admin123`

---

## ✅ Success Criteria

You'll know everything is working when:

1. ✅ No database errors in console
2. ✅ Sidebar appears on both dashboards
3. ✅ "My Students" link works for faculty
4. ✅ Can add students individually
5. ✅ Can bulk upload students from Excel/CSV
6. ✅ Can enroll students in classes
7. ✅ Can take student attendance
8. ✅ Attendance window shows correct status
9. ✅ Admin can see temporary passwords
10. ✅ Everything is responsive on mobile

---

## 🎉 Next Steps After Testing

Once everything works:

1. **Deploy to Production:**
   - Run migration on production database
   - Deploy backend to Render.com
   - Deploy frontend to InfinityFree
   - Update environment variables

2. **Import Real Data:**
   - Prepare Excel file with real students
   - Use bulk upload feature
   - Verify all data imported correctly

3. **Train Users:**
   - Show faculty how to use Student Management
   - Demonstrate bulk upload feature
   - Explain attendance time window

4. **Monitor:**
   - Check for any errors
   - Gather user feedback
   - Make adjustments as needed

---

## 📞 Support

If you encounter issues not covered here:
1. Check browser console for errors
2. Check server logs for backend errors
3. Verify database migration completed
4. Review BULK_UPLOAD_GUIDE.md for upload issues
5. Check MIGRATION_INSTRUCTIONS.md for database help

---

**Ready to test? Start with the database migration!** 🚀
