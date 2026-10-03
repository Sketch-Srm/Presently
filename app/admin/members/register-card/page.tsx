'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RibbonFold } from '@/components/logo/RibbonFold';
import { LogoMark } from '@/components/logo/LogoMark';
import { getAllMembers, linkNfcCard } from '@/lib/actions';
import { Wifi, Search, AlertCircle } from 'lucide-react';

// NFC scan states
type ScanState = 'idle' | 'scanning' | 'reading' | 'success' | 'error';

function vibrate(pattern: number | number[]) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
}

// -- NFC Radar Component --
function NfcRadar({ state, onStart, onStop }: { state: ScanState; onStart: () => void; onStop: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', minHeight: '360px' }}>
      <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
        {(state === 'scanning' || state === 'reading') && <>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              position: 'absolute', borderRadius: '50%', border: `1.5px solid ${state === 'reading' ? 'var(--accent-signal)' : 'var(--chrome-mid)'}`,
              opacity: 0, animation: `nfc-ripple 2s ease-out infinite`, animationDelay: `${i * 0.65}s`, width: '100%', height: '100%',
            }} />
          ))}
        </>}

        {state === 'success' && <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: '0 0 40px rgba(111, 207, 151, 0.5)', animation: 'nfc-success-glow 0.5s ease forwards' }} />}
        {state === 'error' && <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: '0 0 40px rgba(232, 93, 93, 0.5)' }} />}

        <button
          onClick={state === 'idle' ? onStart : state === 'scanning' ? onStop : undefined}
          disabled={state === 'reading' || state === 'success'}
          style={{
            position: 'relative', zIndex: 2, width: '140px', height: '140px', borderRadius: '50%',
            background: state === 'success' ? 'rgba(111, 207, 151, 0.15)' : state === 'error' ? 'rgba(232, 93, 93, 0.1)' : state === 'scanning' || state === 'reading' ? 'var(--bg-surface)' : 'var(--gradient-chrome)',
            border: `2px solid ${state === 'success' ? 'var(--state-present)' : state === 'error' ? 'var(--state-absent)' : state === 'scanning' || state === 'reading' ? 'var(--accent-signal)' : 'var(--chrome-dark)'}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            cursor: state === 'idle' || state === 'scanning' ? 'pointer' : 'default', transition: 'all 0.3s ease',
            boxShadow: state === 'scanning' ? '0 0 20px rgba(125, 216, 255, 0.15)' : 'none',
          }}
        >
          {state === 'idle' && (
            <>
              <Wifi size={32} style={{ color: 'var(--chrome-light)' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--chrome-light)' }}>TAP TO SCAN</span>
            </>
          )}
          {(state === 'scanning' || state === 'reading') && (
            <>
              <div style={{ width: '40px', height: '40px' }}><LogoMark /></div>
              <span style={{ fontSize: '0.6rem', color: 'var(--accent-signal)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {state === 'reading' ? 'READING...' : 'READY'}
              </span>
            </>
          )}
          {state === 'success' && (
            <>
              <div style={{ width: '40px', height: '40px' }}><RibbonFold /></div>
              <span style={{ fontSize: '0.6rem', color: 'var(--state-present)', fontWeight: 700 }}>SCANNED</span>
            </>
          )}
          {state === 'error' && (
            <>
              <span style={{ fontSize: '1.5rem' }}>✕</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--state-absent)', fontWeight: 700 }}>ERROR</span>
            </>
          )}
        </button>
      </div>

      <div style={{ textAlign: 'center' }}>
        {state === 'idle' && <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Tap the button to read a new NFC tag</p>}
        {state === 'scanning' && <p style={{ color: 'var(--chrome-light)', fontSize: '0.875rem', animation: 'pulse-text 1.5s ease-in-out infinite' }}>Hold the card near the top of the phone</p>}
        {state === 'reading' && <p style={{ color: 'var(--accent-signal)', fontSize: '0.875rem', fontWeight: 600 }}>Card detected! Processing...</p>}
        {state === 'success' && <p style={{ color: 'var(--state-present)', fontSize: '0.875rem', fontWeight: 600 }}>Tag read successfully!</p>}
        {state === 'error' && <p style={{ color: 'var(--state-absent)', fontSize: '0.875rem' }}>Could not read tag. Try again.</p>}
      </div>

      {(state === 'scanning' || state === 'reading') && (
        <button onClick={onStop} className="btn btn-ghost" style={{ marginTop: '1.5rem', padding: '0.5rem 1.5rem', border: '1px solid var(--chrome-dark)', fontSize: '0.8rem', color: 'var(--chrome-mid)' }}>
          Stop Scanning
        </button>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes nfc-ripple { 0% { transform: scale(0.4); opacity: 0.8; } 100% { transform: scale(1.4); opacity: 0; } }
        @keyframes nfc-success-glow { 0% { opacity: 0; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes pulse-text { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}} />
    </div>
  );
}

export default function RegisterCardPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [cardSerial, setCardSerial] = useState<string | null>(null);
  const [nfcSupported, setNfcSupported] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  
  const ndefRef = useRef<any>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !('NDEFReader' in window)) {
      setNfcSupported(false);
    }
    getAllMembers().then(setMembers);
  }, []);

  const handleStartScan = async () => {
    if (!('NDEFReader' in window)) return;
    try {
      abortRef.current = new AbortController();
      // @ts-ignore
      const ndef = new window.NDEFReader();
      ndefRef.current = ndef;

      setScanState('scanning');
      vibrate(50);

      await ndef.scan({ signal: abortRef.current.signal });

      ndef.addEventListener('reading', ({ serialNumber }: any) => {
        setScanState('reading');
        vibrate([50, 30, 50]);

        setTimeout(() => {
          setCardSerial(serialNumber);
          setScanState('success');
          vibrate([100, 50, 200]);
          setTimeout(() => setStep(2), 1500);
        }, 500);
      }, { signal: abortRef.current.signal });

      ndef.addEventListener('readingerror', () => {
        setScanState('error');
        vibrate(300);
        setTimeout(() => setScanState('scanning'), 2000);
      }, { signal: abortRef.current?.signal });

    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('NFC error:', err);
      setScanState('idle');

      if (err.name === 'NotAllowedError') {
        alert('NFC permission denied. Please allow NFC access in browser settings and close any screen overlays (chat heads, floating windows).');
      } else if (err.name === 'NotSupportedError') {
        alert('NFC is not supported on this device or browser.');
      } else {
        alert(`NFC Error: ${err.message}`);
      }
    }
  };

  const handleStopScan = () => {
    abortRef.current?.abort();
    setScanState('idle');
  };

  const handleLink = async (memberId: string) => {
    if (!cardSerial) return;
    const result = await linkNfcCard(memberId, cardSerial);
    if (result.success) {
      alert('Card linked successfully!');
      router.push('/admin/members');
    } else {
      alert((result as any).reason === 'already_linked' ? `Card already linked to ${(result as any).owner}` : 'Failed to link card');
    }
  };

  const filteredMembers = members.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.student_id?.toLowerCase().includes(search.toLowerCase())
  );

  if (!nfcSupported) {
    return (
      <div style={{ padding: '1.25rem', textAlign: 'center', marginTop: '4rem' }}>
        <h2 className="text-display" style={{ marginBottom: '1rem', color: 'var(--state-absent)' }}>NFC Not Supported</h2>
        <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Card registration requires an Android device using Chrome or Edge.</p>
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
        <NfcRadar state={scanState} onStart={handleStartScan} onStop={handleStopScan} />
      )}

      {step === 2 && (
        <div>
          <div className="card" style={{ marginBottom: '2rem', textAlign: 'center', border: '1px solid var(--accent-signal)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--chrome-mid)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Card Serial Read</div>
            <div className="text-display text-mono" style={{ color: 'var(--accent-signal)', fontSize: '1.25rem' }}>{cardSerial}</div>
          </div>

          <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--chrome-mid)' }}>Select Member to Link</label>
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--chrome-mid)' }} />
            <input type="text" className="input" placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.25rem' }} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredMembers.map((member) => (
              <div key={member.id} className="card" style={{ padding: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--chrome-light)' }}>{member.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--chrome-mid)', fontFamily: 'var(--font-mono)' }}>{member.student_id}</div>
                </div>
                {member.card_serial ? (
                  <span className="badge badge-present" style={{ fontSize: '0.65rem' }}>LINKED</span>
                ) : (
                  <button onClick={() => handleLink(member.id)} className="btn btn-ghost" style={{ padding: '0 1rem', border: '1px solid var(--accent-signal)', color: 'var(--accent-signal)', minHeight: '32px' }}>
                    Link
                  </button>
                )}
              </div>
            ))}
            {filteredMembers.length === 0 && (
              <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem', textAlign: 'center', marginTop: '1rem' }}>No members found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
