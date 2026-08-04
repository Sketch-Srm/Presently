import React from 'react';
import { LogoLoading } from '@/components/logo/LogoLoading';

export default function GlobalLoading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      background: 'var(--bg-void)',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
        <LogoLoading size={80} />
    </div>
  );
}
