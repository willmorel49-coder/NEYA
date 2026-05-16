/* ============================================================
   NÉYA V4.2 — ÇA VA? page-marque magazine storytelling
   ============================================================
   120 photos shootées sur 4 continents, séquencées en
   narrative éditoriale type magazine. Scroll vertical immersif.
   ============================================================
   I.   HERO            — full-screen photo rotation + ÇA VA?
   II.  MANIFESTE       — 4 piliers + raison d'être
   III. LES VOIX        — citations italic + spreads photo
   IV.  LA GALERIE      — 108 regards en grid asymétrique
   V.   CTA EXTERNE     — cava-brand.com
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { haptic } from '../state';

const TOTAL = 120;
const PHOTO = (n) => `/cava/brand/cava-${String(n).padStart(3, '0')}.jpg`;

const HERO_PHOTOS = [1, 7, 60, 75];

const STATEMENT_QUOTES = [
  { idx: 7,   place: 'Santorini', quote: 'On ne peut pas toujours aller bien. Mais on peut toujours en parler.' },
  { idx: 40,  place: 'Patmos',    quote: 'Le chemin existe, même quand on ne le voit pas.' },
  { idx: 90,  place: 'Italie',    quote: 'Même si le bonheur vous oublie un peu, ne l\'oubliez jamais complètement.' },
  { idx: 105, place: 'Marrakech', quote: 'Je garde la pêche en public, je craque en silence.' },
];

const PILIERS = [
  { mark: '01', title: 'Destigmatiser', body: 'Sortir la santé mentale du silence. La rendre visible, portable, partageable.' },
  { mark: '02', title: 'Soutenir',      body: '1€ reversé sur chaque pièce à des associations de santé mentale.' },
  { mark: '03', title: 'Écouter',       body: 'Faire de la mode un langage qui libère la parole. Parlons-en.' },
  { mark: '04', title: 'Prendre soin',  body: 'Slow fashion. Quantités limitées. Du sens à chaque pièce.' },
];

const NARRATIVE_USED = new Set([...HERO_PHOTOS, ...STATEMENT_QUOTES.map((s) => s.idx)]);
const GALLERY_INDICES = Array.from({ length: TOTAL }, (_, i) => i + 1).filter((n) => !NARRATIVE_USED.has(n));

export default function CaVa() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: '#F4F0E8',
        color: 'var(--cava-ink)',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <Hero />
      <ManifesteAct />
      <VoixAct />
      <GalerieAct />
      <CtaExternal />
    </div>
  );
}

/* ─────────── HERO ─────────── */

function Hero() {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);
  useEffect(() => {
    timerRef.current = setInterval(() => setIdx((i) => (i + 1) % HERO_PHOTOS.length), 5800);
    return () => clearInterval(timerRef.current);
  }, []);

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
      {HERO_PHOTOS.map((n, i) => (
        <div
          key={n}
          aria-hidden={i !== idx}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${PHOTO(n)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: i === idx ? 1 : 0,
            transition: 'opacity 1800ms ease-in-out',
            transform: i === idx ? 'scale(1.04)' : 'scale(1)',
            transitionProperty: 'opacity, transform',
            transitionDuration: '1800ms, 8000ms',
          }}
        />
      ))}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.78) 100%)',
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
          style={{ color: '#FBF6E8', opacity: 0.78, fontSize: 9, letterSpacing: '0.222em' }}
        >
          MENTAL HEALTH STREETWEAR
        </div>
        <div
          className="neya-mark"
          style={{ color: '#FBF6E8', opacity: 0.55, fontSize: 9, letterSpacing: '0.222em', fontVariantNumeric: 'tabular-nums' }}
        >
          {String(idx + 1).padStart(2, '0')} / {String(HERO_PHOTOS.length).padStart(2, '0')}
        </div>
      </div>
      {/* Bottom title + scroll cue */}
      <div
        style={{
          position: 'absolute',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 70px)',
          left: 22,
          right: 22,
          color: '#FBF6E8',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(64px, 22vw, 110px)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 0.88,
            letterSpacing: '-0.032em',
            fontVariationSettings: 'var(--fraunces-opsz-large)',
            color: '#FBF6E8',
            textShadow: '0 2px 22px rgba(0, 0, 0, 0.35)',
          }}
        >
          ÇA VA?
        </h1>
        <p
          style={{
            margin: '18px 0 0',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 19,
            lineHeight: 1.32,
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            color: '#FBF6E8',
            opacity: 0.92,
            maxWidth: 320,
            textShadow: '0 1px 8px rgba(0, 0, 0, 0.3)',
          }}
        >
          Briser le masque.<br />Parler. Écouter. Exister.
        </p>
      </div>
      {/* Scroll cue */}
      <div
        style={{
          position: 'absolute',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 22px)',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: 'var(--font-ui)',
          fontSize: 9,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: '#FBF6E8',
          opacity: 0.55,
          animation: 'cava-scroll-cue 2.4s ease-in-out infinite',
        }}
      >
        Glisser
      </div>
      <style>{`
        @keyframes cava-scroll-cue {
          0%, 100% { transform: translateY(0); opacity: 0.55; }
          50%      { transform: translateY(6px); opacity: 0.85; }
        }
      `}</style>
    </section>
  );
}

