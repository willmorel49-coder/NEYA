/* ============================================================
   ÇA VA ? V4 — Splash (palette bleu/rose claire) — premium polish
   ============================================================
   Fond clair --bg + blobs decoratifs (ken-burns) + Cormorant Garamond italic.
   Mark · Logo · Sous-titre avec stagger Apple-style.
   2.5s autoplay, tap-to-skip via pill glass premium.
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

  const ease = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

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
        @keyframes splashBreathe {
          0%, 100% { opacity: 0.82; }
          50%      { opacity: 1; }
        }
        @keyframes splashBlobsKenburns {
          0%   { transform: scale(1)    translate3d(0,0,0); }
          100% { transform: scale(1.04) translate3d(0,-4px,0); }
        }
        [data-splash-blobs] > * {
          animation: splashBlobsKenburns 16s ease-in-out infinite alternate;
          transform-origin: 50% 50%;
          will-change: transform;
        }
        [data-splash-skip]:hover {
          background: rgba(255,255,255,0.95) !important;
          box-shadow: 0 6px 22px rgba(10,36,56,0.14) !important;
        }
        [data-splash-skip]:active {
          transform: scale(0.96);
        }
        @media (prefers-reduced-motion: reduce) {
          [data-splash-anim] { animation: none !important; transition: none !important; opacity: 1 !important; transform: none !important; }
          [data-splash-blobs] > * { animation: none !important; }
        }
      `}</style>

      <div data-splash-blobs style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Blobs variant="rose-blue" />
      </div>

      {/* Top-right skip — pill glass premium */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); fire(); }}
        aria-label="Passer"
        data-splash-skip
        data-splash-anim
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          right: 18,
          zIndex: 2,
          appearance: 'none',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          border: '1px solid rgba(255,255,255,0.9)',
          padding: '9px 16px',
          minHeight: 36,
          borderRadius: 50,
          cursor: 'pointer',
          fontFamily: "'Inter', system-ui, sans-serif",
          fontWeight: 500,
          fontSize: 13,
          color: 'var(--blue-700)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(6px)',
          transition: `opacity 800ms ${ease} 200ms, transform 800ms ${ease} 200ms, background 240ms ${ease}, box-shadow 240ms ${ease}`,
          WebkitTapHighlightColor: 'transparent',
          boxShadow: '0 2px 14px rgba(10,36,56,0.08)',
        }}
      >
        Passer ›
      </button>

      {/* Center stack — Mark · Logo · Sous-titre (stagger Apple-style) */}
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
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
            transition: `opacity 800ms ${ease} 100ms, transform 800ms ${ease} 100ms`,
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
            fontSize: 'clamp(72px, 20vw, 112px)',
            letterSpacing: '0.04em',
            color: 'var(--blue-900)',
            lineHeight: 1,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: `opacity 1000ms ${ease} 300ms, transform 1000ms ${ease} 300ms`,
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
            fontSize: 17,
            color: 'var(--text-secondary)',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(6px)',
            animation: mounted ? 'splashBreathe 4s ease-in-out infinite 1400ms' : 'none',
            transition: `opacity 800ms ${ease} 600ms, transform 800ms ${ease} 600ms`,
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
