import React from 'react';
import { getReportsData, getAllMembers } from '@/lib/actions';
import { ExportButton } from '@/components/ExportButton';

export default async function ReportsPage() {
  const data = await getReportsData();
  const allMembers = await getAllMembers();
  
  // Format data for export
  const exportData = allMembers.map(m => ({
    Name: m.name,
    Email: m.email || m.regular_email,
    Student_ID: m.student_id,
    Register_No: m.register_no,
    Role: m.role,
    Status: m.status
  }));
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
          <ExportButton 
            label="Club-wide Report" 
            filename="presently_club_wide_members.csv" 
            data={exportData} 
          />
          <ExportButton 
            label="Active Members Only" 
            filename="presently_active_members.csv" 
            data={exportData.filter(m => m.Status === 'active')} 
          />
        </div>
      </section>

      <section>
        <h2 className="text-display" style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--state-absent)' }}>At-Risk Members</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {data.atRiskMembers.length === 0 ? (
            <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>No at-risk members found.</p>
          ) : (
            data.atRiskMembers.map((member: any) => (
              <div key={member.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(232, 93, 93, 0.3)' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{member.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--chrome-mid)' }}>{member.domain} • {member.student_id}</div>
                </div>
                <div className="text-display" style={{ color: 'var(--state-absent)', fontSize: '1.5rem' }}>
                  {member.attendanceRate}%
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
