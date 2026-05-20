/* ============================================================
   Stat — Big number (jours, minutes, etc.)
   ============================================================ */

export default function Stat({ value, label, color = 'blue', size = 'md' }) {
  const colors = {
    blue: 'var(--blue-700)',
    rose: 'var(--rose-700)',
    violet: 'var(--violet)',
  };
  const sizes = {
    sm: { number: 22, label: 10 },
    md: { number: 28, label: 11 },
    lg: { number: 36, label: 12 },
  };
  const s = sizes[size] ?? sizes.md;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
      <div
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: s.number,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: colors[color] ?? color,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
      {label && (
        <div
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: s.label,
            fontWeight: 500,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
