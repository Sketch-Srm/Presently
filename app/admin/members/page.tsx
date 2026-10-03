'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllMembers, getAllDomains } from '@/lib/actions';
import { Search, Plus, CreditCard } from 'lucide-react';

export default function MembersListPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [activeDomain, setActiveDomain] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    (async () => {
      const [m, d] = await Promise.all([getAllMembers(), getAllDomains()]);
      setMembers(m);
      setDomains(d);
      setLoading(false);
    })();
  }, []);

  const filteredMembers = members.filter(m => {
    const matchesSearch =
      !search ||
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.student_id?.toLowerCase().includes(search.toLowerCase()) ||
      m.register_no?.toLowerCase().includes(search.toLowerCase());

    const matchesDomain =
      activeDomain === 'all' ||
      (m.domain_ids && m.domain_ids.includes(activeDomain));

    return matchesSearch && matchesDomain;
  });

  // Reset pagination when search or domain changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeDomain]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  return (
    <div style={{ padding: '1.25rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="text-display" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Members</h1>
          <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem' }}>{members.length} total</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/admin/members/import" className="btn btn-ghost" style={{ padding: '0 0.75rem', border: '1px solid var(--chrome-dark)', fontSize: '0.8rem' }}>
            CSV
          </Link>
          <Link href="/admin/members/register-card" className="btn btn-ghost" style={{ padding: '0 0.75rem', border: '1px solid var(--chrome-dark)' }}>
            <CreditCard size={16} />
          </Link>
          <Link href="/admin/members/new" className="btn btn-primary" style={{ padding: '0 1rem' }}>
            <Plus size={18} />
          </Link>
        </div>
      </header>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--chrome-mid)' }} />
        <input
          type="text"
          className="input"
          placeholder="Search name, ID, reg no..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: '2.25rem' }}
        />
      </div>

      {/* Domain Filter Dropdown */}
      <div style={{ marginBottom: '1.5rem' }}>
        <select
          className="input"
          value={activeDomain}
          onChange={(e) => setActiveDomain(e.target.value)}
          style={{ padding: '0.75rem', width: '100%', fontSize: '0.875rem' }}
        >
          <option value="all">All Domains</option>
          {domains.map((d: any) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Member List */}
      {loading ? (
        <p style={{ color: 'var(--chrome-mid)', textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem' }}>Loading...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {paginatedMembers.map((member: any) => (
            <Link href={`/admin/members/${member.id}`} key={member.id} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: member.photo_url ? 'transparent' : 'var(--gradient-chrome)',
                    border: '1px solid var(--chrome-dark)',
                    overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--chrome-mid)', fontSize: '0.875rem',
                    flexShrink: 0,
                  }}>
                    {member.photo_url
                      ? <img src={member.photo_url} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : member.name?.charAt(0).toUpperCase()
                    }
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, color: 'var(--chrome-light)' }}>{member.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--chrome-mid)', fontFamily: 'var(--font-mono)' }}>{member.student_id}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                  {member.role === 'domain_lead' && <span className="badge badge-present" style={{ fontSize: '0.6rem' }}>LEAD</span>}
                  {member.role === 'club_admin' && <span className="badge" style={{ fontSize: '0.6rem', borderColor: 'var(--chrome-light)', color: 'var(--chrome-light)' }}>ADMIN</span>}
                  {member.role === 'super_admin' && <span className="badge badge-present" style={{ fontSize: '0.6rem', borderColor: 'var(--accent-signal)', color: 'var(--accent-signal)' }}>SUPER</span>}
                  {member.card_serial && <span style={{ fontSize: '0.6rem', color: 'var(--chrome-mid)' }}>NFC ✓</span>}
                </div>
              </div>
            </Link>
          ))}
          {filteredMembers.length === 0 && (
            <p style={{ color: 'var(--chrome-mid)', fontSize: '0.875rem', textAlign: 'center', marginTop: '2rem' }}>
              {search || activeDomain !== 'all' ? 'No members match your filter.' : 'No members found.'}
            </p>
          )}

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '0.5rem 0' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn btn-ghost"
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', border: '1px solid var(--chrome-dark)' }}
              >
                Prev
              </button>
              <span style={{ fontSize: '0.875rem', color: 'var(--chrome-mid)' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-ghost"
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', border: '1px solid var(--chrome-dark)' }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
