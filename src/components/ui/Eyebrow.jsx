/* ============================================================
   Eyebrow — Inter 10/600/0.18em uppercase, couleur pilier
   ============================================================ */

const COLORS = {
  blue: 'var(--blue-500)',
  rose: 'var(--rose-700)',
  violet: 'var(--violet)',
  muted: 'var(--text-muted)',
  secondary: 'var(--text-secondary)',
};

export default function Eyebrow({ children, color = 'rose', style = {} }) {
  return (
    <div
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: COLORS[color] ?? color,
        lineHeight: 1.3,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
