/* ============================================================
   CTA — Bouton pill avec variants primary/rose/outline/ghost
   ============================================================ */

import { haptic } from '../../v2/state';

const VARIANTS = {
  primary: {
    background: 'linear-gradient(135deg, #1A5A7F, #2A8ABF)',
    color: 'white',
    border: 'none',
    boxShadow: '0 8px 24px rgba(26, 90, 127, 0.30)',
    hoverShadow: '0 12px 32px rgba(26, 90, 127, 0.42)',
  },
  rose: {
    background: 'linear-gradient(135deg, #C87090, #E080A8)',
    color: 'white',
    border: 'none',
    boxShadow: '0 8px 24px rgba(200, 112, 144, 0.30)',
    hoverShadow: '0 12px 32px rgba(200, 112, 144, 0.42)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--blue-700)',
    border: '1.5px solid var(--blue-300)',
    boxShadow: 'none',
    hoverShadow: '0 4px 12px rgba(26, 90, 127, 0.15)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--blue-700)',
    border: 'none',
    boxShadow: 'none',
    hoverShadow: 'none',
  },
};

const SIZES = {
  sm: { padding: '10px 18px', fontSize: 11, minHeight: 38 },
  md: { padding: '14px 24px', fontSize: 12, minHeight: 48 },
  lg: { padding: '16px 28px', fontSize: 13, minHeight: 54 },
};

export default function CTA({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  full = false,
  haptic: doHaptic = true,
  type = 'button',
  disabled = false,
  style = {},
  ...rest
}) {
  const v = VARIANTS[variant] ?? VARIANTS.primary;
  const s = SIZES[size] ?? SIZES.md;

  const handleClick = (e) => {
    if (disabled) return;
    if (doHaptic) haptic(4);
    onClick?.(e);
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      data-press
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = 'translateY(-2px)';
        if (v.hoverShadow !== 'none') e.currentTarget.style.boxShadow = v.hoverShadow;
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = v.boxShadow;
      }}
      style={{
        appearance: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontWeight: 600,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        borderRadius: 50,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        width: full ? '100%' : 'auto',
        transition: 'transform 240ms cubic-bezier(0.22,0.61,0.36,1), box-shadow 240ms cubic-bezier(0.22,0.61,0.36,1), background 240ms cubic-bezier(0.22,0.61,0.36,1)',
        WebkitTapHighlightColor: 'transparent',
        ...v,
        ...s,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
