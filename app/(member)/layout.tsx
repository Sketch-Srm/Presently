import React from 'react';
import { MemberBottomNav } from '@/components/ui/MemberBottomNav';

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ paddingBottom: '80px' }}>
      {children}
      <MemberBottomNav />
    </div>
  );
}
