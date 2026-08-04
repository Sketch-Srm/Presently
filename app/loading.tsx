import React from 'react';
import { RibbonSpin } from '@/components/logo/RibbonSpin';

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
      <div style={{ width: '80px', height: '80px' }}>
        <RibbonSpin />
      </div>
    </div>
  );
}
