/* ============================================================
   HeroTitle — Cormorant Garamond italic 300, large hero
   ============================================================ */

const SIZES = {
  xl: 'clamp(40px, 10vw, 56px)',
  lg: 'clamp(36px, 9vw, 52px)',
  md: 'clamp(28px, 7vw, 36px)',
  sm: 'clamp(22px, 5.5vw, 28px)',
};

export default function HeroTitle({ children, size = 'lg', color = 'primary', style = {} }) {
  const colors = {
    primary: 'var(--blue-900)',
    rose: 'var(--rose-700)',
    violet: 'var(--violet)',
    white: '#fff',
  };

  return (
    <h1
      style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontStyle: 'italic',
        fontWeight: 300,
        fontSize: SIZES[size] ?? size,
        lineHeight: 1.05,
        letterSpacing: '-0.01em',
        color: colors[color] ?? color,
        margin: 0,
        textWrap: 'balance',
        ...style,
      }}
    >
      {children}
    </h1>
  );
}
