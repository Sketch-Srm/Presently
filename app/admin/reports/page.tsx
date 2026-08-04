import React from 'react';
import { getReportsData } from '@/lib/actions';

export default async function ReportsPage() {
  const data = await getReportsData();
  return (
    <div style={{ padding: '1.25rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="text-display" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Reports</h1>
        <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Analytics and exports</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ fontSize: '2rem', color: 'var(--chrome-light)' }} className="text-display">{data.avgAttendance}<span style={{ fontSize: '1rem', color: 'var(--chrome-mid)' }}>%</span></div>
          <div style={{ color: 'var(--chrome-mid)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Avg Attendance</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '2rem', color: 'var(--chrome-light)' }} className="text-display">{data.memberCount}</div>
          <div style={{ color: 'var(--chrome-mid)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Total Members</div>
        </div>
      </div>

      <section style={{ marginBottom: '2rem' }}>
        <h2 className="text-display" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Export Data (CSV)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button className="btn btn-ghost card" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--chrome-dark)' }}>
            <span style={{ fontWeight: 500 }}>Club-wide Report</span>
            <span style={{ color: 'var(--accent-signal)' }}>↓</span>
          </button>
          <button className="btn btn-ghost card" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--chrome-dark)' }}>
            <span style={{ fontWeight: 500 }}>Technical Domain</span>
            <span style={{ color: 'var(--accent-signal)' }}>↓</span>
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-display" style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--state-absent)' }}>At-Risk Members</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2].map((i) => (
            <div key={i} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(232, 93, 93, 0.3)' }}>
              <div>
                <div style={{ fontWeight: 500 }}>At Risk Member {i}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--chrome-mid)' }}>Technical • md500{i}</div>
              </div>
              <div className="text-display" style={{ color: 'var(--state-absent)', fontSize: '1.5rem' }}>
                6{i}%
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
