-- Run this SQL in your Supabase Dashboard SQL Editor
-- URL: https://mnqxuhijgyajrnlhcmpr.supabase.co

-- Step 1: Check if role column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'role';

-- Step 2: Add role column if it doesn't exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'teacher';

-- Step 3: Set your user as super_admin
UPDATE profiles
SET role = 'super_admin'
WHERE id = 'e8f2b9bd-afa2-4020-9bf7-0ae75d82a4b7';

-- Step 4: Verify the update
SELECT id, role, full_name, phone
FROM profiles
WHERE id = 'e8f2b9bd-afa2-4020-9bf7-0ae75d82a4b7';
