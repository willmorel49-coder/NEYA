/* ============================================================
   BottomNav — NÉYA V3 (LIGHT MODE, pearl glass)
   ============================================================
   4 tabs floating cream glass · backdrop-filter blur 20 ·
   ink text · accent dot indicator.
   ============================================================ */

import { haptic } from '../v2/state';

const TABS = [
  { key: 'aventure',   label: 'Aventure',   icon: '↑' },
  { key: 'cocon',      label: 'Cocon',      icon: '◇' },
  { key: 'communaute', label: 'Communauté', icon: '◯' },
  { key: 'cava',       label: 'ça va ♡',    icon: null },  // wordmark D.A. lowercase + heart
];

export default function BottomNav({ active, onChange, accent = 'var(--terracotta)' }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)',
        height: 60,
        background: 'rgba(255, 252, 245, 0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '0.5px solid rgba(26, 26, 47, 0.08)',
        borderRadius: 'var(--radius-pill)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 12px',
        zIndex: 50,
        boxShadow: '0 8px 32px rgba(26, 26, 47, 0.12)',
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
            {t.icon && <span style={{ fontSize: 18, lineHeight: 1 }}>{t.icon}</span>}
            {!t.icon && <span style={{ height: 18 }} />}
            <span
              style={{
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: t.key === 'cava' ? 0 : '0.18em',
                textTransform: t.key === 'cava' ? 'none' : 'uppercase',
                fontFamily: t.key === 'cava' ? 'var(--font-display)' : 'var(--font-ui)',
                fontStyle: t.key === 'cava' ? 'italic' : 'normal',
                fontSize: t.key === 'cava' ? 13 : 9,
                fontVariationSettings: t.key === 'cava' ? 'var(--fraunces-italic-soft)' : 'normal',
                lineHeight: 1,
                whiteSpace: 'nowrap',
                marginTop: t.key === 'cava' ? -6 : 0,
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
