'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogoMark } from '@/components/logo/LogoMark';
import { RibbonSpin } from '@/components/logo/RibbonSpin';
import { RibbonFold } from '@/components/logo/RibbonFold';

export default function MemberSessionDetail() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState<'pending' | 'success'>('pending');
  const [nfcSupported, setNfcSupported] = useState(false);

  useEffect(() => {
    if ('NDEFReader' in window) {
      setNfcSupported(true);
    }
  }, []);

  const handleSelfCheckIn = async () => {
    if (!('NDEFReader' in window)) return;
    try {
      setScanning(true);
      // @ts-ignore
      const ndef = new window.NDEFReader();
      await ndef.scan();
      
      ndef.addEventListener("reading", ({ serialNumber }: any) => {
        // In reality, verify it matches their own card_serial in DB
        setScanning(false);
        setStatus('success');
      });
    } catch (error) {
      console.error(error);
      setScanning(false);
    }
  };

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: '100px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <button onClick={() => router.back()} className="btn btn-ghost" style={{ padding: '0', minWidth: '40px', minHeight: '40px' }}>←</button>
        <span className="badge badge-present">LIVE NOW</span>
      </header>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="text-display" style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--chrome-light)' }}>UI Review Sync</h1>
        <p style={{ color: 'var(--chrome-mid)', fontSize: '1rem', marginBottom: '1rem' }}>Today • 4:00 PM - 5:00 PM</p>
        <span className="badge" style={{ borderColor: 'var(--chrome-mid)', color: 'var(--chrome-mid)' }}>DESIGN DOMAIN</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {status === 'success' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'slideUp 0.5s var(--ease-spring)' }}>
            <div style={{ width: '80px', height: '80px', marginBottom: '1.5rem' }}>
              <RibbonFold />
            </div>
            <h2 className="text-display" style={{ color: 'var(--state-present)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>You're Checked In</h2>
            <p style={{ color: 'var(--chrome-mid)' }}>4:12 PM via NFC Tap</p>
          </div>
        ) : (
          <>
            {nfcSupported ? (
              <div style={{ position: 'relative', width: '180px', height: '180px', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {scanning && (
                  <div style={{
                    position: 'absolute', inset: -20, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(125,216,255,0.2) 0%, transparent 70%)',
                    animation: 'pulse 2s infinite var(--ease-smooth)'
                  }} />
                )}
                <button 
                  onClick={handleSelfCheckIn}
                  style={{
                    width: '140px', height: '140px', borderRadius: '50%',
                    background: scanning ? 'var(--bg-surface)' : 'var(--gradient-chrome)',
                    border: `1px solid ${scanning ? 'var(--accent-signal)' : 'var(--chrome-dark)'}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    boxShadow: scanning ? '0 0 30px rgba(125, 216, 255, 0.3)' : '0 10px 30px rgba(0,0,0,0.5)',
                    transition: 'all 0.3s',
                    zIndex: 2
                  }}
                >
                  {scanning ? (
                    <RibbonSpin />
                  ) : (
                    <div style={{ width: '48px', height: '48px' }}>
                      <LogoMark />
                    </div>
                  )}
                  {!scanning && <span style={{ marginTop: '0.75rem', fontSize: '1rem', fontWeight: 600 }}>TAP IN</span>}
                </button>
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ width: '48px', height: '48px', opacity: 0.5, margin: '0 auto 1rem' }}>
                  <LogoMark />
                </div>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--chrome-light)' }}>NFC Not Supported</h3>
                <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  Please ask your Domain Lead to mark you present manually.
                </p>
              </div>
            )}
            
            {nfcSupported && (
              <p style={{ color: 'var(--chrome-mid)', textAlign: 'center', fontSize: '0.875rem' }}>
                {scanning ? 'Hold your phone against your member card...' : 'Tap to enable NFC scanning'}
              </p>
            )}
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </div>
  );
}
