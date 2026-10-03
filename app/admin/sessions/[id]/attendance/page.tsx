'use client';

import React, { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RibbonFold } from '@/components/logo/RibbonFold';
import { LogoMark } from '@/components/logo/LogoMark';
import { handleNfcScan, getSessionWithRoster, markAttendance, closeSession } from '@/lib/actions';
import { Search, Wifi, X, Lock, ChevronDown } from 'lucide-react';

type ScanState = 'idle' | 'scanning' | 'reading' | 'success' | 'error';
type AttendanceStatus = 'present' | 'late' | 'excused' | 'absent';

type ToastData = {
  outcome: 'marked' | 'already_marked' | 'session_closed' | 'unregistered';
  name?: string;
};

function vibrate(pattern: number | number[]) {
  if ('vibrate' in navigator) navigator.vibrate(pattern);
}

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  present: 'var(--state-present)',
  late: 'var(--state-late)',
  excused: 'var(--accent-signal)',
  absent: 'var(--state-absent)',
};

// ── NFC Radar ──────────────────────────────────────────────
function NfcRadar({ state, onStart, onStop }: { state: ScanState; onStart: () => void; onStop: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem', minHeight: '360px', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
        {(state === 'scanning' || state === 'reading') && [0, 1, 2].map(i => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            border: `1.5px solid ${state === 'reading' ? 'var(--accent-signal)' : 'var(--chrome-mid)'}`,
            opacity: 0, animation: `nfc-ripple 2s ease-out infinite`,
            animationDelay: `${i * 0.65}s`, width: '100%', height: '100%',
          }} />
        ))}
        {state === 'success' && <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: '0 0 40px rgba(111,207,151,0.5)', animation: 'nfc-success-glow 0.5s ease forwards' }} />}
        {state === 'error' && <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: '0 0 40px rgba(232,93,93,0.5)' }} />}

        <button
          onClick={state === 'idle' ? onStart : state === 'scanning' ? onStop : undefined}
          disabled={state === 'reading' || state === 'success'}
          style={{
            position: 'relative', zIndex: 2,
            width: '140px', height: '140px', borderRadius: '50%',
            background: state === 'success' ? 'rgba(111,207,151,0.15)' : state === 'error' ? 'rgba(232,93,93,0.1)' : state === 'scanning' || state === 'reading' ? 'var(--bg-surface)' : 'var(--gradient-chrome)',
            border: `2px solid ${state === 'success' ? 'var(--state-present)' : state === 'error' ? 'var(--state-absent)' : state === 'scanning' || state === 'reading' ? 'var(--accent-signal)' : 'var(--chrome-dark)'}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            cursor: state === 'idle' || state === 'scanning' ? 'pointer' : 'default',
            transition: 'all 0.3s ease',
          }}
        >
          {state === 'idle' && <><Wifi size={32} style={{ color: 'var(--chrome-light)' }} /><span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--chrome-light)' }}>TAP TO SCAN</span></>}
          {(state === 'scanning' || state === 'reading') && <><div style={{ width: '40px', height: '40px' }}><LogoMark /></div><span style={{ fontSize: '0.6rem', color: 'var(--accent-signal)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{state === 'reading' ? 'READING...' : 'READY'}</span></>}
          {state === 'success' && <><div style={{ width: '40px', height: '40px' }}><RibbonFold /></div><span style={{ fontSize: '0.6rem', color: 'var(--state-present)', fontWeight: 700 }}>MARKED</span></>}
          {state === 'error' && <><span style={{ fontSize: '1.5rem' }}>✕</span><span style={{ fontSize: '0.6rem', color: 'var(--state-absent)', fontWeight: 700 }}>NOT FOUND</span></>}
        </button>
      </div>

      <div style={{ textAlign: 'center' }}>
        {state === 'idle' && <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Tap the button to begin NFC scanning</p>}
        {state === 'scanning' && <p style={{ color: 'var(--chrome-light)', fontSize: '0.875rem' }}>Hold member card near the top of the phone</p>}
        {state === 'reading' && <p style={{ color: 'var(--accent-signal)', fontSize: '0.875rem', fontWeight: 600 }}>Card detected! Processing...</p>}
        {state === 'success' && <p style={{ color: 'var(--state-present)', fontSize: '0.875rem', fontWeight: 600 }}>Marked! Ready for next card.</p>}
        {state === 'error' && <p style={{ color: 'var(--state-absent)', fontSize: '0.875rem' }}>Card not registered. Scanning continues...</p>}
      </div>

      {(state === 'scanning' || state === 'reading') && (
        <button onClick={onStop} className="btn btn-ghost" style={{ marginTop: '1.5rem', padding: '0.5rem 1.5rem', border: '1px solid var(--chrome-dark)', fontSize: '0.8rem', color: 'var(--chrome-mid)' }}>
          Stop Scanning
        </button>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes nfc-ripple { 0% { transform: scale(0.4); opacity: 0.8; } 100% { transform: scale(1.4); opacity: 0; } }
        @keyframes nfc-success-glow { 0% { opacity: 0; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }
      `}} />
    </div>
  );
}

