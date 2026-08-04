import React from 'react';
import { LogoMark } from '@/components/logo/LogoMark';
import { getMemberProfile, getUpcomingSessions } from '@/lib/actions';
import Link from 'next/link';

export default async function MemberDashboard() {
  const profile = await getMemberProfile();
  const sessions = await getUpcomingSessions();

  return (
    <div style={{ padding: '1.25rem' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="text-display" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Welcome, {profile?.student_id || 'Member'}</h1>
          <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem', textTransform: 'capitalize' }}>
            {profile?.domain_ids?.length > 0 ? 'Domain Assigned' : 'Club'} Member
          </p>
        </div>
        <div style={{ width: '40px', height: '40px', opacity: 0.8 }}>
          <LogoMark />
        </div>
      </header>

      {/* QUICK ACTIONS FOR TESTING */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 className="text-display" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Quick Actions (Testing)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Link href="/admin/members/new" className="btn btn-ghost card" style={{ padding: '1rem', textAlign: 'center', border: '1px solid var(--accent-signal)', color: 'var(--accent-signal)', textDecoration: 'none' }}>
            + Add Member
          </Link>
          <Link href="/admin/members/register-card" className="btn btn-ghost card" style={{ padding: '1rem', textAlign: 'center', border: '1px solid var(--chrome-light)', color: 'var(--chrome-light)', textDecoration: 'none' }}>
            Register NFC Card
          </Link>
        </div>
      </section>

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
          {sessions.length === 0 ? (
            <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>No upcoming sessions.</p>
          ) : (
            sessions.map((session: any) => (
              <div key={session.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{session.title}</h4>
                    <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>
                      {new Date(session.date).toLocaleDateString()} • {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="badge" style={{ borderColor: 'var(--chrome-mid)', color: 'var(--chrome-mid)' }}>
                    {session.scope === 'club_wide' ? 'CLUB_WIDE' : 'DOMAIN'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
