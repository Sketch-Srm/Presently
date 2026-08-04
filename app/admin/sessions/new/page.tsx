'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSession } from '@/lib/actions';

export default function NewSessionPage() {
  const router = useRouter();
  const [scope, setScope] = useState<'club_wide' | 'domain_specific'>('club_wide');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.append('scope', scope);
      await createSession(formData);
      router.push('/admin/sessions');
    } catch (err) {
      console.error(err);
      alert('Failed to create session');
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1.25rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => router.back()} className="btn btn-ghost" style={{ padding: '0 0.5rem' }}>←</button>
        <div>
          <h1 className="text-display" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>New Session</h1>
          <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Create an event or meeting</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--chrome-mid)' }}>Session Title</label>
          <input type="text" name="title" className="input" placeholder="e.g. Design Sync" required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--chrome-mid)' }}>Type</label>
            <select name="type" className="input" required>
              <option value="meeting">Meeting</option>
              <option value="event">Event</option>
              <option value="workshop">Workshop</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--chrome-mid)' }}>Date</label>
            <input type="date" name="date" className="input" required />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--chrome-mid)' }}>Start Time</label>
            <input type="time" name="start_time" className="input" required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--chrome-mid)' }}>End Time (Optional)</label>
            <input type="time" name="end_time" className="input" />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--chrome-mid)' }}>Scope</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              type="button"
              onClick={() => setScope('club_wide')}
              className={`btn ${scope === 'club_wide' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1, border: scope !== 'club_wide' ? '1px solid var(--chrome-dark)' : 'none' }}
            >
              Club-wide
            </button>
            <button 
              type="button"
              onClick={() => setScope('domain_specific')}
              className={`btn ${scope === 'domain_specific' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1, border: scope !== 'domain_specific' ? '1px solid var(--chrome-dark)' : 'none' }}
            >
              Domains
            </button>
          </div>
        </div>

        {scope === 'domain_specific' && (
          <div className="card" style={{ padding: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--chrome-mid)' }}>Select Domains</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['Design', 'Technical', 'Events', 'Marketing'].map((d) => (
                <label key={d} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <input type="checkbox" style={{ width: '18px', height: '18px', accentColor: 'var(--accent-signal)' }} />
                  {d}
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--chrome-mid)' }}>Late Threshold (minutes past start time)</label>
          <input type="number" className="input input-mono" placeholder="15" />
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
          {loading ? 'Creating...' : 'Create Session'}
        </button>
      </form>
    </div>
  );
}
