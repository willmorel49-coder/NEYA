/* ============================================================
   ÇA VA ? V4 — Méditation (light glass, blobs, violet accent)
   ============================================================
   Bg clair var(--bg) + Blobs rose-violet + BreathingCircle 4·7·8
   centré (160px, violet) + dust particles + bottom row glass.
   ============================================================ */

import { useState, useEffect, useRef, useMemo } from 'react';
import { WORLDS } from '../worlds';
import {
  haptic,
  getProfile,
  completeMeditation,
  getOnboardingTargetMinutes,
  addSouvenir,
} from '../state';
import Blobs from '../../components/Blobs';
import useStandardOverlay from '../hooks/useStandardOverlay';

// 4-7-8 breathing cycle = 19 seconds
const CYCLE_MS = 19000;
const PHASES = [
  { key: 'inspire', label: 'Inspire',  duration: 4 },
  { key: 'retiens', label: 'Retiens',  duration: 7 },
  { key: 'expire',  label: 'Expire',   duration: 8 },
];

function getPhase(tMs) {
  const t = (tMs % CYCLE_MS) / 1000; // 0..19
  if (t < 4) return { ...PHASES[0], remaining: Math.ceil(4 - t) };
  if (t < 11) return { ...PHASES[1], remaining: Math.ceil(11 - t) };
  return { ...PHASES[2], remaining: Math.ceil(19 - t) };
}

