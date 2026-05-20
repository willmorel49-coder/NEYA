/* ============================================================
   Badge — Pill compact status / chip
   ============================================================
   - padding 4×10, radius 50
   - Inter 10/600/0.06em uppercase
   - Variants : success / info / warning / crisis / muted
   ============================================================ */

const VARIANTS = {
  success: {
    background: 'rgba(52, 145, 127, 0.12)',
    color: '#34917F',
    border: '1px solid rgba(52, 145, 127, 0.20)',
  },
  info: {
    background: 'rgba(26, 90, 127, 0.12)',
    color: 'var(--blue-700)',
    border: '1px solid rgba(26, 90, 127, 0.20)',
  },
  warning: {
    background: 'rgba(200, 112, 144, 0.12)',
    color: 'var(--rose-700)',
    border: '1px solid rgba(200, 112, 144, 0.20)',
  },
  crisis: {
    background: 'var(--rose-700)',
    color: '#FFFFFF',
    border: '1px solid var(--rose-700)',
  },
  muted: {
    background: 'var(--blue-100)',
    color: 'var(--text-secondary)',
    border: '1px solid rgba(194, 216, 232, 0.6)',
  },
};

export default function Badge({
  children,
  variant = 'info',
  style = {},
  ...rest
}) {
  const v = VARIANTS[variant] ?? VARIANTS.info;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: '4px 10px',
        borderRadius: 50,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        ...v,
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
