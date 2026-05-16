/* ============================================================
   ÇA VA ? V2 — Tour (first-time 4-slide overlay)
   ============================================================
   Affiché UNE SEULE FOIS après onboarding. Pose la carte des
   territoires : Aventure / Cocon / Communauté / Ça va? + SOS.
   Persistance via ls.set('tour_seen', true).
   Agent B.
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { ls, haptic } from '../state';
import useStandardOverlay from '../hooks/useStandardOverlay';

const TRANSITION_MS = 320;

const SLIDES = [
  {
    mark: '01 / 04 · L\'ARRIVÉE',
    titleBefore: '« Entre dans ',
    titleEm: 'la forêt.',
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
        <strong>Ça va ?</strong> prolonge ÇA VA ? sur la peau. Et quand ça
        devient trop, le bouton <strong>SOS</strong> te ramène toujours à
        la respiration.
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
  const [seen] = useState(() => ls.get('tour_seen', false));
  const closedRef = useRef(false);
  const transitionTimerRef = useRef(null);
  const rafIdsRef = useRef([]);

  // Cleanup pending timers / rAFs on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      rafIdsRef.current.forEach((id) => cancelAnimationFrame(id));
      rafIdsRef.current = [];
    };
  }, []);

  // Persistence check on mount — skip render entirely if already seen
  useEffect(() => {
    if (seen && !closedRef.current) {
      closedRef.current = true;
      onClose?.();
    }
  }, [seen, onClose]);

  if (seen) return null;

  const persistAndClose = () => {
    if (closedRef.current) return;
    closedRef.current = true;
    ls.set('tour_seen', true);
    onClose?.();
  };

  const skip = () => {
    haptic(4);
    persistAndClose();
  };

  // Comportement iOS standard (scroll lock body + ESC + focus trap + ARIA).
  // transitionTimerRef + rafIdsRef cleanup déjà gérés via useEffect existant.
  const { dialogProps, containerRef } = useStandardOverlay({
    open: !seen,
    onClose: skip,
    labelText: 'Visite guidée',
  });

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
    transitionTimerRef.current = setTimeout(() => {
      setSlideIdx((i) => i + 1);
      // next mounts hidden, then fades in next frame
      const r1 = requestAnimationFrame(() => {
        const r2 = requestAnimationFrame(() => {
          setVisible(true);
          setTransitioning(false);
        });
        rafIdsRef.current.push(r2);
      });
      rafIdsRef.current.push(r1);
    }, TRANSITION_MS);
  };

  const goBack = () => {
    if (transitioning) return;
    if (slideIdx === 0) return;
    haptic(4);

    setTransitioning(true);
    setVisible(false);
    transitionTimerRef.current = setTimeout(() => {
      setSlideIdx((i) => Math.max(0, i - 1));
      const r1 = requestAnimationFrame(() => {
        const r2 = requestAnimationFrame(() => {
          setVisible(true);
          setTransitioning(false);
        });
        rafIdsRef.current.push(r2);
      });
      rafIdsRef.current.push(r1);
    }, TRANSITION_MS);
  };

  const slide = SLIDES[slideIdx];

  return (
    <div
      ref={containerRef}
      {...dialogProps}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 950,
        background: 'rgba(5, 8, 16, 0.72)',
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
        aria-label="Passer la visite"
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          right: 12,
          background: 'transparent',
          border: '0.5px solid rgba(251, 246, 232, 0.32)',
          borderRadius: 999,
          padding: '8px 16px',
          minWidth: 44,
          minHeight: 44,
          cursor: 'pointer',
          color: 'var(--cream)',
          opacity: 0.92,
          fontFamily: 'var(--font-ui)',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          WebkitTapHighlightColor: 'transparent',
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
          role="tablist"
          aria-label="Slides"
          style={{
            display: 'flex',
            gap: 6,
            marginBottom: 18,
          }}
        >
          {SLIDES.map((_, i) => (
            <button
              key={i}
              role="tab"
              type="button"
              data-press
              onClick={() => i !== slideIdx && setSlideIdx(i)}
              aria-selected={i === slideIdx}
              aria-label={`Slide ${i + 1} sur ${SLIDES.length}`}
              style={{
                width: i === slideIdx ? 24 : 8,
                height: 8,
                borderRadius: 999,
                border: 'none',
                background:
                  i === slideIdx
                    ? 'rgba(251,246,232,0.92)'
                    : 'rgba(251,246,232,0.32)',
                cursor: 'pointer',
                padding: 0,
                transition: `width ${TRANSITION_MS}ms var(--ease-out-ios), background ${TRANSITION_MS}ms var(--ease-out-ios)`,
                WebkitTapHighlightColor: 'transparent',
              }}
            />
          ))}
        </div>

        {/* Actions row — back (left) + primary CTA (right) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            gap: 12,
          }}
        >
          {slideIdx > 0 ? (
            <button
              type="button"
              data-press
              onClick={goBack}
              style={{
                appearance: 'none',
                border: 'none',
                background: 'transparent',
                color: 'var(--content-tertiary)',
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: 'var(--tracking-caps)',
                textTransform: 'uppercase',
                padding: '12px 14px',
                minHeight: 44,
                minWidth: 44,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
              aria-label="Revenir à l’étape précédente"
            >
              ← Retour
            </button>
          ) : (
            <span aria-hidden="true" style={{ display: 'inline-block', width: 1 }} />
          )}

          <button
            type="button"
            data-press
            onClick={advance}
            style={{
              appearance: 'none',
              border: 'none',
              background: 'var(--gradient-blue)',
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
    </div>
  );
}
