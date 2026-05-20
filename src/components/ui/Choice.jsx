/* ============================================================
   Choice — Card sélectionnable (quiz, bilan, mood, etc.)
   ============================================================
   Pattern :
     <Choice selected={bool} onClick={fn} accent="blue|rose|violet">
       ...
     </Choice>
   ============================================================ */

const ACCENTS = {
  blue: {
    base: 'var(--blue-700)',
    gradient: 'var(--gradient-blue)',
    tint: 'rgba(26, 90, 127, 0.10)',
    shadow: '0 8px 24px rgba(26, 90, 127, 0.18)',
  },
  rose: {
    base: 'var(--rose-700)',
    gradient: 'var(--gradient-rose)',
    tint: 'rgba(200, 112, 144, 0.10)',
    shadow: '0 8px 24px rgba(200, 112, 144, 0.18)',
  },
  violet: {
    base: 'var(--violet)',
    gradient: 'var(--gradient-violet)',
    tint: 'rgba(127, 90, 138, 0.10)',
    shadow: '0 8px 24px rgba(127, 90, 138, 0.18)',
  },
};

const RADII = { sm: 12, md: 16, lg: 20, xl: 24, xxl: 28 };

export default function Choice({
  selected = false,
  onClick,
  accent = 'blue',
  disabled = false,
  radius = 'lg',
  padding = '16px 18px',
  children,
  style = {},
  ...rest
}) {
  const a = ACCENTS[accent] ?? ACCENTS.blue;
  const borderLeftWidth = selected ? 4 : 3;

  const handleMouseDown = (e) => {
    if (disabled) return;
    e.currentTarget.style.transform = 'scale(0.985)';
  };
  const handleMouseUp = (e) => {
    if (disabled) return;
    e.currentTarget.style.transform = selected ? 'translateY(-2px)' : '';
  };
  const handleMouseEnter = (e) => {
    if (disabled) return;
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = a.shadow;
  };
  const handleMouseLeave = (e) => {
    if (disabled) return;
    e.currentTarget.style.transform = selected ? 'translateY(-2px)' : '';
    e.currentTarget.style.boxShadow = selected
      ? a.shadow
      : '0 4px 24px rgba(10, 36, 56, 0.07)';
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        appearance: 'none',
        width: '100%',
        textAlign: 'left',
        background: selected
          ? `linear-gradient(135deg, ${a.tint}, rgba(255,255,255,0.55)), rgba(255, 255, 255, 0.65)`
          : 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(24px) saturate(160%)',
        WebkitBackdropFilter: 'blur(24px) saturate(160%)',
        border: '1px solid rgba(255, 255, 255, 0.85)',
        borderLeft: `${borderLeftWidth}px solid ${a.base}`,
        borderRadius: RADII[radius] ?? radius,
        padding,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        boxShadow: selected
          ? a.shadow
          : '0 4px 24px rgba(10, 36, 56, 0.07)',
        transform: selected ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 120ms cubic-bezier(0.22,0.61,0.36,1), box-shadow 240ms cubic-bezier(0.22,0.61,0.36,1), background 240ms cubic-bezier(0.22,0.61,0.36,1), border 240ms cubic-bezier(0.22,0.61,0.36,1)',
        fontFamily: 'inherit',
        color: 'inherit',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
