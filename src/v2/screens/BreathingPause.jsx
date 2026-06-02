/* ============================================================
   BreathingPause — mini respiration guidée
   ============================================================
   3 rythmes supportés via prop `rhythm` :
     - '5-5'   : inspire 5s / expire 5s · 6 cycles (cohérence)
     - '4-7-8' : inspire 4s / hold 7s / expire 8s · 4 cycles (relax)
     - '4-6'   : inspire 4s / expire 6s · 6 cycles (apaisant)

   Lancée depuis Checkin (V6) ou Crise overlay (safety).
   ============================================================ */

import { useEffect, useRef, useState } from 'react';
import { haptic } from '../state';
import useStandardOverlay from '../hooks/useStandardOverlay';

const RHYTHMS = {
  '5-5':   { inspire: 5000, hold: 0,    expire: 5000,  cycles: 6, label: '5·5'   },
  '4-7-8': { inspire: 4000, hold: 7000, expire: 8000,  cycles: 4, label: '4·7·8' },
  '4-6':   { inspire: 4000, hold: 0,    expire: 6000,  cycles: 6, label: '4·6'   },
};

// Mappe les noms semantiques vers les CSS vars du DS.
// Si la prop accent est deja une valeur CSS (e.g. 'var(--terracotta)' venant
// de Cocon via WORLDS[*].accent), on la laisse telle quelle.
const ACCENT_TOKEN_MAP = {
  rose: 'var(--rose-700)',
  violet: 'var(--violet)',
  blue: 'var(--blue-700)',
  terracotta: 'var(--terracotta)',
  gold: 'var(--gold)',
};

function resolveAccent(value) {
  if (!value) return ACCENT_TOKEN_MAP.rose;
  return ACCENT_TOKEN_MAP[value] || value;
}

