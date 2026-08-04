import React from 'react';
import Link from 'next/link';

export default function MemberSessionsPage() {
  return (
    <div style={{ padding: '1.25rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="text-display" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Sessions</h1>
        <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Your upcoming and past events</p>
      </header>

      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none', marginBottom: '1rem' }}>
        <button className="badge" style={{ padding: '0.5rem 1rem', background: 'var(--chrome-light)', color: 'var(--bg-void)' }}>Upcoming</button>
        <button className="badge">Past</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Link href="/member/sessions/1" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ borderColor: 'var(--accent-signal)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--chrome-light)' }}>UI Review Sync</h3>
                <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Tomorrow • 4:00 PM</p>
              </div>
              <span className="badge badge-present">LIVE</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="badge" style={{ borderColor: 'var(--chrome-mid)', color: 'var(--chrome-mid)' }}>DESIGN</span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--chrome-mid)' }}>
                Tap to check in →
              </div>
            </div>
          </div>
        </Link>
        
        <Link href="/member/sessions/2" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ opacity: 0.7 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--chrome-light)' }}>General Assembly</h3>
                <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Sept 18 • 5:00 PM</p>
              </div>
              <span className="badge badge-present" style={{ background: 'transparent', borderColor: 'var(--state-present)', color: 'var(--state-present)' }}>ATTENDED</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
