import React from 'react';
import { LogoMark } from '@/components/logo/LogoMark';
import { getMemberProfile, getUpcomingSessions, getMemberAttendance } from '@/lib/actions';
import Link from 'next/link';

export default async function MemberDashboard() {
  const profile = await getMemberProfile();
  const sessions = await getUpcomingSessions();
  const attendanceHistory = profile ? await getMemberAttendance(profile.id) : [];

  const presentCount = attendanceHistory.filter((a: any) => a.status === 'present' || a.status === 'late').length;
  const totalCount = attendanceHistory.length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : null;

  const eligibleSessions = sessions.filter((s: any) => {
    if (s.scope === 'club_wide') return true;
    if (!s.target_domain_ids?.length) return false;
    return (profile?.domain_ids ?? []).some((d: string) => s.target_domain_ids.includes(d));
  });

  return (
    <div style={{ padding: '1.25rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--chrome-mid)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Welcome back</p>
          <h1 className="text-display" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{profile?.name || 'Member'}</h1>
          <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem', fontFamily: 'var(--font-mono)' }}>
            {profile?.student_id || '—'}
          </p>
        </div>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          border: '2px solid var(--chrome-dark)',
          overflow: 'hidden', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-surface)'
        }}>
          {profile?.photo_url
            ? <img src={profile.photo_url} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <LogoMark style={{ width: '28px', height: '28px', opacity: 0.6 }} />
          }
        </div>
      </header>

      {/* Attendance Summary */}
      <section style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1.25rem' }}>
          <h2 style={{ fontSize: '0.75rem', color: 'var(--chrome-mid)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
            My Attendance
          </h2>
          {attendanceRate !== null ? (
            <>
              <div className="text-display" style={{
                fontSize: '4rem', lineHeight: 1,
                color: attendanceRate >= 75 ? 'var(--state-present)' : 'var(--state-absent)',
                textShadow: attendanceRate >= 75 ? '0 0 20px rgba(111, 207, 151, 0.2)' : '0 0 20px rgba(232, 93, 93, 0.2)'
              }}>
                {attendanceRate}<span style={{ fontSize: '2rem', color: 'var(--chrome-mid)' }}>%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--chrome-dark)', borderRadius: '3px', marginTop: '1.5rem', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '3px', transition: 'width 0.5s',
                  width: `${attendanceRate}%`,
                  background: attendanceRate >= 75 ? 'var(--state-present)' : 'var(--state-absent)'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--chrome-mid)' }}>
                <span>{presentCount} Present</span>
                <span>{totalCount - presentCount} Missed</span>
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>No attendance records yet.</p>
          )}
        </div>
      </section>

      {/* Attendance History */}
      {attendanceHistory.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="text-display" style={{ fontSize: '1rem' }}>Recent Sessions</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {attendanceHistory.slice(0, 5).map((a: any) => (
              <div key={a.id} className="card" style={{ padding: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--chrome-light)' }}>{a.sessions?.title || 'Session'}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--chrome-mid)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>{a.sessions?.date}</div>
                </div>
                <span className={`badge ${a.status === 'present' || a.status === 'late' ? 'badge-present' : 'badge-absent'}`} style={{ fontSize: '0.6rem' }}>
                  {a.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Sessions */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="text-display" style={{ fontSize: '1rem' }}>Upcoming</h3>
          <Link href="/sessions" style={{ fontSize: '0.8rem', color: 'var(--accent-signal)', textDecoration: 'none' }}>View All</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {eligibleSessions.length === 0 ? (
            <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>No upcoming sessions.</p>
          ) : (
            eligibleSessions.map((session: any) => (
              <div key={session.id} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>{session.title}</h4>
                    <p style={{ color: 'var(--chrome-mid)', fontSize: '0.8rem' }}>
                      {new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      {' · '}
                      {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="badge badge-present" style={{ fontSize: '0.6rem' }}>LIVE</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
