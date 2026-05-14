/* ============================================================
   NÉYA V2 — Tour (first-time 4-slide overlay)
   ============================================================
   Affiché UNE SEULE FOIS après onboarding. Pose la carte des
   territoires : Aventure / Cocon / Communauté / Ça va? + SOS.
   Persistance via ls.set('tour_seen', true).
   Agent B.
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { ls, haptic } from '../state';

const TRANSITION_MS = 320;

const SLIDES = [
  {
    mark: '01 / 04 · BIENVENUE',
    titleBefore: '« Le voyage ',
    titleEm: 'commence ici.',
    titleAfter: ' »',
    body: (
      <>
        L’onglet <strong>Aventure</strong> est ton chemin. Six mondes à
        explorer, un pas à la fois. Chaque méditation déverrouille le
        prochain.
      </>
    ),
    glyph: '↑',
    glyphColor: 'var(--ochre)',
    cta: 'Suivant →',
  },
  {
    mark: '02 / 04 · TON COCON',
    titleBefore: '« Ton sanctuaire. ',
    titleEm: 'Personnel.',
    titleAfter: ' »',
    body: (
      <>
        Pose ton prénom, choisis ton totem, déclare ton mantra. C’est ton
        espace à toi, jamais visible des autres.
      </>
    ),
    glyph: '◇',
    glyphColor: 'var(--mist-blue)',
    cta: 'Suivant →',
  },
  {
    mark: '03 / 04 · ESPACE VRAI',
    titleBefore: '« Tu n’es ',
    titleEm: 'pas seul·e.',
    titleAfter: ' »',
    body: (
      <>
        Lis ce que d’autres ressentent. Partage ce qui est vrai pour toi.
        Sans likes, sans classement. Tu peux supprimer ce que tu écris à
        tout moment.
      </>
    ),
    glyph: '◯',
    glyphColor: 'var(--terracotta)',
    cta: 'Suivant →',
  },
  {
    mark: '04 / 04 · LA SUITE',
    titleBefore: '« Une ',
    titleEm: 'capsule sœur.',
    titleAfter: ' »',
    body: (
      <>
        <strong>Ça va ?</strong> est la marque de vêtements qui prolonge
        NÉYA. Et en haut à droite, le bouton <strong>SOS</strong> te
        ramène toujours à la respiration en cas de tempête.
      </>
    ),
    glyph: '♡',
    glyphColor: 'var(--terracotta)',
    cta: 'C’est parti',
  },
];

export default function Tour({ onClose }) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [visible, setVisible] = useState(true);          // current slide opacity flag
  const [transitioning, setTransitioning] = useState(false);
  const mountedRef = useRef(false);

  // Persistence check on mount — skip render entirely if already seen
  useEffect(() => {
    if (ls.get('tour_seen', false)) {
      onClose?.();
      return;
    }
    mountedRef.current = true;
  }, [onClose]);

  if (ls.get('tour_seen', false)) return null;

  const persistAndClose = () => {
    ls.set('tour_seen', true);
    onClose?.();
  };

  const skip = () => {
    haptic(4);
    persistAndClose();
  };

  const advance = () => {
    if (transitioning) return;
    haptic(6);

    // Final slide → close
    if (slideIdx === SLIDES.length - 1) {
      persistAndClose();
      return;
    }

    // Staggered transition: fade out current, mount next, fade next in
    setTransitioning(true);
    setVisible(false);
    setTimeout(() => {
      setSlideIdx((i) => i + 1);
      // next mounts hidden, then fades in next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
          setTransitioning(false);
        });
      });
    }, TRANSITION_MS);
  };

  const slide = SLIDES[slideIdx];

  return (
    <div
      role="dialog"
      aria-label="Visite guidée NÉYA"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 950,
        background: 'rgba(5, 8, 16, 0.55)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      {/* Skip — top-right ghost */}
      <button
        type="button"
        data-press
        onClick={skip}
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 18px)',
          right: 18,
          background: 'transparent',
          border: 'none',
          padding: '6px 10px',
          color: 'var(--cream)',
          opacity: 0.62,
          fontFamily: 'var(--font-ui)',
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.222em',
          textTransform: 'uppercase',
        }}
      >
        Passer
      </button>

      {/* Card */}
      <div
        key={slideIdx}
        style={{
          width: 'clamp(280px, 88vw, 360px)',
          maxHeight: '60vh',
          background: 'var(--cream-light)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          padding: '22px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(6px)',
          transition: `opacity ${TRANSITION_MS}ms var(--ease-out-ios), transform ${TRANSITION_MS}ms var(--ease-out-ios)`,
          overflow: 'auto',
        }}
      >
        {/* Caps mark */}
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            color: 'var(--ink-whisper)',
            marginBottom: 14,
          }}
        >
          {slide.mark}
        </div>

        {/* Glyph illustration */}
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 48,
            lineHeight: 1,
            color: slide.glyphColor,
            opacity: 0.5,
            marginBottom: 12,
          }}
          aria-hidden="true"
        >
          {slide.glyph}
        </div>

        {/* Title — Fraunces italic 24 */}
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 24,
            fontWeight: 400,
            lineHeight: 1.18,
            letterSpacing: '-0.014em',
            color: 'var(--ink)',
            margin: '0 0 14px',
          }}
        >
          {slide.titleBefore}
          <em className="neya-key" style={{ fontStyle: 'italic' }}>
            {slide.titleEm}
          </em>
          {slide.titleAfter}
        </h2>

        {/* Body — Inter 14 ink-soft */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            lineHeight: 1.55,
            color: 'var(--ink-soft)',
            margin: '0 0 22px',
          }}
        >
          {slide.body}
        </p>

        {/* Pagination dots */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            marginBottom: 18,
          }}
          aria-hidden="true"
        >
          {SLIDES.map((_, i) => (
            <span
              key={i}
              style={{
                width: i === slideIdx ? 18 : 6,
                height: 6,
                borderRadius: 3,
                background:
                  i === slideIdx
                    ? 'var(--ink)'
                    : 'rgba(26, 26, 47, 0.18)',
                transition: `width ${TRANSITION_MS}ms var(--ease-out-ios), background ${TRANSITION_MS}ms var(--ease-out-ios)`,
              }}
            />
          ))}
        </div>

        {/* Primary CTA */}
        <button
          type="button"
          data-press
          onClick={advance}
          style={{
            appearance: 'none',
            border: 'none',
            background: 'var(--ink)',
            color: 'var(--cream)',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: '0.011em',
            padding: '12px 22px',
            borderRadius: 'var(--radius-pill, 999px)',
            minWidth: 160,
          }}
        >
          {slide.cta}
        </button>
      </div>
    </div>
  );
}
