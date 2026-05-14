/* ============================================================
   ChapterMark — NÉYA Design System v2
   ============================================================
   Validates Do's :
   - Mark token : Sora 9px UPPERCASE +2px tracking, weight 500 ✓
   - Top-left brand "N É Y A" (non-breaking thin spaces) in
     content-tertiary, always present ✓
   - Top-right two-line chapter info :
     line 1 "CHAPITRE 0X" content-tertiary
     line 2 world name content-secondary Sora 500 9px no tracking ✓
   - Replaces traditional progress bar (mark IS progression) ✓

   Don'ts respected :
   - Pas de pure white (cream 45% / 65% on dark) ✓
   - Pas de bold (700+) — weight 500 ✓
   ============================================================ */

const THIN_SPACE = ' '; // non-breaking thin space

// Brand mark, top-left — always "N É Y A" with thin spaces
export function BrandMark({ style }) {
  return (
    <div
      className="neya-mark"
      style={{
        color: 'var(--content-tertiary)',
        ...style,
      }}
    >
      {`N${THIN_SPACE}É${THIN_SPACE}Y${THIN_SPACE}A`}
    </div>
  );
}

// Chapter info, top-right — two lines
export function ChapterInfo({ chapter = '01', world = 'Forêt de la Clarté', align = 'right', style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: align === 'right' ? 'flex-end' : 'flex-start', gap: 2, ...style }}>
      <div
        className="neya-mark"
        style={{ color: 'var(--content-tertiary)' }}
      >
        {`CHAPITRE ${String(chapter).padStart(2, '0')}`}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 'var(--type-mark)',
          fontWeight: 'var(--weight-medium)',
          lineHeight: 'var(--lh-mark)',
          color: 'var(--content-secondary)',
          letterSpacing: 0,
          textTransform: 'none',
        }}
      >
        {world}
      </div>
    </div>
  );
}

// Composite ChapterMark — rendered as a full top-bar row, useful for screens
export default function ChapterMark({
  brand = true,
  chapter,
  world,
  topPadding = 'env(safe-area-inset-top, 0px)',
  side = 22,
  style,
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: `calc(${topPadding} + 16px) ${side}px 0`,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        pointerEvents: 'none',
        ...style,
      }}
    >
      {brand ? <BrandMark /> : <span />}
      {chapter || world ? <ChapterInfo chapter={chapter} world={world} /> : <span />}
    </div>
  );
}
