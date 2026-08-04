import React from 'react';
import Link from 'next/link';

export function MemberBottomNav() {
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
      <NavItem href="/dashboard" label="Home" icon="⌂" />
      <NavItem href="/sessions" label="Sessions" icon="📅" />
      <NavItem href="/profile" label="Profile" icon="👤" />
    </nav>
  );
}

function NavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link href={href} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: 'var(--chrome-mid)'
    }}>
      <div style={{ fontSize: '1.25rem', marginBottom: '2px' }}>{icon}</div>
      <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    </Link>
  );
}
