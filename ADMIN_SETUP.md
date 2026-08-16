# Admin Panel Setup Guide

## 🚀 Quick Start

### 1. Run SQL Migrations

Go to Supabase Dashboard → SQL Editor → Run the following:

```sql
-- Add role column to profiles if not exists
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

-- Add status column to profiles if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscription_codes_code ON subscription_codes(code);
CREATE INDEX IF NOT EXISTS idx_subscription_codes_status ON subscription_codes(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
```

### 2. Set Your Account as Admin

```sql
UPDATE profiles 
SET role = 'super_admin' 
WHERE id = 'YOUR_USER_ID_HERE';
```

To find your user ID:
1. Go to Supabase Dashboard → Authentication → Users
2. Click on your user
3. Copy the UUID

### 3. Access Admin Panel

After setting your role to `super_admin`, you'll see "لوحة الإدارة" button in the sidebar.

Click it to access: `/admin`

## 📊 Features

### Dashboard Tab
- Total teachers count
- Active subscriptions count
- New registrations this month
- Revenue statistics

### Teachers Tab
- View all teachers
- Search by name or phone
- Filter by status (active/expired/suspended)
- Filter by plan (trial/monthly/annual)
- Suspend/Delete teacher accounts

### Codes Tab
- Generate subscription codes
- Bulk code generation
- Export codes to CSV
- Track code usage
- Copy codes to clipboard

## 🔐 Security

- Only users with `role = 'super_admin'` can access `/admin`
- Auth check on page load
- Redirects unauthorized users to home page

## 🎨 UI Features

- Responsive design (mobile + desktop)
- RTL support
- Dark mode theme
- Toast notifications
- Loading states
- Smooth animations

## 📝 Code Structure

```
src/
├── app/
│   └── admin/
│       └── page.tsx          # Main admin panel page
└── migrations/
    └── admin_panel.sql       # Database migrations
```

## 🐛 Troubleshooting

### "لوحة الإدارة" button not showing?
- Make sure your role is set to `super_admin` in database
- Clear cache and reload

### Can't access /admin page?
- Check if migrations were run successfully
- Verify your user role in database
- Check browser console for errors

### Codes not generating?
- Verify `subscription_codes` table exists
- Check Supabase connection
- Look for errors in browser console
