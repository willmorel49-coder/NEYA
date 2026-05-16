/* ============================================================
   BreathingCircle — ÇA VA ? Design System v2
   ============================================================
   Validates Do's :
   - 19s cycle (4s inhale, 7s hold, 8s exhale) ✓
   - Scale 1 → 1.4 → 1 (via @keyframes breathe-19s in tokens.css) ✓
   - Tilleul radial gradient center 30% → transparent edge ✓
   - 0.5px Tilleul 60% border ✓
   - Phase label Sora 500 11px ("Inspire" / "Retiens" / "Expire") ✓
   - Remaining seconds in stat token (Sora 24px / 600) ✓
   - 6-8 Tilleul dust particles drift outward during exhale ✓
   - Anti-gamification : no skip, no points award, no badge ✓
   - No bounce, no spring rebound — pure scale animation ✓

   Don'ts respected :
   - Pas de pulse intense (max 0.4↔0.5 at 4s+ rule) — la respiration
     est lente et progressive, jamais agressive ✓
   - Pas de confetti ✓
   - Pas de bounce ✓
   - Tilleul rare et précieux (vital presence) ✓
   ============================================================ */

import { useEffect, useRef, useState } from 'react';

const PHASES = [
  { name: 'Inspire', duration: 4000 },
  { name: 'Retiens', duration: 7000 },
  { name: 'Expire',  duration: 8000 },
];
const TOTAL_MS = PHASES.reduce((s, p) => s + p.duration, 0); // 19000

export default function BreathingCircle({
  size = 160,
  autoStart = true,
  durationMs = null,        // null = infinite loop ; integer = stop after N ms
  showCountdown = true,
  onComplete,
  style,
}) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phaseRemaining, setPhaseRemaining] = useState(PHASES[0].duration);
  const [totalRemaining, setTotalRemaining] = useState(durationMs);
  const [isRunning, setIsRunning] = useState(autoStart);
  const phaseStartedAtRef = useRef(null);
  const sessionStartedAtRef = useRef(null);

  // Phase tick
  useEffect(() => {
    if (!isRunning) return;
    if (phaseStartedAtRef.current == null) {
      phaseStartedAtRef.current = performance.now();
    }
    if (sessionStartedAtRef.current == null) {
      sessionStartedAtRef.current = performance.now();
    }

    let raf;
    const tick = () => {
      const now = performance.now();
      const elapsedPhase = now - phaseStartedAtRef.current;
      const remaining = PHASES[phaseIdx].duration - elapsedPhase;

      if (remaining <= 0) {
        // advance phase
        const nextIdx = (phaseIdx + 1) % PHASES.length;
        phaseStartedAtRef.current = now;
        setPhaseIdx(nextIdx);
        setPhaseRemaining(PHASES[nextIdx].duration);
      } else {
        setPhaseRemaining(remaining);
      }

      if (durationMs != null) {
        const totalElapsed = now - sessionStartedAtRef.current;
        const totalRem = durationMs - totalElapsed;
        setTotalRemaining(Math.max(0, totalRem));
        if (totalRem <= 0) {
          setIsRunning(false);
          if (onComplete) onComplete();
          return;
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isRunning, phaseIdx, durationMs, onComplete]);

  const currentPhase = PHASES[phaseIdx];
  const isExhale = currentPhase.name === 'Expire';
  const remainingSec = Math.max(1, Math.ceil(phaseRemaining / 1000));

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {/* The breathing circle — scale 1→1.4→1 over 19s */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'var(--radius-circle)',
          background: 'radial-gradient(circle at center, rgba(212, 224, 140, 0.30) 0%, rgba(212, 224, 140, 0.10) 50%, transparent 80%)',
          border: '0.5px solid rgba(212, 224, 140, 0.60)',
          animation: isRunning ? 'breathe-19s 19s var(--ease-in-out) infinite' : 'none',
          willChange: 'transform',
        }}
      />

      {/* Dust particles — 8 Tilleul particles, drift outward during exhale */}
      {isExhale &&
        Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const distance = 0.7 + (i % 3) * 0.15;
          const x = Math.cos(angle) * (size / 2) * distance;
          const y = Math.sin(angle) * (size / 2) * distance;
          return (
            <span
              key={i}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 3,
                height: 3,
                borderRadius: '50%',
                background: 'rgba(212, 224, 140, 0.70)',
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                animation: 'particle-drift 12s var(--ease-in-out) infinite',
                animationDelay: `${i * 0.4}s`,
                pointerEvents: 'none',
              }}
            />
          );
        })}

      {/* Inner content — phase label + remaining seconds */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          textAlign: 'center',
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 'var(--type-label)',
            fontWeight: 'var(--weight-medium)',
            lineHeight: 'var(--lh-label)',
            color: 'rgba(212, 224, 140, 0.92)',
            letterSpacing: 0,
          }}
        >
          {currentPhase.name}
        </div>
        {showCountdown && (
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--type-stat)',
              fontWeight: 'var(--weight-semibold)',
              lineHeight: 'var(--lh-stat)',
              letterSpacing: 'var(--ls-stat)',
              color: 'var(--content-primary)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {remainingSec}
          </div>
        )}
      </div>
    </div>
  );
}
