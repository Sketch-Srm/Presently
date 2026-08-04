import React from 'react';
import { AdminBottomNav } from '@/components/ui/BottomNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ paddingBottom: '80px' }}>
      {children}
      <AdminBottomNav />
    </div>
  );
}