export default function Meditation({ worldKey = 'foret', onClose }) {
  const profile = getProfile();
  const world = WORLDS[worldKey] || WORLDS.foret;
  const target = getOnboardingTargetMinutes();

  const [paused, setPaused] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [breathMs, setBreathMs] = useState(0);
  const [show, setShow] = useState(false);
  const [toast, setToast] = useState(null);

  const targetReachedRef = useRef(false);
  const closingRef = useRef(false);
  const closeTimerRef = useRef(null);

  // Fade-in on mount
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Cleanup pending close timer
  useEffect(() => () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  // Notify shell that overlay is open
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('neya:fullscreen-overlay', { detail: { open: true } }));
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('neya:fullscreen-overlay', { detail: { open: false } }));
      }
    };
  }, []);

  // Elapsed timer — 1Hz, drift-resistant
  useEffect(() => {
    if (paused) return;
    const start = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const baseline = elapsedMs;
    const tick = setInterval(() => {
      const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      const dt = now - start;
      setElapsedMs(baseline + Math.floor(dt / 1000) * 1000);
    }, 1000);
    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  // Breath sub-timer — 50ms for smooth phase tracking
  useEffect(() => {
    if (paused) return;
    const start = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const baseline = breathMs;
    const tick = setInterval(() => {
      const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      const dt = now - start;
      setBreathMs(baseline + dt);
    }, 50);
    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  const minutes = Math.floor(elapsedMs / 60000);
  const seconds = Math.floor((elapsedMs % 60000) / 1000);
  const phase = getPhase(breathMs);
  const reached = target !== 999 && minutes >= target;

  // Reached pulse haptic
  useEffect(() => {
    if (target === 999) return;
    if (targetReachedRef.current) return;
    if (minutes >= target) {
      targetReachedRef.current = true;
      haptic([6, 40, 6]);
    }
  }, [minutes, target]);

  // Dust particles drift outward only during expire
  const dust = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => ({
      angle: (i / 7) * Math.PI * 2 + (i * 0.4),
      delay: i * 0.25,
      duration: 7.5 + (i % 3) * 0.6,
      offset: 6 + (i % 4) * 3,
    })),
    [],
  );

  const handleClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    if (minutes >= 1) {
      const { wasNew } = completeMeditation(worldKey, minutes);
      addSouvenir({
        type: 'meditation',
        world: worldKey,
        label: `${minutes} minute${minutes > 1 ? 's' : ''} a la ${world.name}`,
        detail: wasNew ? 'Premiere fois ici.' : null,
      });
      if (wasNew) {
        addSouvenir({
          type: 'world-unlock',
          world: worldKey,
          label: `Decouverte de ${world.name}`,
          detail: world.totem,
        });
      }
      haptic([8, 60, 8]);
      setToast({ minutes, wasNew });
      closeTimerRef.current = setTimeout(() => {
        closeTimerRef.current = null;
        onClose?.();
      }, 2200);
      return;
    }
    haptic(4);
    onClose?.();
  };

  const objectifLabel = target === 999 ? 'Objectif libre' : `Objectif ${target} min`;

  const { dialogProps, containerRef } = useStandardOverlay({
    open: !toast,
    onClose: handleClose,
    labelText: 'Meditation guidee',
  });

  const isExpire = phase.key === 'expire' && !paused;

  return (
    <div
      ref={containerRef}
      {...dialogProps}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--bg)',
        opacity: show ? 1 : 0,
        transition: 'opacity 600ms ease-out',
        zIndex: 60,
        overflow: 'hidden',
      }}
    >
      <Blobs variant="rose-violet" />

      {/* Local CSS — breathing scale + dust drift */}
      <style>{`
        @keyframes cv-breathe-circle {
          0%   { transform: translate(-50%, -50%) scale(1); }
          21%  { transform: translate(-50%, -50%) scale(1.4); }
          57.9%{ transform: translate(-50%, -50%) scale(1.4); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes cv-dust-drift {
          0%   { opacity: 0; transform: translate(-50%, -50%) translate(0px, 0px); }
          15%  { opacity: 0.7; }
          100% { opacity: 0; transform: translate(-50%, -50%) translate(var(--dx), var(--dy)); }
        }
        @keyframes cv-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Top header — chapter + world name */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 22px)',
          left: 22,
          right: 22,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.20em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          MEDITATION
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.20em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            CHAPITRE {String(world.chapter).padStart(2, '0')}
          </div>
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 9,
              fontWeight: 500,
              color: 'var(--violet)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            {world.name}
          </div>
        </div>
      </div>

      {/* Mantra hint */}
      {profile.mantra && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(env(safe-area-inset-top, 0px) + 78px)',
            left: 22,
            right: 22,
            textAlign: 'center',
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 20,
              lineHeight: 1.35,
              color: 'var(--text-primary)',
              opacity: 0.88,
            }}
          >
            « {profile.mantra} »
          </div>
        </div>
      )}

      {/* Centered breathing zone */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: paused ? 0.55 : 1,
          transition: 'opacity 320ms ease-out',
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 240,
            height: 240,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Breathing circle 160px — animates 1 → 1.4 → 1 over 19s */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(127,90,138,0.30) 0%, transparent 70%)',
              border: '0.5px solid rgba(127,90,138,0.60)',
              transform: 'translate(-50%, -50%) scale(1)',
              animation: paused ? 'none' : `cv-breathe-circle ${CYCLE_MS}ms ease-in-out infinite`,
              boxShadow: '0 0 40px rgba(127,90,138,0.15)',
            }}
          />

          {/* Dust particles — only visible during expire phase */}
          {isExpire && dust.map((d, i) => {
            const dx = Math.cos(d.angle) * 80;
            const dy = Math.sin(d.angle) * 80;
            return (
              <span
                key={i}
                aria-hidden
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: 'rgba(127,90,138,0.55)',
                  pointerEvents: 'none',
                  '--dx': `${dx}px`,
                  '--dy': `${dy}px`,
                  animation: `cv-dust-drift ${d.duration}s ease-out ${d.delay}s infinite`,
                }}
              />
            );
          })}

          {/* Phase label + seconds (center) */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              pointerEvents: 'none',
              animation: 'cv-fade-in 600ms ease-out',
            }}
          >
            <div
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: 14,
                color: 'var(--text-secondary)',
                letterSpacing: '0.02em',
              }}
            >
              {paused ? 'En pause' : phase.label}
            </div>
            <div
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 24,
                fontWeight: 600,
                color: 'var(--violet)',
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1,
              }}
            >
              {paused ? '—' : phase.remaining}
            </div>
          </div>
        </div>
      </div>

      {/* Reached caption */}
      {reached && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 130px)',
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 2,
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 18,
            color: 'var(--violet)',
            pointerEvents: 'none',
            animation: 'cv-fade-in 600ms ease-out',
          }}
        >
          Tu y es. Tu peux fermer.
        </div>
      )}

      {/* Bottom row — Pause/Play · Timer · Close */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          gap: 12,
          zIndex: 2,
        }}
      >
        <button
          type="button"
          data-press
          onClick={() => { haptic(4); setPaused((p) => !p); }}
          aria-label={paused ? 'Reprendre' : 'Pause'}
          style={glassBtnStyle}
        >
          {paused ? '▶' : '❚❚'}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.20em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            DUREE
          </div>
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 28,
              fontWeight: 600,
              color: 'var(--text-primary)',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1.1,
            }}
          >
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 11,
              fontWeight: 400,
              color: 'var(--text-secondary)',
              marginTop: 2,
            }}
          >
            {objectifLabel}
          </div>
        </div>

        <button
          type="button"
          data-press
          onClick={handleClose}
          aria-label="Fermer"
          style={glassBtnStyle}
        >
          ✕
        </button>
      </div>

      {/* Completion toast */}
      {toast && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(238, 243, 248, 0.95)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 32px',
            gap: 14,
            zIndex: 80,
            animation: 'cv-fade-in 360ms ease-out both',
          }}
        >
          <div
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 26,
              lineHeight: 1.32,
              color: 'var(--text-primary)',
              textAlign: 'center',
              maxWidth: 320,
            }}
          >
            {toast.wasNew
              ? `« Tu as explore la ${world.name}. »`
              : `« Tu es passe par la. »`}
          </div>
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.222em',
              textTransform: 'uppercase',
              color: 'var(--violet)',
            }}
          >
            +{toast.minutes} MIN
          </div>
        </div>
      )}
    </div>
  );
}

const glassBtnStyle = {
  appearance: 'none',
  width: 40,
  height: 40,
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.65)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.85)',
  color: 'var(--text-primary)',
  fontSize: 13,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  WebkitTapHighlightColor: 'transparent',
  boxShadow: '0 4px 24px rgba(10,36,56,0.07)',
};
