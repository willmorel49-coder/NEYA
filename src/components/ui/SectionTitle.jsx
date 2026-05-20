/* ============================================================
   SectionTitle — Cormorant italic medium, pour sections
   ============================================================ */

export default function SectionTitle({ children, color = 'primary', style = {} }) {
  const colors = {
    primary: 'var(--blue-900)',
    rose: 'var(--rose-700)',
    violet: 'var(--violet)',
  };

  return (
    <h2
      style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontStyle: 'italic',
        fontWeight: 300,
        fontSize: 'clamp(22px, 5.5vw, 28px)',
        lineHeight: 1.2,
        color: colors[color] ?? color,
        margin: 0,
        ...style,
      }}
    >
      {children}
    </h2>
  );
}
