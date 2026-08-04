import React from 'react';
import { LogoMark } from '@/components/logo/LogoMark';
import { getMemberProfile, signOutAction } from '@/lib/actions';

export default async function ProfilePage() {
  const profile = await getMemberProfile();

  return (
    <div style={{ padding: '1.25rem' }}>
      <header style={{ marginBottom: '2.5rem', textAlign: 'center', marginTop: '2rem' }}>
        <div style={{ width: '80px', height: '80px', margin: '0 auto 1rem', borderRadius: '50%', background: 'var(--gradient-chrome)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '40px', height: '40px' }}><LogoMark /></div>
        </div>
        <h1 className="text-display" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{profile?.name || 'Member'}</h1>
        <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>{profile?.email}</p>
      </header>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--chrome-dark)' }}>
          <span style={{ color: 'var(--chrome-mid)' }}>Student ID</span>
          <span className="text-mono">{profile?.student_id}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--chrome-dark)' }}>
          <span style={{ color: 'var(--chrome-mid)' }}>Register No</span>
          <span className="text-mono">{profile?.register_no}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem' }}>
          <span style={{ color: 'var(--chrome-mid)' }}>Domains</span>
          <span style={{ textTransform: 'capitalize' }}>{profile?.domain_ids?.length > 0 ? 'Assigned' : 'None'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button className="btn btn-ghost card" style={{ padding: '1rem', display: 'flex', justifyContent: 'center', color: 'var(--chrome-light)', border: '1px solid var(--chrome-dark)' }}>
          Install App (PWA)
        </button>
        <form action={signOutAction}>
          <button type="submit" className="btn btn-ghost card" style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', color: 'var(--state-absent)', border: '1px solid rgba(232, 93, 93, 0.3)' }}>
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
