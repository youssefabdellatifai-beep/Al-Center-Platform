-- Check if role column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'role';

-- Check user role
SELECT id, name, phone, role 
FROM profiles 
WHERE id = 'e8f2b9bd-afa2-4020-9bf7-0ae75d82a4b7';
