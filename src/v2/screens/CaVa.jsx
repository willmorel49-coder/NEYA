/* ============================================================
   NÉYA V6 — ÇA VA? page condensée (catalogue style)
   ============================================================
   Page COURTE et DENSE inspirée designmd.app / getdesign.md.
   Plus d'actes, plus de scroll infini, plus de Ken Burns.
   La grid photos EST la valeur principale.
   ============================================================
   STRUCTURE (6 blocs verticaux, viewport compact) :
     1. Top bar discrète       — ÇA VA? + lien externe
     2. Hero 55vh              — photo iconique + tagline
     3. Stats inline           — 4 chiffres en 1 ligne
     4. Voix (3 cards)         — citations brand + photos
     5. Galerie dense          — 120 photos grid uniforme
     6. Footer                 — CTA cava-brand.com
   ============================================================ */

import { useState, useCallback } from 'react';
import { haptic } from '../state';
import CaVaPhotoViewer from './CaVaPhotoViewer';

const TOTAL = 120;
const PHOTO = (n) => `/cava/brand/cava-${String(n).padStart(3, '0')}.jpg`;

const HERO_PHOTO = 1;

const VOIX = [
  { idx: 7,   quote: 'Je vais bien en version limitée.' },
  { idx: 75,  quote: 'Certaines tempêtes portent des fleurs.' },
  { idx: 105, quote: 'Le masque tombe quand personne regarde.' },
];

const STATS = [
  { value: '120',  label: 'regards' },
  { value: '1€',   label: 'reversé' },
  { value: '100%', label: 'slow' },
  { value: '4',    label: 'continents' },
];

const CAPTION_MAP = VOIX.reduce((acc, v) => { acc[v.idx] = { place: '', quote: v.quote }; return acc; }, {});

const EXTERNAL_URL = 'https://www.cava-brand.com';

export default function CaVa() {
  const [viewer, setViewer] = useState(null);

  const openViewer = useCallback((idx) => { haptic(3); setViewer({ idx }); }, []);
  const closeViewer = useCallback(() => setViewer(null), []);
  const getPhotoSrc = useCallback((idx) => PHOTO(idx), []);
  const getCaption = useCallback((idx) => CAPTION_MAP[idx] || null, []);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#FFFCF5',
          color: 'var(--cava-ink, #1a1a2f)',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <TopBar />
        <Hero />
        <Stats />
        <VoixRow onOpen={openViewer} />
        <Gallery onOpen={openViewer} />
        <Footer />
      </div>

      {viewer && (
        <CaVaPhotoViewer
          photoIndex={viewer.idx}
          totalPhotos={TOTAL}
          onClose={closeViewer}
          getPhotoSrc={getPhotoSrc}
          getCaption={getCaption}
        />
      )}
    </>
  );
}

/* ─── Top bar ─── */

function TopBar() {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 22px 14px',
        background: 'rgba(255, 252, 245, 0.92)',
        backdropFilter: 'blur(14px) saturate(160%)',
        WebkitBackdropFilter: 'blur(14px) saturate(160%)',
        borderBottom: '0.5px solid rgba(26, 26, 47, 0.08)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 17,
          fontWeight: 500,
          letterSpacing: '-0.01em',
          fontVariationSettings: 'var(--fraunces-italic-soft)',
          color: 'var(--cava-ink, #1a1a2f)',
        }}
      >
        ÇA VA?
      </span>
      <a
        href={EXTERNAL_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => haptic(4)}
        data-press
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          fontWeight: 600,
          color: 'var(--cava-ink, #1a1a2f)',
          opacity: 0.7,
          textDecoration: 'none',
          padding: '8px 4px',
          minHeight: 32,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        Boutique <span style={{ opacity: 0.55 }}>↗</span>
      </a>
    </div>
  );
}

/* ─── Hero ─── */

function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        height: '55vh',
        minHeight: 360,
        maxHeight: 540,
        overflow: 'hidden',
        background: '#0e0c08',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${PHOTO(HERO_PHOTO)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.7) 100%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 22,
          right: 22,
          bottom: 28,
          color: '#FBF6E8',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(44px, 14vw, 72px)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 0.94,
            letterSpacing: '-0.028em',
            fontVariationSettings: 'var(--fraunces-opsz-large)',
            color: '#FBF6E8',
            textShadow: '0 2px 18px rgba(0,0,0,0.32)',
          }}
        >
          ÇA VA?
        </h1>
        <p
          style={{
            margin: '12px 0 0',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 15,
            lineHeight: 1.4,
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            color: '#FBF6E8',
            opacity: 0.92,
            maxWidth: 320,
            textShadow: '0 1px 6px rgba(0,0,0,0.28)',
          }}
        >
          Mode émotionnelle. Santé mentale.<br />Briser le masque.
        </p>
      </div>
    </section>
  );
}

