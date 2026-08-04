'use client';

import React, { useEffect, useState } from 'react';
import { LogoMark } from './LogoMark';

export function LogoLoading({ size = 120 }: { size?: number }) {
  // We use key state to cleanly restart the CSS animations every loop
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimKey((prev) => prev + 1);
    }, 2200);

    return () => clearInterval(timer);
  }, []);

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
        animation: 'fadeLoop 2.2s ease-in-out forwards',
      }}
    >
      {/* LAYER 1: Outline Tracing (Runs instantly) */}
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
          stroke="var(--chrome-light, #E8E8EA)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 250,
            strokeDashoffset: 250,
            animation: 'traceLine 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0s forwards',
          }}
        />
        <path
          d="M 80,30 L 60,30 L 40,50 L 40,70 L 60,50 L 80,50 Z"
          fill="none"
          stroke="var(--chrome-light, #E8E8EA)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 250,
            strokeDashoffset: 250,
            animation: 'traceLine 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s forwards',
          }}
        />
        <path
          d="M 80,70 L 40,70 L 20,50 L 40,50 L 60,50 L 80,70 Z"
          fill="none"
          stroke="var(--chrome-light, #E8E8EA)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 250,
            strokeDashoffset: 250,
            animation: 'traceLine 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards',
          }}
        />
      </svg>

      {/* LAYER 2: Solid Metallic Fill (Liquid wipe downwards) */}
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          inset: 0,
          clipPath: 'inset(0 0 100% 0)',
          filter: 'drop-shadow(0 0 14px rgba(125, 216, 255, 0.45))',
          animation: 'liquidWipe 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.5s forwards',
        }}
      >
        <LogoMark />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes traceLine {
          from { stroke-dashoffset: 250; }
          to   { stroke-dashoffset: 0; }
        }

        @keyframes liquidWipe {
          0%   { clip-path: inset(0 0 100% 0); -webkit-clip-path: inset(0 0 100% 0); opacity: 0; transform: scale(0.96); }
          5%   { opacity: 1; transform: scale(0.96); }
          100% { clip-path: inset(0 0 0 0); -webkit-clip-path: inset(0 0 0 0); opacity: 1; transform: scale(1); }
        }

        @keyframes fadeLoop {
          0%   { opacity: 1; }
          80%  { opacity: 1; }
          100% { opacity: 0; }
        }
      `}} />
    </div>
  );
}
