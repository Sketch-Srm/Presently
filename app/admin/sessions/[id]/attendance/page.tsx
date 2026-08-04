'use client';

import React, { useState, useEffect } from 'react';
import { LogoMark } from '@/components/logo/LogoMark';
import { RibbonSpin } from '@/components/logo/RibbonSpin';
import { RibbonFold } from '@/components/logo/RibbonFold';
import { handleNfcScan } from '@/lib/actions';

export default function TakeAttendancePage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'nfc' | 'manual'>('manual');
  const [nfcSupported, setNfcSupported] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  useEffect(() => {
    if ('NDEFReader' in window) {
      setNfcSupported(true);
      setActiveTab('nfc');
    }
  }, []);

  const handleStartScan = async () => {
    if (!('NDEFReader' in window)) return;
    try {
      setScanning(true);
      setScanResult(null);
      // @ts-ignore
      const ndef = new window.NDEFReader();
      await ndef.scan();
      
      ndef.addEventListener("reading", async ({ message, serialNumber }: any) => {
        // Call the server action to register the scan
        const result = await handleNfcScan(params.id, serialNumber);
        
        if (result.success) {
          setScanResult(result.memberName || serialNumber);
        } else {
          alert(result.error || "Failed to mark attendance.");
        }
        
        // Toast timeout
        setTimeout(() => setScanResult(null), 3000); 
      });
      
      ndef.addEventListener("readingerror", () => {
        alert("Cannot read NFC tag. Please try again.");
      });
    } catch (error) {
      console.error(error);
      setScanning(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      {/* Sticky Header */}
      <div style={{ padding: '1.25rem', background: 'var(--bg-void)', borderBottom: '1px solid var(--chrome-dark)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h1 className="text-display" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Design Sync 1</h1>
            <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Sept 24 • Design Team</p>
          </div>
          <button className="btn btn-ghost" style={{ padding: '0 0.5rem', minHeight: '32px' }}>✕</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--chrome-mid)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Checked In</div>
          <div className="text-display" style={{ fontSize: '2rem', color: 'var(--accent-signal)', letterSpacing: '0.05em' }}>
            14 <span style={{ fontSize: '1rem', color: 'var(--chrome-mid)' }}>/ 20</span>
          </div>
        </div>

        {/* Tabs */}
        {nfcSupported && (
          <div style={{ display: 'flex', marginTop: '1rem', borderBottom: '1px solid var(--chrome-dark)', position: 'relative' }}>
            <button 
              onClick={() => setActiveTab('nfc')}
              style={{ flex: 1, padding: '0.75rem', color: activeTab === 'nfc' ? 'var(--chrome-light)' : 'var(--chrome-mid)', fontWeight: activeTab === 'nfc' ? 600 : 400, transition: 'color 0.2s' }}
            >
              NFC Scan
            </button>
            <button 
              onClick={() => setActiveTab('manual')}
              style={{ flex: 1, padding: '0.75rem', color: activeTab === 'manual' ? 'var(--chrome-light)' : 'var(--chrome-mid)', fontWeight: activeTab === 'manual' ? 600 : 400, transition: 'color 0.2s' }}
            >
              Manual List
            </button>
            {/* Ribbon Indicator */}
            <div style={{
              position: 'absolute', bottom: '-1px', height: '2px', width: '50%', background: 'var(--accent-signal)',
              transform: activeTab === 'nfc' ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 0.3s var(--ease-spring)'
            }} />
          </div>
        )}
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
        
        {activeTab === 'nfc' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '350px' }}>
            
            <div style={{ position: 'relative', width: '160px', height: '160px', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Outer Ripple */}
              {scanning && (
                <div style={{
                  position: 'absolute', inset: -20, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(125,216,255,0.2) 0%, transparent 70%)',
                  animation: 'pulse 2s infinite var(--ease-smooth)'
                }} />
              )}
              {/* Inner Circle / Button */}
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
                {!scanning && <span style={{ marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>START</span>}
              </button>
            </div>

            <p style={{ color: 'var(--chrome-mid)', textAlign: 'center', fontSize: '0.875rem' }}>
              {scanning ? 'Hold member card near device...' : 'Tap START and scan NFC cards'}
            </p>

            {/* Toast Mock */}
            {scanResult && (
              <div className="card" style={{
                position: 'fixed', bottom: '100px', left: '1.25rem', right: '1.25rem',
                display: 'flex', alignItems: 'center', gap: '1rem',
                background: 'var(--bg-surface)', border: '1px solid var(--state-present)',
                animation: 'slideUp 0.3s var(--ease-spring)', zIndex: 50,
                boxShadow: '0 4px 24px rgba(111, 207, 151, 0.2)'
              }}>
                <div style={{ width: '40px', height: '40px' }}>
                  <RibbonFold />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--state-present)' }}>Marked Present</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--chrome-mid)', fontFamily: 'var(--font-mono)' }}>{scanResult}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'manual' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <input type="text" className="input" placeholder="Search name or ID..." />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['Alice Chen', 'Bob Smith', 'Charlie Day'].map((name, i) => (
                <div key={i} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', borderColor: i === 0 ? 'var(--state-present)' : 'var(--chrome-dark)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'var(--chrome-dark)' }} />
                    <div>
                      <div style={{ fontWeight: 500 }}>{name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--chrome-mid)', fontFamily: 'var(--font-mono)' }}>sd100{i}</div>
                    </div>
                  </div>
                  
                  {i === 0 ? (
                    <span className="badge badge-present">Present</span>
                  ) : (
                    <button className="btn btn-ghost" style={{ padding: '0 0.5rem', minHeight: '36px', color: 'var(--chrome-light)', border: '1px solid var(--chrome-dark)' }}>
                      Mark
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
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
