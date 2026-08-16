-- Check if role column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'role';

-- If role column doesn't exist, create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'teacher';
    END IF;
END $$;

-- Check current role for user e8f2b9bd-afa2-4020-9bf7-0ae75d82a4b7
SELECT id, role, full_name, phone
FROM profiles
WHERE id = 'e8f2b9bd-afa2-4020-9bf7-0ae75d82a4b7';

-- Update user role to super_admin if not already set
UPDATE profiles
SET role = 'super_admin'
WHERE id = 'e8f2b9bd-afa2-4020-9bf7-0ae75d82a4b7'
AND (role IS NULL OR role != 'super_admin');

-- Verify the update
SELECT id, role, full_name, phone
FROM profiles
WHERE id = 'e8f2b9bd-afa2-4020-9bf7-0ae75d82a4b7';
