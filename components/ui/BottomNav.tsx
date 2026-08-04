import React from 'react';
import Link from 'next/link';

export function AdminBottomNav() {
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
      <NavItem href="/admin/dashboard" label="Dash" icon="D" />
      <NavItem href="/admin/sessions" label="Sessions" icon="S" />
      <NavItem href="/admin/sessions/new" label="Take" icon="+" hero />
      <NavItem href="/admin/members" label="Members" icon="M" />
      <NavItem href="/admin/reports" label="Reports" icon="R" />
    </nav>
  );
}

function NavItem({ href, label, icon, hero }: { href: string; label: string; icon: string; hero?: boolean }) {
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
      display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: 'var(--chrome-mid)'
    }}>
      <div style={{ fontSize: '1.25rem', marginBottom: '2px' }}>{icon}</div>
      <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    </Link>
  );
}
