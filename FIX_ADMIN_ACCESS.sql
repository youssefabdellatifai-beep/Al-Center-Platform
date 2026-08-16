-- ADMIN FIX - Run in Supabase SQL Editor
-- URL: https://mnqxuhijgyajrnlhcmpr.supabase.co

-- Step 1: Check current profiles table structure
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Step 2: Check if role column exists and see current values
SELECT id, role, full_name, phone, email
FROM profiles
LIMIT 5;

-- Step 3: Add role column if it doesn't exist (safe to run even if exists)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'teacher';

-- Step 4: Check your specific user
SELECT id, role, full_name, phone, email, created_at
FROM profiles
WHERE id = 'e8f2b9bd-afa2-4020-9bf7-0ae75d82a4b7';

-- Step 5: Set your user as super_admin
UPDATE profiles
SET role = 'super_admin'
WHERE id = 'e8f2b9bd-afa2-4020-9bf7-0ae75d82a4b7';

-- Step 6: Verify the change
SELECT id, role, full_name, phone
FROM profiles
WHERE id = 'e8f2b9bd-afa2-4020-9bf7-0ae75d82a4b7';

-- Expected result:
-- role should be: 'super_admin'
