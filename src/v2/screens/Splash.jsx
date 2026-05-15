/* ============================================================
   NÉYA V2 — Splash (cinematic entry)
   ============================================================
   The ONE dark moment in the V3 cream world. 2.5s autoplay,
   tap-to-skip. After this, the cream world reveals.
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { ls, haptic } from '../state';

export default function Splash({ onContinue }) {
  const [mounted, setMounted] = useState(false);
  const continuedRef = useRef(false);

  const fire = () => {
    if (continuedRef.current) return;
    continuedRef.current = true;
    ls.set('splash_seen_at', Date.now());
    haptic(8);
    onContinue?.();
  };

  useEffect(() => {
    // Trigger fade-ins shortly after mount
    const m = setTimeout(() => setMounted(true), 60);
    // Auto-dismiss after 2.5s
    const t = setTimeout(() => {
      fire();
    }, 2500);
    return () => {
      clearTimeout(m);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTap = () => {
    fire();
  };

  return (
    <div
      onClick={handleTap}
      role="button"
      tabIndex={0}
      aria-label="Entrer dans NÉYA"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundImage:
          "url('/img/splash.png'), url('/bg-onboarding.avif')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#050810',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Inline keyframes — splash is self-contained */}
      <style>{`
        @keyframes splashFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashBreathe {
          0%, 100% { opacity: 0.42; }
          50%      { opacity: 0.78; }
        }
      `}</style>

      {/* Cinematic vignette over photo */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to top, rgba(5,8,16,0.85), rgba(5,8,16,0.45) 50%, rgba(5,8,16,0.75))',
          pointerEvents: 'none',
        }}
      />

      {/* Top-right explicit skip — 44×44 hit zone */}
      <button
        type="button"
        data-press
        onClick={(e) => {
          e.stopPropagation();
          handleTap();
        }}
        aria-label="Passer"
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          right: 18,
          zIndex: 1,
          appearance: 'none',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          cursor: 'pointer',
          padding: '12px 14px',
          minWidth: 44,
          minHeight: 44,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Sora', system-ui, sans-serif",
          fontWeight: 500,
          fontSize: 11,
          letterSpacing: '0.222em',
          textTransform: 'uppercase',
          color: 'rgba(251,246,232,0.5)',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 1400ms var(--ease-narrative) 600ms',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        Passer ›
      </button>

      {/* Center stack */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
          padding: '0 24px',
          textAlign: 'center',
        }}
      >
        {/* Caps mark */}
        <div
          style={{
            fontFamily: "'Sora', system-ui, sans-serif",
            fontWeight: 400,
            fontSize: 9,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            color: 'rgba(251,246,232,0.62)',
            opacity: mounted ? 1 : 0,
            transition: 'opacity 1400ms var(--ease-narrative)',
          }}
        >
          MMXXVI · NÉYA
        </div>

        {/* Wordmark */}
        <div
          style={{
            fontFamily: "'Sora', system-ui, sans-serif",
            fontWeight: 200,
            fontSize: 'clamp(64px, 18vw, 96px)',
            letterSpacing: '0.04em',
            color: '#FBF6E8',
            lineHeight: 1,
            opacity: mounted ? 1 : 0,
            transition: 'opacity 1400ms var(--ease-narrative)',
          }}
        >
          NÉYA
        </div>

        {/* Hairline */}
        <div
          style={{
            width: 48,
            height: 1,
            background: 'rgba(251,246,232,0.42)',
            opacity: mounted ? 1 : 0,
            transition: 'opacity 1400ms var(--ease-narrative)',
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: 'clamp(17px, 4.5vw, 21px)',
            color: 'rgba(251,246,232,0.78)',
            maxWidth: 320,
            lineHeight: 1.4,
            fontVariationSettings: "'opsz' 144, 'SOFT' 100",
            opacity: mounted ? 1 : 0,
            transition: 'opacity 1400ms var(--ease-narrative)',
          }}
        >
          Et toi, ça va vraiment ?
        </div>
      </div>

      {/* Bottom hint */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 36px)',
          textAlign: 'center',
          fontFamily: "'Sora', system-ui, sans-serif",
          fontWeight: 400,
          fontSize: 11,
          letterSpacing: '0.222em',
          textTransform: 'uppercase',
          color: 'rgba(251,246,232,0.42)',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 1400ms var(--ease-narrative) 400ms',
          animation: mounted
            ? 'splashBreathe 4s ease-in-out infinite 1800ms'
            : 'none',
          pointerEvents: 'none',
        }}
      >
        Touche pour entrer
      </div>
    </div>
  );
}
