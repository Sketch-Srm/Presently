import React from 'react';
import { redirect } from 'next/navigation';
import { getMemberSessionDetail } from '@/lib/actions';
import { NfcCheckIn } from './NfcCheckIn';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const STATUS_STYLES: Record<string, { color: string; label: string }> = {
  present:  { color: 'var(--state-present)', label: "You're Checked In" },
  late:     { color: 'var(--state-late)',    label: 'Marked Late' },
  absent:   { color: 'var(--state-absent)',  label: 'Marked Absent' },
  excused:  { color: 'var(--accent-signal)', label: 'Excused' },
};

export default async function MemberSessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;
  const data = await getMemberSessionDetail(sessionId);

  if (!data) redirect('/sessions');

  const { session, attendanceRecord, memberId } = data;

  const sessionTime = new Date(session.start_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const sessionDate = new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const isOpen = session.status === 'open';
  const markStyle = attendanceRecord ? STATUS_STYLES[attendanceRecord.status] : null;

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: '100px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <Link href="/sessions" className="btn btn-ghost" style={{ padding: '0', minWidth: '40px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={20} />
        </Link>
        <span className={`badge ${isOpen ? 'badge-present' : ''}`} style={{ borderColor: isOpen ? undefined : 'var(--chrome-dark)', color: isOpen ? undefined : 'var(--chrome-mid)' }}>
          {isOpen ? 'LIVE NOW' : 'CLOSED'}
        </span>
      </header>

      {/* Session Info */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 className="text-display" style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--chrome-light)' }}>{session.title}</h1>
        <p style={{ color: 'var(--chrome-mid)', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
          {sessionDate} · {sessionTime}
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <span className="badge" style={{ borderColor: 'var(--chrome-mid)', color: 'var(--chrome-mid)', fontSize: '0.65rem' }}>
            {session.type?.toUpperCase()}
          </span>
          <span className="badge" style={{ borderColor: 'var(--chrome-mid)', color: 'var(--chrome-mid)', fontSize: '0.65rem' }}>
            {session.scope === 'club_wide' ? 'CLUB-WIDE' : 'DOMAIN'}
          </span>
        </div>
      </div>

      {/* Status / Check-in area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {markStyle ? (
          /* Already have an attendance record */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'slideUp 0.5s ease' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: `${markStyle.color}22`, border: `2px solid ${markStyle.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1.5rem' }}>
              {attendanceRecord!.status === 'present' || attendanceRecord!.status === 'late' ? '✓' : '×'}
            </div>
            <h2 className="text-display" style={{ color: markStyle.color, fontSize: '1.5rem', marginBottom: '0.5rem' }}>{markStyle.label}</h2>
            {attendanceRecord!.timestamp && (
              <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>
                {new Date(attendanceRecord!.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} via {attendanceRecord!.method}
              </p>
            )}
          </div>
        ) : isOpen ? (
          /* Session is open, not yet marked — show NFC check-in */
          <NfcCheckIn sessionId={sessionId} memberId={memberId} />
        ) : (
          /* Session closed, no record */
          <div className="card" style={{ textAlign: 'center', padding: '2rem', maxWidth: '280px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--chrome-light)' }}>Session Closed</h3>
            <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>
              This session has ended. No attendance record was found for you.
            </p>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}} />
    </div>
  );
}
