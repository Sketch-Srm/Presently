'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MoreVertical, LogOut, Layers, User, X } from 'lucide-react';
import { signOutAction } from '@/lib/actions';

interface AdminTopBarProps {
  memberName?: string;
  photoUrl?: string;
}

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Overview',
  '/admin/sessions': 'Sessions',
  '/admin/members': 'Members',
  '/admin/reports': 'Reports',
  '/admin/domains': 'Domains',
  '/admin/scan': 'Take Attendance',
};

export function AdminTopBar({ memberName, photoUrl }: AdminTopBarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const title = Object.entries(PAGE_TITLES).find(([path]) => pathname.startsWith(path))?.[1] ?? 'Presently';

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: '56px',
      background: 'var(--bg-void)',
      borderBottom: '1px solid var(--chrome-dark)',
      display: 'flex', alignItems: 'center',
      padding: '0 1.25rem',
      gap: '0.75rem',
    }}>
      {/* Logo mark */}
      <div style={{ width: '24px', height: '24px', flexShrink: 0 }}>
        <svg viewBox="0 0 24 24" fill="none" style={{ width: '100%', height: '100%' }}>
          <rect x="3" y="3" width="8" height="8" rx="1.5" fill="var(--accent-signal)" opacity="0.9" />
          <rect x="13" y="3" width="8" height="8" rx="1.5" fill="var(--accent-signal)" opacity="0.5" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" fill="var(--accent-signal)" opacity="0.5" />
          <rect x="13" y="13" width="8" height="8" rx="1.5" fill="var(--accent-signal)" opacity="0.2" />
        </svg>
      </div>

      {/* Page title */}
      <span className="text-display" style={{ fontSize: '0.95rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {title}
      </span>

      {/* Avatar */}
      {memberName && (
        <div style={{
          width: '30px', height: '30px', borderRadius: '50%',
          background: photoUrl ? 'transparent' : 'var(--gradient-chrome)',
          border: '1px solid var(--chrome-dark)',
          overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem', color: 'var(--chrome-mid)', flexShrink: 0,
        }}>
          {photoUrl
            ? <img src={photoUrl} alt={memberName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : memberName.charAt(0).toUpperCase()
          }
        </div>
      )}

      {/* Overflow menu */}
      <div ref={menuRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(v => !v)}
          className="btn btn-ghost"
          style={{ padding: '0.25rem', minWidth: '32px', minHeight: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="More options"
        >
          {open ? <X size={18} /> : <MoreVertical size={18} />}
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            background: 'var(--bg-surface)', border: '1px solid var(--chrome-dark)',
            borderRadius: 'var(--radius-md)', minWidth: '180px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            animation: 'menu-in 0.15s ease',
            zIndex: 200,
          }}>
            <Link href="/profile" onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', textDecoration: 'none', color: 'var(--chrome-light)', fontSize: '0.875rem', borderBottom: '1px solid var(--chrome-dark)' }}>
              <User size={15} style={{ color: 'var(--chrome-mid)' }} /> Profile
            </Link>
            <Link href="/admin/domains" onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', textDecoration: 'none', color: 'var(--chrome-light)', fontSize: '0.875rem', borderBottom: '1px solid var(--chrome-dark)' }}>
              <Layers size={15} style={{ color: 'var(--chrome-mid)' }} /> Domains
            </Link>
            <form action={signOutAction}>
              <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', width: '100%', background: 'none', border: 'none', color: 'var(--state-absent)', fontSize: '0.875rem', cursor: 'pointer', textAlign: 'left' }}>
                <LogOut size={15} /> Sign Out
              </button>
            </form>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `@keyframes menu-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }` }} />
    </header>
  );
}
