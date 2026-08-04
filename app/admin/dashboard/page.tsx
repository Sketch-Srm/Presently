import React from 'react';
import { getUpcomingSessions } from '@/lib/actions';
import Link from 'next/link';

export default async function AdminDashboard() {
  const sessions = await getUpcomingSessions();

  return (
    <div style={{ padding: '1.25rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="text-display" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Overview</h1>
        <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Today's operations</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ fontSize: '2rem', color: 'var(--chrome-light)' }} className="text-display">3</div>
          <div style={{ color: 'var(--chrome-mid)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Sessions Today</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '2rem', color: 'var(--state-absent)' }} className="text-display">12</div>
          <div style={{ color: 'var(--chrome-mid)', fontSize: '0.75rem', textTransform: 'uppercase' }}>At Risk (&lt;75%)</div>
        </div>
      </div>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="text-display" style={{ fontSize: '1.25rem' }}>Today's Sessions</h2>
          <span className="badge badge-present">LIVE</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sessions.length === 0 ? (
            <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>No upcoming sessions.</p>
          ) : (
            sessions.map((session: any) => (
              <div key={session.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{session.title}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="badge" style={{ borderColor: 'var(--chrome-mid)', color: 'var(--chrome-mid)' }}>
                      {session.scope === 'club_wide' ? 'CLUB_WIDE' : 'DOMAIN'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--chrome-mid)' }}>
                      {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <Link href={`/admin/sessions/${session.id}/attendance`} className="btn btn-primary" style={{ minHeight: '36px', padding: '0 1rem', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                  Take
                </Link>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
