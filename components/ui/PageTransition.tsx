'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { LogoLoading } from '@/components/logo/LogoLoading';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      setShow(true);
    }
  }, [pathname]);

  return (
    <>
      {show && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: '#0A0A0B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <LogoLoading 
            size={90} 
            onComplete={() => setShow(false)} 
          />
        </div>
      )}
      {children}
    </>
  );
}
