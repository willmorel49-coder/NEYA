/* ============================================================
   HeroTitle — ÇA VA ? Design System v2
   ============================================================
   Validates Do's :
   - em-dash eyebrow ("— L'ÉVEIL") in content-accent-dawn or
     content-accent-night (mark token Sora 9px UPPERCASE +2px) ✓
   - Fraunces 28px h1, weight 400, font-variation-settings opsz 144 ✓
   - <em> italic on 2-4 emotional keywords, weight 300 ✓
   - Body description Inter 11px content-secondary, 2 lines max ✓
   - Color content-accent-{palette} pour eyebrow ✓
   - Restrained typography (max 35% scene height) ✓

   Don'ts respected :
   - Pas de Fraunces sur body — exclusivement hero/h1/h2 ✓
   - Pas de bold (italic = weight 300) ✓
   - Pas de UPPERCASE sur Fraunces ✓
   - Tutoiement par défaut (consumer prop) ✓
   ============================================================ */

export default function HeroTitle({
  eyebrow,                                  // ex: "L'ÉVEIL"
  paletteMode = 'dawn',                      // 'dawn' | 'night' → accent eyebrow
  title,                                     // React node : "Le lion blanc s'éveille <em class='neya-key'>avec toi.</em>"
  body,                                      // 2-line max description
  size = 'h1',                               // 'hero' (32) | 'h1' (28) | 'h2' (22)
  style,
  ...rest
}) {
  const eyebrowColor =
    paletteMode === 'night'
      ? 'var(--content-accent-night)'
      : 'var(--content-accent-dawn)';

  const sizeMap = {
    hero: { fs: 'var(--type-hero)', lh: 'var(--lh-hero)',  ls: 'var(--ls-hero)' },
    h1:   { fs: 'var(--type-h1)',   lh: 'var(--lh-h1)',    ls: 'var(--ls-h1)'   },
    h2:   { fs: 'var(--type-h2)',   lh: 'var(--lh-h2)',    ls: 'var(--ls-h2)'   },
  };
  const sz = sizeMap[size] || sizeMap.h1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480, ...style }} {...rest}>
      {eyebrow && (
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 'var(--type-mark)',
            fontWeight: 'var(--weight-medium)',
            lineHeight: 'var(--lh-mark)',
            letterSpacing: 'var(--ls-mark)',
            textTransform: 'uppercase',
            color: eyebrowColor,
          }}
        >
          {`— ${eyebrow}`}
        </div>
      )}

      {title && (
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: sz.fs,
            fontWeight: 'var(--weight-regular)',
            lineHeight: sz.lh,
            letterSpacing: sz.ls,
            fontVariationSettings: 'var(--fraunces-opsz-large)',
            color: 'var(--content-primary)',
          }}
        >
          {title}
        </h1>
      )}

      {body && (
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-body)',
            fontSize: 11,
            fontWeight: 'var(--weight-regular)',
            lineHeight: 1.5,
            color: 'var(--content-secondary)',
            maxWidth: 360,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {body}
        </p>
      )}
    </div>
  );
}
