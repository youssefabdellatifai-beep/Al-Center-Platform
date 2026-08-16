-- ========================================
-- 🚨 إصلاح لوحة الإدارة - نفذ هذا الآن!
-- ========================================

-- Step 1: إضافة عمود role إذا لم يكن موجوداً
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'teacher';

-- Step 2: إضافة عمود status
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Step 3: جعل المستخدم admin
UPDATE profiles
SET role = 'super_admin'
WHERE id = 'e8f2b9bd-afa2-4020-9bf7-0ae75d82a4b7';

-- Step 4: التحقق من النتيجة
SELECT id, name, phone, role, status
FROM profiles
WHERE id = 'e8f2b9bd-afa2-4020-9bf7-0ae75d82a4b7';

-- ========================================
-- إذا نجح، يجب أن ترى: role = 'super_admin'
-- ========================================
