import { useState } from 'react';
import Sidebar from './Sidebar';

export default function AppShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: 'var(--vyom-bg)' }}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-stone-200">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="font-bold text-sm text-teal-800 tracking-wide">VYOM</span>
        <div className="w-11" aria-hidden />
      </header>

      <main className="app-main">{children}</main>
    </div>
  );
}
