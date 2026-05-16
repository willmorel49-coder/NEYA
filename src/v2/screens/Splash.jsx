/* ============================================================
   ÇA VA ? V4 — Splash (palette bleu/rose claire)
   ============================================================
   Fond clair --bg + blobs decoratifs + Cormorant Garamond italic.
   2.5s autoplay, tap-to-skip.
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { ls, haptic } from '../state';
import Blobs from '../../components/Blobs';

export default function Splash({ onContinue }) {
  const [mounted, setMounted] = useState(false);
  const continuedRef = useRef(false);

  const lastSeen = ls.get('splash_seen_at', 0);
  const elapsed = Date.now() - lastSeen;
  const ms4h = 4 * 3600 * 1000;
  const ms7j = 7 * 24 * 3600 * 1000;
  let subtitle;
  if (!lastSeen || elapsed > ms7j) subtitle = "Tu n'es pas seul·e.";
  else if (elapsed > ms4h) subtitle = "T'as pas besoin d'aller bien pour commencer.";
  else subtitle = 'Et toi, ça va vraiment ?';

  const fire = () => {
    if (continuedRef.current) return;
    continuedRef.current = true;
    ls.set('splash_seen_at', Date.now());
    haptic(8);
    onContinue?.();
  };

  useEffect(() => {
    const m = setTimeout(() => setMounted(true), 60);
    const t = setTimeout(() => { fire(); }, 2500);
    return () => {
      clearTimeout(m);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      onClick={fire}
      role="dialog"
      aria-modal="true"
      aria-label="Entrer dans ÇA VA ?"
      tabIndex={0}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'var(--bg)',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <style>{`
        @keyframes splashFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashBreathe {
          0%, 100% { opacity: 0.78; }
          50%      { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-splash-anim] { animation: none !important; transition: none !important; opacity: 1 !important; }
        }
      `}</style>

      <Blobs variant="rose-blue" />

      {/* Top-right skip */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); fire(); }}
        aria-label="Passer"
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          right: 18,
          zIndex: 2,
          appearance: 'none',
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.85)',
          padding: '8px 16px',
          minHeight: 36,
          borderRadius: 50,
          cursor: 'pointer',
          fontFamily: "'Inter', system-ui, sans-serif",
          fontWeight: 500,
          fontSize: 13,
          color: 'var(--blue-700)',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 800ms cubic-bezier(0.22, 0.61, 0.36, 1) 200ms',
          WebkitTapHighlightColor: 'transparent',
          boxShadow: '0 2px 12px rgba(10,36,56,0.08)',
        }}
        data-splash-anim
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
          gap: 24,
          padding: '0 24px',
          textAlign: 'center',
          zIndex: 1,
        }}
      >
        <div
          data-splash-anim
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 10,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--blue-500)',
            opacity: mounted ? 1 : 0,
            transition: 'opacity 1400ms cubic-bezier(0.22, 0.61, 0.36, 1)',
          }}
        >
          MMXXVI · ÇA VA ?
        </div>

        <div
          data-splash-anim
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(64px, 18vw, 96px)',
            letterSpacing: '0.02em',
            color: 'var(--blue-900)',
            lineHeight: 1,
            opacity: mounted ? 1 : 0,
            transition: 'opacity 1400ms cubic-bezier(0.22, 0.61, 0.36, 1)',
          }}
        >
          ÇA VA ?
        </div>

        <div
          data-splash-anim
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(15px, 4.2vw, 18px)',
            color: 'var(--text-secondary)',
            opacity: mounted ? 1 : 0,
            animation: mounted ? 'splashBreathe 4s ease-in-out infinite' : 'none',
            transition: 'opacity 1600ms cubic-bezier(0.22, 0.61, 0.36, 1) 400ms',
            maxWidth: 320,
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}
