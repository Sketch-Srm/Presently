import React from 'react';
import { MemberBottomNav } from '@/components/ui/MemberBottomNav';
import { PageTransition } from '@/components/ui/PageTransition';

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageTransition>
      <div style={{ paddingBottom: '80px' }}>
        {children}
        <MemberBottomNav />
      </div>
    </PageTransition>
  );
}
