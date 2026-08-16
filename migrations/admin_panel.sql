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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscription_codes_code ON subscription_codes(code);
CREATE INDEX IF NOT EXISTS idx_subscription_codes_status ON subscription_codes(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
