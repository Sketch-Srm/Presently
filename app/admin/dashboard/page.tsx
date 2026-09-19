import React from 'react';
import { getUpcomingSessions, getAllDomains, getAllMembers } from '@/lib/actions';
import Link from 'next/link';
import { Layers, Plus, CreditCard, Users, FileSpreadsheet } from 'lucide-react';

export default async function AdminDashboard() {
  const [sessions, domains, members] = await Promise.all([
    getUpcomingSessions(),
    getAllDomains(),
    getAllMembers()
  ]);

  return (
    <div style={{ padding: '1.25rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="text-display" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Overview</h1>
        <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Club operations & administration</p>
      </header>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '1.75rem', color: 'var(--chrome-light)' }} className="text-display">{members.length}</div>
          <div style={{ color: 'var(--chrome-mid)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Members</div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '1.75rem', color: 'var(--accent-signal)' }} className="text-display">{domains.length}</div>
          <div style={{ color: 'var(--chrome-mid)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Domains</div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '1.75rem', color: 'var(--chrome-light)' }} className="text-display">{sessions.length}</div>
          <div style={{ color: 'var(--chrome-mid)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Sessions</div>
        </div>
      </div>

      {/* Admin Actions Grid */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 className="text-display" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Admin Operations</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Link href="/admin/domains" className="btn btn-ghost card" style={{
            padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            border: '1px solid var(--accent-signal)', color: 'var(--accent-signal)', textDecoration: 'none'
          }}>
            <Layers size={22} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Manage Domains</span>
          </Link>

          <Link href="/admin/members/new" className="btn btn-ghost card" style={{
            padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            border: '1px solid var(--chrome-dark)', color: 'var(--chrome-light)', textDecoration: 'none'
          }}>
            <Plus size={22} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Add Member</span>
          </Link>

          <Link href="/admin/members/register-card" className="btn btn-ghost card" style={{
            padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            border: '1px solid var(--chrome-dark)', color: 'var(--chrome-light)', textDecoration: 'none'
          }}>
            <CreditCard size={22} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Register NFC Card</span>
          </Link>

          <Link href="/admin/members/import" className="btn btn-ghost card" style={{
            padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            border: '1px solid var(--chrome-dark)', color: 'var(--chrome-light)', textDecoration: 'none'
          }}>
            <FileSpreadsheet size={22} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Bulk CSV Import</span>
          </Link>
        </div>
      </section>

      {/* Today's Sessions */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="text-display" style={{ fontSize: '1.1rem' }}>Active & Upcoming Sessions</h2>
          <Link href="/admin/sessions/new" className="badge badge-present" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            + NEW SESSION
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sessions.length === 0 ? (
            <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem', textAlign: 'center', marginTop: '1rem' }}>No open sessions right now.</p>
          ) : (
            sessions.map((session: any) => (
              <div key={session.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>{session.title}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="badge" style={{ borderColor: 'var(--chrome-mid)', color: 'var(--chrome-mid)', fontSize: '0.6rem' }}>
                      {session.scope === 'club_wide' ? 'CLUB-WIDE' : 'DOMAIN'}
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
