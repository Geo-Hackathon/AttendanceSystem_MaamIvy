# Student Bulk Upload Guide

## 📊 Overview

The bulk upload feature allows faculty and admins to import multiple students at once using Excel (.xlsx, .xls) or CSV files. This saves time when enrolling large numbers of students.

---

## 🚀 How to Use Bulk Upload

### Step 1: Access the Feature

1. **Login as Faculty**
2. Click **"My Students"** in the sidebar
3. Click the **"Bulk Upload"** button (top right)

### Step 2: Download Template

1. In the Bulk Upload modal, click **"Download Template"**
2. A CSV file will download: `student-upload-template.csv`
3. Open the file in Excel, Google Sheets, or any spreadsheet software

### Step 3: Fill in Student Data

The template has the following columns:

| Column | Required | Valid Values | Example |
|--------|----------|--------------|---------|
| **Student ID** | ✅ Yes | Any unique ID | 2021-001 |
| **First Name** | ✅ Yes | Text | Juan |
| **Last Name** | ✅ Yes | Text | Dela Cruz |
| **Email** | ❌ No | Valid email | juan@example.com |
| **Year Level** | ✅ Yes | 1st Year, 2nd Year, 3rd Year, 4th Year | 1st Year |
| **Department** | ✅ Yes | CTE, CBA, CLAPA, CIT, THEO | CIT |
| **Major** | ❌ No | Text | Information Technology |
| **Section** | ❌ No | Text | A |

#### ⚠️ Important Rules:

- **Required fields** must be filled for every student
- **Year Level** must be exactly: `1st Year`, `2nd Year`, `3rd Year`, or `4th Year`
- **Department** must be exactly: `CTE`, `CBA`, `CLAPA`, `CIT`, or `THEO`
- **Student ID** must be unique (duplicates will be updated, not create new records)
- Column names must match exactly (case-sensitive)

### Step 4: Upload the File

1. Click **"Choose File"** or drag and drop
2. Select your completed Excel or CSV file
3. Click **"Upload Students"**
4. Wait for processing

### Step 5: Review Results

After upload, you'll see:
- ✅ **Success count**: Number of students imported
- ❌ **Failed count**: Number of rows that failed
- **Error details**: Specific errors for each failed row

---

## 📝 Template Examples

### Example 1: Basic CSV Format

```csv
Student ID,First Name,Last Name,Email,Year Level,Department,Major,Section
2021-001,Juan,Dela Cruz,juan.delacruz@example.com,1st Year,CIT,Information Technology,A
2021-002,Maria,Santos,maria.santos@example.com,2nd Year,CBA,Business Administration,B
2021-003,Pedro,Reyes,pedro.reyes@example.com,3rd Year,CTE,Education,C
```

### Example 2: Minimal Required Fields

```csv
Student ID,First Name,Last Name,Year Level,Department
2021-004,Anna,Garcia,1st Year,THEO
2021-005,Jose,Martinez,2nd Year,CLAPA
```

### Example 3: Excel Format

You can also use Excel (.xlsx) files with the same column structure.

---

## ✅ Validation Rules

### Year Level Validation
- ✅ Valid: `1st Year`, `2nd Year`, `3rd Year`, `4th Year`
- ❌ Invalid: `First Year`, `1`, `Year 1`, `Freshman`

### Department Validation
- ✅ Valid: `CTE`, `CBA`, `CLAPA`, `CIT`, `THEO`
- ❌ Invalid: `cit`, `Computer`, `IT`, `Business`

### Student ID Validation
- ✅ Valid: Any unique identifier
- ❌ Invalid: Empty or duplicate within the same file

---

## 🔄 Update vs Create

The bulk upload uses **"upsert"** logic:

- **If Student ID exists**: Updates the student's information
- **If Student ID is new**: Creates a new student record

This means you can:
- Import new students
- Update existing student information
- Mix both in the same file

---

## ❌ Common Errors and Solutions

### Error: "Missing required fields"
**Cause**: One or more required columns are empty  
**Solution**: Fill in Student ID, First Name, Last Name, Year Level, and Department

### Error: "Invalid year level"
**Cause**: Year level doesn't match exact format  
**Solution**: Use exactly: `1st Year`, `2nd Year`, `3rd Year`, or `4th Year`

