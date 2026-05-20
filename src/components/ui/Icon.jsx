/* ============================================================
   Icon — Système d'icônes SVG (style Tabler outline)
   ============================================================
   - viewBox 24 24, stroke-linecap/-linejoin round
   - stroke 1.5 par défaut (1.2 si size < 20)
   - color = currentColor par défaut (héritage)
   - sizes recommandés : 14 16 20 24 28 32 40 48
   ============================================================ */

const PATHS = {
  /* ─── Navigation ─── */
  'chevron-left': (
    <polyline points="15 6 9 12 15 18" />
  ),
  'chevron-right': (
    <polyline points="9 6 15 12 9 18" />
  ),
  'chevron-up': (
    <polyline points="6 15 12 9 18 15" />
  ),
  'chevron-down': (
    <polyline points="6 9 12 15 18 9" />
  ),
  x: (
    <>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </>
  ),
  'arrow-up': (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="6 11 12 5 18 11" />
    </>
  ),
  'arrow-down': (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="6 13 12 19 18 13" />
    </>
  ),
  'arrow-right': (
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="13 6 19 12 13 18" />
    </>
  ),
  'arrow-left': (
    <>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="11 6 5 12 11 18" />
    </>
  ),
  menu: (
    <>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </>
  ),

  /* ─── Actions ─── */
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  minus: (
    <line x1="5" y1="12" x2="19" y2="12" />
  ),
  check: (
    <polyline points="5 12 10 17 19 7" />
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <line x1="20" y1="20" x2="15.5" y2="15.5" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
    </>
  ),

  /* ─── Emotions ─── */
  heart: (
    <path d="M12 20s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 5C19 15.5 12 20 12 20z" />
  ),
  sparkle: (
    <path d="M12 3v6m0 6v6M3 12h6m6 0h6M6.5 6.5l3 3m5 5l3 3m0-11l-3 3m-5 5l-3 3" />
  ),
  moon: (
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="3" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="21" />
      <line x1="3" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="21" y2="12" />
      <line x1="5.6" y1="5.6" x2="7" y2="7" />
      <line x1="17" y1="17" x2="18.4" y2="18.4" />
      <line x1="5.6" y1="18.4" x2="7" y2="17" />
      <line x1="17" y1="7" x2="18.4" y2="5.6" />
    </>
  ),
  star: (
    <polygon points="12 3 14.8 9.3 21.5 10 16.5 14.5 18 21 12 17.5 6 21 7.5 14.5 2.5 10 9.2 9.3" />
  ),

  /* ─── Content ─── */
  message: (
    <path d="M21 12a8 8 0 0 1-8 8 8 8 0 0 1-3.5-.8L4 21l1.3-4.6A8 8 0 1 1 21 12z" />
  ),
  book: (
    <>
      <path d="M5 5a2 2 0 0 1 2-2h12v16H7a2 2 0 0 0-2 2z" />
      <line x1="5" y1="19" x2="19" y2="19" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <polyline points="4 17 9 13 14 17 19 12 21 14" />
    </>
  ),

  /* ─── Nature ─── */
  flame: (
    <path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3s0 2 2 2c0-3 2-5 2-8z" />
  ),
  leaf: (
    <>
      <path d="M5 19s-1-8 5-13c4-3 9-2 9-2s1 5-2 9c-5 6-13 5-13 5z" />
      <line x1="5" y1="19" x2="11" y2="13" />
    </>
  ),
  wave: (
    <>
      <path d="M3 10c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 2-2" />
      <path d="M3 16c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 2-2" />
    </>
  ),
  mountain: (
    <>
      <polyline points="3 19 9 9 14 16 17 12 21 19" />
      <line x1="3" y1="19" x2="21" y2="19" />
    </>
  ),

  /* ─── Status ─── */
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16" />
      <line x1="12" y1="8" x2="12" y2="8.01" />
    </>
  ),
  warning: (
    <>
      <path d="M10.3 3.9 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12" y2="17.01" />
    </>
  ),
  'crisis-phone': (
    <path d="M22 16.9V20a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.6A2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.7 2z" />
  ),
  breath: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
    </>
  ),
  circle: (
    <circle cx="12" cy="12" r="9" />
  ),

  /* ─── User ─── */
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21a7 7 0 0 1 14 0" />
      <path d="M17 4a4 4 0 0 1 0 8" />
      <path d="M22 21a7 7 0 0 0-5-6.7" />
    </>
  ),

  /* ─── Home ─── */
  home: (
    <>
      <path d="M3 11 12 4l9 7" />
      <path d="M5 10v10h14V10" />
    </>
  ),
};

export default function Icon({
  name,
  size = 24,
  color,
  strokeWidth,
  style = {},
  className,
  ...rest
}) {
  const content = PATHS[name];
  if (!content) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(`[Icon] Unknown name: "${name}"`);
    }
    return null;
  }

  const sw = strokeWidth ?? (size < 20 ? 1.2 : 1.5);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || 'currentColor'}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{
        display: 'inline-block',
        flexShrink: 0,
        verticalAlign: 'middle',
        ...style,
      }}
      {...rest}
    >
      {content}
    </svg>
  );
}
