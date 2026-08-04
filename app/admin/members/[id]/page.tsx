'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAllMembers, getMemberAttendance, updateMember, updateMemberPhoto } from '@/lib/actions';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Pencil, Save, X, Upload } from 'lucide-react';

export default function MemberDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [member, setMember] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    (async () => {
      const { getMemberById } = await import('@/lib/actions');
      const m = await getMemberById(params.id);
      if (m) {
        setMember(m);
        setForm({
          name: m.name,
          student_id: m.student_id,
          register_no: m.register_no,
          email: m.email,
          regular_email: m.regular_email,
          phone: m.phone,
          role: m.role,
          status: m.status,
        });
        const hist = await getMemberAttendance(m.id);
        setAttendance(hist);
      }
    })();
  }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMember(params.id, form);
      setMember((prev: any) => ({ ...prev, ...form }));
      setEditing(false);
    } catch {
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const path = `${params.id}.${ext}`;
      const { error } = await supabase.storage.from('member-photos').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('member-photos').getPublicUrl(path);
      await updateMemberPhoto(params.id, publicUrl);
      setMember((prev: any) => ({ ...prev, photo_url: publicUrl }));
    } catch {
      alert('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const presentCount = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : null;

  if (!member) {
    return (
      <div style={{ padding: '1.25rem', textAlign: 'center', paddingTop: '4rem' }}>
        <p style={{ color: 'var(--chrome-mid)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.25rem' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => router.back()} className="btn btn-ghost" style={{ padding: '0 0.5rem' }}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-display" style={{ fontSize: '1.25rem', flex: 1 }}>Member Detail</h1>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--chrome-dark)', padding: '0 0.75rem', minHeight: '36px' }}>
            <Pencil size={14} /> Edit
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setEditing(false)} className="btn btn-ghost" style={{ padding: '0 0.75rem', minHeight: '36px' }}>
              <X size={16} />
            </button>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 0.75rem', minHeight: '36px' }}>
              <Save size={14} /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </header>

      {/* Avatar + Quick Stats */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: member.photo_url ? 'transparent' : 'var(--gradient-chrome)',
            border: '2px solid var(--chrome-dark)',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', color: 'var(--chrome-mid)'
          }}>
            {member.photo_url
              ? <img src={member.photo_url} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : member.name?.charAt(0).toUpperCase()
            }
          </div>
          <label style={{
            position: 'absolute', bottom: -4, right: -4,
            width: '24px', height: '24px', borderRadius: '50%',
            background: 'var(--accent-signal)', color: 'var(--bg-void)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', border: '2px solid var(--bg-surface)'
          }}>
            {uploading ? '...' : <Upload size={10} />}
            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
          </label>
        </div>
        <div style={{ flex: 1 }}>
          <div className="text-display" style={{ fontSize: '1.25rem' }}>{member.name}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--chrome-mid)' }}>{member.student_id}</div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <span className={`badge ${member.role === 'super_admin' ? 'badge-present' : ''}`} style={{ fontSize: '0.6rem' }}>{member.role.replace('_', ' ').toUpperCase()}</span>
            <span className={`badge ${member.status === 'active' ? 'badge-present' : 'badge-absent'}`} style={{ fontSize: '0.6rem' }}>{member.status.toUpperCase()}</span>
          </div>
        </div>
        {attendanceRate !== null && (
          <div style={{ textAlign: 'center' }}>
            <div className="text-display" style={{ fontSize: '2rem', color: attendanceRate >= 75 ? 'var(--state-present)' : 'var(--state-absent)' }}>
              {attendanceRate}%
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--chrome-mid)', textTransform: 'uppercase' }}>Attendance</div>
          </div>
        )}
      </div>

      {/* Edit / View Fields */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <h2 className="text-display" style={{ fontSize: '1rem', marginBottom: '1rem' }}>Details</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { label: 'Full Name', key: 'name', type: 'text' },
            { label: 'Student ID', key: 'student_id', type: 'text' },
            { label: 'Register No', key: 'register_no', type: 'text' },
            { label: 'Personal Email', key: 'regular_email', type: 'email' },
            { label: 'SRMIST Email', key: 'email', type: 'email' },
            { label: 'Phone', key: 'phone', type: 'tel' },
          ].map(({ label, key, type }) => (
            <div key={key} style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--chrome-mid)' }}>{label}</span>
              {editing ? (
                <input
                  type={type}
                  className="input"
                  value={form[key] || ''}
                  onChange={e => setForm((prev: any) => ({ ...prev, [key]: e.target.value }))}
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                />
              ) : (
                <span style={{ fontFamily: key.includes('id') || key.includes('no') ? 'var(--font-mono)' : 'inherit', fontSize: '0.875rem', color: member[key] ? 'var(--chrome-light)' : 'var(--chrome-mid)' }}>
                  {member[key] || '—'}
                </span>
              )}
            </div>
          ))}

          {editing && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--chrome-mid)' }}>Role</span>
                <select className="input" value={form.role} onChange={e => setForm((p: any) => ({ ...p, role: e.target.value }))} style={{ padding: '0.5rem', fontSize: '0.875rem' }}>
                  <option value="member">Member</option>
                  <option value="domain_lead">Domain Lead</option>
                  <option value="club_admin">Club Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--chrome-mid)' }}>Status</span>
                <select className="input" value={form.status} onChange={e => setForm((p: any) => ({ ...p, status: e.target.value }))} style={{ padding: '0.5rem', fontSize: '0.875rem' }}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="alumni">Alumni</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Attendance History */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h2 className="text-display" style={{ fontSize: '1rem', marginBottom: '1rem' }}>Attendance History</h2>
        {attendance.length === 0 ? (
          <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>No attendance records yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {attendance.map((a: any) => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--chrome-light)' }}>{a.sessions?.title || 'Session'}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--chrome-mid)', fontFamily: 'var(--font-mono)' }}>
                    {a.sessions?.date} · {a.method}
                  </div>
                </div>
                <span className={`badge ${a.status === 'present' || a.status === 'late' ? 'badge-present' : 'badge-absent'}`} style={{ fontSize: '0.6rem' }}>
                  {a.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
