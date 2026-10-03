'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllSessions, closeSession } from '@/lib/actions';
import { Plus, Lock } from 'lucide-react';

export default function SessionsListPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [closing, setClosing] = useState<string | null>(null);

  useEffect(() => {
    getAllSessions().then(setSessions);
  }, []);

  const handleClose = async (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault(); // prevent Link navigation
    if (!confirm('Close this session? All unmarked eligible members will be marked absent.')) return;
    setClosing(sessionId);
    try {
      await closeSession(sessionId);
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'closed' } : s));
    } catch {
      alert('Failed to close session');
    } finally {
      setClosing(null);
    }
  };

  const filtered = sessions.filter(s => filter === 'all' || s.status === filter);

  return (
    <div style={{ padding: '1.25rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-display" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Sessions</h1>
          <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>{sessions.length} total</p>
        </div>
        <Link href="/admin/sessions/new" className="btn btn-primary" style={{ padding: '0 1rem', minHeight: '36px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> New
        </Link>
      </header>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {(['all', 'open', 'closed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="btn btn-ghost"
            style={{
              padding: '0.375rem 0.75rem', fontSize: '0.75rem',
              border: '1px solid',
              borderColor: filter === f ? 'var(--accent-signal)' : 'var(--chrome-dark)',
              color: filter === f ? 'var(--accent-signal)' : 'var(--chrome-mid)',
              transition: 'all 0.2s',
            }}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.map((session: any) => (
          <Link href={`/admin/sessions/${session.id}/attendance`} key={session.id} style={{ textDecoration: 'none' }}>
            <div className="card" style={{
              borderColor: session.status === 'open' ? 'var(--accent-signal)' : 'var(--chrome-dark)',
              opacity: session.status === 'closed' ? 0.7 : 1,
              transition: 'opacity 0.2s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--chrome-light)' }}>{session.title}</h3>
                  <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>
                    {new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}
                    {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                  <span className="badge" style={{ borderColor: 'var(--chrome-mid)', color: 'var(--chrome-mid)', fontSize: '0.6rem' }}>
                    {session.type.toUpperCase()}
                  </span>
                  <span className="badge" style={{ borderColor: 'var(--chrome-mid)', color: 'var(--chrome-mid)', fontSize: '0.6rem' }}>
                    {session.scope === 'club_wide' ? 'CLUB-WIDE' : 'DOMAIN'}
                  </span>
                </div>

                {session.status === 'open' && (
                  <button
                    onClick={e => handleClose(e, session.id)}
                    disabled={closing === session.id}
                    className="btn btn-ghost"
                    style={{
                      padding: '0 0.75rem', minHeight: '30px', fontSize: '0.75rem',
                      border: '1px solid rgba(232, 93, 93, 0.4)',
                      color: 'var(--state-absent)',
                      display: 'flex', alignItems: 'center', gap: '0.375rem'
                    }}
                  >
                    <Lock size={12} />
                    {closing === session.id ? 'Closing...' : 'Close'}
                  </button>
                )}
              </div>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem', textAlign: 'center', marginTop: '2rem' }}>
            No {filter !== 'all' ? filter : ''} sessions found.
          </p>
        )}
      </div>
    </div>
  );
}
