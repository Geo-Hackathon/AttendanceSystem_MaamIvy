# Database Migration Instructions

## Issue: Missing `temp_password_plain` Column

The new password viewing feature requires a `temp_password_plain` column in the `users` table. This column was added to the schema, but existing databases need to be migrated.

---

## Quick Fix (Recommended)

Run this SQL command in your MySQL database:

```sql
ALTER TABLE users ADD COLUMN temp_password_plain VARCHAR(255) AFTER is_temp_password;
```

---

## Step-by-Step Instructions

### Option 1: Using MySQL Command Line

1. **Stop the server** (Ctrl+C in the terminal)

2. **Connect to MySQL:**
   ```bash
   mysql -u root -p
   ```

3. **Select your database:**
   ```sql
   USE faculty_attendance;
   ```

4. **Run the migration:**
   ```sql
   ALTER TABLE users ADD COLUMN temp_password_plain VARCHAR(255) AFTER is_temp_password;
   ```

5. **Verify the column was added:**
   ```sql
   DESCRIBE users;
   ```

6. **Exit MySQL:**
   ```sql
   EXIT;
   ```

7. **Restart the server:**
   ```bash
   npm run dev
   ```

---

### Option 2: Using phpMyAdmin (if installed)

1. **Stop the server** (Ctrl+C)

2. **Open phpMyAdmin** in your browser

3. **Select your database** (usually `faculty_attendance`)

4. **Click on the SQL tab**

5. **Paste and run:**
   ```sql
   ALTER TABLE users ADD COLUMN temp_password_plain VARCHAR(255) AFTER is_temp_password;
   ```

6. **Restart the server:**
   ```bash
   npm run dev
   ```

---

### Option 3: Using the Migration File

1. **Stop the server** (Ctrl+C)

2. **Run the migration script:**
   ```bash
   mysql -u root -p faculty_attendance < add-temp-password-column.sql
   ```

3. **Restart the server:**
   ```bash
   npm run dev
   ```

---

## Verification

After running the migration, you should see:
- ✅ No more "Unknown column 'temp_password_plain'" errors
- ✅ Faculty Management page loads without errors
- ✅ Password column appears in the faculty table

---

## What This Column Does

- **Stores temporary passwords** in plain text (only for admin-generated passwords)
- **Allows admins to view** temporary passwords they create
- **Automatically cleared** when users change their password
- **Never stores** user-created passwords in plain text

---

## Need Help?

If you encounter issues:
1. Check that you're connected to the correct database
2. Verify you have ALTER TABLE permissions
3. Make sure the column doesn't already exist
4. Check MySQL error messages for details
