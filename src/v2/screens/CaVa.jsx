/* ============================================================
   NÉYA V5 — ÇA VA? page-marque (refonte propre, premium magazine)
   ============================================================
   Page éditoriale immersive autour de la marque ÇA VA?.
   PAS une boutique. Le shopping vit sur cava-brand.com.
   ============================================================
   STRUCTURE :
     0. Shell scroll vertical fluide
     1. HERO          — 100vh photo iconique + double-lecture
     2. ACTE I        — Manifeste (4 piliers cards)
     3. INTERMEDE     — Photo silencieuse full-bleed
     4. ACTE II       — 5 voix (spreads photo + citation)
     5. INTERLUDE     — Le mouvement (chiffres premium)
     6. ACTE III      — Galerie 108 photos (asymétrique, lazy)
     7. ACTE IV       — CTA externe cava-brand.com
     8. MICRO-NAV     — Chapitres discrets (apparaît au scroll)
   ============================================================
   Photo viewer : CaVaPhotoViewer (Agent 2 contract)
   ============================================================ */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { haptic } from '../state';
import CaVaPhotoViewer from './CaVaPhotoViewer';

const TOTAL = 120;
const PHOTO = (n) => `/cava/brand/cava-${String(n).padStart(3, '0')}.jpg`;

/* ───── Photos sélectionnées par section ───── */

const HERO_PHOTO = 1;             // Séoul black smiley — iconique
const INTERMEDE_PHOTO = 33;       // respiration silencieuse entre Actes I et II

/* 5 voix — citations brand à double lecture. */
const STATEMENT_QUOTES = [
  { idx: 7,   place: 'Santorini',     quote: 'Je vais bien en version limitée.' },
  { idx: 60,  place: 'Atacama',       quote: 'Le sourire tient par habitude.' },
  { idx: 75,  place: 'Oasis · Maroc', quote: 'Certaines tempêtes portent des fleurs.' },
  { idx: 90,  place: 'Cinque Terre',  quote: 'J\'ai appris à rire silencieusement.' },
  { idx: 105, place: 'Marrakech',     quote: 'Le masque tombe quand personne regarde.' },
];

/* 4 piliers (titres + citation double-lecture) */
const PILIERS = [
  { mark: '01', title: 'Destigmatiser', line: 'Sortir le silence du placard.' },
  { mark: '02', title: 'Soutenir',       line: '1€ qui en vaut mille.' },
  { mark: '03', title: 'Écouter',        line: 'La mode comme micro tendu.' },
  { mark: '04', title: 'Prendre soin',   line: 'Slow par conviction.' },
];

/* 4 chiffres mouvement */
const MOUVEMENT = [
  { value: '1€',   label: 'reversé par pièce' },
  { value: '100%', label: 'slow fashion' },
  { value: 'Ltd.', label: 'quantités limitées' },
  { value: '0',    label: 'jugement' },
];

/* Caption fast-lookup pour viewer */
const CAPTION_MAP = STATEMENT_QUOTES.reduce((acc, s) => {
  acc[s.idx] = { place: s.place, quote: s.quote };
  return acc;
}, {});

/* Indices utilisés ailleurs (à exclure de la galerie) */
const NARRATIVE_USED = new Set([
  HERO_PHOTO,
  INTERMEDE_PHOTO,
  ...STATEMENT_QUOTES.map((s) => s.idx),
]);
const GALLERY_INDICES = Array.from({ length: TOTAL }, (_, i) => i + 1).filter(
  (n) => !NARRATIVE_USED.has(n)
);

/* Chapitres pour micro-nav */
const CHAPTERS = [
  { id: 'manifeste',  label: 'Manifeste' },
  { id: 'voix',       label: 'Voix' },
  { id: 'galerie',    label: 'Galerie' },
  { id: 'collection', label: 'Collection' },
];

/* ============================================================ */

