import React from 'react';
import Link from 'next/link';
import { getAllSessions } from '@/lib/actions';

export default async function SessionsListPage() {
  const sessions = await getAllSessions();

  return (
    <div style={{ padding: '1.25rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-display" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Sessions</h1>
          <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Manage club events and meetings</p>
        </div>
        <Link href="/admin/sessions/new" className="btn btn-primary" style={{ padding: '0 1rem', minHeight: '36px' }}>
          + New
        </Link>
      </header>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none', marginBottom: '1rem' }}>
        <button className="badge" style={{ padding: '0.5rem 1rem', background: 'var(--chrome-light)', color: 'var(--bg-void)' }}>All</button>
        <button className="badge">Open</button>
        <button className="badge">Closed</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sessions.map((session: any) => (
          <Link href={`/admin/sessions/${session.id}/attendance`} key={session.id} style={{ textDecoration: 'none' }}>
            <div className={`card ${session.status === 'closed' ? 'opacity-50' : ''}`} style={{ borderColor: session.status === 'open' ? 'var(--accent-signal)' : 'var(--chrome-dark)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--chrome-light)' }}>{session.title}</h3>
                  <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>
                    {new Date(session.date).toLocaleDateString()} • {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {session.status === 'open' ? (
                  <span className="badge badge-present">LIVE</span>
                ) : (
                  <span className="badge" style={{ background: 'var(--chrome-dark)', borderColor: 'var(--chrome-dark)' }}>CLOSED</span>
                )}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span className="badge" style={{ borderColor: 'var(--chrome-mid)', color: 'var(--chrome-mid)' }}>
                    {session.scope === 'club_wide' ? 'CLUB-WIDE' : 'DOMAIN SPECIFIC'}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {sessions.length === 0 && (
          <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem', textAlign: 'center', marginTop: '2rem' }}>No sessions found.</p>
        )}
      </div>
    </div>
  );
}
