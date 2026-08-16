import { supabase } from './supabaseClient';

export async function runMigrations() {
  try {
    // Check if subscription_codes table exists
    const { data, error } = await supabase
      .from('subscription_codes')
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') {
      console.log('⚠️ subscription_codes table does not exist');
      console.log('📝 Please run the SQL migrations manually from Supabase Dashboard');
      console.log('📄 See ADMIN_SETUP.md for instructions');
      return false;
    }

    console.log('✅ Database tables are ready');
    return true;
  } catch (err) {
    console.error('Error checking migrations:', err);
    return false;
  }
}

export async function checkAdminRole(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking admin role:', error);
      return false;
    }

    return data?.role === 'super_admin';
  } catch (err) {
    console.error('Error checking admin role:', err);
    return false;
  }
}

export async function setUserAsAdmin(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'super_admin' })
      .eq('id', userId);

    if (error) {
      console.error('Error setting admin role:', error);
      return false;
    }

    console.log('✅ User set as admin successfully');
    return true;
  } catch (err) {
    console.error('Error setting admin role:', err);
    return false;
  }
}
