const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  console.log('Testing Supabase Connection...');
  
  // Test 1: Fetch from 'profiles' (often readable)
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*').limit(1);
  console.log('Profiles Test:', pErr ? pErr : (profiles.length > 0 ? 'Data exists' : 'Empty Array'));

  // Test 2: Fetch from 'groups'
  const { data: groups, error: gErr } = await supabase.from('groups').select('*').limit(1);
  console.log('Groups Test:', gErr ? gErr : (groups.length > 0 ? 'Data exists' : 'Empty Array'));
  
  // Test 3: Fetch from 'students'
  const { data: students, error: sErr } = await supabase.from('students').select('*').limit(1);
  console.log('Students Test:', sErr ? sErr : (students.length > 0 ? 'Data exists' : 'Empty Array'));
}

testSupabase();
