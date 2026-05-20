/* ============================================================
   Body — Inter 15/400/1.6 var(--text-secondary)
   Variants: body / body-sm / caption
   ============================================================ */

const VARIANTS = {
  body: { fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)', fontWeight: 400 },
  'body-sm': { fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)', fontWeight: 400 },
  caption: { fontSize: 12, lineHeight: 1.4, color: 'var(--text-muted)', fontWeight: 500 },
  whisper: { fontSize: 13, lineHeight: 1.5, color: 'var(--text-muted)', fontWeight: 400, fontStyle: 'italic' },
};

export default function Body({ children, variant = 'body', italic = false, style = {} }) {
  const v = VARIANTS[variant] ?? VARIANTS.body;
  return (
    <p
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        margin: 0,
        textWrap: 'pretty',
        fontStyle: italic ? 'italic' : 'normal',
        ...v,
        ...style,
      }}
    >
      {children}
    </p>
  );
}