export default function CaVa() {
  const scrollerRef = useRef(null);
  const [viewer, setViewer] = useState(null); // { idx } | null
  const [showNav, setShowNav] = useState(false);

  // Reveal nav once user has scrolled past hero (~ 280px)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setShowNav(el.scrollTop > 280);
        ticking = false;
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = useCallback((id) => {
    const scroller = scrollerRef.current;
    const target = scroller?.querySelector(`[data-chapter="${id}"]`);
    if (!target) return;
    haptic(4);
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const getPhotoSrc = useCallback((idx) => PHOTO(idx), []);
  const getCaption = useCallback((idx) => CAPTION_MAP[idx] || null, []);
  const closeViewer = useCallback(() => setViewer(null), []);

  return (
    <>
      <div
        ref={scrollerRef}
        style={{
          position: 'absolute',
          inset: 0,
          background: '#F4F0E8',
          color: 'var(--cava-ink)',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Hero />
        <ManifesteSection />
        <PhotoBreath idx={INTERMEDE_PHOTO} />
        <VoixSection onOpenPhoto={(idx) => setViewer({ idx })} />
        <MouvementSection />
        <GalerieSection onOpenPhoto={(idx) => setViewer({ idx })} />
        <CollectionCta />

        <style>{`
          @keyframes cava-ken-burns {
            0%   { transform: scale(1) translate3d(0, 0, 0); }
            100% { transform: scale(1.06) translate3d(0, -1%, 0); }
          }
          @keyframes cava-scroll-cue {
            0%, 100% { transform: translateY(0); opacity: 0.55; }
            50%      { transform: translateY(6px); opacity: 0.92; }
          }
          @keyframes cava-fade-in {
            from { opacity: 0; transform: translate3d(0, 16px, 0); }
            to   { opacity: 1; transform: translate3d(0, 0, 0); }
          }
          .cava-reveal {
            opacity: 0;
            will-change: opacity, transform;
          }
          .cava-reveal.is-in {
            animation: cava-fade-in 900ms var(--ease-out, ease-out) forwards;
          }
          .cava-gallery-tile {
            transition: opacity 320ms ease-out;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
          }
          .cava-gallery-tile:active { opacity: 0.78; }
        `}</style>
      </div>

      {/* Micro-nav chapitres */}
      <ChapterNav
        visible={showNav}
        onJump={scrollToSection}
      />

      {/* Photo viewer overlay */}
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

/* ============================================================
   HERO — 100vh, photo iconique immobile + ÇA VA?
   ============================================================ */

function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: 560,
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
          animation: 'cava-ken-burns 16s ease-out both',
          willChange: 'transform',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.10) 38%, rgba(0,0,0,0.30) 64%, rgba(0,0,0,0.82) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top eyebrow */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 28px)',
          left: 22,
          right: 22,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          className="neya-mark"
          style={{
            color: '#FBF6E8',
            opacity: 0.82,
            fontSize: 9.5,
            letterSpacing: '0.32em',
          }}
        >
          ÇA VA ?
        </div>
        <div
          className="neya-mark"
          style={{
            color: '#FBF6E8',
            opacity: 0.55,
            fontSize: 9,
            letterSpacing: '0.222em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          N°01 — MANIFESTE
        </div>
      </div>

      {/* Bottom title block */}
      <div
        style={{
          position: 'absolute',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 78px)',
          left: 22,
          right: 22,
          color: '#FBF6E8',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(64px, 22vw, 112px)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 0.88,
            letterSpacing: '-0.034em',
            fontVariationSettings: 'var(--fraunces-opsz-large)',
            color: '#FBF6E8',
            textShadow: '0 2px 22px rgba(0, 0, 0, 0.38)',
          }}
        >
          ÇA VA?
        </h1>
        <p
          style={{
            margin: '20px 0 0',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 'clamp(18px, 4.8vw, 22px)',
            lineHeight: 1.32,
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            color: '#FBF6E8',
            opacity: 0.94,
            maxWidth: 340,
            textShadow: '0 1px 10px rgba(0, 0, 0, 0.36)',
          }}
        >
          Je vais bien<br />en version limitée.
        </p>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: 'var(--font-ui)',
          fontSize: 9,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: '#FBF6E8',
          opacity: 0.55,
          animation: 'cava-scroll-cue 2.6s ease-in-out infinite',
        }}
      >
        Glisser
      </div>
    </section>
  );
}

/* ============================================================
   ACTE I — Manifeste
   ============================================================ */

function ManifesteSection() {
  return (
    <SectionReveal
      id="manifeste"
      style={{ background: '#F4F0E8', padding: '96px 22px 88px' }}
    >
      <Eyebrow>01 — Le Manifeste</Eyebrow>

      <h2
        style={{
          margin: '0 auto 32px',
          textAlign: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 7vw, 38px)',
          fontStyle: 'italic',
          fontWeight: 400,
          lineHeight: 1.16,
          letterSpacing: '-0.018em',
          fontVariationSettings: 'var(--fraunces-italic-soft)',
          maxWidth: 520,
          color: 'var(--cava-ink)',
        }}
      >
        Nous existons pour briser<br />
        le masque du <em style={{ fontWeight: 500 }}>« ça va ».</em>
      </h2>

      <div
        style={{
          margin: '0 auto 56px',
          maxWidth: 460,
          textAlign: 'center',
          fontFamily: 'var(--font-body)',
          fontSize: 15,
          lineHeight: 1.7,
          color: 'rgba(26, 26, 47, 0.72)',
        }}
      >
        <p style={{ margin: '0 0 14px' }}>
          ÇA VA? habille la santé mentale. Chaque vêtement porte une question
          qu'on n'ose plus poser, une phrase qu'on ne dit plus tout haut.
        </p>
        <p style={{ margin: 0 }}>
          Mode lente, pièces rares, voix douces et radicales. Le tissu comme
          conversation.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          maxWidth: 560,
          margin: '0 auto',
        }}
      >
        {PILIERS.map((p) => (
          <article
            key={p.mark}
            style={{
              padding: '24px 22px',
              background: '#FFFCF5',
              border: '0.5px solid rgba(26, 26, 47, 0.08)',
              borderRadius: 18,
              boxShadow: '0 1px 10px rgba(26, 26, 47, 0.04)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 10,
                marginBottom: 12,
              }}
            >
              <span
                className="neya-mark"
                style={{
                  color: 'rgba(199, 103, 74, 0.85)',
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: 9,
                  letterSpacing: '0.28em',
                }}
              >
                {p.mark}
              </span>
              <span
                className="neya-mark"
                style={{
                  color: 'rgba(26, 26, 47, 0.45)',
                  fontSize: 9,
                  letterSpacing: '0.28em',
                }}
              >
                {p.title}
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 19,
                lineHeight: 1.32,
                letterSpacing: '-0.01em',
                fontVariationSettings: 'var(--fraunces-italic-soft)',
                color: 'var(--cava-ink)',
              }}
            >
              « {p.line} »
            </p>
          </article>
        ))}
      </div>
    </SectionReveal>
  );
}

