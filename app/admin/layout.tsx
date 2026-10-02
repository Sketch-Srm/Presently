import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminBottomNav } from '@/components/ui/BottomNav';
import { PageTransition } from '@/components/ui/PageTransition';

const ADMIN_ROLES = ['domain_lead', 'club_admin', 'super_admin'];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Not logged in at all
  if (!user) {
    redirect('/login');
  }

  // Logged in but check role
  const { data: member } = await supabase
    .from('members')
    .select('role')
    .or(`email.ilike.${user.email},regular_email.ilike.${user.email}`)
    .single();

  if (!member || !ADMIN_ROLES.includes(member.role)) {
    redirect('/dashboard');
  }

  return (
    <PageTransition>
      <div style={{ paddingBottom: '80px' }}>
        {children}
        <AdminBottomNav />
      </div>
    </PageTransition>
  );
}
