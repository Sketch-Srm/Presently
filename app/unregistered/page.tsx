'use client';

import React from 'react';
import Link from 'next/link';
import { signOutAction } from '@/lib/actions';
import { LogoMark } from '@/components/logo/LogoMark';

export default function UnregisteredPage() {
  return (
    <div style={{ padding: '1.25rem', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ width: '80px', height: '80px', marginBottom: '2rem' }}>
        <LogoMark />
      </div>
      
      <h1 className="text-display" style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--state-absent)' }}>
        Access Denied
      </h1>
      
      <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem', marginBottom: '2rem', maxWidth: '300px' }}>
        The Google account you logged in with is not registered in the club database. Please ask a club admin to add your email.
      </p>

      <form action={signOutAction} style={{ width: '100%', maxWidth: '300px' }}>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginBottom: '1rem' }}>
          Sign Out & Try Again
        </button>
      </form>
    </div>
  );
}
