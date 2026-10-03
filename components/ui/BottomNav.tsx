'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CalendarDays, Wifi, Users, BarChart3 } from 'lucide-react';

export function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--chrome-dark)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '0.5rem 0',
      paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))',
      zIndex: 100
    }}>
      <NavItem href="/admin/dashboard" label="Dash" icon={<LayoutDashboard size={20} />} active={pathname === '/admin/dashboard'} />
      <NavItem href="/admin/sessions" label="Sessions" icon={<CalendarDays size={20} />} active={pathname.startsWith('/admin/sessions')} />
      <NavItem href="/admin/scan" label="Scan" icon={<Wifi size={24} />} hero active={false} />
      <NavItem href="/admin/members" label="Members" icon={<Users size={20} />} active={pathname.startsWith('/admin/members')} />
      <NavItem href="/admin/reports" label="Reports" icon={<BarChart3 size={20} />} active={pathname === '/admin/reports'} />
    </nav>
  );
}

function NavItem({ href, label, icon, hero, active }: { href: string; label: string; icon: React.ReactNode; hero?: boolean; active: boolean }) {
  if (hero) {
    return (
      <Link href={href} style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: 'var(--chrome-light)',
        transform: 'translateY(-10px)'
      }}>
        <div style={{
          width: '56px', height: '56px',
          borderRadius: '50%',
          background: 'var(--accent-signal)',
          color: 'var(--bg-void)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(125, 216, 255, 0.3)'
        }}>
          {icon}
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none',
      color: active ? 'var(--chrome-light)' : 'var(--chrome-mid)',
      transition: 'color 0.2s',
      position: 'relative',
      padding: '0.25rem 0.75rem',
    }}>
      {active && (
        <div style={{
          position: 'absolute', top: '-0.5rem', left: '50%', transform: 'translateX(-50%)',
          width: '3px', height: '3px', borderRadius: '50%',
          background: 'var(--accent-signal)',
        }} />
      )}
      <div style={{ marginBottom: '2px' }}>{icon}</div>
      <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    </Link>
  );
}
