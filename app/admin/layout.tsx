import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminBottomNav } from '@/components/ui/BottomNav';
import { AdminTopBar } from '@/components/ui/AdminTopBar';
import { PageTransition } from '@/components/ui/PageTransition';
import { emailFilter } from '@/lib/utils/email-filter';

const ADMIN_ROLES = ['domain_lead', 'club_admin', 'super_admin'];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: member } = await supabase
    .from('members')
    .select('role, name, photo_url')
    .or(emailFilter(user.email))
    .single();

  if (!member || !ADMIN_ROLES.includes(member.role)) redirect('/dashboard');

  return (
    <PageTransition>
      <AdminTopBar memberName={member.name} photoUrl={member.photo_url} />
      <div style={{ paddingBottom: '80px', paddingTop: '56px' }}>
        {children}
        <AdminBottomNav />
      </div>
    </PageTransition>
  );
}
