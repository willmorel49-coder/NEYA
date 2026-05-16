/* ============================================================
   NÉYA V3 — Méditation (LIGHT MODE, wash + halo accent)
   ============================================================
   Wash pastel monde + BreathingCircle centré + ink controls.
   Complétion : marque le monde exploré + avance currentWorld
   + toast italique 2.2s avant onClose.
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { WORLDS } from '../worlds';
import {
  haptic,
  getProfile,
  completeMeditation,
  getOnboardingTargetMinutes,
  addSouvenir,
} from '../state';
import BreathingCircle from '../../components/BreathingCircle';
import useStandardOverlay from '../hooks/useStandardOverlay';

const TOTEM_HOME = {
  lion: 'foret', ours: 'temple', aigle: 'oasis',
  daim: 'lac', baleine: 'montagne', renard: 'communaute',
};

// Ambient audio presets — procedural Web Audio (no mp3 dependencies)
const AUDIO_PRESETS = {
  foret:      { name: 'Forêt',    desc: 'Vent dans les feuilles',   type: 'wind',  filter: 800,  q: 1 },
  temple:     { name: 'Temple',   desc: 'Vent froid sur la pierre', type: 'wind',  filter: 400,  q: 0.7 },
  oasis:      { name: 'Oasis',    desc: 'Brise tiède du désert',    type: 'wind',  filter: 1200, q: 0.8 },
  lac:        { name: 'Lac',      desc: 'Eau qui clapote doucement',type: 'water', filter: 600,  q: 2 },
  montagne:   { name: 'Montagne', desc: 'Vent d’altitude',          type: 'wind',  filter: 300,  q: 0.5 },
  communaute: { name: 'Brume',    desc: 'Souffle de l’aube',        type: 'wind',  filter: 700,  q: 1 },
};

function createAmbience(preset) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    const ctx = new Ctx();
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.4;

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = preset.filter;
    filter.Q.value = preset.q;

    const gain = ctx.createGain();
    gain.gain.value = 0;

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 1.5);

    let osc = null;
    let oscGain = null;
    if (preset.type === 'water') {
      osc = ctx.createOscillator();
      osc.frequency.value = 0.3;
      oscGain = ctx.createGain();
      oscGain.gain.value = 200;
      osc.connect(oscGain);
      oscGain.connect(filter.frequency);
      osc.start();
    }

    return {
      stop() {
        try {
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
        } catch (_) { /* noop */ }
        setTimeout(() => {
          try { src.stop(); } catch (_) { /* noop */ }
          try { if (osc) osc.stop(); } catch (_) { /* noop */ }
          try { ctx.close(); } catch (_) { /* noop */ }
        }, 700);
      },
    };
  } catch (_) {
    return null;
  }
}

