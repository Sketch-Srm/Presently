import React from 'react';
import { LogoMark } from '@/components/logo/LogoMark';

export function LogoLoading({ size = 80 }: { size?: number }) {
  return (
    <div style={{ 
      width: size, 
      height: size, 
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        position: 'absolute', 
        inset: 0,
        animation: 'logo-float-spin 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        filter: 'drop-shadow(0 0 15px rgba(220, 220, 230, 0.3))'
      }}>
        <LogoMark />
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes logo-float-spin {
          0% { 
            opacity: 0.6; 
            transform: scale(0.85) rotate(-5deg); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1.05) rotate(5deg); 
            filter: drop-shadow(0 0 25px rgba(220, 220, 230, 0.6));
          }
          100% { 
            opacity: 0.6; 
            transform: scale(0.85) rotate(-5deg); 
          }
        }
      `}} />
    </div>
  );
}
