'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RibbonSpin } from '@/components/logo/RibbonSpin';
import { LogoMark } from '@/components/logo/LogoMark';
import { getAllMembers, linkNfcCard } from '@/lib/actions';

export default function RegisterCardPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [scanning, setScanning] = useState(false);
  const [cardSerial, setCardSerial] = useState<string | null>(null);
  const [nfcSupported, setNfcSupported] = useState(true);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    if (!('NDEFReader' in window)) {
      setNfcSupported(false);
    }
    // Fetch live members
    getAllMembers().then(data => setMembers(data));
  }, []);

  const handleStartScan = async () => {
    if (!('NDEFReader' in window)) return;
    try {
      setScanning(true);
      // @ts-ignore
      const ndef = new window.NDEFReader();
      await ndef.scan();
      
      ndef.addEventListener("reading", ({ serialNumber }: any) => {
        setCardSerial(serialNumber);
        setScanning(false);
        setStep(2);
      });
    } catch (error) {
      console.error(error);
      setScanning(false);
    }
  };

  const handleLink = async (memberId: string) => {
    if (!cardSerial) return;
    const result = await linkNfcCard(memberId, cardSerial);
    if (result.success) {
      alert('Card linked successfully!');
      router.push('/admin/members');
    } else {
      alert('Failed to link card');
    }
  };

  if (!nfcSupported) {
    return (
      <div style={{ padding: '1.25rem', textAlign: 'center', marginTop: '4rem' }}>
        <h2 className="text-display" style={{ marginBottom: '1rem', color: 'var(--state-absent)' }}>NFC Not Supported</h2>
        <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>
          Card registration requires an Android device using Chrome or Edge.
        </p>
        <button onClick={() => router.back()} className="btn btn-ghost" style={{ marginTop: '2rem', border: '1px solid var(--chrome-dark)' }}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.25rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => router.back()} className="btn btn-ghost" style={{ padding: '0 0.5rem' }}>←</button>
        <div>
          <h1 className="text-display" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Register Card</h1>
          <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Link an NFC tag to a member</p>
        </div>
      </header>

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '3rem' }}>
          <div style={{ position: 'relative', width: '160px', height: '160px', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {scanning && (
              <div style={{
                position: 'absolute', inset: -20, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(125,216,255,0.2) 0%, transparent 70%)',
                animation: 'pulse 2s infinite var(--ease-smooth)'
              }} />
            )}
            <button 
              onClick={handleStartScan}
              style={{
                width: '120px', height: '120px', borderRadius: '50%',
                background: scanning ? 'var(--bg-surface)' : 'var(--gradient-chrome)',
                border: `1px solid ${scanning ? 'var(--accent-signal)' : 'var(--chrome-dark)'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: scanning ? '0 0 20px rgba(125, 216, 255, 0.2)' : 'none',
                transition: 'all 0.3s',
                zIndex: 2
              }}
            >
              {scanning ? (
                <RibbonSpin />
              ) : (
                <div style={{ width: '40px', height: '40px' }}>
                  <LogoMark />
                </div>
              )}
              {!scanning && <span style={{ marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>READ TAG</span>}
            </button>
          </div>
          <p style={{ color: 'var(--chrome-mid)', textAlign: 'center', fontSize: '0.875rem' }}>
            {scanning ? 'Hold a new member card near device...' : 'Tap to read the card serial'}
          </p>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--chrome-mid)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Card Serial Read</div>
            <div className="text-display text-mono" style={{ color: 'var(--accent-signal)', fontSize: '1.25rem' }}>{cardSerial}</div>
          </div>

          <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--chrome-mid)' }}>Select Member to Link</label>
          <input type="text" className="input" placeholder="Search by name or ID..." style={{ marginBottom: '1rem' }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {members.map((member) => (
              <div key={member.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--chrome-light)' }}>{member.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--chrome-mid)', fontFamily: 'var(--font-mono)' }}>{member.student_id}</div>
                </div>
                <button onClick={() => handleLink(member.id)} className="btn btn-ghost" style={{ padding: '0 1rem', border: '1px solid var(--accent-signal)', color: 'var(--accent-signal)' }}>
                  Link
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
      `}} />
    </div>
  );
}