/* ─────────── ACTE I — LE MANIFESTE ─────────── */

function ManifesteAct() {
  return (
    <section style={{ background: '#F4F0E8', padding: '100px 22px 80px' }}>
      <div
        className="neya-mark"
        style={{
          color: 'rgba(26, 26, 47, 0.55)',
          textAlign: 'center',
          marginBottom: 28,
          letterSpacing: '0.32em',
        }}
      >
        ACTE I · LE MANIFESTE
      </div>
      <h2
        style={{
          margin: '0 auto 36px',
          textAlign: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 7vw, 38px)',
          fontStyle: 'italic',
          fontWeight: 400,
          lineHeight: 1.18,
          letterSpacing: '-0.018em',
          fontVariationSettings: 'var(--fraunces-italic-soft)',
          maxWidth: 520,
          color: 'var(--cava-ink)',
        }}
      >
        Nous existons pour briser<br />
        le masque du <em style={{ fontWeight: 600 }}>« ça va ».</em>
      </h2>
      <p
        style={{
          margin: '0 auto 60px',
          textAlign: 'center',
          fontFamily: 'var(--font-body)',
          fontSize: 15,
          lineHeight: 1.7,
          color: 'rgba(26, 26, 47, 0.72)',
          maxWidth: 460,
        }}
      >
        ÇA VA? est un mouvement habillé. Chaque pièce porte une question, une voix, un message.
        Nous habillons la santé mentale d'une voix douce et radicale à la fois.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 520, margin: '0 auto' }}>
        {PILIERS.map((p) => (
          <div
            key={p.mark}
            style={{
              display: 'flex',
              gap: 20,
              padding: '22px 24px',
              background: 'rgba(255, 252, 245, 0.72)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '0.5px solid rgba(26, 26, 47, 0.08)',
              borderRadius: 16,
              alignItems: 'flex-start',
              boxShadow: '0 1px 8px rgba(26, 26, 47, 0.04)',
            }}
          >
            <span
              className="neya-mark"
              style={{
                color: 'rgba(26, 26, 47, 0.42)',
                fontVariantNumeric: 'tabular-nums',
                minWidth: 18,
                paddingTop: 4,
              }}
            >
              {p.mark}
            </span>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 19,
                  fontStyle: 'italic',
                  fontVariationSettings: 'var(--fraunces-italic-soft)',
                  lineHeight: 1.2,
                  marginBottom: 6,
                  color: 'var(--cava-ink)',
                }}
              >
                {p.title}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: 'rgba(26, 26, 47, 0.65)',
                }}
              >
                {p.body}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────── ACTE II — LES VOIX ─────────── */