/* ─── Stats inline ─── */

function Stats() {
  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 0,
        borderBottom: '0.5px solid rgba(26, 26, 47, 0.08)',
        background: '#FFFCF5',
      }}
    >
      {STATS.map((s, i) => (
        <div
          key={s.label}
          style={{
            padding: '20px 8px',
            textAlign: 'center',
            borderLeft: i === 0 ? 'none' : '0.5px solid rgba(26, 26, 47, 0.06)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 22,
              fontWeight: 500,
              lineHeight: 1,
              color: 'var(--cava-ink, #1a1a2f)',
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {s.value}
          </div>
          <div
            style={{
              marginTop: 6,
              fontFamily: 'var(--font-ui)',
              fontSize: 9,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: 'rgba(26, 26, 47, 0.55)',
            }}
          >
            {s.label}
          </div>
        </div>
      ))}
    </section>
  );
}

/* ─── Voix (3 cards) ─── */

function VoixRow({ onOpen }) {
  return (
    <section style={{ padding: '28px 16px 12px', background: '#FFFCF5' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          padding: '0 6px 14px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            fontWeight: 600,
            color: 'rgba(26, 26, 47, 0.5)',
          }}
        >
          Les voix
        </span>
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 600,
            color: 'rgba(26, 26, 47, 0.35)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          03
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
        }}
      >
        {VOIX.map((v) => (
          <button
            key={v.idx}
            data-press
            onClick={() => onOpen(v.idx)}
            aria-label={v.quote}
            style={{
              appearance: 'none',
              border: 'none',
              padding: 0,
              background: '#0e0c08',
              borderRadius: 8,
              overflow: 'hidden',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              position: 'relative',
              aspectRatio: '3 / 4',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${PHOTO(v.idx)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)',
              }}
            />
            <p
              style={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                right: 8,
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 10.5,
                lineHeight: 1.25,
                fontVariationSettings: 'var(--fraunces-italic-soft)',
                color: '#FBF6E8',
                textAlign: 'left',
                textShadow: '0 1px 6px rgba(0,0,0,0.5)',
              }}
            >
              « {v.quote} »
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ─── Gallery (120 photos, grid dense uniforme) ─── */

function Gallery({ onOpen }) {
  return (
    <section style={{ padding: '20px 16px 24px', background: '#FFFCF5' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          padding: '8px 6px 14px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            fontWeight: 600,
            color: 'rgba(26, 26, 47, 0.5)',
          }}
        >
          La collection
        </span>
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 600,
            color: 'rgba(26, 26, 47, 0.35)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {TOTAL} pièces
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 3,
        }}
      >
        {Array.from({ length: TOTAL }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            data-press
            onClick={() => onOpen(n)}
            aria-label={`Photo ${n}`}
            style={{
              appearance: 'none',
              border: 'none',
              padding: 0,
              background: '#0e0c08',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              aspectRatio: '1 / 1',
              backgroundImage: `url(${PHOTO(n)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'opacity 180ms ease-out',
            }}
            className="cava-tile"
          />
        ))}
      </div>
      <style>{`
        .cava-tile:active { opacity: 0.7; }
      `}</style>
    </section>
  );
}

/* ─── Footer ─── */

function Footer() {
  return (
    <section
      style={{
        background: 'var(--cava-ink, #1a1a2f)',
        color: '#FBF6E8',
        padding: 'calc(env(safe-area-inset-bottom, 0px) + 48px) 22px calc(env(safe-area-inset-bottom, 0px) + 130px)',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          margin: '0 0 22px',
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 19,
          lineHeight: 1.35,
          fontVariationSettings: 'var(--fraunces-italic-soft)',
          color: '#FBF6E8',
          opacity: 0.92,
          maxWidth: 320,
          marginInline: 'auto',
        }}
      >
        Porte la question.
      </p>
      <a
        href={EXTERNAL_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => haptic(6)}
        data-press
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 26px',
          minHeight: 44,
          background: '#FBF6E8',
          color: 'var(--cava-ink, #1a1a2f)',
          borderRadius: 999,
          fontFamily: 'var(--font-ui)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        cava-brand.com <span style={{ opacity: 0.55 }}>↗</span>
      </a>
    </section>
  );
}
