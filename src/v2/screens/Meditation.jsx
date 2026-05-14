/* ============================================================
   NÉYA V3 — Méditation (LIGHT MODE, wash + halo accent)
   ============================================================
   Wash pastel monde + BreathingCircle centré + ink controls.
   ============================================================ */

import { useState, useEffect } from 'react';
import { WORLDS } from '../worlds';
import { haptic, addMinutes } from '../state';
import BreathingCircle from '../../components/BreathingCircle';
import Button from '../../components/Button';

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
    if (minutes >= 1) addMinutes(minutes);
    haptic(4);
    onClose?.();
  };

  return (
    <div
      className={world.wash}
      style={{
        position: 'absolute',
        inset: 0,
        opacity: show ? 1 : 0,
        transition: 'opacity 600ms var(--ease-out)',
        zIndex: 60,
      }}
    >
      {/* Halo accent derrière le BreathingCircle */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 340,
          height: 340,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${world.accent}33 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Top — chapter mark */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 22px)',
          left: 22,
          right: 22,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <div className="neya-mark" style={{ color: 'var(--content-tertiary)' }}>
          {`N É Y A`}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <div className="neya-mark" style={{ color: 'var(--content-tertiary)' }}>
            CHAPITRE {String(world.chapter).padStart(2, '0')}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 9,
              fontWeight: 500,
              color: world.accent,
            }}
          >
            {world.name}
          </div>
        </div>
      </div>

      {/* Title hint top */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 84px)',
          left: 0,
          right: 0,
          textAlign: 'center',
          padding: '0 22px',
        }}
      >
        <h2
          className="neya-h2"
          style={{
            color: 'var(--ink)',
            margin: 0,
          }}
        >
          Pose-toi. <em className="neya-key">Respire.</em>
        </h2>
      </div>

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

      {/* Bottom controls */}
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
        }}
      >
        <button
          data-press
          onClick={() => { haptic(4); setPaused((p) => !p); }}
          aria-label={paused ? 'Reprendre' : 'Pause'}
          style={iconBtnStyle}
        >
          {paused ? '▶' : '❚❚'}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div className="neya-mark" style={{ color: 'var(--content-tertiary)' }}>
            DURÉE
          </div>
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--type-stat)',
              fontWeight: 'var(--weight-semibold)',
              lineHeight: 'var(--lh-stat)',
              letterSpacing: 'var(--ls-stat)',
              color: 'var(--ink)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>

        <button
          data-press
          onClick={handleClose}
          aria-label="Fermer"
          style={iconBtnStyle}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

const iconBtnStyle = {
  appearance: 'none',
  width: 44,
  height: 44,
  borderRadius: '50%',
  background: 'rgba(255, 252, 245, 0.82)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '0.5px solid rgba(26, 26, 47, 0.10)',
  color: 'var(--ink)',
  fontSize: 14,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  WebkitTapHighlightColor: 'transparent',
  boxShadow: '0 4px 14px rgba(26, 26, 47, 0.08)',
};