/* ============================================================
   INTERMÈDE — Photo silencieuse pleine largeur
   ============================================================ */

function PhotoBreath({ idx }) {
  return (
    <section
      aria-hidden
      style={{
        width: '100%',
        aspectRatio: '4 / 5',
        maxHeight: '92vh',
        backgroundImage: `url(${PHOTO(idx)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#0e0c08',
      }}
    />
  );
}

/* ============================================================
   ACTE II — Les voix (5 spreads photo + citation)
   ============================================================ */

function VoixSection({ onOpenPhoto }) {
  return (
    <SectionReveal id="voix" style={{ background: '#F4F0E8' }}>
      <div style={{ padding: '90px 22px 36px', textAlign: 'center' }}>
        <Eyebrow>02 — Les Voix</Eyebrow>
        <h2
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(26px, 6.5vw, 34px)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.22,
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            maxWidth: 480,
            marginInline: 'auto',
            color: 'var(--cava-ink)',
          }}
        >
          Cinq phrases qu'on porte<br />
          comme on portait un masque.
        </h2>
      </div>

      {STATEMENT_QUOTES.map((s, i) => (
        <article
          key={s.idx}
          style={{
            position: 'relative',
            background: i % 2 === 0 ? '#F4F0E8' : '#FFFCF5',
          }}
        >
          {/* Photo full-bleed */}
          <button
            type="button"
            onClick={() => { haptic(4); onOpenPhoto(s.idx); }}
            aria-label={`Agrandir la photo : ${s.place}`}
            style={{
              display: 'block',
              width: '100%',
              aspectRatio: '4 / 5',
              maxHeight: '94vh',
              backgroundImage: `url(${PHOTO(s.idx)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#0e0c08',
              border: 0,
              padding: 0,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 18,
                left: 18,
                padding: '5px 11px',
                borderRadius: 4,
                background: 'rgba(26, 26, 47, 0.48)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                fontFamily: 'var(--font-ui)',
                fontSize: 8.5,
                letterSpacing: '0.222em',
                textTransform: 'uppercase',
                color: '#FBF6E8',
                fontWeight: 600,
              }}
            >
              {s.place}
            </div>
          </button>

          {/* Quote panel */}
          <div style={{ padding: '44px 22px 72px' }}>
            <div
              className="neya-mark"
              style={{
                color: 'rgba(26, 26, 47, 0.4)',
                marginBottom: 14,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '0.222em',
              }}
            >
              {String(i + 1).padStart(2, '0')} / {String(STATEMENT_QUOTES.length).padStart(2, '0')}
            </div>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 'clamp(22px, 5.6vw, 30px)',
                lineHeight: 1.32,
                letterSpacing: '-0.012em',
                fontVariationSettings: 'var(--fraunces-italic-soft)',
                maxWidth: 540,
                color: 'var(--cava-ink)',
              }}
            >
              « {s.quote} »
            </p>
          </div>
        </article>
      ))}
    </SectionReveal>
  );
}

