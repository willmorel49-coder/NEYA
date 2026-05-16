/* ============================================================
   MondeReader — voyage initiatique dans un monde
   ============================================================
   Plein écran painterly du monde + étapes narratives une par une.
   Progression visible (barre + numéro étape).
   Marque le monde comme avancé/complété dans profile.aventure.
   ============================================================ */

import { useState, useEffect, useRef, useMemo } from 'react';
import { haptic, getProfile, patchProfile } from '../state';
import useStandardOverlay from '../hooks/useStandardOverlay';

function getProgress(monde) {
  const profile = getProfile();
  const av = profile.aventure || {};
  const progress = av.mondesProgress || {};
  return progress[monde.key] || 0; // 0 = pas commencé, N = N étapes faites
}

function setProgress(mondeKey, etapeIdx) {
  const profile = getProfile();
  const av = profile.aventure || {};
  const progress = av.mondesProgress || {};
  // Ne descend jamais — seulement enregistre l'étape la plus avancée
  const current = progress[mondeKey] || 0;
  if (etapeIdx > current) {
    progress[mondeKey] = etapeIdx;
    patchProfile({ aventure: { ...av, mondesProgress: progress } });
  }
}

export default function MondeReader({ monde, onClose }) {
  const initialEtape = Math.min(getProgress(monde), monde.etapes.length - 1);
  const [etapeIdx, setEtapeIdx] = useState(initialEtape);
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const aliveRef = useRef(true);
  const timersRef = useRef([]);

  const safeTimeout = (fn, ms) => {
    const id = setTimeout(() => { if (aliveRef.current) fn(); }, ms);
    timersRef.current.push(id);
    return id;
  };

  const etape = monde.etapes[etapeIdx];
  const total = monde.etapes.length;
  const isLast = etapeIdx === total - 1;
  const progressPct = ((etapeIdx + 1) / total) * 100;

  const handleClose = () => {
    if (closing) return;
    haptic(3);
    setClosing(true);
    safeTimeout(() => onClose?.(), 380);
  };

  const handleNext = () => {
    if (isLast) {
      // Marque le monde comme complété
      setProgress(monde.key, total);
      setCompleted(true);
      haptic([6, 80, 6]);
      safeTimeout(() => {
        if (aliveRef.current) handleClose();
      }, 2400);
      return;
    }
    haptic(4);
    setProgress(monde.key, etapeIdx + 1);
    setEtapeIdx((i) => i + 1);
  };

  const handlePrev = () => {
    if (etapeIdx === 0) return;
    haptic(2);
    setEtapeIdx((i) => i - 1);
  };

  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closing,
    onClose: handleClose,
    labelText: monde.name,
  });

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    haptic(4);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('neya:fullscreen-overlay', { detail: { open: true } }));
    }
    return () => {
      cancelAnimationFrame(raf);
      aliveRef.current = false;
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('neya:fullscreen-overlay', { detail: { open: false } }));
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      {...dialogProps}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        overflow: 'hidden',
        background: 'var(--bg)',
        opacity: closing ? 0 : mounted ? 1 : 0,
        transition: 'opacity 420ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Painterly bg */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${monde.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: 'monde-bg-ken-burns 36s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      />

      {/* Voile sombre */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.32) 35%, rgba(0,0,0,0.78) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top bar */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
          left: 12,
          right: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 3,
        }}
      >
        <button
          type="button"
          data-press
          onClick={handleClose}
          aria-label="Quitter le monde"
          style={{
            appearance: 'none',
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.70)',
            border: '0.5px solid rgba(251, 246, 232, 0.28)',
            color: 'var(--blue-900)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            WebkitTapHighlightColor: 'transparent',
            fontSize: 18,
            padding: 0,
          }}
        >
          ‹
        </button>
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 10,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            color: 'var(--blue-900)',
            opacity: 0.88,
            fontWeight: 600,
            textShadow: '0 1px 6px rgba(0, 0, 0, 0.48)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {String(etapeIdx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>
        <span style={{ width: 44, height: 44 }} aria-hidden />
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 64px)',
          left: 22,
          right: 22,
          height: 2,
          background: 'rgba(251, 246, 232, 0.16)',
          borderRadius: 2,
          overflow: 'hidden',
          zIndex: 3,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progressPct}%`,
            background: monde.accent,
            transition: 'width 600ms cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: `0 0 8px ${monde.accent}`,
          }}
        />
      </div>

      {/* Étape content */}
      {!completed && (
        <div
          key={etape.key}
          style={{
            position: 'absolute',
            top: 'calc(env(safe-area-inset-top, 0px) + 90px)',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 110px)',
            left: 22,
            right: 22,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            zIndex: 2,
            color: 'var(--blue-900)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            animation: 'monde-content-fade 700ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{ paddingTop: 80 }}>
            {/* Eyebrow */}
            <div
              className="neya-mark"
              style={{
                color: monde.accent,
                marginBottom: 12,
                fontSize: 9,
                opacity: 0.96,
                textShadow: '0 1px 6px rgba(0, 0, 0, 0.5)',
              }}
            >
              {monde.name.toUpperCase()} · {etape.eyebrow.toUpperCase()}
            </div>

            {/* Title */}
            <h2
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontVariationSettings: 'var(--fraunces-italic-soft)',
                fontWeight: 400,
                fontSize: 'clamp(28px, 8vw, 38px)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: 'var(--blue-900)',
                textShadow: '0 2px 16px rgba(0, 0, 0, 0.42)',
                marginBottom: 22,
              }}
            >
              {etape.title}
            </h2>

            {/* Body */}
            <div>
              {etape.body.map((para, i) => (
                <p
                  key={i}
                  style={{
                    margin: '0 0 14px',
                    fontFamily: 'var(--font-body)',
                    fontSize: 15.5,
                    lineHeight: 1.6,
                    color: 'var(--blue-900)',
                    opacity: 0.94,
                    textShadow: '0 1px 8px rgba(0, 0, 0, 0.42)',
                  }}
                >
                  {para}
                </p>
              ))}
            </div>

            {/* Quote */}
            {etape.quote && (
              <p
                style={{
                  margin: '22px 0 0',
                  paddingLeft: 16,
                  borderLeft: `2px solid ${monde.accent}`,
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontVariationSettings: 'var(--fraunces-italic-soft)',
                  fontSize: 18,
                  lineHeight: 1.4,
                  color: 'var(--blue-900)',
                  opacity: 0.92,
                  textShadow: '0 1px 8px rgba(0, 0, 0, 0.42)',
                }}
              >
                « {etape.quote} »
              </p>
            )}
          </div>
        </div>
      )}

      {/* Completed celebration */}
      {completed && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 32px',
            textAlign: 'center',
            color: 'var(--blue-900)',
            zIndex: 5,
            animation: 'monde-celebrate 800ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div
            className="neya-mark"
            style={{
              color: monde.accent,
              marginBottom: 18,
              opacity: 1,
              fontSize: 10,
              letterSpacing: '0.32em',
              textShadow: '0 1px 8px rgba(0, 0, 0, 0.5)',
            }}
          >
            MONDE TRAVERSÉ
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              fontSize: 'clamp(34px, 10vw, 48px)',
              lineHeight: 1.05,
              color: 'var(--blue-900)',
              textShadow: '0 2px 22px rgba(0, 0, 0, 0.55)',
              marginBottom: 16,
            }}
          >
            {monde.name}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14.5,
              lineHeight: 1.6,
              color: 'var(--blue-900)',
              opacity: 0.88,
              maxWidth: 320,
              textShadow: '0 1px 8px rgba(0, 0, 0, 0.42)',
            }}
          >
            Tu as marché jusqu'au bout. Tu peux revenir ici à tout moment.
          </div>
        </div>
      )}

      {/* Bottom controls */}
      {!completed && (
        <div
          style={{
            position: 'absolute',
            left: 22,
            right: 22,
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            zIndex: 3,
          }}
        >
          {/* Précédent */}
          <button
            type="button"
            data-press
            onClick={handlePrev}
            disabled={etapeIdx === 0}
            aria-label="Étape précédente"
            style={{
              appearance: 'none',
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.70)',
              border: '0.5px solid rgba(251, 246, 232, 0.28)',
              color: 'var(--blue-900)',
              cursor: etapeIdx === 0 ? 'default' : 'pointer',
              opacity: etapeIdx === 0 ? 0.32 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              WebkitTapHighlightColor: 'transparent',
              fontSize: 18,
              padding: 0,
              flexShrink: 0,
            }}
          >
            ‹
          </button>

          {/* Suivant (CTA principal) */}
          <button
            type="button"
            data-press
            onClick={handleNext}
            aria-label={isLast ? 'Terminer le monde' : 'Continuer'}
            style={{
              appearance: 'none',
              flex: 1,
              padding: '16px 28px',
              minHeight: 52,
              background: monde.accent,
              color: 'var(--blue-900)',
              border: 'none',
              borderRadius: 999,
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.222em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              boxShadow: `0 6px 22px ${monde.accentRgb}, 0.42)`,
            }}
          >
            {etape.cta}
          </button>
        </div>
      )}

      <style>{`
        @keyframes monde-bg-ken-burns {
          0%   { transform: scale(1)    translate3d(0, 0, 0); }
          100% { transform: scale(1.06) translate3d(0, -1%, 0); }
        }
        @keyframes monde-content-fade {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes monde-celebrate {
          0%   { opacity: 0; transform: scale(0.96); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
