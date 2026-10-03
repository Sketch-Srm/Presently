'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { bulkImportMembers } from '@/lib/actions';
import { Upload, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const EXPECTED_COLUMNS = ['name', 'student_id', 'register_no', 'regular_email', 'email', 'role'];

export default function ImportMembersPage() {
  const router = useRouter();
  const [preview, setPreview] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ inserted: number } | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) { setErrors(['CSV must have a header row and at least one data row.']); return; }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
      const missingHeaders = EXPECTED_COLUMNS.filter(c => !headers.includes(c));
      if (missingHeaders.length > 0) {
        setErrors([`Missing required columns: ${missingHeaders.join(', ')}`]);
        return;
      }
      
      const rows = lines.slice(1).map((line, i) => {
        const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const row: any = {};
        headers.forEach((h, idx) => { row[h] = vals[idx] || ''; });
        return row;
      });

      const errs: string[] = [];
      rows.forEach((row, i) => {
        if (!row.name) errs.push(`Row ${i + 2}: Missing name`);
        if (!row.student_id) errs.push(`Row ${i + 2}: Missing student_id`);
        if (!row.register_no) errs.push(`Row ${i + 2}: Missing register_no`);
        if (!row.regular_email && !row.email) errs.push(`Row ${i + 2}: At least one email required`);
      });

      setErrors(errs);
      setPreview(rows.map(r => ({
        ...r,
        role: r.role || 'member',
        email: r.email || null,
        regular_email: r.regular_email || null,
      })));
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (errors.length > 0) { alert('Fix errors before importing'); return; }
    setImporting(true);
    try {
      const res = await bulkImportMembers(preview);
      setResult(res);
    } catch (err: any) {
      alert('Import failed: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div style={{ padding: '1.25rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => router.back()} className="btn btn-ghost" style={{ padding: '0 0.5rem' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-display" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Bulk Import</h1>
          <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Upload a CSV to add many members at once</p>
        </div>
      </header>

      {result ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <CheckCircle size={48} style={{ color: 'var(--state-present)', marginBottom: '1rem' }} />
          <div className="text-display" style={{ fontSize: '2rem', color: 'var(--state-present)' }}>{result.inserted}</div>
          <p style={{ color: 'var(--chrome-mid)' }}>Members imported successfully!</p>
          <button onClick={() => router.push('/admin/members')} className="btn btn-primary" style={{ marginTop: '1.5rem', padding: '0 2rem' }}>
            View Members
          </button>
        </div>
      ) : (
        <>
          {/* Instructions */}
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', borderColor: 'var(--chrome-mid)' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--chrome-mid)', marginBottom: '0.75rem' }}>CSV must have these columns (in any order):</p>
            <code style={{ fontSize: '0.75rem', color: 'var(--accent-signal)', fontFamily: 'var(--font-mono)' }}>
              name, student_id, register_no, regular_email, email, role
            </code>
            <p style={{ fontSize: '0.75rem', color: 'var(--chrome-mid)', marginTop: '0.5rem' }}>
              <strong>role</strong> defaults to "member" if not set. <strong>email</strong> and <strong>regular_email</strong> are optional but at least one is needed.
            </p>
          </div>

          {/* File Upload */}
          <label className="card" style={{
            padding: '2rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '1rem', cursor: 'pointer',
            border: '2px dashed var(--chrome-dark)', textAlign: 'center'
          }}>
            <Upload size={32} style={{ color: 'var(--chrome-mid)' }} />
            <div>
              <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Click to upload CSV</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--chrome-mid)' }}>or drag and drop</div>
            </div>
            <input type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} />
          </label>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', border: '1px solid rgba(232, 93, 93, 0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <AlertCircle size={16} style={{ color: 'var(--state-absent)' }} />
                <span style={{ color: 'var(--state-absent)', fontWeight: 600, fontSize: '0.875rem' }}>{errors.length} Error(s)</span>
              </div>
              {errors.map((err, i) => (
                <div key={i} style={{ fontSize: '0.8rem', color: 'var(--state-absent)', marginBottom: '0.25rem' }}>{err}</div>
              ))}
            </div>
          )}

          {/* Preview Table */}
          {preview.length > 0 && (
            <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 className="text-display" style={{ fontSize: '1rem' }}>Preview ({preview.length} rows)</h2>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                  <thead>
                    <tr>
                      {['name', 'student_id', 'register_no', 'regular_email', 'role'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--chrome-mid)', borderBottom: '1px solid var(--chrome-dark)', whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 5).map((row, i) => (
                      <tr key={i}>
                        {['name', 'student_id', 'register_no', 'regular_email', 'role'].map(h => (
                          <td key={h} style={{ padding: '0.5rem', color: 'var(--chrome-light)', borderBottom: '1px solid var(--chrome-dark)', fontFamily: h === 'student_id' ? 'var(--font-mono)' : 'inherit' }}>
                            {row[h] || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 5 && (
                  <p style={{ color: 'var(--chrome-mid)', fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center' }}>
                    + {preview.length - 5} more rows
                  </p>
                )}
              </div>
            </div>
          )}

          {preview.length > 0 && errors.length === 0 && (
            <button onClick={handleImport} disabled={importing} className="btn btn-primary" style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              <Upload size={16} />
              {importing ? 'Importing...' : `Import ${preview.length} Members`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
