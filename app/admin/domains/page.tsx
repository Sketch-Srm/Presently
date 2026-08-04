import React from 'react';
import Link from 'next/link';

export default function DomainsListPage() {
  return (
    <div style={{ padding: '1.25rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-display" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Domains</h1>
          <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Club sub-teams</p>
        </div>
        <button className="btn btn-primary" style={{ padding: '0 1rem' }}>
          +
        </button>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {['Design', 'Technical', 'Events', 'Marketing'].map((domain, i) => (
          <div key={domain} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--chrome-light)' }}>{domain}</h3>
              <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Lead: Jane Doe {i + 1}</p>
            </div>
            <div className="text-display" style={{ fontSize: '1.5rem', color: 'var(--chrome-mid)' }}>
              {12 + i * 4} <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-body)', fontWeight: 400, textTransform: 'uppercase' }}>Members</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
