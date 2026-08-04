'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LogoAssembly } from '@/components/logo/LogoAssembly';
import { LogoMark } from '@/components/logo/LogoMark';
import { createClient } from '@/lib/supabase/client';

function LoginContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const supabase = createClient();
    
    // Redirect to the callback route for processing
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      console.error('Error logging in:', error);
      setLoading(false);
    }
  };

  if (showSplash) {
    return <LogoAssembly onComplete={handleSplashComplete} />;
  }

  return (
    <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div style={{ width: '64px', height: '64px', marginBottom: '1rem' }}>
          <LogoMark />
        </div>
        <h1 className="text-display" style={{ fontSize: '1.5rem', letterSpacing: '0.05em' }}>PRESENTLY</h1>
        <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Access Control</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button 
          onClick={handleGoogleLogin} 
          className="btn btn-primary" 
          disabled={loading}
          style={{ width: '100%', display: 'flex', gap: '0.75rem' }}
        >
          {/* Simple Google G icon SVG */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.79 15.73 17.57V20.33H19.29C21.37 18.42 22.56 15.6 22.56 12.25Z" fill="currentColor"/>
            <path d="M12 23C14.97 23 17.46 22.02 19.29 20.33L15.73 17.57C14.74 18.24 13.48 18.64 12 18.64C9.13 18.64 6.7 16.71 5.82 14.12H2.15V16.96C3.96 20.56 7.68 23 12 23Z" fill="currentColor"/>
            <path d="M5.82 14.12C5.59 13.45 5.46 12.74 5.46 12C5.46 11.26 5.59 10.55 5.82 9.88V7.04H2.15C1.4 8.53 0.98 10.22 0.98 12C0.98 13.78 1.4 15.47 2.15 16.96L5.82 14.12Z" fill="currentColor"/>
            <path d="M12 5.36C13.62 5.36 15.07 5.92 16.21 7.01L19.37 3.85C17.45 2.07 14.96 1 12 1C7.68 1 3.96 3.44 2.15 7.04L5.82 9.88C6.7 7.29 9.13 5.36 12 5.36Z" fill="currentColor"/>
          </svg>
          {loading ? 'Redirecting...' : 'Sign In with Google'}
        </button>

        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--chrome-mid)' }}>
          Only <span className="text-mono" style={{ color: 'var(--chrome-light)' }}>xx1234@srmist.edu.in</span> emails are allowed.
        </div>
      </div>
      
      {errorParam === 'invalid_domain' && (
        <div style={{ 
          marginTop: '1.5rem', 
          padding: '0.75rem', 
          borderRadius: 'var(--radius-sm)', 
          background: 'rgba(232, 93, 93, 0.1)', 
          border: '1px solid rgba(232, 93, 93, 0.3)',
          color: 'var(--state-absent)', 
          fontSize: '0.875rem', 
          textAlign: 'center' 
        }}>
          Authentication failed. You must use a valid student email (e.g. md5822@srmist.edu.in).
        </div>
      )}
      
      {errorParam === 'auth_failed' && (
        <div style={{ 
          marginTop: '1.5rem', 
          padding: '0.75rem', 
          borderRadius: 'var(--radius-sm)', 
          background: 'rgba(232, 93, 93, 0.1)', 
          border: '1px solid rgba(232, 93, 93, 0.3)',
          color: 'var(--state-absent)', 
          fontSize: '0.875rem', 
          textAlign: 'center' 
        }}>
          Authentication error. Please try again.
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="logo-assembly-container"><LogoMark style={{ width: 120, height: 120, opacity: 0.5 }} /></div>}>
      <LoginContent />
    </Suspense>
  );
}
