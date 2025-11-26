"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/?view=explore', label: 'Explore', icon: '🧭' },
  { href: '/?view=passport', label: 'Dashboard', icon: '📊' },
  { href: '/?view=admin', label: 'My Settings', icon: '⚙️' },
  { href: '/?view=verify', label: 'Course Calendar', icon: '📅' },
];

export default function UnifiedSidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed top-4 left-4 bottom-4 w-64 rounded-3xl border border-white/20 bg-white/80 backdrop-blur-2xl backdrop-saturate-180 shadow-[0_8px_30px_rgba(15,23,42,0.12)] px-5 py-6 space-y-4 z-40">
      <div className="card bg-white/60 backdrop-blur-sm border border-white/30 shadow-soft-sm">
        <div className="font-semibold text-soft-text">APEC-Credify</div>
        <div className="opacity-70 text-sm text-soft-text-muted">Improved Learning</div>
      </div>
      <nav className="card bg-white/60 backdrop-blur-sm border border-white/30 shadow-soft-sm">
        <div className="space-y-2">
          {nav.map((n) => {
            const active = typeof window !== 'undefined' ? window.location.search.includes(n.href.split('view=')[1]) : false;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={active ? 'bg-brand text-brand-foreground rounded-xl px-3 py-2 flex items-center gap-3 shadow-soft-sm' : 'btn-ghost px-3 py-2 flex items-center gap-3'}
              >
                <span style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  display: 'grid',
                  placeItems: 'center',
                  background: active ? 'rgba(255,255,255,0.18)' : '#f3f4f6'
                }}>{n.icon}</span>
                <span style={{ fontWeight: 600 }}>{n.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="card bg-white/60 backdrop-blur-sm border border-white/30 shadow-soft-sm" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--brand-surface)', display: 'grid', placeItems: 'center' }}>🚀</div>
        <div style={{ fontSize: 14 }}>
          <div className="font-semibold">Upgrade to Pro</div>
          <div className="opacity-70">Get 1 month free</div>
        </div>
      </div>
    </aside>
  );
}


