'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, User } from 'lucide-react';

export function MemberBottomNav() {
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
      <NavItem href="/dashboard" label="Home" icon={<Home size={20} />} active={pathname === '/dashboard'} />
      <NavItem href="/sessions" label="Sessions" icon={<Calendar size={20} />} active={pathname.startsWith('/sessions')} />
      <NavItem href="/profile" label="Profile" icon={<User size={20} />} active={pathname === '/profile'} />
    </nav>
  );
}

function NavItem({ href, label, icon, active }: { href: string; label: string; icon: React.ReactNode; active: boolean }) {
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
