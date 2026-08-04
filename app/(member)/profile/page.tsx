'use client';

import React, { useState, useEffect } from 'react';
import { getMemberProfile, signOutAction, updateMemberPhoto } from '@/lib/actions';
import { createClient } from '@/lib/supabase/client';
import { Upload, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getMemberProfile().then(setProfile);
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const path = `${profile.id}.${ext}`;
      const { error } = await supabase.storage.from('member-photos').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('member-photos').getPublicUrl(path);
      await updateMemberPhoto(profile.id, publicUrl);
      setProfile((p: any) => ({ ...p, photo_url: publicUrl }));
    } catch {
      alert('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '1.25rem' }}>
      {/* Avatar */}
      <header style={{ marginBottom: '2rem', textAlign: 'center', marginTop: '1.5rem' }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
          <div style={{
            width: '88px', height: '88px', margin: '0 auto',
            borderRadius: '50%',
            background: 'var(--gradient-chrome)',
            border: '2px solid var(--chrome-dark)',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', color: 'var(--chrome-mid)'
          }}>
            {profile?.photo_url
              ? <img src={profile.photo_url} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : profile?.name?.charAt(0).toUpperCase() || '?'
            }
          </div>
          <label style={{
            position: 'absolute', bottom: 0, right: 0,
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'var(--accent-signal)', color: 'var(--bg-void)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', border: '2px solid var(--bg-surface)'
          }}>
            {uploading ? <span style={{ fontSize: '0.6rem' }}>...</span> : <Upload size={12} />}
            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
          </label>
        </div>
        <h1 className="text-display" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{profile?.name || '—'}</h1>
        <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>
          {profile?.regular_email || profile?.email || '—'}
        </p>
        <span className="badge badge-present" style={{ fontSize: '0.65rem', marginTop: '0.5rem', display: 'inline-flex' }}>
          {(profile?.role || 'member').replace('_', ' ').toUpperCase()}
        </span>
      </header>

      {/* Info Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Student ID', value: profile?.student_id, mono: true },
          { label: 'Register No', value: profile?.register_no, mono: true },
          { label: 'Phone', value: profile?.phone, mono: false },
          { label: 'Status', value: profile?.status?.toUpperCase(), mono: false },
        ].map(({ label, value, mono }, i, arr) => (
          <div key={label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.875rem 0',
            borderBottom: i < arr.length - 1 ? '1px solid var(--chrome-dark)' : 'none'
          }}>
            <span style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>{label}</span>
            <span style={{
              fontFamily: mono ? 'var(--font-mono)' : 'inherit',
              fontSize: '0.875rem',
              color: value ? 'var(--chrome-light)' : 'var(--chrome-mid)'
            }}>
              {value || '—'}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <form action={signOutAction}>
          <button type="submit" className="btn btn-ghost" style={{
            width: '100%', padding: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            color: 'var(--state-absent)',
            border: '1px solid rgba(232, 93, 93, 0.3)'
          }}>
            <LogOut size={16} /> Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
