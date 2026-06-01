/* ============================================================
   V2App — Shell V6
   ============================================================
   2 onglets : Check-in (charpente) + Marque (philosophie).
   + FAB Crise toujours visible (hors fullscreen overlays).
   + Onboarding 1 écran si pas encore complété.
   + Migration V5 -> V6 au boot.
   ============================================================ */

import { useState, useEffect } from 'react';
import { ToastProvider } from '../components/ui';
import { isOnboarded, ls } from './state';
import { migrateV5ToV6 } from './helpers/migrate-v5-to-v6';
import Onboarding from './screens/Onboarding';
import Checkin from './screens/Checkin';
import CaVa from './screens/CaVa';
import Crise from './screens/Crise';
import CriseFab from '../components/ui/CriseFab';

export default function V2App() {
  return (
    <ToastProvider>
      <V2AppInner />
    </ToastProvider>
  );
}

function V2AppInner() {
  useEffect(() => {
    migrateV5ToV6();
  }, []);

  const [onboarded, setOnboarded] = useState(() => isOnboarded());
  const [activeTab, setActiveTab] = useState(() => ls.get('active_tab', 'checkin'));
  const [criseOpen, setCriseOpen] = useState(false);

  useEffect(() => {
    ls.set('active_tab', activeTab);
  }, [activeTab]);

  if (!onboarded) {
    return <Onboarding onDone={() => setOnboarded(true)} />;
  }

  return (
    <div style={{ minHeight: '100dvh', position: 'relative', background: 'var(--bg, #EEF3F8)' }}>
      {activeTab === 'checkin' && <Checkin />}
      {activeTab === 'marque'  && <CaVa />}

      <BottomNav active={activeTab} onChange={setActiveTab} />

      <CriseFab onClick={() => setCriseOpen(true)} hidden={criseOpen} />
      <Crise open={criseOpen} onClose={() => setCriseOpen(false)} />
    </div>
  );
}

function BottomNav({ active, onChange }) {
  const tabs = [
    { id: 'checkin', label: 'Check-in', icon: '◐' },
    { id: 'marque',  label: 'Marque',   icon: '✦' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      height: 'calc(64px + env(safe-area-inset-bottom, 0))',
      paddingBottom: 'env(safe-area-inset-bottom, 0)',
      background: 'rgba(255,255,255,0.85)',
      borderTop: '1px solid rgba(0,0,0,0.06)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      zIndex: 30,
    }}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          aria-current={active === t.id ? 'page' : undefined}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            cursor: 'pointer',
            color: active === t.id ? 'var(--rose-700, #BE185D)' : 'rgba(0,0,0,0.55)',
            fontFamily: 'inherit',
            fontSize: 11,
          }}
        >
          <span style={{ fontSize: 22 }}>{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
