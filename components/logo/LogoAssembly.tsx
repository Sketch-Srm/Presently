'use client';

import React, { useEffect, useState } from 'react';
import { LogoMark } from './LogoMark';
import './logo.css';

export function LogoAssembly({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<'draw' | 'fill' | 'fade'>('draw');

  useEffect(() => {
    // Stage 1: Draw strokes (0 - 500ms)
    const fillTimer = setTimeout(() => {
      setStage('fill');
    }, 500);

    // Stage 2: Fade out overlay/assemble complete (1000ms)
    const fadeTimer = setTimeout(() => {
      setStage('fade');
      setTimeout(onComplete, 300); // Trigger complete after fade
    }, 1200);

    return () => {
      clearTimeout(fillTimer);
      clearTimeout(fadeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`logo-assembly-container ${stage === 'fade' ? 'fade-out' : ''}`}>
      <div className={`logo-assembly-mark ${stage}`}>
        {/* We use an animated version of the SVG or CSS classes applied to it */}
        <LogoMark />
      </div>
    </div>
  );
}
