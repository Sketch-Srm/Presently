import React from 'react';
import Link from 'next/link';
import { getAllDomains } from '@/lib/actions';

export default async function DomainsListPage() {
  const domains = await getAllDomains();

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
        {domains.map((domain: any) => (
          <div key={domain.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--chrome-light)' }}>{domain.name}</h3>
              <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Lead: {domain.domain_lead_id?.name || 'Unassigned'}</p>
            </div>
          </div>
        ))}
        {domains.length === 0 && (
          <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem', textAlign: 'center', marginTop: '2rem' }}>No domains found.</p>
        )}
      </div>
    </div>
  );
}
