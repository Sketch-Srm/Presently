import React from 'react';

export function LogoMark({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className} 
      style={{ width: '100%', height: '100%', ...style }}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="chrome-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8E8EA" />
          <stop offset="40%" stopColor="#9CA0A6" />
          <stop offset="100%" stopColor="#4A4D52" />
        </linearGradient>
        <linearGradient id="chrome-dark-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4A4D52" />
          <stop offset="50%" stopColor="#9CA0A6" />
          <stop offset="100%" stopColor="#E8E8EA" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* 
        Creating an interlocking 'S' shape using clean geometry to represent the ribbon fold.
        Top fold 
      */}
      <path 
        d="M 20,30 L 60,30 L 80,50 L 60,50 L 40,50 L 20,30 Z" 
        fill="url(#chrome-grad)" 
        stroke="#141416"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      
      {/* Center diagonal cut */}
      <path 
        d="M 80,30 L 60,30 L 40,50 L 40,70 L 60,50 L 80,50 Z" 
        fill="url(#chrome-dark-grad)" 
        stroke="#141416"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Bottom fold */}
      <path 
        d="M 80,70 L 40,70 L 20,50 L 40,50 L 60,50 L 80,70 Z" 
        fill="url(#chrome-grad)" 
        stroke="#141416"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
