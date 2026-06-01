/* ============================================================
   Star — étoile individuelle (constellation Ciel)
   ============================================================
   Props :
     color  : 'bleu' | 'rose' | 'violet' | 'peche' | 'orage'
     size   : number (px diameter, default 4)
     pulse  : bool (animation pulse 4s)
     glow   : bool (halo additionnel, pour aujourd'hui)
     dashed : bool (cercle pointillé blanc — état "pas encore posée")
     onTap  : function — si présent, rend <button> avec hit-zone ≥ 44×44 iOS HIG
============================================================ */

const COLOR_MAP = {
  bleu:   'var(--star-bleu)',
  rose:   'var(--star-rose)',
  violet: 'var(--star-violet)',
  peche:  'var(--star-peche)',
  orage:  'var(--star-orage)',
};

const HIT_MIN = 44; // iOS HIG minimum tappable area

export default function Star({
  color = 'bleu',
  size = 4,
  pulse = false,
  glow = false,
  dashed = false,
  onTap,
  style = {},
  ariaLabel,
}) {
  const fill = COLOR_MAP[color] || COLOR_MAP.bleu;
  const interactive = typeof onTap === 'function';

  // Visuel SVG/dot — taille originale (toujours)
  const visualStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    background: dashed ? 'transparent' : fill,
    border: dashed ? '1.5px dashed rgba(255,255,255,0.6)' : 'none',
    boxShadow: glow ? `0 0 ${size * 3}px ${fill}, 0 0 ${size * 5}px ${fill}` : 'none',
    animation: pulse ? `star-pulse 4s ease-in-out infinite` : 'none',
    pointerEvents: 'none',
    flexShrink: 0,
  };

  if (interactive) {
    // Hit-zone ≥ 44×44 via padding sur le <button>, visuel centré à size original
    const pad = Math.max(0, (HIT_MIN - size) / 2);
    return (
      <button
        type="button"
        onClick={onTap}
        aria-label={ariaLabel}
        style={{
          position: 'absolute',
          width: Math.max(HIT_MIN, size),
          height: Math.max(HIT_MIN, size),
          minWidth: HIT_MIN,
          minHeight: HIT_MIN,
          padding: pad,
          margin: 0,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          appearance: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'translate(-50%, -50%)',
          WebkitTapHighlightColor: 'transparent',
          ...style,
        }}
      >
        <span aria-hidden style={visualStyle} />
      </button>
    );
  }

  // Non-interactif : <span> simple, taille = visuel
  return (
    <span
      aria-label={ariaLabel}
      style={{
        position: 'absolute',
        ...visualStyle,
        pointerEvents: 'none',
        transform: 'translate(-50%, -50%)',
        ...style,
      }}
    />
  );
}
