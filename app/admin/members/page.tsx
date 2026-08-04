import React from 'react';
import Link from 'next/link';

export default function MembersListPage() {
  return (
    <div style={{ padding: '1.25rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="text-display" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Members</h1>
          <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Manage club roster</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/admin/members/register-card" className="btn btn-ghost" style={{ padding: '0 0.75rem', border: '1px solid var(--chrome-dark)' }}>
            NFC
          </Link>
          <Link href="/admin/members/new" className="btn btn-primary" style={{ padding: '0 1rem' }}>
            +
          </Link>
        </div>
      </header>

      <div style={{ marginBottom: '1.5rem' }}>
        <input type="text" className="input" placeholder="Search name or ID..." />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[1, 2, 3].map((i) => (
          <Link href={`/admin/members/${i}`} key={i} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gradient-chrome)', border: '1px solid var(--chrome-dark)' }} />
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--chrome-light)' }}>Jane Doe {i}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--chrome-mid)', fontFamily: 'var(--font-mono)' }}>jd500{i}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                <span className="badge" style={{ borderColor: 'var(--chrome-mid)', color: 'var(--chrome-mid)', fontSize: '0.65rem' }}>DESIGN</span>
                {i === 1 && <span className="badge badge-present" style={{ fontSize: '0.65rem' }}>LEAD</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
