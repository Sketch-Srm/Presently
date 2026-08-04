import React from 'react';
import { LogoMark } from '@/components/logo/LogoMark';

export default function MemberDashboard() {
  return (
    <div style={{ padding: '1.25rem' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="text-display" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Welcome, md5822</h1>
          <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Design & Technical Domains</p>
        </div>
        <div style={{ width: '40px', height: '40px', opacity: 0.8 }}>
          <LogoMark />
        </div>
      </header>

      {/* Attendance Summary */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1.25rem' }}>
          <h2 style={{ fontSize: '0.875rem', color: 'var(--chrome-mid)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            Overall Attendance
          </h2>
          <div className="text-display" style={{ fontSize: '4rem', color: 'var(--chrome-light)', lineHeight: 1, textShadow: '0 0 20px rgba(232, 232, 234, 0.2)' }}>
            85<span style={{ fontSize: '2rem', color: 'var(--chrome-mid)' }}>%</span>
          </div>
          
          <div style={{ width: '100%', height: '8px', background: 'var(--chrome-dark)', borderRadius: '4px', marginTop: '2rem', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '85%', background: 'var(--accent-signal)', borderRadius: '4px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--chrome-mid)' }}>
            <span>17 Present</span>
            <span>3 Missed</span>
          </div>
        </div>
      </section>

      {/* Upcoming Sessions */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="text-display" style={{ fontSize: '1.25rem' }}>Upcoming</h3>
          <a href="/sessions" style={{ fontSize: '0.875rem', color: 'var(--accent-signal)', textDecoration: 'none' }}>View All</a>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h4 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>UI Review Sync</h4>
                <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Tomorrow • 4:00 PM</p>
              </div>
              <span className="badge" style={{ borderColor: 'var(--chrome-mid)', color: 'var(--chrome-mid)' }}>DESIGN</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
