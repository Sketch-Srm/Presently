'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/admin/members');
    }, 1000);
  };

  return (
    <div style={{ padding: '1.25rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => router.back()} className="btn btn-ghost" style={{ padding: '0 0.5rem' }}>←</button>
        <div>
          <h1 className="text-display" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Add Member</h1>
          <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Enter member details</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--chrome-mid)' }}>Full Name</label>
          <input type="text" className="input" placeholder="Jane Doe" required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--chrome-mid)' }}>Student ID</label>
            <input type="text" className="input input-mono" placeholder="jd1234" required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--chrome-mid)' }}>Register No</label>
            <input type="text" className="input input-mono" placeholder="RA2111..." required />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--chrome-mid)' }}>Email (SRMIST)</label>
          <input type="email" className="input" placeholder="jd1234@srmist.edu.in" required />
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--chrome-mid)' }}>Assign Domains</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {['Design', 'Technical', 'Events', 'Marketing'].map((d) => (
              <label key={d} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                <input type="checkbox" style={{ width: '18px', height: '18px', accentColor: 'var(--accent-signal)' }} />
                {d}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--chrome-mid)' }}>Role</label>
          <select className="input" required>
            <option value="member">Member</option>
            <option value="domain_lead">Domain Lead</option>
            <option value="club_admin">Club Admin</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
          {loading ? 'Saving...' : 'Add Member'}
        </button>
      </form>
    </div>
  );
}
