import React from 'react';

export function RibbonSpin({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className} 
      style={{ width: '40px', height: '40px', animation: 'spin 2s linear infinite', ...style }}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="spin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent-signal)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      
      {/* A single morphing path that loops to represent the twist */}
      <path 
        d="M 20,50 C 20,20 80,20 80,50 C 80,80 20,80 20,50 Z" 
        stroke="url(#spin-grad)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="100 200"
      />
      <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </svg>
  );
}
