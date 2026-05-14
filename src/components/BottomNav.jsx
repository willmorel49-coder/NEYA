/* ============================================================
   BottomNav — NÉYA V2 (3 tabs floating glass)
   ============================================================
   Apple mix : pill shape global · backdrop-filter blur(20) ·
   data-press scale(0.95) · iOS easing.
   ============================================================ */

import { haptic } from '../v2/state';

const TABS = [
  { key: 'aventure',   label: 'Aventure',   icon: '↑' },
  { key: 'cocon',      label: 'Cocon',      icon: '◇' },
  { key: 'communaute', label: 'Communauté', icon: '◯' },
  { key: 'cava',       label: 'Ça va ?',    icon: '✿' },
];

export default function BottomNav({ active, onChange, accent = 'var(--amber)' }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)',
        height: 60,
        background: 'var(--surface-overlay)',
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        border: '0.5px solid var(--hairline-strong)',
        borderRadius: 'var(--radius-pill)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 12px',
        zIndex: 50,
        boxShadow: '0 8px 32px -8px rgba(0,0,0,0.4)',
      }}
    >
      {TABS.map((t) => {
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            data-press
            onClick={() => { haptic(4); onChange?.(t.key); }}
            style={{
              appearance: 'none',
              flex: 1,
              height: '100%',
              background: 'transparent',
              border: 'none',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              cursor: 'pointer',
              color: isActive ? accent : 'var(--content-tertiary)',
              fontFamily: 'var(--font-ui)',
              WebkitTapHighlightColor: 'transparent',
              transition: 'color 200ms var(--ease-out-ios)',
              position: 'relative',
            }}
            aria-label={t.label}
            aria-current={isActive ? 'page' : undefined}
          >
            {/* Top dot indicator when active */}
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: 8,
                  width: 3,
                  height: 3,
                  borderRadius: '50%',
                  background: accent,
                }}
              />
            )}
            <span style={{ fontSize: 18, lineHeight: 1 }}>{t.icon}</span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
