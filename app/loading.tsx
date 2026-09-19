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
      background: '#0A0A0B',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
      <LogoLoading size={100} loop={true} />
    </div>
  );
}
