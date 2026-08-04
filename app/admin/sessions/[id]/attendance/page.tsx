'use client';

import React, { useState, useEffect } from 'react';
import { LogoMark } from '@/components/logo/LogoMark';
import { RibbonSpin } from '@/components/logo/RibbonSpin';
import { RibbonFold } from '@/components/logo/RibbonFold';
import { handleNfcScan, getAllMembers, markAttendance } from '@/lib/actions';

export default function TakeAttendancePage({ params }: { params: { id: string } }) {
  // Default to manual so it's always accessible
  const [activeTab, setActiveTab] = useState<'nfc' | 'manual'>('manual');
  const [nfcSupported, setNfcSupported] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  
  // Data for manual attendance
  const [members, setMembers] = useState<any[]>([]);
  const [markedIds, setMarkedIds] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if ('NDEFReader' in window) {
      setNfcSupported(true);
      // We do NOT auto-switch to 'nfc'. User can click the tab if they want to scan.
    }
    
    // Fetch live members for the manual list
    getAllMembers().then(data => setMembers(data));
  }, []);

  const handleStartScan = async () => {
    if (!('NDEFReader' in window)) return;
    try {
      setScanning(true);
      setScanResult(null);
      // @ts-ignore
      const ndef = new window.NDEFReader();
      await ndef.scan();
      
      ndef.addEventListener("reading", async ({ serialNumber }: any) => {
        const result = await handleNfcScan(params.id, serialNumber);
        if (result.success) {
          setScanResult(result.memberName || serialNumber);
        } else {
          alert(result.error || "Failed to mark attendance.");
        }
        setTimeout(() => setScanResult(null), 3000);
      });
      
      ndef.addEventListener("readingerror", () => {
        alert("Cannot read NFC tag. Please try again.");
        setScanning(false);
      });
    } catch (error) {
      console.error(error);
      setScanning(false);
    }
  };

  const handleManualMark = async (memberId: string, memberName: string) => {
    setLoadingId(memberId);
    try {
      const result = await markAttendance(params.id, memberId, 'present', 'manual');
      if (result.success) {
        setMarkedIds(prev => new Set(prev).add(memberId));
        setScanResult(memberName);
        setTimeout(() => setScanResult(null), 3000);
      } else {
        alert('Failed to mark attendance');
      }
    } catch (e) {
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
            <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Session ID: {params.id.slice(0, 8)}...</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="text-display" style={{ fontSize: '2rem', color: 'var(--accent-signal)', letterSpacing: '0.05em' }}>
              {markedIds.size} <span style={{ fontSize: '1rem', color: 'var(--chrome-mid)' }}>/ {members.length}</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--chrome-mid)', textTransform: 'uppercase' }}>Checked In</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--chrome-dark)', position: 'relative' }}>
          {nfcSupported && (
            <button
              onClick={() => setActiveTab('nfc')}
              style={{ flex: 1, padding: '0.75rem', color: activeTab === 'nfc' ? 'var(--chrome-light)' : 'var(--chrome-mid)', fontWeight: activeTab === 'nfc' ? 600 : 400, transition: 'color 0.2s' }}
            >
              NFC Scan
            </button>
          )}
          <button
            onClick={() => setActiveTab('manual')}
            style={{ flex: 1, padding: '0.75rem', color: activeTab === 'manual' ? 'var(--chrome-light)' : 'var(--chrome-mid)', fontWeight: activeTab === 'manual' ? 600 : 400, transition: 'color 0.2s' }}
          >
            Manual List
          </button>
          <div style={{
            position: 'absolute', bottom: '-1px', height: '2px',
            width: nfcSupported ? '50%' : '100%',
            background: 'var(--accent-signal)',
            transform: nfcSupported && activeTab === 'nfc' ? 'translateX(0)' : nfcSupported ? 'translateX(100%)' : 'translateX(0)',
            transition: 'transform 0.3s var(--ease-spring)'
          }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>

        {/* NFC Tab */}
        {activeTab === 'nfc' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '350px' }}>
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
                  transition: 'all 0.3s', zIndex: 2
                }}
              >
                {scanning ? <RibbonSpin /> : <div style={{ width: '40px', height: '40px' }}><LogoMark /></div>}
                {!scanning && <span style={{ marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>START</span>}
              </button>
            </div>
            <p style={{ color: 'var(--chrome-mid)', textAlign: 'center', fontSize: '0.875rem' }}>
              {scanning ? 'Hold member card near device...' : 'Tap START and scan NFC cards'}
            </p>
          </div>
        )}

        {/* Manual Tab */}
        {activeTab === 'manual' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="text"
                className="input"
                placeholder="Search name or student ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {filteredMembers.length === 0 && (
              <p style={{ color: 'var(--chrome-mid)', textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem' }}>
                {members.length === 0 ? 'No members in database yet.' : 'No results found.'}
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredMembers.map((member) => {
                const isMarked = markedIds.has(member.id);
                const isLoading = loadingId === member.id;
                return (
                  <div
                    key={member.id}
                    className="card"
                    style={{
                      padding: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderColor: isMarked ? 'var(--state-present)' : 'var(--chrome-dark)',
                      transition: 'border-color 0.3s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'var(--chrome-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--chrome-mid)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--chrome-light)' }}>{member.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--chrome-mid)', fontFamily: 'var(--font-mono)' }}>{member.student_id}</div>
                      </div>
                    </div>

                    {isMarked ? (
                      <span className="badge badge-present">Present ✓</span>
                    ) : (
                      <button
                        onClick={() => handleManualMark(member.id, member.name)}
                        disabled={isLoading}
                        className="btn btn-ghost"
                        style={{ padding: '0 0.75rem', minHeight: '36px', color: 'var(--chrome-light)', border: '1px solid var(--chrome-dark)', opacity: isLoading ? 0.5 : 1 }}
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
      {scanResult && (
        <div className="card" style={{
          position: 'fixed', bottom: '100px', left: '1.25rem', right: '1.25rem',
          display: 'flex', alignItems: 'center', gap: '1rem',
          background: 'var(--bg-surface)', border: '1px solid var(--state-present)',
          animation: 'slideUp 0.3s var(--ease-spring)', zIndex: 50,
          boxShadow: '0 4px 24px rgba(111, 207, 151, 0.2)'
        }}>
          <div style={{ width: '40px', height: '40px' }}><RibbonFold /></div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--state-present)' }}>Marked Present</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--chrome-mid)', fontFamily: 'var(--font-mono)' }}>{scanResult}</div>
          </div>
        </div>
      )}

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
