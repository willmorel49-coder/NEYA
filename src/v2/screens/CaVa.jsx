/* ============================================================
   ÇA VA ? V7 — ÇA VA? condensé + storytelling officiel
   ============================================================
   Page courte (8 blocs), pas de scroll infini.
   Le storytelling se RÉVÈLE par phrases-clés brèves placées
   entre les blocs visuels — pas par des paragraphes longs.
   ============================================================
   STRUCTURE :
     1. Top bar           — ÇA VA? + lien externe
     2. Hero              — photo + punchline "phrase mensongère"
     3. Pourquoi          — 3 lignes courtes manifeste
     4. Photo + citation  — "Très peu sont prêts à entendre la vraie réponse."
     5. Voix × 3 cards    — citations brand double-lecture
     6. Photo + citation  — "Souffrir et rester beau."
     7. Galerie 120       — grid dense uniforme 3-col
     8. Final + CTA       — "Derrière chaque visage..."
   ============================================================ */

import { useState, useCallback } from 'react';
import { haptic } from '../state';
import CaVaPhotoViewer from './CaVaPhotoViewer';
import Blobs from '../../components/Blobs';

const TOTAL = 120;
const PHOTO = (n) => `/cava/brand/cava-${String(n).padStart(3, '0')}.jpg`;
const EXTERNAL_URL = 'https://www.cava-brand.com';

const HERO_PHOTO = 1;
const BREATH_1 = 33;   // photo intermède 1
const BREATH_2 = 88;   // photo intermède 2

const VOIX = [
  { idx: 7,   quote: 'Je vais bien en version limitée.' },
  { idx: 75,  quote: 'Certaines tempêtes portent des fleurs.' },
  { idx: 105, quote: 'Le masque tombe quand personne regarde.' },
];

const CAPTION_MAP = VOIX.reduce((acc, v) => { acc[v.idx] = { place: '', quote: v.quote }; return acc; }, {});

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
          background: 'var(--bg)',
          color: 'var(--blue-900)',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Blobs variant="rose-blue" />
        <TopBar />
        <Hero />
        <Pourquoi />
        <PhotoBreath idx={BREATH_1} quote="Tout le monde demande « ça va ? ». Très peu sont prêts à entendre la vraie réponse." onTap={() => openViewer(BREATH_1)} />
        <VoixRow onOpen={openViewer} />
        <PhotoBreath idx={BREATH_2} quote="Tu peux souffrir et rester beau, humain, vivant. Important." onTap={() => openViewer(BREATH_2)} />
        <Gallery onOpen={openViewer} />
        <Final />
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

/* ─── 1. Top bar ─── */

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
          opacity: 0.88,
          textDecoration: 'none',
          padding: '12px 14px',
          minHeight: 44,
          minWidth: 44,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        Boutique <span style={{ opacity: 0.78 }} aria-hidden>↗</span>
      </a>
    </div>
  );
}

/* ─── 2. Hero ─── */

function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        height: '62vh',
        minHeight: 400,
        maxHeight: 600,
        overflow: 'hidden',
        background: 'var(--bg)',
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
            'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.20) 55%, rgba(0,0,0,0.78) 100%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 22,
          right: 22,
          bottom: 32,
          color: 'var(--blue-900)',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(48px, 15vw, 80px)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 0.92,
            letterSpacing: '-0.028em',
            fontVariationSettings: 'var(--fraunces-opsz-large)',
            color: 'var(--blue-900)',
            textShadow: '0 2px 18px rgba(0,0,0,0.32)',
          }}
        >
          ÇA VA?
        </h1>
        <p
          style={{
            margin: '14px 0 0',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 16,
            lineHeight: 1.4,
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            color: 'var(--blue-900)',
            opacity: 0.94,
            maxWidth: 320,
            textShadow: '0 1px 8px rgba(0,0,0,0.32)',
          }}
        >
          La phrase la plus mensongère du monde.
        </p>
      </div>
    </section>
  );
}

/* ─── 3. Pourquoi — 3 lignes brèves ─── */

