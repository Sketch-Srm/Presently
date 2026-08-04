import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check role
  const { data: member } = await supabase
    .from('members')
    .select('role')
    .or(`email.ilike.${user.email},regular_email.ilike.${user.email}`)
    .single();

  if (!member) {
    redirect('/unregistered');
  }

  if (member.role === 'super_admin' || member.role === 'club_admin') {
    redirect('/admin/dashboard');
  } else {
    redirect('/dashboard');
  }
}
