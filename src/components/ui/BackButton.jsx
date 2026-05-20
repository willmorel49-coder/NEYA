/* ============================================================
   BackButton — Glass pill standard (top-left fixed)
   ============================================================ */

import { haptic } from '../../v2/state';

export default function BackButton({ onClick, label = 'Retour', ariaLabel }) {
  return (
    <button
      type="button"
      onClick={() => { haptic(3); onClick?.(); }}
      aria-label={ariaLabel || label}
      data-press
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0px) + 14px)',
        left: 16,
        zIndex: 80,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        minHeight: 44,
        padding: '10px 14px',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.9)',
        borderRadius: 50,
        color: 'var(--blue-700)',
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: '0.02em',
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(10, 36, 56, 0.10)',
        WebkitTapHighlightColor: 'transparent',
        transition: 'background 240ms cubic-bezier(0.22,0.61,0.36,1), transform 120ms cubic-bezier(0.22,0.61,0.36,1)',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </button>
  );
}