function Pourquoi() {
  return (
    <section
      style={{
        padding: '64px 28px 56px',
        background: 'rgba(255,255,255,0.65)',
        textAlign: 'center',
        borderBottom: '0.5px solid rgba(26, 26, 47, 0.06)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 9,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          fontWeight: 600,
          color: 'rgba(26, 26, 47, 0.72)',
          marginBottom: 22,
        }}
      >
        Pourquoi
      </div>
      <p
        style={{
          margin: '0 auto',
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 'clamp(22px, 6vw, 28px)',
          lineHeight: 1.32,
          letterSpacing: '-0.014em',
          fontVariationSettings: 'var(--fraunces-italic-soft)',
          color: 'var(--cava-ink, #1a1a2f)',
          maxWidth: 460,
        }}
      >
        Pas née pour vendre.<br />
        Née parce que trop de gens<br />souffrent en silence.
      </p>
      <p
        style={{
          margin: '28px auto 0',
          fontFamily: 'var(--font-body)',
          fontSize: 13.5,
          lineHeight: 1.65,
          color: 'rgba(26, 26, 47, 0.78)',
          maxWidth: 360,
        }}
      >
        La mode comme langage humain.
        Le vêtement comme support de conversation, signal, présence.
      </p>
    </section>
  );
}

/* ─── 4 & 6. Photo + citation (intermède narratif) ─── */

function PhotoBreath({ idx, quote, onTap }) {
  return (
    <section style={{ background: 'rgba(255,255,255,0.65)' }}>
      <button
        data-press
        onClick={onTap}
        aria-label={quote}
        style={{
          appearance: 'none',
          border: 'none',
          padding: 0,
          width: '100%',
          aspectRatio: '4 / 5',
          background: `var(--bg) url(${PHOTO(idx)}) center / cover no-repeat`,
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          display: 'block',
        }}
      />
      <div
        style={{
          padding: '32px 28px 40px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 'clamp(19px, 5vw, 23px)',
            lineHeight: 1.35,
            letterSpacing: '-0.012em',
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            color: 'var(--cava-ink, #1a1a2f)',
            maxWidth: 480,
            marginInline: 'auto',
          }}
        >
          « {quote} »
        </p>
      </div>
    </section>
  );
}

/* ─── 5. Voix (3 cards) ─── */

function VoixRow({ onOpen }) {
  return (
    <section style={{ padding: '20px 16px 12px', background: 'rgba(255,255,255,0.65)' }}>
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
            color: 'rgba(26, 26, 47, 0.72)',
          }}
        >
          Les voix
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
              background: 'var(--bg)',
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
                background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.72) 100%)',
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
                color: 'var(--blue-900)',
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

/* ─── 7. Gallery (120 photos, grid dense uniforme) ─── */

function Gallery({ onOpen }) {
  return (
    <section style={{ padding: '20px 16px 24px', background: 'rgba(255,255,255,0.65)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          padding: '14px 6px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            fontWeight: 600,
            color: 'rgba(26, 26, 47, 0.72)',
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
            color: 'rgba(26, 26, 47, 0.62)',
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
            className="cava-tile"
            style={{
              appearance: 'none',
              border: 'none',
              padding: 0,
              background: 'var(--bg)',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              aspectRatio: '1 / 1',
              backgroundImage: `url(${PHOTO(n)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'opacity 180ms ease-out',
            }}
          />
        ))}
      </div>
      <style>{`
        .cava-tile:active { opacity: 0.7; }
      `}</style>
    </section>
  );
}

/* ─── 8. Final (message + CTA) ─── */

function Final() {
  return (
    <section
      style={{
        background: 'var(--cava-ink, #1a1a2f)',
        color: 'var(--blue-900)',
        padding: '72px 22px calc(env(safe-area-inset-bottom, 0px) + 130px)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 9,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          fontWeight: 600,
          color: 'var(--blue-900)',
          opacity: 0.7,
          marginBottom: 22,
        }}
      >
        Message final
      </div>
      <p
        style={{
          margin: '0 auto 14px',
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 'clamp(22px, 6vw, 28px)',
          lineHeight: 1.3,
          letterSpacing: '-0.014em',
          fontVariationSettings: 'var(--fraunces-italic-soft)',
          color: 'var(--blue-900)',
          maxWidth: 420,
        }}
      >
        Derrière chaque visage<br />
        peut se cacher<br />
        une bataille invisible.
      </p>
      <p
        style={{
          margin: '0 auto 40px',
          fontFamily: 'var(--font-body)',
          fontSize: 13.5,
          lineHeight: 1.6,
          color: 'rgba(10, 36, 56, 0.82)',
          maxWidth: 360,
        }}
      >
        Parfois, se sentir compris suffit à tout changer.
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
          padding: '14px 28px',
          minHeight: 44,
          background: 'var(--bg)',
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
        Porter la question <span style={{ opacity: 0.55 }}>↗</span>
      </a>
    </section>
  );
}
