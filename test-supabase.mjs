import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://mnqxuhijgyajrnlhcmpr.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucXh1aGlqZ3lhanJubGhjbXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NDI0MDYsImV4cCI6MjEwMjExODQwNn0.z6KP4JQZT_hBLVCpTJwAYmSCHDjHQDNea7TX9u0LKZg');

async function test() {
  const { data, error } = await supabase.from('payments').insert([{
    student_id: '12345678-1234-1234-1234-123456789012',
    month: 'أكتوبر',
    payment_date: '2023-10-10',
    status: 'مدفوع',
    amount: 100
  }]).select();
  
  console.log("DATA:", data);
  console.log("ERROR:", error);
}
test();