// ── Status Picker Bottom Sheet ──────────────────────────────
function StatusSheet({ member, currentStatus, onPick, onClose }: {
  member: any; currentStatus: AttendanceStatus; onPick: (s: AttendanceStatus) => void; onClose: () => void;
}) {
  const statuses: AttendanceStatus[] = ['present', 'late', 'excused', 'absent'];
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'var(--bg-surface)', borderTop: '1px solid var(--chrome-dark)',
        borderRadius: '16px 16px 0 0', padding: '1.5rem 1.25rem',
        animation: 'sheet-in 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--chrome-light)' }}>{member.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--chrome-mid)', fontFamily: 'var(--font-mono)' }}>{member.student_id}</div>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.25rem' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => onPick(s)}
              className="btn btn-ghost"
              style={{
                justifyContent: 'flex-start', padding: '0.875rem 1rem',
                border: `1px solid ${s === currentStatus ? STATUS_COLORS[s] : 'var(--chrome-dark)'}`,
                color: s === currentStatus ? STATUS_COLORS[s] : 'var(--chrome-light)',
                fontWeight: s === currentStatus ? 600 : 400,
                borderRadius: 'var(--radius-md)',
              }}
            >
              {s.toUpperCase()}
              {s === currentStatus && <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>✓ current</span>}
            </button>
          ))}
        </div>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes sheet-in { from { transform: translateY(100%); } to { transform: translateY(0); } }` }} />
      </div>
    </>
  );
}

// ── Toast ──────────────────────────────────────────────────
function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: () => void }) {
  const configs = {
    marked:         { color: 'var(--state-present)', label: 'MARKED', icon: '✓' },
    already_marked: { color: 'var(--state-late)',    label: 'ALREADY IN', icon: '→' },
    session_closed: { color: 'var(--state-absent)',  label: 'SESSION CLOSED', icon: '✕' },
    unregistered:   { color: 'var(--state-absent)',  label: 'UNREGISTERED CARD', icon: '✕' },
  };
  const { color, label, icon } = configs[toast.outcome];
  return (
    <div className="card" style={{
      position: 'fixed', bottom: '100px', left: '1rem', right: '1rem',
      display: 'flex', alignItems: 'center', gap: '1rem',
      background: 'var(--bg-surface)', border: `1px solid ${color}`,
      animation: 'toast-in 0.3s cubic-bezier(0.34,1.56,0.64,1)', zIndex: 50,
      boxShadow: `0 8px 32px ${color}33`,
    }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${color}22`, border: `1px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color, fontWeight: 700, fontSize: '1rem' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color, fontSize: '0.875rem' }}>{label}</div>
        {toast.name && <div style={{ fontSize: '0.75rem', color: 'var(--chrome-mid)', fontFamily: 'var(--font-mono)' }}>{toast.name}</div>}
      </div>
      <button onClick={onDismiss} className="btn btn-ghost" style={{ padding: '0.25rem', color: 'var(--chrome-mid)' }}>
        <X size={16} />
      </button>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes toast-in { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }` }} />
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function TakeAttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = use(params);
  const router = useRouter();

  const [session, setSession] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  // marks: memberId → status
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({});
  const [activeTab, setActiveTab] = useState<'nfc' | 'manual'>('manual');
  const [nfcSupported, setNfcSupported] = useState(false);
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<ToastData | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [sheetMember, setSheetMember] = useState<any>(null);
  const [closing, setClosing] = useState(false);
  const [loading, setLoading] = useState(true);

  const ndefRef = useRef<any>(null);
  const abortRef = useRef<AbortController | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'NDEFReader' in window) setNfcSupported(true);

    getSessionWithRoster(sessionId).then(data => {
      if (!data) {
        setLoading(false);
        return;
      }
      setSession(data.session);
      setMembers(data.members ?? []);
      // Hydrate existing marks from DB
      const m: Record<string, AttendanceStatus> = {};
      (data.attendance ?? []).forEach((a: any) => { m[a.member_id] = a.status; });
      setMarks(m);
      setLoading(false);
    });

    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [sessionId]);

  const showToast = (data: ToastData) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(data);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  // ── NFC scanning ──
  const handleStartScan = async () => {
    if (!('NDEFReader' in window)) return;
    try {
      abortRef.current = new AbortController();
      const ndef = new (window as any).NDEFReader();
      ndefRef.current = ndef;
      setScanState('scanning');
      vibrate(50);
      await ndef.scan({ signal: abortRef.current.signal });

      ndef.addEventListener('reading', async ({ serialNumber }: any) => {
        setScanState('reading');
        vibrate([50, 30, 50]);
        const result = await handleNfcScan(sessionId, serialNumber);

        if (result.outcome === 'marked') {
          setScanState('success');
          vibrate([100, 50, 200]);
          setMarks(prev => ({ ...prev, [result.memberId]: 'present' }));
          showToast({ outcome: 'marked', name: result.memberName });
          setTimeout(() => setScanState('scanning'), 2000);
        } else if (result.outcome === 'already_marked') {
          setScanState('success');
          vibrate([50, 50, 50]);
          showToast({ outcome: 'already_marked', name: result.memberName });
          setTimeout(() => setScanState('scanning'), 2000);
        } else if (result.outcome === 'session_closed') {
          setScanState('error');
          vibrate([300]);
          showToast({ outcome: 'session_closed' });
          setTimeout(() => setScanState('idle'), 2000);
        } else {
          setScanState('error');
          vibrate([300]);
          showToast({ outcome: 'unregistered' });
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
      setScanState('idle');
      if (err.name === 'NotAllowedError') alert('NFC permission denied.');
      else alert(`NFC Error: ${err.message}`);
    }
  };

  const handleStopScan = () => { abortRef.current?.abort(); setScanState('idle'); };

  // ── Manual mark ──
  const handleManualMark = async (memberId: string, status: AttendanceStatus) => {
    setLoadingId(memberId);
    const prev = marks[memberId];
    setMarks(m => ({ ...m, [memberId]: status })); // optimistic
    try {
      const result = await markAttendance(sessionId, memberId, status, 'manual');
      if (!result.success) {
        setMarks(m => { const n = { ...m }; if (prev) n[memberId] = prev; else delete n[memberId]; return n; }); // rollback
        if (result.reason === 'session_closed') showToast({ outcome: 'session_closed' });
      } else {
        vibrate([50, 30, 100]);
      }
    } catch {
      setMarks(m => { const n = { ...m }; if (prev) n[memberId] = prev; else delete n[memberId]; return n; });
    } finally {
      setLoadingId(null);
      setSheetMember(null);
    }
  };

  // ── Close session ──
  const handleClose = async () => {
    if (!confirm('Close this session? All unmarked eligible members will be marked absent.')) return;
    setClosing(true);
    try {
      await closeSession(sessionId);
      setSession((s: any) => ({ ...s, status: 'closed' }));
      router.refresh();
    } catch { alert('Failed to close session.'); }
    finally { setClosing(false); }
  };

  const presentCount = Object.values(marks).filter(s => s === 'present' || s === 'late').length;
  const filteredMembers = members.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.student_id?.toLowerCase().includes(search.toLowerCase()) ||
    m.register_no?.toLowerCase().includes(search.toLowerCase())
  );

  const sessionClosed = session?.status === 'closed';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>

      {/* ── Sticky Header ─────────────────────────── */}
      <div style={{ padding: '1rem 1.25rem', background: 'var(--bg-void)', borderBottom: '1px solid var(--chrome-dark)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div style={{ flex: 1, minWidth: 0, paddingRight: '1rem' }}>
            {loading ? (
              <div style={{ height: '1.25rem', width: '160px', background: 'var(--chrome-dark)', borderRadius: '4px', marginBottom: '0.25rem' }} />
            ) : (
              <>
                <h1 className="text-display" style={{ fontSize: '1.1rem', marginBottom: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {session?.title ?? 'Take Attendance'}
                </h1>
                <p style={{ color: 'var(--chrome-mid)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                  {session?.date} · {session?.scope === 'club_wide' ? 'CLUB-WIDE' : 'DOMAIN'} · {sessionClosed ? '🔒 CLOSED' : '🟢 OPEN'}
                </p>
              </>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <div style={{ textAlign: 'right' }}>
              <div className="text-display" style={{ fontSize: '2rem', color: 'var(--accent-signal)', lineHeight: 1 }}>{presentCount}</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--chrome-mid)', textTransform: 'uppercase' }}>of {members.length}</div>
            </div>
            {!sessionClosed && (
              <button
                onClick={handleClose}
                disabled={closing}
                className="btn btn-ghost"
                style={{ padding: '0 0.75rem', minHeight: '34px', fontSize: '0.75rem', border: '1px solid rgba(232,93,93,0.5)', color: 'var(--state-absent)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
              >
                <Lock size={12} /> {closing ? '...' : 'Close'}
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {members.length > 0 && (
          <div style={{ height: '3px', background: 'var(--chrome-dark)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.round((presentCount / members.length) * 100)}%`, background: 'var(--accent-signal)', transition: 'width 0.4s ease', borderRadius: '2px' }} />
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--chrome-dark)', position: 'relative', marginTop: '0.75rem' }}>
          {nfcSupported && (
            <button onClick={() => setActiveTab('nfc')} style={{ flex: 1, padding: '0.625rem', color: activeTab === 'nfc' ? 'var(--chrome-light)' : 'var(--chrome-mid)', fontWeight: activeTab === 'nfc' ? 600 : 400, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'color 0.2s', fontSize: '0.875rem' }}>
              <Wifi size={14} /> NFC Scan
            </button>
          )}
          <button onClick={() => setActiveTab('manual')} style={{ flex: 1, padding: '0.625rem', color: activeTab === 'manual' ? 'var(--chrome-light)' : 'var(--chrome-mid)', fontWeight: activeTab === 'manual' ? 600 : 400, transition: 'color 0.2s', fontSize: '0.875rem' }}>
            Manual List
          </button>
          <div style={{ position: 'absolute', bottom: '-1px', height: '2px', width: nfcSupported ? '50%' : '100%', background: 'var(--accent-signal)', transform: nfcSupported && activeTab === 'nfc' ? 'translateX(0)' : nfcSupported ? 'translateX(100%)' : 'translateX(0)', transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)' }} />
        </div>
      </div>

      {/* ── Content ───────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {activeTab === 'nfc' && nfcSupported && (
          <NfcRadar state={scanState} onStart={handleStartScan} onStop={handleStopScan} />
        )}

        {activeTab === 'manual' && (
          <div>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--chrome-mid)' }} />
              <input type="text" className="input" placeholder="Search name, ID, reg no..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.25rem' }} />
            </div>

            {loading && <p style={{ color: 'var(--chrome-mid)', textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem' }}>Loading roster...</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredMembers.map(member => {
                const status = marks[member.id] as AttendanceStatus | undefined;
                const isLoading = loadingId === member.id;
                const isPresent = status === 'present' || status === 'late';
                return (
                  <div
                    key={member.id}
                    className="card"
                    style={{
                      padding: '0.875rem',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      borderColor: status ? STATUS_COLORS[status] : 'var(--chrome-dark)',
                      background: isPresent ? 'rgba(111,207,151,0.05)' : 'var(--bg-surface)',
                      transition: 'border-color 0.3s, background 0.3s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: member.photo_url ? 'transparent' : 'var(--chrome-dark)', border: '1px solid var(--chrome-dark)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--chrome-mid)', fontSize: '0.875rem', flexShrink: 0 }}>
                        {member.photo_url ? <img src={member.photo_url} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : member.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.9rem', color: status ? STATUS_COLORS[status] : 'var(--chrome-light)', transition: 'color 0.3s' }}>{member.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--chrome-mid)', fontFamily: 'var(--font-mono)' }}>{member.student_id}</div>
                      </div>
                    </div>

                    {sessionClosed ? (
                      status ? (
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: STATUS_COLORS[status] }}>{status.toUpperCase()}</span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--chrome-mid)' }}>—</span>
                      )
                    ) : status ? (
                      <button
                        onClick={() => setSheetMember(member)}
                        disabled={isLoading}
                        className="btn btn-ghost"
                        style={{ padding: '0.25rem 0.625rem', minHeight: '30px', fontSize: '0.75rem', border: `1px solid ${STATUS_COLORS[status]}`, color: STATUS_COLORS[status], display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                      >
                        {status.toUpperCase()} <ChevronDown size={12} />
                      </button>
                    ) : (
                      <button
                        onClick={() => setSheetMember(member)}
                        disabled={isLoading}
                        className="btn btn-ghost"
                        style={{ padding: '0 0.875rem', minHeight: '34px', fontSize: '0.8rem', border: '1px solid var(--chrome-dark)', opacity: isLoading ? 0.5 : 1 }}
                      >
                        {isLoading ? '...' : 'Mark'}
                      </button>
                    )}
                  </div>
                );
              })}
              {!loading && filteredMembers.length === 0 && (
                <p style={{ color: 'var(--chrome-mid)', textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem' }}>
                  {members.length === 0 ? 'No eligible members for this session.' : 'No results found.'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Status Picker Sheet ────────────────────── */}
      {sheetMember && (
        <StatusSheet
          member={sheetMember}
          currentStatus={(marks[sheetMember.id] ?? 'present') as AttendanceStatus}
          onPick={s => handleManualMark(sheetMember.id, s)}
          onClose={() => setSheetMember(null)}
        />
      )}

      {/* ── Toast ─────────────────────────────────── */}
      {toast && <Toast toast={toast} onDismiss={() => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast(null);
      }} />}
    </div>
  );
}
