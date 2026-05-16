/* ============================================================
   Button — ÇA VA ? Design System v2
   ============================================================
   Validates Do's:
   - Pill shape (radius-pill) ✓
   - Cream fill (no #fff) ✓
   - Sora 500 label, no 700+ ✓
   - Apple mix: scale(0.95) press via [data-press] ✓
   - halo-sm hover on primary (radial gradient world-accent) ✓
   - No bounce, no spring rebound ✓
   - Crisis variant rare (mode crise only) ✓

   Don'ts respected:
   - Pas de #FFFFFF (cream #FBF6E8 toujours) ✓
   - Pas de neon ✓
   - Pas de bold 700+ ✓
   - Pas de bounce / spring rebound (ease-out only) ✓
   ============================================================ */

const SIZE = {
  sm: { fontSize: 11, height: 32, padding: '8px 14px' },
  md: { fontSize: 12, height: 40, padding: '10px 18px' },
  lg: { fontSize: 14, height: 48, padding: '12px 24px' },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  worldAccent = 'var(--amber)',
  disabled = false,
  onClick,
  icon = null,
  children,
  style,
  ...rest
}) {
  const sz = SIZE[size] || SIZE.md;

  const base = {
    appearance: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: sz.height,
    padding: sz.padding,
    fontFamily: 'var(--font-ui)',
    fontSize: sz.fontSize,
    fontWeight: 'var(--weight-medium)',
    lineHeight: 1,
    letterSpacing: 0,
    borderRadius: 'var(--radius-pill)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.35 : 1,
    transition: `background ${disabled ? '0ms' : '200ms'} var(--ease-out), border-color 200ms var(--ease-out), opacity 200ms var(--ease-out), box-shadow 200ms var(--ease-out)`,
    WebkitTapHighlightColor: 'transparent',
    whiteSpace: 'nowrap',
    border: 'none',
    background: 'transparent',
    color: 'var(--content-primary)',
  };

  const variants = {
    primary: {
      background: 'var(--cream)',
      color: 'var(--deep-night)',
      boxShadow: 'none',
    },
    'primary-night': {
      background: 'var(--moon-white)',
      color: 'var(--deep-night)',
    },
    secondary: {
      background: 'transparent',
      color: 'rgba(251, 246, 232, 0.80)',
      border: '0.5px solid rgba(251, 246, 232, 0.25)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--content-secondary)',
    },
    icon: {
      width: 40,
      height: 40,
      padding: 0,
      background: 'rgba(251, 246, 232, 0.08)',
      border: '0.5px solid rgba(251, 246, 232, 0.18)',
      borderRadius: 'var(--radius-circle)',
    },
    destructive: {
      background: 'rgba(201, 113, 113, 0.90)',
      color: 'var(--cream)',
    },
  };

  const v = variants[variant] || variants.primary;

  return (
    <button
      data-press={disabled ? undefined : true}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...v, ...style }}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === 'primary' || variant === 'primary-night') {
          e.currentTarget.style.boxShadow = `0 0 16px 0 ${worldAccent === 'var(--amber)' ? 'rgba(212, 168, 120, 0.25)' : 'rgba(202, 223, 253, 0.25)'}`;
        } else if (variant === 'secondary') {
          e.currentTarget.style.background = 'rgba(251, 246, 232, 0.08)';
          e.currentTarget.style.boxShadow = '0 0 16px 0 rgba(251, 246, 232, 0.15)';
        } else if (variant === 'ghost') {
          e.currentTarget.style.background = 'rgba(251, 246, 232, 0.06)';
        } else if (variant === 'icon') {
          e.currentTarget.style.background = 'rgba(251, 246, 232, 0.14)';
        } else if (variant === 'destructive') {
          e.currentTarget.style.boxShadow = '0 0 12px 0 rgba(201, 113, 113, 0.30)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        if (variant === 'secondary' || variant === 'ghost') {
          e.currentTarget.style.background = 'transparent';
        } else if (variant === 'icon') {
          e.currentTarget.style.background = 'rgba(251, 246, 232, 0.08)';
        }
      }}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
