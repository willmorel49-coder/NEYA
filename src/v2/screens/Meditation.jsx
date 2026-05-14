/* ============================================================
   NÉYA V2 — Méditation / Respiration
   ============================================================
   Full-screen painterly du monde courant.
   Centre : BreathingCircle.
   Bas : 3 contrôles (Pause/Play 40 circle · phase/timer info ·
   Close X 40 circle).
   No skip. Anti-gamification.
   ============================================================ */

import { useState, useEffect } from 'react';
import { WORLDS } from '../worlds';
import { haptic, addMinutes } from '../state';
import BreathingCircle from '../../components/BreathingCircle';
import Button from '../../components/Button';
import ChapterMark from '../../components/ChapterMark';

export default function Meditation({ worldKey = 'foret', onClose }) {
  const world = WORLDS[worldKey] || WORLDS.foret;
  const [paused, setPaused] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => { const t = setTimeout(() => setShow(true), 60); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (paused) return;
    const tick = setInterval(() => setElapsedMs((m) => m + 1000), 1000);
    return () => clearInterval(tick);
  }, [paused]);

  const minutes = Math.floor(elapsedMs / 60000);
  const seconds = Math.floor((elapsedMs % 60000) / 1000);

  const handleClose = () => {
    if (minutes >= 1) {
      addMinutes(minutes);
    }
    haptic(4);
    onClose?.();
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--void)',
        opacity: show ? 1 : 0,
        transition: 'opacity 600ms var(--ease-out)',
      }}
    >
      {/* Painterly bg */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${world.bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.55)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to top, rgba(5,8,16,0.85) 0%, rgba(5,8,16,0.45) 35%, rgba(5,8,16,0.20) 65%, rgba(5,8,16,0.55) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Halo derrière le BreathingCircle */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 320,
          height: 320,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${world.accent}22 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <ChapterMark brand chapter={world.chapter} world={world.name} />

      {/* Centered breathing */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <BreathingCircle size={220} autoStart={!paused} />
      </div>

      {/* Title hint at top */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 80px)',
          left: 0,
          right: 0,
          textAlign: 'center',
          padding: '0 var(--sp-5)',
        }}
      >
        <div
          className="neya-h2"
          style={{
            color: 'var(--content-primary)',
            opacity: 0.92,
          }}
        >
          Pose-toi. <em className="neya-key">Respire.</em>
        </div>
      </div>

      {/* Bottom controls row */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + var(--sp-6))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--sp-6)',
          gap: 'var(--sp-3)',
        }}
      >
        {/* Left: Pause/Play */}
        <Button
          variant="icon"
          icon={paused ? '▶' : '❚❚'}
          aria-label={paused ? 'Reprendre' : 'Pause'}
          onClick={() => { haptic(4); setPaused((p) => !p); }}
          style={{ fontSize: 14 }}
        />

        {/* Center: elapsed time info */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div
            className="neya-mark"
            style={{ color: 'var(--content-tertiary)' }}
          >
            DURÉE
          </div>
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
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>

        {/* Right: Close */}
        <Button
          variant="icon"
          icon="✕"
          aria-label="Fermer"
          onClick={handleClose}
          style={{ fontSize: 14 }}
        />
      </div>
    </div>
  );
}
