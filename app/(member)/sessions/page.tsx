import React from 'react';
import Link from 'next/link';
import { getMemberSessionsWithAttendance } from '@/lib/actions';

const STATUS_STYLES: Record<string, { color: string; label: string }> = {
  present:  { color: 'var(--state-present)', label: 'PRESENT' },
  late:     { color: 'var(--state-late)',    label: 'LATE' },
  absent:   { color: 'var(--state-absent)',  label: 'ABSENT' },
  excused:  { color: 'var(--accent-signal)', label: 'EXCUSED' },
};

export default async function MemberSessionsPage() {
  const data = await getMemberSessionsWithAttendance();

  if (!data) {
    return (
      <div style={{ padding: '1.25rem', textAlign: 'center', paddingTop: '4rem' }}>
        <p style={{ color: 'var(--chrome-mid)' }}>Unable to load sessions.</p>
      </div>
    );
  }

  const { stats, sessions } = data;
  const upcoming = sessions.filter((s: any) => s.status === 'open');
  const past     = sessions.filter((s: any) => s.status !== 'open');

  return (
    <div style={{ padding: '1.25rem' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 className="text-display" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Sessions</h1>
        <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Your attendance history</p>
      </header>

      {/* ── Stats Strip ────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Eligible', value: stats.eligible, color: 'var(--chrome-light)' },
          { label: 'Attended', value: stats.attended, color: 'var(--state-present)' },
          { label: 'Missed',   value: stats.missed,   color: 'var(--state-absent)' },
          { label: 'Rate',     value: `${stats.rate}%`, color: stats.rate >= 75 ? 'var(--state-present)' : stats.rate >= 50 ? 'var(--state-late)' : 'var(--state-absent)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: '0.875rem 0.5rem', textAlign: 'center' }}>
            <div className="text-display" style={{ fontSize: '1.5rem', color, lineHeight: 1, marginBottom: '0.25rem' }}>{value}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--chrome-mid)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
          </div>
        ))}
      </div>

      {sessions.length === 0 ? (
        <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem', textAlign: 'center', marginTop: '2rem' }}>
          No sessions found for your domains yet.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* ── Open / Live ─────────────────────────── */}
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-display" style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--chrome-light)' }}>Live Now</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {upcoming.map((session: any) => (
                  <Link key={session.id} href={`/sessions/${session.id}`} style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ borderColor: 'var(--accent-signal)', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--chrome-light)', flex: 1, paddingRight: '0.5rem' }}>{session.title}</h3>
                        <span className="badge badge-present" style={{ fontSize: '0.6rem', flexShrink: 0 }}>LIVE</span>
                      </div>
                      <p style={{ color: 'var(--chrome-mid)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                        {new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        {' · '}
                        {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge" style={{ fontSize: '0.6rem', borderColor: 'var(--chrome-mid)', color: 'var(--chrome-mid)' }}>
                          {session.scope === 'club_wide' ? 'CLUB-WIDE' : 'DOMAIN'}
                        </span>
                        {session.attendanceRecord ? (
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: STATUS_STYLES[session.attendanceRecord.status]?.color }}>
                            {STATUS_STYLES[session.attendanceRecord.status]?.label}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--accent-signal)', fontWeight: 600 }}>Tap to check in →</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── Past Sessions ─────────────────────────── */}
          {past.length > 0 && (
            <section>
              <h2 className="text-display" style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--chrome-mid)' }}>Past Sessions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {past.map((session: any) => {
                  const mark = session.attendanceRecord;
                  const style = mark ? STATUS_STYLES[mark.status] : null;
                  return (
                    <div key={session.id} className="card" style={{ padding: '1rem', opacity: mark?.status === 'absent' ? 0.75 : 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--chrome-light)', flex: 1, paddingRight: '0.5rem' }}>{session.title}</h3>
                        {style ? (
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: style.color, flexShrink: 0 }}>{style.label}</span>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: 'var(--chrome-mid)', flexShrink: 0 }}>—</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--chrome-mid)' }}>
                          {new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="badge" style={{ fontSize: '0.6rem', borderColor: 'var(--chrome-dark)', color: 'var(--chrome-mid)' }}>
                          {session.type?.toUpperCase()}
                        </span>
                        <span className="badge" style={{ fontSize: '0.6rem', borderColor: 'var(--chrome-dark)', color: 'var(--chrome-mid)' }}>
                          {session.scope === 'club_wide' ? 'CLUB-WIDE' : 'DOMAIN'}
                        </span>
                        {mark?.method && (
                          <span style={{ fontSize: '0.65rem', color: 'var(--chrome-mid)' }}>via {mark.method}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
}
