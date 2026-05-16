/* ============================================================
   BreathingPause — mini respiration 60 secondes
   ============================================================
   Cohérence cardiaque simplifiée : 5s inspire / 5s expire,
   6 cycles = 60 secondes. Cercle qui respire visuellement,
   compteur cycles, fermeture par tap ou auto-fin.

   Lancée depuis le Cocon via "Me poser 2 minutes".
   ============================================================ */

import { useEffect, useRef, useState } from 'react';
import { haptic } from '../state';
import useStandardOverlay from '../hooks/useStandardOverlay';

const PHASE_DURATION_MS = 5000;
const CYCLES = 6;

export default function BreathingPause({ accent = 'var(--terracotta)', onClose }) {
  const [phase, setPhase] = useState('inspire'); // 'inspire' | 'expire'
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

  const handleClose = () => {
    if (closing) return;
    haptic(2);
    setClosing(true);
    safeTimeout(() => onClose?.(), 380);
  };

  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closing,
    onClose: handleClose,
    labelText: 'Respiration douce',
  });

  // Cycle inspire/expire toutes les 5s
  useEffect(() => {
    if (done) return;
    const id = setInterval(() => {
      if (!aliveRef.current) return;
      setPhase((p) => (p === 'inspire' ? 'expire' : 'inspire'));
    }, PHASE_DURATION_MS);
    return () => clearInterval(id);
  }, [done]);

  // Compteur cycles : chaque inspire = nouveau cycle
  useEffect(() => {
    if (done) return;
    if (phase === 'inspire' && cycle > 0) {
      haptic(2);
    }
    if (phase === 'inspire') {
      setCycle((c) => {
        const next = c + 1;
        if (next > CYCLES) {
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

  const progressPct = Math.min(100, (Math.min(cycle, CYCLES) / CYCLES) * 100);

  return (
    <div
      ref={containerRef}
      {...dialogProps}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(8, 10, 24, 0.94)',
        backdropFilter: 'blur(24px) saturate(140%)',
        WebkitBackdropFilter: 'blur(24px) saturate(140%)',
        opacity: closing ? 0 : mounted ? 1 : 0,
        transition: 'opacity 380ms cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FBF6E8',
        padding: '22px',
      }}
    >
      {/* Top eyebrow + counter */}
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
            color: '#FBF6E8',
            opacity: 0.82,
            fontWeight: 600,
          }}
        >
          Respiration douce
        </span>
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 10,
            letterSpacing: '0.222em',
            color: '#FBF6E8',
            opacity: 0.78,
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {Math.min(cycle, CYCLES).toString().padStart(2, '0')} / {CYCLES.toString().padStart(2, '0')}
        </span>
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
        {/* Halo rings — 4 layers, écart amplifié */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `1px solid ${accent}`,
              opacity: phase === 'inspire' ? 0.28 - i * 0.06 : 0.55 - i * 0.12,
              transform: phase === 'inspire' ? `scale(${1.0 + i * 0.14})` : `scale(${0.32 + i * 0.10})`,
              transition: `transform ${PHASE_DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${PHASE_DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
              boxShadow: phase === 'inspire' ? `0 0 20px ${accent}25` : 'none',
            }}
          />
        ))}
        {/* Core orb — écart amplifié 250 ↔ 60 */}
        <div
          style={{
            width: phase === 'inspire' ? 250 : 60,
            height: phase === 'inspire' ? 250 : 60,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${accent} 0%, ${accent}88 35%, ${accent}33 65%, transparent 100%)`,
            opacity: phase === 'inspire' ? 0.92 : 0.36,
            filter: phase === 'inspire' ? 'blur(1px)' : 'blur(4px)',
            boxShadow: phase === 'inspire'
              ? `0 0 60px 16px ${accent}55, 0 0 120px 32px ${accent}28`
              : `0 0 20px 6px ${accent}28`,
            transition: `width ${PHASE_DURATION_MS}ms cubic-bezier(0.34, 1.1, 0.64, 1), height ${PHASE_DURATION_MS}ms cubic-bezier(0.34, 1.1, 0.64, 1), opacity ${PHASE_DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1), filter ${PHASE_DURATION_MS}ms ease-out, box-shadow ${PHASE_DURATION_MS}ms ease-out`,
          }}
        />
        {/* Anneau central plus marqué */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            width: phase === 'inspire' ? 260 : 70,
            height: phase === 'inspire' ? 260 : 70,
            borderRadius: '50%',
            border: `1.5px solid ${accent}`,
            opacity: phase === 'inspire' ? 0.7 : 0.36,
            transition: `width ${PHASE_DURATION_MS}ms cubic-bezier(0.34, 1.1, 0.64, 1), height ${PHASE_DURATION_MS}ms cubic-bezier(0.34, 1.1, 0.64, 1), opacity ${PHASE_DURATION_MS}ms ease-out`,
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
              color: '#FBF6E8',
              opacity: 0.96,
              animation: 'breath-label-fade 700ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {done ? 'Posé.' : phase === 'inspire' ? 'Inspire' : 'Expire'}
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
            background: accent,
            transition: 'width 700ms cubic-bezier(0.16, 1, 0.3, 1)',
            opacity: 0.85,
          }}
        />
      </div>

      {/* Bottom action — Fermer / Terminer */}
      <button
        type="button"
        onClick={handleClose}
        data-press
        aria-label={done ? 'Terminer la pause' : 'Quitter la respiration'}
        style={{
          position: 'absolute',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 36px)',
          left: '50%',
          transform: 'translateX(-50%)',
          appearance: 'none',
          padding: '14px 28px',
          minHeight: 44,
          background: done ? accent : 'transparent',
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
        {done ? 'Revenir' : 'Quitter'}
      </button>

      <style>{`
        @keyframes breath-label-fade {
          0%   { opacity: 0; transform: translateY(4px); }
          100% { opacity: 0.96; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