/* ============================================================
   INTERLUDE — Le mouvement (chiffres premium)
   ============================================================ */

function MouvementSection() {
  return (
    <SectionReveal
      style={{
        background: '#FFFCF5',
        padding: '96px 22px 96px',
      }}
    >
      <Eyebrow>03 — Le Mouvement</Eyebrow>
      <h2
        style={{
          margin: '0 auto 48px',
          textAlign: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(26px, 6.5vw, 32px)',
          fontStyle: 'italic',
          fontWeight: 400,
          lineHeight: 1.22,
          fontVariationSettings: 'var(--fraunces-italic-soft)',
          maxWidth: 480,
          color: 'var(--cava-ink)',
        }}
      >
        Ce que la marque change.
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '36px 12px',
          maxWidth: 520,
          margin: '0 auto',
        }}
      >
        {MOUVEMENT.map((m) => (
          <div key={m.label} style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 'clamp(44px, 12vw, 60px)',
                lineHeight: 1,
                fontWeight: 400,
                letterSpacing: '-0.02em',
                fontVariationSettings: 'var(--fraunces-italic-soft)',
                color: 'var(--cava-ink)',
                marginBottom: 10,
              }}
            >
              {m.value}
            </div>
            <div
              className="neya-mark"
              style={{
                color: 'rgba(26, 26, 47, 0.5)',
                fontSize: 9,
                letterSpacing: '0.28em',
              }}
            >
              {m.label}
            </div>
          </div>
        ))}
      </div>
    </SectionReveal>
  );
}

/* ============================================================
   ACTE III — Galerie 108 photos
   ============================================================ */

