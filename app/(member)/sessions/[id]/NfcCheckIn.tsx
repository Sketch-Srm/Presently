'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LogoMark } from '@/components/logo/LogoMark';
import { RibbonFold } from '@/components/logo/RibbonFold';
import { selfCheckIn } from '@/lib/actions';

interface NfcCheckInProps {
  sessionId: string;
  memberId: string;
}

export function NfcCheckIn({ sessionId, memberId }: NfcCheckInProps) {
  const [nfcSupported, setNfcSupported] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<'success' | 'already_in' | 'error' | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'NDEFReader' in window) setNfcSupported(true);
    return () => abortRef.current?.abort();
  }, []);

  const handleScan = async () => {
    if (!('NDEFReader' in window)) return;
    try {
      setScanning(true);
      abortRef.current = new AbortController();
      const ndef = new (window as any).NDEFReader();
      await ndef.scan({ signal: abortRef.current.signal });

      ndef.addEventListener('reading', async ({ serialNumber }: any) => {
        const outcome = await selfCheckIn(sessionId, serialNumber);
        setScanning(false);
        abortRef.current?.abort();

        if (outcome.outcome === 'marked') {
          setResult('success');
          setTimestamp(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
          if ('vibrate' in navigator) navigator.vibrate([100, 50, 200]);
        } else if (outcome.outcome === 'already_marked') {
          setResult('already_in');
          if ('vibrate' in navigator) navigator.vibrate([50, 50, 50]);
        } else if (outcome.outcome === 'not_your_card') {
          setResult('error');
          alert("This card doesn't belong to you.");
          if ('vibrate' in navigator) navigator.vibrate([300]);
        } else {
          setResult('error');
          if ('vibrate' in navigator) navigator.vibrate([300]);
        }
      }, { signal: abortRef.current.signal });

    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setScanning(false);
      console.error('NFC error:', err);
    }
  };

  if (result === 'success') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'slideUp 0.5s ease' }}>
        <div style={{ width: '80px', height: '80px', marginBottom: '1.5rem' }}>
          <RibbonFold />
        </div>
        <h2 className="text-display" style={{ color: 'var(--state-present)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          You're Checked In
        </h2>
        {timestamp && <p style={{ color: 'var(--chrome-mid)' }}>{timestamp} via NFC Tap</p>}
      </div>
    );
  }

  if (result === 'already_in') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(240,192,64,0.1)', border: '2px solid var(--state-late)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', marginBottom: '1.5rem' }}>✓</div>
        <h2 className="text-display" style={{ color: 'var(--state-late)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Already Checked In</h2>
        <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Your attendance was already recorded.</p>
      </div>
    );
  }

  if (result === 'error') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(232,93,93,0.1)', border: '2px solid var(--state-absent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', marginBottom: '1.5rem' }}>✕</div>
        <h2 className="text-display" style={{ color: 'var(--state-absent)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Card Not Recognised</h2>
        <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          Make sure you're tapping your registered NFC card. Ask your lead to mark you manually.
        </p>
        <button onClick={() => setResult(null)} className="btn btn-ghost" style={{ border: '1px solid var(--chrome-dark)' }}>Try Again</button>
      </div>
    );
  }

  if (!nfcSupported) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2rem', maxWidth: '280px' }}>
        <div style={{ width: '48px', height: '48px', opacity: 0.5, margin: '0 auto 1rem' }}>
          <LogoMark />
        </div>
        <h3 style={{ marginBottom: '0.5rem', color: 'var(--chrome-light)' }}>NFC Not Available</h3>
        <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>
          Please ask your Domain Lead to mark you present manually.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: '180px', height: '180px', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {scanning && (
          <div style={{ position: 'absolute', inset: -20, borderRadius: '50%', background: 'radial-gradient(circle, rgba(125,216,255,0.2) 0%, transparent 70%)', animation: 'pulse 2s infinite ease' }} />
        )}
        <button
          onClick={handleScan}
          disabled={scanning}
          style={{
            width: '140px', height: '140px', borderRadius: '50%',
            background: scanning ? 'var(--bg-surface)' : 'var(--gradient-chrome)',
            border: `2px solid ${scanning ? 'var(--accent-signal)' : 'var(--chrome-dark)'}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            boxShadow: scanning ? '0 0 30px rgba(125,216,255,0.3)' : '0 10px 30px rgba(0,0,0,0.5)',
            transition: 'all 0.3s', zIndex: 2,
          }}
        >
          <div style={{ width: '48px', height: '48px' }}><LogoMark /></div>
          {!scanning && <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--chrome-light)' }}>TAP IN</span>}
        </button>
      </div>
      <p style={{ color: 'var(--chrome-mid)', textAlign: 'center', fontSize: '0.875rem' }}>
        {scanning ? 'Hold your card near the top of your phone...' : 'Tap to enable NFC scanning'}
      </p>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes pulse { 0% { transform: scale(0.95); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 0.8; } 100% { transform: scale(0.95); opacity: 0.5; } }` }} />
    </div>
  );
}
