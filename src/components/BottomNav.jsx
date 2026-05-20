/* ============================================================
   BottomNav — ÇA VA ? V4 (Pivot bleu/rose glassmorphism)
   ============================================================
   Pill flottante glass blur 20px · 4 tabs · indicateur actif
   en haut, dégradé bleu→rose figé.
   ============================================================ */

import { haptic } from '../v2/state';
import { Icon } from './ui';

const TABS = [
  { key: 'aventure',   label: 'Aventure',   icon: 'arrow-up' },
  { key: 'cocon',      label: 'Cocon',      icon: 'sparkle' },
  { key: 'communaute', label: 'Communauté', icon: 'circle' },
  { key: 'cava',       label: 'ÇA VA?',     icon: 'heart' },
];

export default function BottomNav({ active, onChange, badges = {} }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 14,
        right: 14,
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.9)',
        borderRadius: 30,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'stretch',
        padding: '12px 8px 10px',
        zIndex: 30,
        boxShadow: '0 8px 32px rgba(10, 36, 56, 0.10)',
      }}
    >
      {TABS.map((t) => {
        const isActive = active === t.key;
        const hasBadge = !!badges[t.key];
        return (
          <button
            key={t.key}
            data-press
            onClick={() => { haptic(4); onChange?.(t.key); }}
            aria-label={t.label}
            aria-current={isActive ? 'page' : undefined}
            style={{
              appearance: 'none',
              flex: 1,
              minHeight: 44,
              background: 'transparent',
              border: 'none',
              padding: '6px 4px 2px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              cursor: 'pointer',
              fontFamily: "'Inter', system-ui, sans-serif",
              WebkitTapHighlightColor: 'transparent',
              position: 'relative',
              transition: 'color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {isActive && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 18,
                  height: 2.5,
                  background: 'linear-gradient(90deg, #1A5A7F, #C87090)',
                  borderRadius: 2,
                }}
              />
            )}
            <span style={{ position: 'relative', display: 'inline-flex' }}>
              <span
                style={{
                  lineHeight: 1,
                  color: isActive ? '#1A5A7F' : '#6F9DB5',
                  transition: 'color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'inline-flex',
                }}
              >
                <Icon
                  name={t.icon}
                  size={20}
                  strokeWidth={isActive ? 1.8 : 1.5}
                />
              </span>
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
                    background: '#C87090',
                    boxShadow: '0 0 6px rgba(200, 112, 144, 0.6)',
                  }}
                />
              )}
            </span>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: isActive ? 600 : 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: isActive ? '#0A2438' : '#4A6070',
                transition: 'color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace: 'nowrap',
                lineHeight: 1,
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