### Error: "Invalid department"
**Cause**: Department code doesn't match valid options  
**Solution**: Use exactly: `CTE`, `CBA`, `CLAPA`, `CIT`, or `THEO`

### Error: "File is empty or invalid format"
**Cause**: File has no data rows or wrong format  
**Solution**: Ensure file has header row and at least one data row

### Error: "Invalid file type"
**Cause**: File is not Excel or CSV  
**Solution**: Use .xlsx, .xls, or .csv files only

---

## 💡 Best Practices

### 1. Start Small
- Test with 5-10 students first
- Verify the format works
- Then upload larger batches

### 2. Keep Backups
- Save your original Excel file
- Keep a copy before uploading
- Easy to fix and re-upload if needed

### 3. Use Consistent Formatting
- Always use the same Year Level format
- Always use uppercase for Department codes
- Keep Student IDs in a consistent format

### 4. Review Before Upload
- Double-check required fields are filled
- Verify Year Level and Department values
- Look for typos in names

### 5. Check Results
- Always review the upload results
- Fix any errors shown
- Re-upload failed rows after correction

---

## 🔧 Technical Details

### Supported File Types
- **Excel 2007+**: `.xlsx`
- **Excel 97-2003**: `.xls`
- **CSV**: `.csv`

### File Size Limits
- Maximum file size: Depends on server configuration
- Recommended: Keep under 1000 students per file
- For larger imports, split into multiple files

### Processing
- Each row is validated individually
- Failed rows don't affect successful rows
- All successful rows are imported even if some fail

### Database Behavior
- Uses `INSERT ... ON DUPLICATE KEY UPDATE`
- Student ID is the unique identifier
- Existing records are updated with new data
- No records are deleted during bulk upload

---

## 📊 Sample Data for Testing

Here's a complete sample file you can use for testing:

```csv
Student ID,First Name,Last Name,Email,Year Level,Department,Major,Section
2024-001,Juan,Dela Cruz,juan.delacruz@school.edu,1st Year,CIT,Information Technology,A
2024-002,Maria,Santos,maria.santos@school.edu,1st Year,CIT,Information Technology,A
2024-003,Pedro,Reyes,pedro.reyes@school.edu,2nd Year,CBA,Business Administration,B
2024-004,Anna,Garcia,anna.garcia@school.edu,2nd Year,CBA,Accounting,B
2024-005,Jose,Martinez,jose.martinez@school.edu,3rd Year,CTE,Elementary Education,C
2024-006,Sofia,Lopez,sofia.lopez@school.edu,3rd Year,CTE,Secondary Education,C
2024-007,Miguel,Hernandez,miguel.hernandez@school.edu,4th Year,CLAPA,Political Science,D
2024-008,Isabel,Gonzalez,isabel.gonzalez@school.edu,4th Year,THEO,Theology,E
2024-009,Carlos,Perez,carlos.perez@school.edu,1st Year,CLAPA,Communication Arts,A
2024-010,Elena,Torres,elena.torres@school.edu,2nd Year,THEO,Religious Studies,B
```

---

## 🎯 Quick Reference

### Required Columns
1. Student ID
2. First Name
3. Last Name
4. Year Level
5. Department

### Optional Columns
1. Email
2. Major
3. Section

### Valid Year Levels
- `1st Year`
- `2nd Year`
- `3rd Year`
- `4th Year`

### Valid Departments
- `CTE` - College of Teacher Education
- `CBA` - College of Business Administration
- `CLAPA` - College of Liberal Arts and Public Affairs
- `CIT` - College of Information Technology
- `THEO` - Theology Department

---

## 🆘 Need Help?

If you encounter issues:
1. Check the error messages in the upload results
2. Verify your file matches the template format
3. Ensure all required fields are filled
4. Check Year Level and Department values are exact matches
5. Try uploading a smaller batch to isolate the problem

---

## ✨ Summary

The bulk upload feature makes it easy to import many students at once:
- ✅ Download template
- ✅ Fill in student data
- ✅ Upload Excel or CSV file
- ✅ Review results
- ✅ Fix any errors and re-upload if needed

**Time saved**: Import 100 students in minutes instead of hours! 🚀
