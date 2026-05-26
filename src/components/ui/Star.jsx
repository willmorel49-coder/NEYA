/* ============================================================
   Star — étoile individuelle (constellation Ciel)
   ============================================================
   Props :
     color  : 'bleu' | 'rose' | 'violet' | 'peche' | 'orage'
     size   : number (px diameter, default 4)
     pulse  : bool (animation pulse 4s)
     glow   : bool (halo additionnel, pour aujourd'hui)
     dashed : bool (cercle pointillé blanc — état "pas encore posée")
     onTap  : function
============================================================ */

const COLOR_MAP = {
  bleu:   'var(--star-bleu)',
  rose:   'var(--star-rose)',
  violet: 'var(--star-violet)',
  peche:  'var(--star-peche)',
  orage:  'var(--star-orage)',
};

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
  const Tag = onTap ? 'button' : 'span';

  return (
    <Tag
      type={onTap ? 'button' : undefined}
      onClick={onTap}
      aria-label={ariaLabel}
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: dashed ? 'transparent' : fill,
        border: dashed ? '1.5px dashed rgba(255,255,255,0.6)' : 'none',
        boxShadow: glow ? `0 0 ${size * 3}px ${fill}, 0 0 ${size * 5}px ${fill}` : 'none',
        animation: pulse ? `star-pulse 4s ease-in-out infinite` : 'none',
        cursor: onTap ? 'pointer' : 'default',
        appearance: 'none',
        padding: 0,
        transform: 'translate(-50%, -50%)',
        ...style,
      }}
    />
  );
}
