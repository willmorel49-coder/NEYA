/* ============================================================
   Blobs — ÇA VA ? V4 décor de fond rose + bleu/violet
   ============================================================
   Variantes :
     'rose-blue'   (default) — rose top-right + bleu bottom-left
     'rose-violet' — rose top-right + violet bottom-left
     'blue-rose'   — bleu top-left + rose bottom-right
   ============================================================ */

const BLOB_BASE = {
  position: 'absolute',
  borderRadius: '50%',
  filter: 'blur(70px)',
  pointerEvents: 'none',
  zIndex: 0,
};

const VARIANTS = {
  'rose-blue': [
    { top: -90, right: -70, width: 300, height: 300, background: 'radial-gradient(circle, rgba(200,112,144,0.30) 0%, transparent 70%)' },
    { bottom: -100, left: -80, width: 260, height: 260, background: 'radial-gradient(circle, rgba(26,90,127,0.22) 0%, transparent 70%)' },
  ],
  'rose-violet': [
    { top: -90, right: -70, width: 300, height: 300, background: 'radial-gradient(circle, rgba(200,112,144,0.32) 0%, transparent 70%)' },
    { bottom: -100, left: -80, width: 260, height: 260, background: 'radial-gradient(circle, rgba(127,90,138,0.24) 0%, transparent 70%)' },
  ],
  'blue-rose': [
    { top: -90, left: -70, width: 280, height: 280, background: 'radial-gradient(circle, rgba(26,90,127,0.24) 0%, transparent 70%)' },
    { bottom: -90, right: -80, width: 260, height: 260, background: 'radial-gradient(circle, rgba(200,112,144,0.28) 0%, transparent 70%)' },
  ],
};

export default function Blobs({ variant = 'rose-blue' }) {
  const blobs = VARIANTS[variant] || VARIANTS['rose-blue'];
  return (
    <>
      {blobs.map((b, i) => (
        <div key={i} aria-hidden style={{ ...BLOB_BASE, ...b }} />
      ))}
    </>
  );
}