export default function Meditation({ worldKey = 'foret', onClose }) {
  const profile = getProfile();
  const world = WORLDS[worldKey] || WORLDS.foret;
  // Halo color = totem's world accent (personnalisation Agent C)
  const totemHome = WORLDS[TOTEM_HOME[profile.totem] || 'foret'];
  const haloAccent = totemHome.accent;
  const target = getOnboardingTargetMinutes(); // 5 | 10 | 15 | 999
  const [paused, setPaused] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [show, setShow] = useState(false);
  const [pop, setPop] = useState(false);
  const [toast, setToast] = useState(null); // { minutes, wasNew }
  const [reachedShow, setReachedShow] = useState(false);
  const targetReachedRef = useRef(false);
  const popTimerRef = useRef(null);

  // Ambient audio — OPT-IN only
  const [audioOn, setAudioOn] = useState(false);
  const audioEngineRef = useRef(null);
  const audioPreset = AUDIO_PRESETS[worldKey] || AUDIO_PRESETS.foret;
  const closingRef = useRef(false);
  const closeTimerRef = useRef(null);

  const toggleAudio = () => {
    haptic(3);
    setAudioOn((on) => {
      if (on) {
        if (audioEngineRef.current) {
          audioEngineRef.current.stop();
          audioEngineRef.current = null;
        }
        return false;
      }
      const engine = createAmbience(audioPreset);
      if (!engine) return false;
      audioEngineRef.current = engine;
      return true;
    });
  };

  // Free audio resources + pending close timer on unmount
  useEffect(() => () => {
    if (audioEngineRef.current) {
      audioEngineRef.current.stop();
      audioEngineRef.current = null;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  // Signale au shell qu'un overlay plein écran est ouvert (masque BottomNav, lock scroll, etc.)
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

  useEffect(() => { const t = setTimeout(() => setShow(true), 60); return () => clearTimeout(t); }, []);

  // Drift-resistant tick : anchor sur performance.now() et calcule un delta réel
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

  const minutes = Math.floor(elapsedMs / 60000);
  const seconds = Math.floor((elapsedMs % 60000) / 1000);
  const reached = target !== 999 && minutes >= target;

  // Fade-in caption "Tu y es" — 300ms delay overlap avec tilleul-pop end
  useEffect(() => {
    if (!reached) { setReachedShow(false); return; }
    const t = setTimeout(() => setReachedShow(true), 300);
    return () => clearTimeout(t);
  }, [reached]);

  // One-shot pop quand on atteint la cible (skip si target illimité)
  useEffect(() => {
    if (target === 999) return;
    if (targetReachedRef.current) return;
    if (minutes >= target) {
      targetReachedRef.current = true;
      setPop(true);
      haptic([6, 40, 6]);
      popTimerRef.current = setTimeout(() => setPop(false), 420);
    }
  }, [minutes, target]);

  useEffect(() => () => { if (popTimerRef.current) clearTimeout(popTimerRef.current); }, []);

  const handleClose = () => {
    // Guard: empêche double-tap / re-entry → completeMeditation x2
    if (closingRef.current) return;
    closingRef.current = true;
    if (audioEngineRef.current) {
      audioEngineRef.current.stop();
      audioEngineRef.current = null;
    }
    if (minutes >= 1) {
      const { wasNew } = completeMeditation(worldKey, minutes);
      addSouvenir({
        type: 'meditation',
        world: worldKey,
        label: `${minutes} minute${minutes > 1 ? 's' : ''} à la ${world.name}`,
        detail: wasNew ? 'Première fois ici.' : null,
      });
      if (wasNew) {
        addSouvenir({
          type: 'world-unlock',
          world: worldKey,
          label: `Découverte de ${world.name}`,
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

  // Comportement iOS standard (scroll lock body + ESC + focus trap + ARIA)
  const { dialogProps, containerRef } = useStandardOverlay({
    open: !toast,
    onClose: handleClose,
    labelText: 'Méditation guidée',
  });

  return (
    <div
      ref={containerRef}
      {...dialogProps}
      className={world.wash}
      style={{
        position: 'absolute',
        inset: 0,
        opacity: show ? 1 : 0,
        transition: 'opacity 600ms var(--ease-out)',
        zIndex: 60,
      }}
    >
      {/* Atmospheric bg overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${world.bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.08,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }}
      />

      {/* Halo accent — couleur du TOTEM, pas du chapitre (Agent C) */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 340,
          height: 340,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${haloAccent}${reached ? '5A' : '3D'} 0%, transparent 70%)`,
          pointerEvents: 'none',
          animation: 'ray-oscillate 8s var(--ease-in-out) infinite',
          transition: 'background 800ms var(--ease-out)',
        }}
      />

      {/* Close TOP-LEFT — accessible, discret, pearl glass */}
      <button
        type="button"
        onClick={handleClose}
        aria-label="Fermer la méditation"
        data-press
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top, 0px) + 14px)',
          left: 14,
          width: 44,
          height: 44,
          borderRadius: 22,
          background: 'rgba(255, 252, 245, 0.82)',
          border: '0.5px solid rgba(26, 26, 47, 0.10)',
          color: 'var(--ink)',
          fontSize: 18,
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          zIndex: 3,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(26, 26, 47, 0.08)',
        }}
      >
        ✕
      </button>

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

      {/* Audio toggle — discrete floating icon, OPT-IN only */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 70px)',
          right: 22,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 4,
          zIndex: 5,
        }}
      >
        <button
          data-press
          onClick={toggleAudio}
          aria-label={audioOn ? 'Couper l’ambiance' : 'Activer l’ambiance'}
          aria-pressed={audioOn}
          style={{
            appearance: 'none',
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255, 252, 245, 0.82)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '0.5px solid rgba(26, 26, 47, 0.10)',
            color: audioOn ? world.accent : 'var(--content-tertiary)',
            fontFamily: 'var(--font-ui)',
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            WebkitTapHighlightColor: 'transparent',
            boxShadow: '0 4px 14px rgba(26, 26, 47, 0.08)',
            transition: 'color 240ms var(--ease-out)',
          }}
        >
          {audioOn ? '♫' : '♪'}
        </button>
        {audioOn && (
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 10,
              fontStyle: 'italic',
              opacity: 0.6,
              color: 'var(--ink)',
              maxWidth: 120,
              textAlign: 'right',
              lineHeight: 1.3,
            }}
          >
            {audioPreset.desc}
          </div>
        )}
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
          {profile.mantra ? (
            <em className="neya-key" style={{ fontStyle: 'italic' }}>« {profile.mantra} »</em>
          ) : (
            <>Pose-toi. <em className="neya-key">Respire.</em></>
          )}
        </h2>
      </div>

      {/* Reached — outer tilleul ring (vital presence completion) */}
      {reached && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 260,
            height: 260,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: '1px solid rgba(212, 224, 140, 0.45)',
            pointerEvents: 'none',
            opacity: reachedShow ? 1 : 0,
            transition: 'opacity 600ms var(--ease-out)',
          }}
        />
      )}

      {/* Centered breathing — opacity dims on pause */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: paused ? 0.55 : 1,
          transition: 'opacity 320ms var(--ease-out)',
        }}
      >
        <BreathingCircle size={220} autoStart={!paused} />
        {paused && (
          <div
            style={{
              position: 'absolute',
              top: '32%',
              left: 0,
              right: 0,
              textAlign: 'center',
              fontFamily: 'var(--font-ui)',
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--content-tertiary)',
            }}
          >
            EN PAUSE
          </div>
        )}
      </div>

      {/* Reached — caption fade-in entre cercle et controls */}
      {reached && (
        <div
          style={{
            position: 'absolute',
            bottom: '38%',
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: reachedShow ? 1 : 0,
            transition: 'opacity 600ms var(--ease-out)',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 18,
            color: 'var(--emerald)',
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            pointerEvents: 'none',
          }}
        >
          Tu y es. Tu peux fermer.
        </div>
      )}

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
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              fontWeight: 500,
              color: 'var(--content-secondary)',
              marginTop: 2,
            }}
          >
            {objectifLabel}
          </div>
        </div>

        <button
          data-press
          onClick={handleClose}
          aria-label="Fermer"
          className={pop ? 'tilleul-pop' : undefined}
          style={iconBtnStyle}
        >
          ✕
        </button>
      </div>

      {/* Completion toast — full bleed overlay 2.2s */}
      {toast && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(251, 246, 232, 0.95)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 32px',
            gap: 14,
            zIndex: 80,
            animation: 'fade-in 360ms var(--ease-narrative) both',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display, "Fraunces", serif)',
              fontStyle: 'italic',
              fontSize: 26,
              lineHeight: 1.32,
              color: 'var(--ink)',
              textAlign: 'center',
              maxWidth: 320,
            }}
          >
            {toast.wasNew
              ? `« Tu as exploré la ${world.name}. »`
              : `« Tu es passé·e par là. »`}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.222em',
              textTransform: 'uppercase',
              color: 'var(--emerald)',
            }}
          >
            +{toast.minutes} MIN
          </div>
        </div>
      )}
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
