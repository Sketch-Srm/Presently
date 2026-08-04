import React from 'react';
import Link from 'next/link';
import { getAllSessions } from '@/lib/actions';

export default async function MemberSessionsPage() {
  const sessions = await getAllSessions();
  
  const now = new Date();
  const upcoming = sessions.filter((s: any) => new Date(s.date) >= now || s.status === 'open');
  const past = sessions.filter((s: any) => new Date(s.date) < now && s.status !== 'open');

  return (
    <div style={{ padding: '1.25rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="text-display" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Sessions</h1>
        <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Your upcoming and past events</p>
      </header>

      {sessions.length === 0 ? (
        <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem', textAlign: 'center', marginTop: '2rem' }}>
          No sessions found.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-display" style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--chrome-light)' }}>Upcoming & Live</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {upcoming.map((session: any) => (
                  <div key={session.id} className="card" style={{ borderColor: session.status === 'open' ? 'var(--accent-signal)' : 'var(--chrome-dark)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--chrome-light)' }}>{session.title}</h3>
                        <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>
                          {new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' · '}
                          {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {session.status === 'open' && (
                        <span className="badge badge-present">LIVE</span>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span className="badge" style={{ borderColor: 'var(--chrome-mid)', color: 'var(--chrome-mid)' }}>
                          {session.scope === 'club_wide' ? 'CLUB-WIDE' : 'DOMAIN'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-display" style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--chrome-mid)' }}>Past Sessions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {past.map((session: any) => (
                  <div key={session.id} className="card" style={{ opacity: 0.7 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--chrome-light)' }}>{session.title}</h3>
                        <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>
                          {new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <span className="badge" style={{ background: 'var(--chrome-dark)', borderColor: 'var(--chrome-dark)' }}>CLOSED</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
