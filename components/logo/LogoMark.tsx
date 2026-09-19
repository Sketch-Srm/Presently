export interface LogoMarkProps {
  className?: string;
  style?: React.CSSProperties;
  variant?: 'matte' | 'chrome' | 'monochrome';
  accentColor?: string;
}

export function LogoMark({ 
  className = '', 
  style = {},
  variant = 'matte',
  accentColor
}: LogoMarkProps) {
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
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#D1D5DB" />
          <stop offset="100%" stopColor="#9CA0A6" />
        </linearGradient>
        <linearGradient id="chrome-dark-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9CA0A6" />
          <stop offset="50%" stopColor="#D1D5DB" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>
      
      {/* Top fold */}
      <path 
        d="M 20,30 L 60,30 L 80,50 L 60,50 L 40,50 L 20,30 Z" 
        fill={variant === 'chrome' ? 'url(#chrome-grad)' : variant === 'monochrome' ? (accentColor || 'currentColor') : '#E2E4E8'} 
        stroke="#141416"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      
      {/* Center diagonal cut (darker matte tone for 3D geometric depth) */}
      <path 
        d="M 80,30 L 60,30 L 40,50 L 40,70 L 60,50 L 80,50 Z" 
        fill={variant === 'chrome' ? 'url(#chrome-dark-grad)' : variant === 'monochrome' ? (accentColor || 'currentColor') : '#787D86'} 
        stroke="#141416"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Bottom fold */}
      <path 
        d="M 80,70 L 40,70 L 20,50 L 40,50 L 60,50 L 80,70 Z" 
        fill={variant === 'chrome' ? 'url(#chrome-grad)' : variant === 'monochrome' ? (accentColor || 'currentColor') : '#B0B4BC'} 
        stroke="#141416"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
