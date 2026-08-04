import React from 'react';

export function RibbonFold({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className} 
      style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 8px var(--state-present))', ...style }}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M 30,50 L 45,65 L 70,35" 
        stroke="var(--state-present)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="100"
        strokeDashoffset="100"
        style={{ animation: 'drawFold 0.4s var(--ease-spring) forwards' }}
      />
      <style>{`
        @keyframes drawFold {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </svg>
  );
}
