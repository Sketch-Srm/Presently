import React from 'react';
import Link from 'next/link';

export default function SessionsListPage() {
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
        {/* Session Card - Live */}
        <Link href="/admin/sessions/1/attendance" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ borderColor: 'var(--accent-signal)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--chrome-light)' }}>Design Sync 1</h3>
                <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Sept 24 • 2:00 PM</p>
              </div>
              <span className="badge badge-present">LIVE</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="badge" style={{ borderColor: 'var(--chrome-mid)', color: 'var(--chrome-mid)' }}>DESIGN</span>
              </div>
              <div className="text-mono" style={{ fontSize: '0.875rem', color: 'var(--chrome-mid)' }}>
                14 / 20
              </div>
            </div>
          </div>
        </Link>

        {/* Session Card - Closed */}
        <Link href="/admin/reports/session/2" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ opacity: 0.7 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--chrome-light)' }}>General Assembly</h3>
                <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Sept 18 • 5:00 PM</p>
              </div>
              <span className="badge" style={{ background: 'var(--chrome-dark)', borderColor: 'var(--chrome-dark)' }}>CLOSED</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="badge" style={{ borderColor: 'var(--chrome-mid)', color: 'var(--chrome-mid)' }}>CLUB_WIDE</span>
              </div>
              <div className="text-mono" style={{ fontSize: '0.875rem', color: 'var(--chrome-mid)' }}>
                112 / 120
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
