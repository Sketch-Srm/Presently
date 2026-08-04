import React from 'react';
import { AdminBottomNav } from '@/components/ui/BottomNav';
import { PageTransition } from '@/components/ui/PageTransition';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageTransition>
      <div style={{ paddingBottom: '80px' }}>
        {children}
        <AdminBottomNav />
      </div>
    </PageTransition>
  );
}
