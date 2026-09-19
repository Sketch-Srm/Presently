'use client';

import React, { useEffect, useState } from 'react';
import { LogoMark } from './LogoMark';
import './logo.css';

export function LogoAssembly({ onComplete }: { onComplete: () => void }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // 0.0s - 0.45s: strokes draw
    // 0.4s - 0.9s: matte wipe fills up
    // 0.9s - 1.25s: hold full logo
    // 1.25s: begin fading out
    // 1.55s: trigger onComplete
    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, 1250);

    const doneTimer = setTimeout(() => {
      onComplete();
    }, 1550);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div className={`logo-assembly-container ${fade ? 'fade-out' : ''}`}>
      <div
        style={{
          width: 120,
          height: 120,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
              animation: 'llaTraceLine 0.45s cubic-bezier(0.4, 0, 0.2, 1) 0s forwards',
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
              animation: 'llaTraceLine 0.45s cubic-bezier(0.4, 0, 0.2, 1) 0.08s forwards',
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
              animation: 'llaTraceLine 0.45s cubic-bezier(0.4, 0, 0.2, 1) 0.16s forwards',
            }}
          />
        </svg>

        {/* LAYER 2: Solid Matte Fill */}
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            inset: 0,
            clipPath: 'inset(0 0 100% 0)',
            animation: 'llaMatteWipe 0.55s cubic-bezier(0.4, 0, 0.2, 1) 0.4s forwards',
          }}
        >
          <LogoMark variant="matte" />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes llaTraceLine {
          from { stroke-dashoffset: 250; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes llaMatteWipe {
          0%   { clip-path: inset(0 0 100% 0); -webkit-clip-path: inset(0 0 100% 0); opacity: 0; }
          5%   { opacity: 1; }
          100% { clip-path: inset(0 0 0 0); -webkit-clip-path: inset(0 0 0 0); opacity: 1; }
        }
      `}} />
    </div>
  );
}
