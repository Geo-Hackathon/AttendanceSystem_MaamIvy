-- Migration: Add temp_password_plain column to users table
-- This allows admins to view temporary passwords

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS temp_password_plain VARCHAR(255) AFTER is_temp_password;

-- Update existing users with temp passwords to NULL (they'll need to be reset)
UPDATE users 
SET temp_password_plain = NULL 
WHERE is_temp_password = TRUE;

SELECT 'Migration complete: temp_password_plain column added' as status;
