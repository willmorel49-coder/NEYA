/* ============================================================
   BottomNav — NÉYA V3 (LIGHT MODE, pearl glass)
   ============================================================
   4 tabs floating cream glass · backdrop-filter blur 20 ·
   ink text · sliding accent indicator + optional badges.
   ============================================================ */

import { haptic } from '../v2/state';

const TABS = [
  { key: 'aventure',   label: 'Aventure',   icon: '↑' },
  { key: 'cocon',      label: 'Cocon',      icon: '◇' },
  { key: 'communaute', label: 'Communauté', icon: '◯' },
  { key: 'cava',       label: 'ça va ♡',    icon: null },  // wordmark D.A. lowercase + heart
];

export default function BottomNav({ active, onChange, accent = 'var(--terracotta)', badges = {} }) {
  const activeIndex = Math.max(0, TABS.findIndex((t) => t.key === active));

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
      {/* Sliding active indicator — single sibling element.
          Wrapper has padding: 0 12px, so usable button track = calc(100% - 24px),
          starting at 12px from the left edge. */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 8,
          left: `calc(12px + (100% - 24px) * ${(activeIndex + 0.5) / TABS.length})`,
          width: 22,
          height: 3,
          borderRadius: 9999,
          background: accent,
          transform: 'translateX(-50%)',
          transition: 'left 320ms var(--ease-spring-subtle), background 220ms var(--ease-out-ios)',
          opacity: 0.9,
          pointerEvents: 'none',
        }}
      />

      {TABS.map((t) => {
        const isActive = active === t.key;
        const hasBadge = !!badges[t.key];
        return (
          <button
            key={t.key}
            data-press
            onClick={() => { haptic(4); onChange?.(t.key); }}
            style={{
              appearance: 'none',
              flex: 1,
              height: '100%',
              minHeight: 60,
              background: 'transparent',
              border: 'none',
              padding: '8px 12px',
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
            <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              {t.icon && <span style={{ fontSize: 18, lineHeight: 1 }}>{t.icon}</span>}
              {!t.icon && <span style={{ height: 18, display: 'inline-block' }} />}
              {hasBadge && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -8,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--tilleul)',
                    boxShadow: '0 0 6px rgba(212, 224, 140, 0.6)',
                  }}
                />
              )}
            </span>
            <span
              style={{
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
