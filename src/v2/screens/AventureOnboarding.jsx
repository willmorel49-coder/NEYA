/* ============================================================
   AventureOnboarding — tour cinématique 3 piliers
   ============================================================
   3 slides painterly plein écran + texte. Skippable.
   Affiché 1 seule fois (profile.aventure.onboardingSeen).
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { haptic, patchProfile, getProfile } from '../state';
import useStandardOverlay from '../hooks/useStandardOverlay';

const SLIDES = [
  {
    key: 'aventure',
    eyebrow: 'PILIER 01',
    title: 'L\'Aventure',
    image: '/img/world-foret.png',
    accent: '#C29051',
    body: 'Traverse six mondes émotionnels.\nDe la Forêt de Clarté au Refuge partagé.\nÀ chaque monde, des quêtes pour mieux te connaître.',
  },
  {
    key: 'connaissance',
    eyebrow: 'PILIER 02',
    title: 'La Connaissance',
    image: '/img/world-temple.png',
    accent: '#7397BC',
    body: 'Apprends ce que ton mental traverse.\nHuit leçons sur l\'anxiété, le burn-out, l\'estime de soi.\nNi clinique. Ni cliché. Juste comprendre.',
  },
  {
    key: 'temps',
    eyebrow: 'PILIER 03',
    title: 'Les 3 Temps du Soi',
    image: '/img/world-lac.png',
    accent: '#34917F',
    body: 'Réconcilie hier.\nHabite maintenant.\nConstruis demain.\nDouze rituels guidés, à faire à ton rythme.',
  },
];

export default function AventureOnboarding({ onClose }) {
  const [idx, setIdx] = useState(0);
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const aliveRef = useRef(true);
  const timersRef = useRef([]);

  const safeTimeout = (fn, ms) => {
    const id = setTimeout(() => { if (aliveRef.current) fn(); }, ms);
    timersRef.current.push(id);
    return id;
  };

  const markSeen = () => {
    const profile = getProfile();
    const av = profile.aventure || {};
    patchProfile({ aventure: { ...av, onboardingSeen: true } });
  };

  const handleClose = () => {
    if (closing) return;
    haptic(3);
    markSeen();
    setClosing(true);
    safeTimeout(() => onClose?.(), 420);
  };

  const handleNext = () => {
    if (idx < SLIDES.length - 1) {
      haptic(2);
      setIdx(idx + 1);
    } else {
      haptic(6);
      handleClose();
    }
  };

  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closing,
    onClose: handleClose,
    labelText: 'Découverte de l\'Aventure',
  });

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    haptic(4);
    return () => {
      cancelAnimationFrame(raf);
      aliveRef.current = false;
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  const slide = SLIDES[idx];
  const isLast = idx === SLIDES.length - 1;

  return (
    <div
      ref={containerRef}
      {...dialogProps}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        overflow: 'hidden',
        background: '#0a0c14',
        opacity: closing ? 0 : mounted ? 1 : 0,
        transition: 'opacity 420ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Slides painterly empilés (crossfade) */}
      {SLIDES.map((s, i) => (
        <div
          key={s.key}
          aria-hidden={i !== idx}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${s.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: i === idx ? 1 : 0,
            transition: 'opacity 800ms cubic-bezier(0.16, 1, 0.3, 1)',
            transform: i === idx ? 'scale(1.04)' : 'scale(1)',
            transitionProperty: 'opacity, transform',
            transitionDuration: '800ms, 8000ms',
          }}
        />
      ))}

      {/* Voile sombre */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.18) 35%, rgba(0,0,0,0.78) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Skip top-right */}
      <button
        type="button"
        data-press
        onClick={handleClose}
        aria-label="Passer"
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 18px)',
          right: 18,
          appearance: 'none',
          background: 'rgba(251, 246, 232, 0.10)',
          border: '0.5px solid rgba(251, 246, 232, 0.22)',
          borderRadius: 999,
          color: '#FBF6E8',
          cursor: 'pointer',
          padding: '8px 16px',
          minHeight: 36,
          fontFamily: 'var(--font-ui)',
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          WebkitTapHighlightColor: 'transparent',
          zIndex: 3,
        }}
      >
        Passer
      </button>

      {/* Texte centré */}
      <div
        style={{
          position: 'absolute',
          left: 22,
          right: 22,
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 120px)',
          color: '#FBF6E8',
          textAlign: 'left',
          maxWidth: 540,
          zIndex: 2,
        }}
      >
        <div
          key={slide.key + '-eyebrow'}
          className="neya-mark"
          style={{
            color: slide.accent,
            marginBottom: 14,
            fontSize: 9,
            animation: 'onb-fade 600ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {slide.eyebrow}
        </div>
        <h1
          key={slide.key + '-title'}
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(38px, 11vw, 58px)',
            lineHeight: 0.98,
            letterSpacing: '-0.026em',
            fontVariationSettings: '"opsz" 144, "SOFT" 50',
            color: '#FBF6E8',
            textShadow: '0 2px 22px rgba(0,0,0,0.42)',
            animation: 'onb-fade 700ms cubic-bezier(0.16, 1, 0.3, 1) 80ms backwards',
          }}
        >
          {slide.title}
        </h1>
        <p
          key={slide.key + '-body'}
          style={{
            margin: '20px 0 0',
            fontFamily: 'var(--font-body)',
            fontSize: 15.5,
            lineHeight: 1.6,
            color: '#FBF6E8',
            opacity: 0.92,
            maxWidth: 360,
            textShadow: '0 1px 8px rgba(0,0,0,0.36)',
            whiteSpace: 'pre-line',
            animation: 'onb-fade 800ms cubic-bezier(0.16, 1, 0.3, 1) 160ms backwards',
          }}
        >
          {slide.body}
        </p>
      </div>

      {/* Bottom : dots + bouton */}
      <div
        style={{
          position: 'absolute',
          left: 22,
          right: 22,
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 36px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          zIndex: 3,
        }}
      >
        {/* Dots */}
        <div style={{ display: 'flex', gap: 8 }}>
          {SLIDES.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => { if (i !== idx) { haptic(2); setIdx(i); } }}
              aria-label={`Slide ${i + 1}`}
              style={{
                appearance: 'none',
                width: i === idx ? 28 : 8,
                height: 8,
                borderRadius: 999,
                background: i === idx ? slide.accent : 'rgba(251, 246, 232, 0.32)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 360ms cubic-bezier(0.16, 1, 0.3, 1)',
                padding: 0,
                WebkitTapHighlightColor: 'transparent',
              }}
            />
          ))}
        </div>

        {/* CTA */}
        <button
          type="button"
          data-press
          onClick={handleNext}
          style={{
            appearance: 'none',
            padding: '14px 26px',
            minHeight: 48,
            background: slide.accent,
            color: '#FBF6E8',
            border: 'none',
            borderRadius: 999,
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.28)',
            transition: 'background 360ms ease-out',
          }}
        >
          {isLast ? 'Commencer' : 'Suivant'}
        </button>
      </div>

      <style>{`
        @keyframes onb-fade {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
