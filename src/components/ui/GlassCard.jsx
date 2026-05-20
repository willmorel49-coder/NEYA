/* ============================================================
   GlassCard — Card glass standard (rgba blanc + blur 24)
   ============================================================ */

const ELEVATIONS = {
  soft: '0 4px 24px rgba(10, 36, 56, 0.07)',
  card: '0 8px 32px rgba(10, 36, 56, 0.10)',
  deep: '0 12px 40px rgba(10, 36, 56, 0.14)',
};

const RADII = { sm: 12, md: 16, lg: 20, xl: 24, xxl: 28 };

const ACCENTS = {
  blue: 'linear-gradient(to bottom, #1A5A7F, #2A8ABF)',
  rose: 'linear-gradient(to bottom, #C87090, #E080A8)',
  violet: 'linear-gradient(to bottom, #7F5A8A, #AF80BA)',
};

export default function GlassCard({
  children,
  radius = 'lg',
  elevation = 'soft',
  padding = '18px 20px',
  accent,
  onClick,
  hoverable = false,
  style = {},
  ...rest
}) {
  const isInteractive = !!onClick;
  const Tag = isInteractive ? 'button' : 'div';

  const base = {
    position: 'relative',
    background: 'rgba(255, 255, 255, 0.65)',
    backdropFilter: 'blur(24px) saturate(160%)',
    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
    border: '1px solid rgba(255, 255, 255, 0.85)',
    borderRadius: RADII[radius] ?? radius,
    boxShadow: ELEVATIONS[elevation],
    padding,
    color: 'inherit',
    textAlign: isInteractive ? 'left' : undefined,
    width: '100%',
    cursor: isInteractive ? 'pointer' : 'default',
    fontFamily: 'inherit',
    transition: 'transform 240ms cubic-bezier(0.22,0.61,0.36,1), box-shadow 240ms cubic-bezier(0.22,0.61,0.36,1)',
    appearance: isInteractive ? 'none' : undefined,
    WebkitTapHighlightColor: 'transparent',
    ...style,
  };

  const handleMouseEnter = (e) => {
    if (!hoverable && !isInteractive) return;
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = ELEVATIONS.card;
  };
  const handleMouseLeave = (e) => {
    if (!hoverable && !isInteractive) return;
    e.currentTarget.style.transform = '';
    e.currentTarget.style.boxShadow = ELEVATIONS[elevation];
  };

  return (
    <Tag
      type={isInteractive ? 'button' : undefined}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={base}
      {...rest}
    >
      {accent && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            background: ACCENTS[accent] ?? accent,
            borderRadius: '4px 0 0 4px',
          }}
        />
      )}
      {children}
    </Tag>
  );
}
