'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { RibbonSpin } from '@/components/logo/RibbonSpin';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const [show, setShow] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      setShow(true);
      setVisible(true);
      const fadeTimer = setTimeout(() => setVisible(false), 400);
      const hideTimer = setTimeout(() => setShow(false), 650);
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [pathname]);

  return (
    <>
      {show && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'var(--bg-void)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.25s ease',
          pointerEvents: visible ? 'all' : 'none',
        }}>
          <div style={{ width: '80px', height: '80px' }}>
            <RibbonSpin />
          </div>
        </div>
      )}
      {children}
    </>
  );
}
