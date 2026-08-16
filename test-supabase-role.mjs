import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mnqxuhijgyajrnlhcmpr.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserRole() {
  const userId = 'e8f2b9bd-afa2-4020-9bf7-0ae75d82a4b7';

  console.log('\n🔍 Checking user role in Supabase...\n');
  console.log('User ID:', userId);
  console.log('Supabase URL:', supabaseUrl);
  console.log('\n---\n');

  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, full_name, phone')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('❌ Error fetching profile:', error.message);
    if (error.code === 'PGRST116') {
      console.log('\n⚠️  Profile not found. User may not exist in profiles table.');
    } else if (error.message.includes('column') && error.message.includes('does not exist')) {
      console.log('\n⚠️  The "role" column does not exist in the profiles table!');
      console.log('\n📋 You MUST run this SQL in Supabase Dashboard:\n');
      console.log('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT \'teacher\';');
      console.log('UPDATE profiles SET role = \'super_admin\' WHERE id = \'e8f2b9bd-afa2-4020-9bf7-0ae75d82a4b7\';\n');
    }
    return;
  }

  console.log('✅ Profile found!\n');
  console.log('Full Name:', data.full_name || '(not set)');
  console.log('Phone:', data.phone || '(not set)');
  console.log('Role:', data.role || '(null)');
  console.log('\n---\n');

  if (data.role === 'super_admin') {
    console.log('✅ User IS super_admin - Admin access should work!');
  } else {
    console.log('❌ User is NOT super_admin!');
    console.log(`   Current role: "${data.role || 'null'}"`);
    console.log('\n📋 Run this SQL in Supabase Dashboard to fix:\n');
    console.log(`UPDATE profiles SET role = 'super_admin' WHERE id = '${userId}';\n`);
  }
}

checkUserRole().catch(console.error);
