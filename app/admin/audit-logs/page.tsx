'use client';

import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '@/lib/actions';
import { ShieldAlert } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getAuditLogs();
      setLogs(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div style={{ padding: '1.25rem' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <ShieldAlert size={24} style={{ color: 'var(--accent-signal)' }} />
        <div>
          <h1 className="text-display" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Audit Logs</h1>
          <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>View recent administrative actions</p>
        </div>
      </header>

      {loading ? (
        <p style={{ color: 'var(--chrome-mid)', textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem' }}>Loading logs...</p>
      ) : logs.length === 0 ? (
        <p style={{ color: 'var(--chrome-mid)', textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem' }}>
          No audit logs found. Ensure you have run the audit_logs SQL migration.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {logs.map((log: any) => (
            <div key={log.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: 'var(--chrome-light)', fontSize: '0.875rem' }}>
                  {log.action}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--chrome-mid)', fontFamily: 'var(--font-mono)' }}>
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
              
              <div style={{ fontSize: '0.875rem', color: 'var(--chrome-mid)' }}>
                <strong>Actor:</strong> {log.actor_email}
              </div>
              
              {log.details && Object.keys(log.details).length > 0 && (
                <div style={{ 
                  background: 'rgba(0,0,0,0.2)', 
                  padding: '0.75rem', 
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--chrome-mid)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}>
                  {JSON.stringify(log.details, null, 2)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
