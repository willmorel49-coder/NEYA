/* ============================================================
   GlassCard — NÉYA Design System v2
   ============================================================
   3 variants : default (solid) · glass (painterly overlay) · editorial
   Validates Do's :
   - Default: solid surface-scene + Cream 12% border (non-painterly) ✓
   - Glass: backdrop-filter blur(14px) + rgba(world-accent, 0.08)
     + 0.5px rgba(world-accent, 0.2) border (painterly overlay only) ✓
   - Editorial: rgba(cream, 0.55) + blur(20) + 0.5px rgba(cream, 0.7)
     border + radius-lg (22) + 22×20 padding (storytelling moment) ✓
   - No drop-shadow ✓
   - Atmospheric elevation only ✓

   Don'ts respected :
   - Pas de glass sur flat background (use default solid instead) ✓
   - Pas de #FFFFFF (cream RGB 251,246,232) ✓
   - Pas de bounce sur mount (translateY linear ease-out only) ✓
   ============================================================ */

const VARIANTS = {
  default: {
    background: 'var(--surface-scene)',
    border: '0.5px solid rgba(251, 246, 232, 0.12)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--sp-4)',
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none',
  },
  glass: {
    background: 'rgba(212, 168, 120, 0.08)',
    border: '0.5px solid rgba(212, 168, 120, 0.20)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
  },
  editorial: {
    background: 'rgba(251, 246, 232, 0.55)',
    border: '0.5px solid rgba(251, 246, 232, 0.70)',
    borderRadius: 'var(--radius-lg)',
    padding: '22px 20px',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    color: 'var(--deep-night)',
  },
};

export default function GlassCard({
  variant = 'default',
  worldAccent = 'rgba(212, 168, 120',  // amber default RGB without alpha
  maxHeight,
  onClick,
  children,
  style,
  ...rest
}) {
  const baseV = VARIANTS[variant] || VARIANTS.default;

  // Override world-accent for glass variant
  const v = { ...baseV };
  if (variant === 'glass' && worldAccent !== 'rgba(212, 168, 120') {
    v.background = `${worldAccent}, 0.08)`;
    v.border = `0.5px solid ${worldAccent}, 0.20)`;
  }

  const interactive = !!onClick;

  return (
    <div
      data-press={interactive ? true : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={interactive ? (e) => { if (e.key === 'Enter') onClick(e); } : undefined}
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        cursor: interactive ? 'pointer' : 'default',
        transition: 'background 240ms var(--ease-out), border-color 240ms var(--ease-out)',
        WebkitTapHighlightColor: 'transparent',
        ...v,
        ...(maxHeight ? { maxHeight } : {}),
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
