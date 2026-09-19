'use client';

import React, { useEffect, useState } from 'react';
import { LogoMark } from './LogoMark';

interface LogoLoadingProps {
  size?: number;
  onComplete?: () => void;
  loop?: boolean;
}

export function LogoLoading({ size = 100, onComplete, loop = false }: LogoLoadingProps) {
  const [fade, setFade] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (loop) {
      const interval = setInterval(() => {
        setAnimKey(prev => prev + 1);
      }, 1800);
      return () => clearInterval(interval);
    }

    // 1 Full Cycle:
    // 0.0s - 0.45s: Outline strokes trace in
    // 0.4s - 0.9s: Solid matte planes wipe in
    // 0.9s - 1.25s: Full logo holds visible
    // 1.25s: Start fade out
    // 1.55s: Complete and call onComplete
    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, 1250);

    const doneTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1550);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete, loop]);

  return (
    <div
      key={animKey}
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fade ? 0 : 1,
        transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* LAYER 1: Outline Tracing */}
      <svg
        viewBox="0 0 100 100"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          inset: 0,
        }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 20,30 L 60,30 L 80,50 L 60,50 L 40,50 L 20,30 Z"
          fill="none"
          stroke="var(--chrome-mid, #9CA0A6)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 250,
            strokeDashoffset: 250,
            animation: 'llTraceLine 0.45s cubic-bezier(0.4, 0, 0.2, 1) 0s forwards',
          }}
        />
        <path
          d="M 80,30 L 60,30 L 40,50 L 40,70 L 60,50 L 80,50 Z"
          fill="none"
          stroke="var(--chrome-mid, #9CA0A6)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 250,
            strokeDashoffset: 250,
            animation: 'llTraceLine 0.45s cubic-bezier(0.4, 0, 0.2, 1) 0.08s forwards',
          }}
        />
        <path
          d="M 80,70 L 40,70 L 20,50 L 40,50 L 60,50 L 80,70 Z"
          fill="none"
          stroke="var(--chrome-mid, #9CA0A6)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 250,
            strokeDashoffset: 250,
            animation: 'llTraceLine 0.45s cubic-bezier(0.4, 0, 0.2, 1) 0.16s forwards',
          }}
        />
      </svg>

      {/* LAYER 2: Plain Matte Solid Fill (Smooth reveal wipe) */}
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          inset: 0,
          clipPath: 'inset(0 0 100% 0)',
          animation: 'llMatteWipe 0.55s cubic-bezier(0.4, 0, 0.2, 1) 0.4s forwards',
        }}
      >
        <LogoMark variant="matte" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes llTraceLine {
          from { stroke-dashoffset: 250; }
          to   { stroke-dashoffset: 0; }
        }

        @keyframes llMatteWipe {
          0%   { clip-path: inset(0 0 100% 0); -webkit-clip-path: inset(0 0 100% 0); opacity: 0; }
          5%   { opacity: 1; }
          100% { clip-path: inset(0 0 0 0); -webkit-clip-path: inset(0 0 0 0); opacity: 1; }
        }
      `}} />
    </div>
  );
}
