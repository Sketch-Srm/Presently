import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { emailFilter } from '@/lib/utils/email-filter';

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
    .or(emailFilter(user!.email!))
    .single();

  if (!member) {
    redirect('/unregistered');
  }

  if (['super_admin', 'club_admin', 'domain_lead'].includes(member.role)) {
    redirect('/admin/dashboard');
  } else {
    redirect('/dashboard');
  }
}