export default function BreathingPause({ accent = 'rose', rhythm = '5-5', onClose, onComplete }) {
  const accentCss = resolveAccent(accent);
  const r = RHYTHMS[rhythm] || RHYTHMS['5-5'];
  const [phase, setPhase] = useState('inspire'); // 'inspire' | 'hold' | 'expire'
  const [cycle, setCycle] = useState(0);
  const [done, setDone] = useState(false);
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const aliveRef = useRef(true);
  const timersRef = useRef([]);

  const safeTimeout = (fn, ms) => {
    const id = setTimeout(() => {
      if (aliveRef.current) fn();
    }, ms);
    timersRef.current.push(id);
    return id;
  };

  // Durée totale en secondes (un cycle = inspire + hold + expire) — utile pour persister
  // dans profile.checkins[i].action (cf. spec V6 §5.1).
  const totalDurationSec = Math.round(((r.inspire + r.hold + r.expire) * r.cycles) / 1000);

  const handleClose = () => {
    if (closing) return;
    haptic(2);
    setClosing(true);
    safeTimeout(() => {
      if (done) {
        onComplete?.({
          type: 'breath',
          rhythm,
          cycles: r.cycles,
          duration: totalDurationSec,
        });
      }
      onClose?.();
    }, 380);
  };

  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closing,
    onClose: handleClose,
    labelText: 'Respiration douce',
  });

  // Phase cycling : inspire -> [hold] -> expire -> inspire (suivant)
  useEffect(() => {
    if (done) return;
    const duration = phase === 'inspire' ? r.inspire : phase === 'hold' ? r.hold : r.expire;
    const id = setTimeout(() => {
      if (!aliveRef.current) return;
      setPhase((p) => {
        if (p === 'inspire') return r.hold > 0 ? 'hold' : 'expire';
        if (p === 'hold') return 'expire';
        return 'inspire';
      });
    }, duration);
    timersRef.current.push(id);
    return () => clearTimeout(id);
  }, [phase, done, r.inspire, r.hold, r.expire]);

  // Compteur cycles : chaque inspire = nouveau cycle
  useEffect(() => {
    if (done) return;
    if (phase === 'inspire' && cycle > 0) {
      haptic(2);
    }
    if (phase === 'inspire') {
      setCycle((c) => {
        const next = c + 1;
        if (next > r.cycles) {
          setDone(true);
          haptic([6, 80, 6]);
        }
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Mount + cleanup
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

  const progressPct = Math.min(100, (Math.min(cycle, r.cycles) / r.cycles) * 100);
  const isLarge = phase === 'inspire' || phase === 'hold';
  // Transition matches the duration of the current phase for smooth visual flow.
  const phaseMs = phase === 'inspire' ? r.inspire : phase === 'hold' ? r.hold : r.expire;
  const safeCycle = Math.min(cycle, r.cycles);

  return (
    <div
      ref={containerRef}
      {...dialogProps}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        // Ink profond légèrement bleuté — plus méditatif que noir pur.
        background: 'radial-gradient(ellipse at 50% 38%, rgba(18, 22, 44, 0.96) 0%, rgba(8, 10, 22, 0.97) 60%, rgba(4, 6, 16, 0.98) 100%)',
        backdropFilter: 'blur(28px) saturate(140%)',
        WebkitBackdropFilter: 'blur(28px) saturate(140%)',
        opacity: closing ? 0 : mounted ? 1 : 0,
        transition: 'opacity 380ms cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--blue-900)',
        padding: '22px',
      }}
    >
      {/* Top eyebrow + cycle dots */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 22px)',
          left: 22,
          right: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: 'var(--blue-900)',
            opacity: 0.82,
            fontWeight: 600,
          }}
        >
          Respiration douce
        </span>
        <div
          aria-label={`Cycle ${safeCycle} sur ${r.cycles}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {Array.from({ length: r.cycles }).map((_, i) => {
            const filled = i < safeCycle;
            return (
              <span
                key={i}
                aria-hidden
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: filled ? accentCss : 'transparent',
                  border: `0.5px solid ${filled ? accentCss : 'rgba(251, 246, 232, 0.42)'}`,
                  opacity: filled ? 0.92 : 0.55,
                  boxShadow: filled ? `0 0 6px ${accentCss}88` : 'none',
                  transition: 'background 600ms cubic-bezier(0.16, 1, 0.3, 1), opacity 600ms ease-out, box-shadow 600ms ease-out',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Breathing circle — animation accentuée */}
      <div
        style={{
          position: 'relative',
          width: 300,
          height: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Halo rings — 4 layers, écart amplifié + ondulation organique (drift indépendant du cycle) */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: `breath-halo-drift ${11000 + i * 1700}ms ease-in-out ${i * 420}ms infinite`,
              willChange: 'transform',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: `1px solid ${accentCss}`,
                opacity: isLarge ? 0.28 - i * 0.06 : 0.55 - i * 0.12,
                transform: isLarge ? `scale(${1.0 + i * 0.14})` : `scale(${0.32 + i * 0.10})`,
                transition: `transform ${phaseMs}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${phaseMs}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                boxShadow: isLarge ? `0 0 20px ${accentCss}25` : 'none',
              }}
            />
          </div>
        ))}
        {/* Core orb — écart amplifié 250 ↔ 60 */}
        <div
          style={{
            width: isLarge ? 250 : 60,
            height: isLarge ? 250 : 60,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${accentCss} 0%, ${accentCss}88 35%, ${accentCss}33 65%, transparent 100%)`,
            opacity: isLarge ? 0.92 : 0.36,
            filter: isLarge ? 'blur(1px)' : 'blur(4px)',
            boxShadow: isLarge
              ? `0 0 60px 16px ${accentCss}55, 0 0 120px 32px ${accentCss}28`
              : `0 0 20px 6px ${accentCss}28`,
            transition: `width ${phaseMs}ms cubic-bezier(0.34, 1.1, 0.64, 1), height ${phaseMs}ms cubic-bezier(0.34, 1.1, 0.64, 1), opacity ${phaseMs}ms cubic-bezier(0.4, 0, 0.2, 1), filter ${phaseMs}ms ease-out, box-shadow ${phaseMs}ms ease-out`,
          }}
        />
        {/* Anneau central plus marqué */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            width: isLarge ? 260 : 70,
            height: isLarge ? 260 : 70,
            borderRadius: '50%',
            border: `1.5px solid ${accentCss}`,
            opacity: isLarge ? 0.7 : 0.36,
            transition: `width ${phaseMs}ms cubic-bezier(0.34, 1.1, 0.64, 1), height ${phaseMs}ms cubic-bezier(0.34, 1.1, 0.64, 1), opacity ${phaseMs}ms ease-out`,
          }}
        />
        {/* Phase label */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            key={phase + (done ? '-done' : '')}
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 28,
              letterSpacing: '-0.014em',
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              color: 'var(--blue-900)',
              opacity: 0.96,
              animation: 'breath-label-fade 700ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {done ? 'Posé.' : phase === 'inspire' ? 'Inspire' : phase === 'hold' ? 'Garde' : 'Expire'}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          marginTop: 56,
          width: 'min(72%, 280px)',
          height: 1,
          background: 'rgba(251, 246, 232, 0.14)',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progressPct}%`,
            height: '100%',
            background: accentCss,
            transition: 'width 700ms cubic-bezier(0.16, 1, 0.3, 1)',
            opacity: 0.85,
            animation: !done ? 'breath-progress-pulse 5200ms ease-in-out infinite' : 'none',
          }}
        />
      </div>

      {/* Rhythm label — discret, sous la progress bar */}
      <div
        style={{
          marginTop: 14,
          fontFamily: 'var(--font-ui)',
          fontSize: 9,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: 'var(--blue-900)',
          opacity: 0.52,
          fontWeight: 500,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        Rythme {r.label}
      </div>

      {/* Bottom action — Fermer / Terminer */}
      <button
        type="button"
        onClick={handleClose}
        data-press
        aria-label={done ? 'Terminer la pause et revenir' : 'Sortir de la respiration'}
        style={{
          position: 'absolute',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 36px)',
          left: '50%',
          transform: 'translateX(-50%)',
          appearance: 'none',
          padding: '14px 28px',
          minHeight: 44,
          background: done ? accentCss : 'transparent',
          color: done ? 'var(--cream)' : '#FBF6E8',
          border: done ? 'none' : '0.5px solid rgba(251, 246, 232, 0.32)',
          borderRadius: 999,
          fontFamily: 'var(--font-ui)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.222em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          opacity: done ? 1 : 0.78,
          transition: 'all 320ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {done ? "C'est fini" : 'Sortir'}
      </button>

      <style>{`
        @keyframes breath-label-fade {
          0%   { opacity: 0; transform: translateY(4px); }
          100% { opacity: 0.96; transform: translateY(0); }
        }
        @keyframes breath-halo-drift {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25%      { transform: translate(2px, -3px) rotate(0.4deg); }
          50%      { transform: translate(-1px, 2px) rotate(-0.3deg); }
          75%      { transform: translate(-3px, -1px) rotate(0.2deg); }
        }
        @keyframes breath-progress-pulse {
          0%, 100% { opacity: 0.85; }
          50%      { opacity: 0.62; }
        }
        @media (prefers-reduced-motion: reduce) {
          [aria-label*="Cycle"] span { transition: none !important; }
        }
      `}</style>
    </div>
  );
}
