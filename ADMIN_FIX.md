# 🚨 خطوات مهمة لتشغيل لوحة التحكم

## ⚠️ المشكلة الحالية:
زر "لوحة الإدارة" لا يفتح الصفحة - السبب: **لم يتم تشغيل SQL migrations بعد**

---

## ✅ الحل (3 خطوات فقط):

### الخطوة 1: افتح Supabase Dashboard
1. اذهب إلى: https://supabase.com/dashboard
2. افتح مشروعك
3. من القائمة الجانبية: **SQL Editor**

### الخطوة 2: شغّل هذا الكود
انسخ والصق الكود التالي واضغط **RUN**:

```sql
-- Add role column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'teacher';

-- Create subscription_codes table
CREATE TABLE IF NOT EXISTS subscription_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  status TEXT DEFAULT 'unused',
  created_at TIMESTAMP DEFAULT NOW(),
  used_by UUID REFERENCES profiles(id),
  used_at TIMESTAMP
);

-- Add status column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscription_codes_code ON subscription_codes(code);
CREATE INDEX IF NOT EXISTS idx_subscription_codes_status ON subscription_codes(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
```

### الخطوة 3: اجعل نفسك Admin
1. في Supabase Dashboard → **Authentication** → **Users**
2. اضغط على حسابك (المستخدم الذي سجلت به)
3. انسخ الـ **User UID** (مثال: `a1b2c3d4-e5f6-...`)
4. ارجع لـ **SQL Editor** وشغّل:

```sql
UPDATE profiles 
SET role = 'super_admin' 
WHERE id = 'PASTE_YOUR_USER_ID_HERE';
```

⚠️ **مهم:** استبدل `PASTE_YOUR_USER_ID_HERE` بالـ UUID الخاص بك!

---

## 🎉 جاهز!

الآن:
1. ✅ افتح المنصة: http://localhost:3001
2. ✅ ستجد زر **"لوحة الإدارة"** (بنفسجي) في الـ Sidebar
3. ✅ اضغط عليه → سيفتح `/admin`

---

## 🔍 للتحقق من أنك Admin:

شغّل هذا في SQL Editor:

```sql
SELECT id, name, phone, role 
FROM profiles 
WHERE role = 'super_admin';
```

يجب أن يظهر حسابك في النتيجة.

---

## ❓ لا يزال لا يعمل؟

جرّب:
1. **Ctrl + Shift + R** (مسح الـ cache)
2. افتح **Console** في المتصفح (F12) → شوف الأخطاء
3. تأكد أن الـ SQL migrations نجحت بدون أخطاء

---

## 📸 Screenshot المطلوب:

بعد ما تخلص، ابعتلي screenshot من:
1. ✅ Supabase SQL Editor - بعد ما تشغل الـ migrations
2. ✅ المنصة - زر "لوحة الإدارة" في الـ Sidebar
3. ✅ صفحة `/admin` مفتوحة

---

**ملاحظة:** الأخطاء في Console (`newValue`, `ServiceWorker`) مش مهمة - دي من extensions في المتصفح.
