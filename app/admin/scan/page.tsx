import React from 'react';
import Link from 'next/link';
import { getSessionWithRoster, getUpcomingSessions } from '@/lib/actions';
import { Wifi, ChevronRight } from 'lucide-react';

async function getOpenSessionsWithCounts() {
  const sessions = await getUpcomingSessions();
  // For each open session, get its roster and mark count
  const withCounts = await Promise.all(
    sessions.map(async (s: any) => {
      const data = await getSessionWithRoster(s.id);
      if (!data) return { ...s, total: 0, marked: 0 };
      const marked = (data.attendance ?? []).filter((a: any) => a.status === 'present' || a.status === 'late').length;
      return { ...s, total: (data.members ?? []).length, marked };
    })
  );
  return withCounts;
}

export default async function ScanPickerPage() {
  const sessions = await getOpenSessionsWithCounts();

  return (
    <div style={{ padding: '1.25rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-signal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wifi size={16} style={{ color: 'var(--bg-void)' }} />
          </div>
          <h1 className="text-display" style={{ fontSize: '1.5rem' }}>Take Attendance</h1>
        </div>
        <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem', paddingLeft: '3rem' }}>
          {sessions.length} open session{sessions.length !== 1 ? 's' : ''} right now
        </p>
      </header>

      {sessions.length === 0 ? (
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📭</div>
          <h2 style={{ color: 'var(--chrome-light)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>No open sessions</h2>
          <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Create a session first, then come back here to take attendance.
          </p>
          <Link href="/admin/sessions/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0 1.25rem' }}>
            + New Session
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {sessions.map((s: any) => {
            const pending = s.total - s.marked;
            const pct = s.total > 0 ? Math.round((s.marked / s.total) * 100) : 0;
            return (
              <Link
                key={s.id}
                href={`/admin/sessions/${s.id}/attendance`}
                style={{ textDecoration: 'none' }}
              >
                <div className="card" style={{ padding: '1.25rem', borderColor: 'var(--accent-signal)', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'background 0.2s' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h2 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--chrome-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, paddingRight: '0.5rem' }}>{s.title}</h2>
                      <span className="badge badge-present" style={{ flexShrink: 0, fontSize: '0.6rem' }}>LIVE</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--chrome-mid)' }}>
                        {new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        {' · '}
                        {new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="badge" style={{ fontSize: '0.6rem', borderColor: 'var(--chrome-mid)', color: 'var(--chrome-mid)' }}>
                        {s.scope === 'club_wide' ? 'CLUB-WIDE' : 'DOMAIN'}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: '4px', background: 'var(--chrome-dark)', borderRadius: '2px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent-signal)', borderRadius: '2px', transition: 'width 0.4s ease' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--accent-signal)', fontWeight: 600 }}>{s.marked} checked in</span>
                      <span style={{ color: pending > 0 ? 'var(--chrome-mid)' : 'var(--state-present)' }}>
                        {pending > 0 ? `${pending} pending` : '✓ all marked'}
                      </span>
                    </div>
                  </div>

                  <ChevronRight size={20} style={{ color: 'var(--chrome-mid)', flexShrink: 0 }} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
