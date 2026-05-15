/* ============================================================
   NÉYA V3 — StickyHeader (iOS HIG large title nav)
   ============================================================
   Sticky compressed large title pattern :
   - At rest : large Fraunces italic title + optional eyebrow + subtitle
   - On scroll past `threshold` : compresses to smaller title +
     translucent blurred cream background + hairline + fades subtitle
   Parent owns the scroll listener and passes `scrollY`.
   ============================================================ */

export default function StickyHeader({
  eyebrow,
  title,
  subtitle,
  rightSlot,
  scrollY = 0,
  threshold = 60,
  accent = 'var(--ink)',
}) {
  const isCompressed = scrollY > threshold;

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 5,
        padding: isCompressed
          ? '12px 22px'
          : 'calc(env(safe-area-inset-top, 0px) + 22px) 22px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        background: isCompressed ? 'rgba(255, 252, 245, 0.92)' : 'transparent',
        backdropFilter: isCompressed ? 'blur(14px) saturate(160%)' : 'none',
        WebkitBackdropFilter: isCompressed ? 'blur(14px) saturate(160%)' : 'none',
        borderBottom: isCompressed
          ? '0.5px solid var(--hairline, rgba(26, 26, 47, 0.08))'
          : '0.5px solid transparent',
        transition:
          'padding 240ms var(--ease-out-ios), background 240ms var(--ease-out-ios), backdrop-filter 240ms var(--ease-out-ios), border-color 240ms var(--ease-out-ios)',
      }}
    >
      <div style={{ maxWidth: rightSlot ? '70%' : '100%', minWidth: 0 }}>
        {eyebrow && (
          <div
            className="neya-mark"
            style={{ color: 'var(--content-tertiary)' }}
          >
            {eyebrow}
          </div>
        )}
        {title && (
          <h1
            style={{
              marginTop: eyebrow ? 8 : 0,
              marginBottom: 0,
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              fontWeight: 400,
              lineHeight: 1.15,
              color: accent === 'var(--ink)' ? 'var(--ink)' : 'var(--ink)',
              fontSize: isCompressed ? 20 : 28,
              transition: 'font-size 240ms var(--ease-out-ios)',
            }}
          >
            {title}
          </h1>
        )}
        {subtitle && (
          <div
            style={{
              opacity: isCompressed ? 0 : 1,
              maxHeight: isCompressed ? 0 : 80,
              marginTop: isCompressed ? 0 : 8,
              overflow: 'hidden',
              transition:
                'opacity 240ms var(--ease-out-ios), max-height 240ms var(--ease-out-ios), margin-top 240ms var(--ease-out-ios)',
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {rightSlot && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            flexShrink: 0,
          }}
        >
          {rightSlot}
        </div>
      )}
    </div>
  );
}