function VoixAct() {
  return (
    <section style={{ background: '#F4F0E8' }}>
      <div style={{ padding: '80px 22px 40px', textAlign: 'center' }}>
        <div
          className="neya-mark"
          style={{
            color: 'rgba(26, 26, 47, 0.55)',
            marginBottom: 28,
            letterSpacing: '0.32em',
          }}
        >
          ACTE II · LES VOIX
        </div>
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
          Chaque pièce porte une phrase.<br />
          Chaque phrase porte une histoire.
        </h2>
      </div>

      {STATEMENT_QUOTES.map((s, i) => (
        <article key={s.idx} style={{ position: 'relative' }}>
          {/* Full-bleed photo */}
          <div
            style={{
              width: '100%',
              aspectRatio: '4 / 5',
              backgroundImage: `url(${PHOTO(s.idx)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#0e0c08',
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
                background: 'rgba(26, 26, 47, 0.45)',
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
          </div>
          {/* Quote panel */}
          <div
            style={{
              padding: '40px 22px 64px',
              background: i % 2 === 0 ? '#F4F0E8' : '#FFFCF5',
            }}
          >
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
                fontSize: 'clamp(22px, 5.5vw, 28px)',
                lineHeight: 1.32,
                letterSpacing: '-0.012em',
                fontVariationSettings: 'var(--fraunces-italic-soft)',
                maxWidth: 520,
                color: 'var(--cava-ink)',
              }}
            >
              « {s.quote} »
            </p>
          </div>
        </article>
      ))}
    </section>
  );
}

/* ─────────── ACTE III — LA GALERIE ─────────── */

function GalerieAct() {
  const [visible, setVisible] = useState(28);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible((v) => Math.min(v + 24, GALLERY_INDICES.length));
        }
      },
      { rootMargin: '500px' }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section style={{ background: '#F4F0E8' }}>
      <div style={{ padding: '80px 22px 32px', textAlign: 'center' }}>
        <div
          className="neya-mark"
          style={{
            color: 'rgba(26, 26, 47, 0.55)',
            marginBottom: 28,
            letterSpacing: '0.32em',
          }}
        >
          ACTE III · LA GALERIE
        </div>
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
          Le monde porte la question.<br />De Tokyo à Mykonos.
        </h2>
        <p
          style={{
            margin: '16px auto 0',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: 'rgba(26, 26, 47, 0.6)',
            maxWidth: 380,
            lineHeight: 1.55,
          }}
        >
          {GALLERY_INDICES.length} regards portés sur la santé mentale,
          shootés sur 4 continents.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 4,
          padding: '24px 4px',
        }}
      >
        {GALLERY_INDICES.slice(0, visible).map((n, i) => {
          const isSpread = i > 0 && i % 9 === 0;
          const aspectRandom = i % 4 === 0 ? '3 / 4' : i % 4 === 1 ? '4 / 5' : i % 4 === 2 ? '1 / 1' : '5 / 7';
          return (
            <div
              key={n}
              style={{
                gridColumn: isSpread ? '1 / -1' : 'auto',
                aspectRatio: isSpread ? '16 / 10' : aspectRandom,
                backgroundImage: `url(${PHOTO(n)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: '#0e0c08',
                transition: 'opacity 320ms ease-out',
              }}
            />
          );
        })}
      </div>
      <div ref={sentinelRef} style={{ height: 1 }} />
      {visible < GALLERY_INDICES.length && (
        <div
          style={{
            padding: '24px',
            textAlign: 'center',
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: 'rgba(26, 26, 47, 0.4)',
          }}
        >
          {visible} / {GALLERY_INDICES.length}
        </div>
      )}
    </section>
  );
}

/* ─────────── CTA EXTERNE ─────────── */

function CtaExternal() {
  return (
    <section
      style={{
        background: 'var(--cava-ink)',
        padding: 'calc(80px + env(safe-area-inset-top, 0px)) 22px calc(140px + env(safe-area-inset-bottom, 0px))',
        color: '#FBF6E8',
      }}
    >
      <div
        className="neya-mark"
        style={{
          color: '#FBF6E8',
          opacity: 0.55,
          marginBottom: 24,
          textAlign: 'center',
          letterSpacing: '0.32em',
        }}
      >
        DÉCOUVRIR
      </div>
      <h2
        style={{
          margin: '0 auto 18px',
          textAlign: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(34px, 9vw, 46px)',
          fontStyle: 'italic',
          fontWeight: 400,
          lineHeight: 1.12,
          letterSpacing: '-0.022em',
          fontVariationSettings: 'var(--fraunces-italic-soft)',
          color: '#FBF6E8',
          maxWidth: 480,
        }}
      >
        Porte la question.
      </h2>
      <p
        style={{
          margin: '0 auto 40px',
          textAlign: 'center',
          fontFamily: 'var(--font-body)',
          fontSize: 14.5,
          lineHeight: 1.6,
          color: 'rgba(251, 246, 232, 0.72)',
          maxWidth: 400,
        }}
      >
        La collection complète, les pièces, les histoires, le mouvement —
        sur cava-brand.com.
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
            color: 'var(--cava-ink)',
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
            transition: 'transform 200ms var(--ease-out-ios)',
          }}
        >
          Découvrir la collection
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
          fontSize: 17,
          lineHeight: 1.4,
          fontVariationSettings: 'var(--fraunces-italic-soft)',
          color: 'rgba(251, 246, 232, 0.62)',
        }}
      >
        « Briser le masque du ça va. »
      </div>
    </section>
  );
}
