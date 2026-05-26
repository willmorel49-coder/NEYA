/* ============================================================
   CielChapter — Chapitre du scroll narratif sur fond nuit
   ============================================================
   Props :
     eyebrow : label uppercase (ex: "Hier · 23 mai")
     text    : contenu Cormorant italic
     accent  : 'rose' | 'blue' | 'violet' | 'gradient'
     media   : { type: 'image', src: '...' } optionnel
============================================================ */

const ACCENT_COLORS = {
  rose:     '#E8A0B8',
  blue:     '#6F9DB5',
  violet:   '#AF80BA',
  gradient: 'linear-gradient(to bottom, #1A5A7F, #7F5A8A, #C87090)',
};

const EYEBROW_COLORS = {
  rose:     'rgba(232, 160, 184, 0.85)',
  blue:     'rgba(111, 157, 181, 0.85)',
  violet:   'rgba(175, 128, 186, 0.85)',
  gradient: 'rgba(232, 160, 184, 0.85)',
};

export default function CielChapter({ eyebrow, text, accent = 'blue', media }) {
  const borderBackground = ACCENT_COLORS[accent] || ACCENT_COLORS.blue;
  const eyebrowColor = EYEBROW_COLORS[accent] || EYEBROW_COLORS.blue;

  return (
    <article
      style={{
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(24px) saturate(160%)',
        WebkitBackdropFilter: 'blur(24px) saturate(160%)',
        border: '1px solid rgba(255, 255, 255, 0.10)',
        borderRadius: 18,
        padding: '16px 18px',
        margin: '0 16px 12px',
        overflow: 'hidden',
        animation: 'chapter-fade-in 480ms cubic-bezier(0.22,0.61,0.36,1) both',
      }}
    >
      {/* Barre accent gauche */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: borderBackground,
          borderRadius: '4px 0 0 4px',
        }}
      />

      {/* Eyebrow */}
      {eyebrow && (
        <div
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: eyebrowColor,
            marginBottom: 8,
          }}
        >
          {eyebrow}
        </div>
      )}

      {/* Texte principal */}
      <div
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 15,
          lineHeight: 1.45,
          color: 'rgba(251, 246, 232, 0.92)',
        }}
      >
        {text}
      </div>

      {/* Media (image optionnelle) */}
      {media?.type === 'image' && (
        <div
          style={{
            marginTop: 12,
            borderRadius: 12,
            overflow: 'hidden',
            aspectRatio: '4 / 5',
            maxHeight: 200,
          }}
        >
          <img
            src={media.src}
            alt=""
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}
    </article>
  );
}