function GalerieSection({ onOpenPhoto }) {
  const [visible, setVisible] = useState(28);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible((v) => Math.min(v + 24, GALLERY_INDICES.length));
        }
      },
      { rootMargin: '600px 0px' }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);

  const total = GALLERY_INDICES.length;
  const slice = useMemo(() => GALLERY_INDICES.slice(0, visible), [visible]);

  return (
    <SectionReveal id="galerie" style={{ background: '#F4F0E8' }}>
      <div style={{ padding: '90px 22px 36px', textAlign: 'center' }}>
        <Eyebrow>04 — La Galerie</Eyebrow>
        <h2
          style={{
            margin: '0 auto',
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(26px, 6.5vw, 34px)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.22,
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            maxWidth: 480,
            color: 'var(--cava-ink)',
          }}
        >
          Le monde porte la question.<br />
          De Tokyo à Mykonos.
        </h2>
        <p
          style={{
            margin: '18px auto 0',
            fontFamily: 'var(--font-body)',
            fontSize: 13.5,
            color: 'rgba(26, 26, 47, 0.62)',
            maxWidth: 380,
            lineHeight: 1.6,
          }}
        >
          {TOTAL} regards portés sur la santé mentale, shootés sur quatre
          continents. Touche une image pour l'ouvrir.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 3,
          padding: '24px 3px 16px',
        }}
      >
        {slice.map((n, i) => {
          const isSpread = i > 0 && i % 9 === 0;
          const aspect = i % 4 === 0
            ? '3 / 4'
            : i % 4 === 1
              ? '4 / 5'
              : i % 4 === 2
                ? '1 / 1'
                : '5 / 7';
          return (
            <button
              key={n}
              type="button"
              className="cava-gallery-tile"
              onClick={() => { haptic(3); onOpenPhoto(n); }}
              aria-label={`Photo ${n} de ${TOTAL}`}
              style={{
                gridColumn: isSpread ? '1 / -1' : 'auto',
                aspectRatio: isSpread ? '16 / 10' : aspect,
                backgroundImage: `url(${PHOTO(n)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: '#0e0c08',
                border: 0,
                padding: 0,
                margin: 0,
              }}
            />
          );
        })}
      </div>

      <div ref={sentinelRef} style={{ height: 1 }} aria-hidden />

      {visible < total && (
        <div
          style={{
            padding: '20px 24px 8px',
            textAlign: 'center',
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: 'rgba(26, 26, 47, 0.42)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {visible} / {total}
        </div>
      )}
    </SectionReveal>
  );
}

/* ============================================================
   ACTE IV — CTA externe cava-brand.com
   ============================================================ */

function CollectionCta() {
  return (
    <SectionReveal
      id="collection"
      style={{
        background: 'var(--cava-ink, #1a1a2f)',
        padding:
          'calc(96px + env(safe-area-inset-top, 0px)) 22px calc(140px + env(safe-area-inset-bottom, 0px))',
        color: '#FBF6E8',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 26 }}>
        <span
          className="neya-mark"
          style={{
            color: '#FBF6E8',
            opacity: 0.55,
            letterSpacing: '0.32em',
          }}
        >
          05 — La Collection
        </span>
      </div>

      <h2
        style={{
          margin: '0 auto 20px',
          textAlign: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(36px, 10vw, 52px)',
          fontStyle: 'italic',
          fontWeight: 400,
          lineHeight: 1.08,
          letterSpacing: '-0.022em',
          fontVariationSettings: 'var(--fraunces-italic-soft)',
          color: '#FBF6E8',
          maxWidth: 500,
        }}
      >
        Porte la question.
      </h2>

      <p
        style={{
          margin: '0 auto 44px',
          textAlign: 'center',
          fontFamily: 'var(--font-body)',
          fontSize: 14.5,
          lineHeight: 1.65,
          color: 'rgba(251, 246, 232, 0.74)',
          maxWidth: 400,
        }}
      >
        Les pièces, les histoires, le mouvement.<br />
        La collection complète vit ici.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <a
          href="https://www.cava-brand.com"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => haptic(6)}
          data-press
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '18px 36px',
            minHeight: 52,
            background: '#FBF6E8',
            color: 'var(--cava-ink, #1a1a2f)',
            borderRadius: 999,
            fontFamily: 'var(--font-ui)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            WebkitTapHighlightColor: 'transparent',
            cursor: 'pointer',
            boxShadow: '0 12px 32px rgba(251, 246, 232, 0.18)',
            transition: 'transform 200ms var(--ease-out, ease-out)',
          }}
        >
          Découvrir cava-brand.com
          <span style={{ fontSize: 14, opacity: 0.65 }}>↗</span>
        </a>
      </div>

      <div
        style={{
          marginTop: 72,
          paddingTop: 28,
          borderTop: '0.5px solid rgba(251, 246, 232, 0.14)',
          textAlign: 'center',
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 16,
          lineHeight: 1.4,
          fontVariationSettings: 'var(--fraunces-italic-soft)',
          color: 'rgba(251, 246, 232, 0.6)',
          maxWidth: 360,
          marginInline: 'auto',
        }}
      >
        « Sortir le silence du placard. »
      </div>
    </SectionReveal>
  );
}

/* ============================================================
   ChapterNav — micro-nav verticale discrète
   ============================================================ */

function ChapterNav({ visible, onJump }) {
  return (
    <nav
      aria-label="Chapitres ÇA VA?"
      style={{
        position: 'fixed',
        right: 14,
        top: '50%',
        transform: visible ? 'translateY(-50%)' : 'translateY(-50%) translateX(14px)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 320ms ease-out, transform 320ms ease-out',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '10px 7px',
        background: 'rgba(255, 252, 245, 0.62)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: 999,
        border: '0.5px solid rgba(26, 26, 47, 0.08)',
      }}
    >
      {CHAPTERS.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onJump(c.id)}
          aria-label={c.label}
          title={c.label}
          style={{
            width: 8,
            height: 8,
            padding: 0,
            border: 0,
            borderRadius: '50%',
            background: 'rgba(26, 26, 47, 0.42)',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            transition: 'background 200ms ease-out, transform 200ms ease-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(199, 103, 74, 0.95)';
            e.currentTarget.style.transform = 'scale(1.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(26, 26, 47, 0.42)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />
      ))}
    </nav>
  );
}

/* ============================================================
   Helpers — Eyebrow + SectionReveal (IO fade-in)
   ============================================================ */

function Eyebrow({ children }) {
  return (
    <div
      className="neya-mark"
      style={{
        color: 'rgba(26, 26, 47, 0.5)',
        textAlign: 'center',
        marginBottom: 24,
        letterSpacing: '0.32em',
      }}
    >
      {children}
    </div>
  );
}

function SectionReveal({ id, style, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-in');
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      data-chapter={id}
      className="cava-reveal"
      style={style}
    >
      {children}
    </section>
  );
}
