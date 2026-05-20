/* ============================================================
   Spinner — Loader minimal SVG
   ============================================================
   - Rotation 800ms linear infinite
   - Dash-array partial pour donner forme "loading"
   - Variants : 16 / 24 / 32 / 40
   ============================================================ */

const COLORS = {
  blue: 'var(--blue-700)',
  rose: 'var(--rose-700)',
  violet: 'var(--violet)',
  muted: 'var(--text-muted)',
  white: '#FFFFFF',
};

export default function Spinner({
  size = 24,
  color = 'blue',
  strokeWidth = 1.5,
  style = {},
  label = 'Chargement',
}) {
  const stroke = COLORS[color] ?? color;
  const r = (24 - strokeWidth * 2) / 2;
  const c = 2 * Math.PI * r;

  return (
    <span
      role="status"
      aria-label={label}
      style={{
        display: 'inline-flex',
        width: size,
        height: size,
        animation: 'spin 800ms linear infinite',
        ...style,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="12"
          cy="12"
          r={r}
          stroke={stroke}
          strokeOpacity="0.18"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="12"
          cy="12"
          r={r}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * 0.72}
          transform="rotate(-90 12 12)"
        />
      </svg>
    </span>
  );
}
