'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RibbonFold } from '@/components/logo/RibbonFold';
import { LogoMark } from '@/components/logo/LogoMark';
import { handleNfcScan, getAllMembers, markAttendance } from '@/lib/actions';
import { Search, Wifi } from 'lucide-react';

// NFC scan states
type ScanState = 'idle' | 'scanning' | 'reading' | 'success' | 'error';

function vibrate(pattern: number | number[]) {
  if ('vibrate' in navigator) navigator.vibrate(pattern);
}

// -- NFC Radar Animation Component --
function NfcRadar({ state, onStart, onStop }: { state: ScanState; onStart: () => void; onStop: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', minHeight: '360px' }}>
      {/* Ripple container */}
      <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
        {/* Animated ripple rings — only show when scanning */}
        {(state === 'scanning' || state === 'reading') && <>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              position: 'absolute',
              borderRadius: '50%',
              border: `1.5px solid ${state === 'reading' ? 'var(--accent-signal)' : 'var(--chrome-mid)'}`,
              opacity: 0,
              animation: `nfc-ripple 2s ease-out infinite`,
              animationDelay: `${i * 0.65}s`,
              width: '100%', height: '100%',
            }} />
          ))}
        </>}

        {/* Success glow ring */}
        {state === 'success' && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            boxShadow: '0 0 40px rgba(111, 207, 151, 0.5)',
            animation: 'nfc-success-glow 0.5s ease forwards',
          }} />
        )}

        {/* Error glow ring */}
        {state === 'error' && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            boxShadow: '0 0 40px rgba(232, 93, 93, 0.5)',
          }} />
        )}

        {/* Center button */}
        <button
          onClick={state === 'idle' ? onStart : state === 'scanning' ? onStop : undefined}
          disabled={state === 'reading' || state === 'success'}
          style={{
            position: 'relative', zIndex: 2,
            width: '140px', height: '140px',
            borderRadius: '50%',
            background:
              state === 'success' ? 'rgba(111, 207, 151, 0.15)' :
              state === 'error' ? 'rgba(232, 93, 93, 0.1)' :
              state === 'scanning' || state === 'reading' ? 'var(--bg-surface)' :
              'var(--gradient-chrome)',
            border: `2px solid ${
              state === 'success' ? 'var(--state-present)' :
              state === 'error' ? 'var(--state-absent)' :
              state === 'scanning' || state === 'reading' ? 'var(--accent-signal)' :
              'var(--chrome-dark)'
            }`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            cursor: state === 'idle' || state === 'scanning' ? 'pointer' : 'default',
            transition: 'all 0.3s ease',
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
              <span style={{ fontSize: '0.6rem', color: 'var(--state-present)', fontWeight: 700 }}>MARKED</span>
            </>
          )}
          {state === 'error' && (
            <>
              <span style={{ fontSize: '1.5rem' }}>✕</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--state-absent)', fontWeight: 700 }}>NOT FOUND</span>
            </>
          )}
        </button>
      </div>

      {/* Status text */}
      <div style={{ textAlign: 'center' }}>
        {state === 'idle' && (
          <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Tap the button to begin NFC scanning</p>
        )}
        {state === 'scanning' && (
          <p style={{ color: 'var(--chrome-light)', fontSize: '0.875rem', animation: 'pulse-text 1.5s ease-in-out infinite' }}>
            Hold member card near the top of the phone
          </p>
        )}
        {state === 'reading' && (
          <p style={{ color: 'var(--accent-signal)', fontSize: '0.875rem', fontWeight: 600 }}>Card detected! Processing...</p>
        )}
        {state === 'success' && (
          <p style={{ color: 'var(--state-present)', fontSize: '0.875rem', fontWeight: 600 }}>Attendance marked! Ready for next card.</p>
        )}
        {state === 'error' && (
          <p style={{ color: 'var(--state-absent)', fontSize: '0.875rem' }}>Card not registered. Scanning continues...</p>
        )}
      </div>

      {/* Stop button */}
      {(state === 'scanning' || state === 'reading') && (
        <button onClick={onStop} className="btn btn-ghost" style={{
          marginTop: '1.5rem', padding: '0.5rem 1.5rem',
          border: '1px solid var(--chrome-dark)', fontSize: '0.8rem', color: 'var(--chrome-mid)'
        }}>
          Stop Scanning
        </button>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes nfc-ripple {
          0% { transform: scale(0.4); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes nfc-success-glow {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse-text {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}} />
    </div>
  );
}

// -- Main Page --
export default function TakeAttendancePage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'nfc' | 'manual'>('manual');
  const [nfcSupported, setNfcSupported] = useState(false);
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [markedIds, setMarkedIds] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [toastName, setToastName] = useState<string | null>(null);
  const ndefRef = useRef<any>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      setNfcSupported(true);
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

      ndef.addEventListener('reading', async ({ serialNumber }: any) => {
        setScanState('reading');
        vibrate([50, 30, 50]); // double pulse on card detect

        const result = await handleNfcScan(params.id, serialNumber);
        setLastScanned(serialNumber);

        if (result.success) {
          setScanState('success');
          vibrate([100, 50, 200]); // success pattern
          const name = result.memberName || serialNumber;
          setToastName(name);
          setMarkedIds(prev => new Set(prev).add(result.memberId || ''));
          setTimeout(() => {
            setScanState('scanning'); // go back to scanning after success
            setToastName(null);
          }, 2000);
        } else {
          setScanState('error');
          vibrate([300]); // single long buzz for error
          setTimeout(() => setScanState('scanning'), 2000);
        }
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

  const handleManualMark = async (memberId: string, memberName: string) => {
    setLoadingId(memberId);
    try {
      const result = await markAttendance(params.id, memberId, 'present', 'manual');
      if (result.success) {
        vibrate([50, 30, 100]);
        setMarkedIds(prev => new Set(prev).add(memberId));
        setToastName(memberName);
        setTimeout(() => setToastName(null), 2500);
      } else {
        alert('Failed to mark attendance');
      }
    } catch {
      alert('Error marking attendance');
    } finally {
      setLoadingId(null);
    }
  };

  const filteredMembers = members.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.student_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem', background: 'var(--bg-void)', borderBottom: '1px solid var(--chrome-dark)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h1 className="text-display" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Take Attendance</h1>
            <p style={{ color: 'var(--chrome-mid)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{params.id.slice(0, 8).toUpperCase()}...</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="text-display" style={{ fontSize: '2.5rem', color: 'var(--accent-signal)', lineHeight: 1 }}>
              {markedIds.size}
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--chrome-mid)', textTransform: 'uppercase' }}>
              of {members.length} checked in
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--chrome-dark)', position: 'relative' }}>
          {nfcSupported && (
            <button onClick={() => setActiveTab('nfc')} style={{
              flex: 1, padding: '0.75rem',
              color: activeTab === 'nfc' ? 'var(--chrome-light)' : 'var(--chrome-mid)',
              fontWeight: activeTab === 'nfc' ? 600 : 400,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'color 0.2s', fontSize: '0.875rem'
            }}>
              <Wifi size={14} /> NFC Scan
            </button>
          )}
          <button onClick={() => setActiveTab('manual')} style={{
            flex: 1, padding: '0.75rem',
            color: activeTab === 'manual' ? 'var(--chrome-light)' : 'var(--chrome-mid)',
            fontWeight: activeTab === 'manual' ? 600 : 400,
            transition: 'color 0.2s', fontSize: '0.875rem'
          }}>
            Manual List
          </button>
          <div style={{
            position: 'absolute', bottom: '-1px', height: '2px',
            width: nfcSupported ? '50%' : '100%',
            background: 'var(--accent-signal)',
            transform: nfcSupported && activeTab === 'nfc' ? 'translateX(0)' : nfcSupported ? 'translateX(100%)' : 'translateX(0)',
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {activeTab === 'nfc' && nfcSupported && (
          <NfcRadar
            state={scanState}
            onStart={handleStartScan}
            onStop={handleStopScan}
          />
        )}

        {activeTab === 'manual' && (
          <div>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--chrome-mid)' }} />
              <input
                type="text"
                className="input"
                placeholder="Search name or student ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>

            {filteredMembers.length === 0 && (
              <p style={{ color: 'var(--chrome-mid)', textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem' }}>
                {members.length === 0 ? 'No members in database.' : 'No results found.'}
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredMembers.map(member => {
                const isMarked = markedIds.has(member.id);
                const isLoading = loadingId === member.id;
                return (
                  <div key={member.id} className="card" style={{
                    padding: '0.875rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderColor: isMarked ? 'var(--state-present)' : 'var(--chrome-dark)',
                    transition: 'border-color 0.3s, background 0.3s',
                    background: isMarked ? 'rgba(111, 207, 151, 0.05)' : 'var(--bg-surface)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '50%',
                        background: member.photo_url ? 'transparent' : 'var(--chrome-dark)',
                        border: '1px solid var(--chrome-dark)', overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--chrome-mid)', fontSize: '0.875rem', flexShrink: 0,
                      }}>
                        {member.photo_url
                          ? <img src={member.photo_url} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : member.name?.charAt(0).toUpperCase()
                        }
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.9rem', color: isMarked ? 'var(--state-present)' : 'var(--chrome-light)', transition: 'color 0.3s' }}>
                          {member.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--chrome-mid)', fontFamily: 'var(--font-mono)' }}>{member.student_id}</div>
                      </div>
                    </div>

                    {isMarked ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--state-present)', fontSize: '0.8rem', fontWeight: 600 }}>
                        ✓ Present
                      </div>
                    ) : (
                      <button
                        onClick={() => handleManualMark(member.id, member.name)}
                        disabled={isLoading}
                        className="btn btn-ghost"
                        style={{
                          padding: '0 0.875rem', minHeight: '34px', fontSize: '0.8rem',
                          border: '1px solid var(--chrome-dark)', opacity: isLoading ? 0.5 : 1,
                          transition: 'opacity 0.2s'
                        }}
                      >
                        {isLoading ? '...' : 'Mark'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Success Toast */}
      {toastName && (
        <div className="card" style={{
          position: 'fixed', bottom: '100px', left: '1rem', right: '1rem',
          display: 'flex', alignItems: 'center', gap: '1rem',
          background: 'var(--bg-surface)', border: '1px solid var(--state-present)',
          animation: 'toast-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          zIndex: 50, boxShadow: '0 8px 32px rgba(111, 207, 151, 0.2)'
        }}>
          <div style={{ width: '36px', height: '36px', flexShrink: 0 }}><RibbonFold /></div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--state-present)', fontSize: '0.9rem' }}>Marked Present</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--chrome-mid)', fontFamily: 'var(--font-mono)' }}>{toastName}</div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes toast-in {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </div>
  );
}
