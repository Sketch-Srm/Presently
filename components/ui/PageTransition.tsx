'use client';

import React from 'react';

export function PageTransition({ children }: { children: React.ReactNode }) {
  // Removed the 1.55s blocking overlay per design spec
  return <>{children}</>;
}
