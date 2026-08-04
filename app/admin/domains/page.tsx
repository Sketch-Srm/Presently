'use client';

import React, { useState, useEffect } from 'react';
import { getAllDomains, createDomain, updateDomain, deleteDomain, getAllMembers } from '@/lib/actions';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';

export default function DomainsPage() {
  const [domains, setDomains] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [newData, setNewData] = useState({ name: '', description: '', domain_lead_id: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [d, m] = await Promise.all([getAllDomains(), getAllMembers()]);
      setDomains(d);
      setLeads(m.filter((m: any) => ['domain_lead', 'club_admin', 'super_admin'].includes(m.role)));
    })();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', newData.name);
      fd.append('description', newData.description);
      if (newData.domain_lead_id) fd.append('domain_lead_id', newData.domain_lead_id);
      await createDomain(fd);
      const d = await getAllDomains();
      setDomains(d);
      setNewData({ name: '', description: '', domain_lead_id: '' });
      setShowNew(false);
    } catch {
      alert('Failed to create domain');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    setSaving(true);
    try {
      await updateDomain(id, editData);
      setDomains(prev => prev.map(d => d.id === id ? { ...d, ...editData } : d));
      setEditId(null);
    } catch {
      alert('Failed to update domain');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this domain? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await deleteDomain(id);
      setDomains(prev => prev.filter(d => d.id !== id));
    } catch {
      alert('Failed to delete domain');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div style={{ padding: '1.25rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-display" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Domains</h1>
          <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>Manage club sub-teams</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn btn-primary" style={{ padding: '0 1rem', minHeight: '36px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> New
        </button>
      </header>

      {/* New Domain Form */}
      {showNew && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid var(--accent-signal)' }}>
          <h2 className="text-display" style={{ fontSize: '1rem', marginBottom: '1rem' }}>New Domain</h2>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              className="input" type="text" placeholder="Domain Name (e.g. Technical)"
              value={newData.name} required
              onChange={e => setNewData(p => ({ ...p, name: e.target.value }))}
            />
            <input
              className="input" type="text" placeholder="Description (optional)"
              value={newData.description}
              onChange={e => setNewData(p => ({ ...p, description: e.target.value }))}
            />
            <select
              className="input" value={newData.domain_lead_id}
              onChange={e => setNewData(p => ({ ...p, domain_lead_id: e.target.value }))}
            >
              <option value="">No Lead Assigned</option>
              {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>
                {saving ? 'Saving...' : 'Create Domain'}
              </button>
              <button type="button" onClick={() => setShowNew(false)} className="btn btn-ghost" style={{ padding: '0 1rem', border: '1px solid var(--chrome-dark)' }}>
                <X size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Domain List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {domains.map(domain => (
          <div key={domain.id} className="card" style={{ padding: '1.25rem' }}>
            {editId === domain.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input className="input" value={editData.name || ''} placeholder="Domain Name" onChange={e => setEditData((p: any) => ({ ...p, name: e.target.value }))} />
                <input className="input" value={editData.description || ''} placeholder="Description" onChange={e => setEditData((p: any) => ({ ...p, description: e.target.value }))} />
                <select className="input" value={editData.domain_lead_id || ''} onChange={e => setEditData((p: any) => ({ ...p, domain_lead_id: e.target.value || null }))}>
                  <option value="">No Lead Assigned</option>
                  {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleUpdate(domain.id)} disabled={saving} className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditId(null)} className="btn btn-ghost" style={{ padding: '0 0.75rem', border: '1px solid var(--chrome-dark)' }}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>{domain.name}</div>
                  {domain.description && <div style={{ fontSize: '0.8rem', color: 'var(--chrome-mid)', marginBottom: '0.5rem' }}>{domain.description}</div>}
                  {domain.domain_lead_id && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--chrome-mid)' }}>
                      Lead: <span style={{ color: 'var(--accent-signal)' }}>{leads.find(l => l.id === domain.domain_lead_id)?.name || 'Unknown'}</span>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => { setEditId(domain.id); setEditData({ name: domain.name, description: domain.description, domain_lead_id: domain.domain_lead_id }); }} className="btn btn-ghost" style={{ padding: '0 0.5rem', minHeight: '32px' }}>
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(domain.id)} disabled={deleting === domain.id} className="btn btn-ghost" style={{ padding: '0 0.5rem', minHeight: '32px', color: 'var(--state-absent)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {domains.length === 0 && !showNew && (
          <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem', textAlign: 'center', marginTop: '2rem' }}>
            No domains yet. Create one to get started.
          </p>
        )}
      </div>
    </div>
  );
}
