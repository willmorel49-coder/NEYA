/* ============================================================
   NÉYA V3 — EspaceVrai (RITUEL signature, LIGHT MODE)
   ============================================================
   Espace de présence libre : 90s+ minimum, 5 min max.
   Pas de structure imposée — juste BE.
   Ripples → patience texts (30s) → deep texts (90s).
   Long-press anywhere (800ms) → résumé rituel → onClose.
   ============================================================ */

import { useState, useEffect, useRef, useCallback } from 'react';
import { WORLDS } from '../worlds';
import { getProfile, haptic, ls, addMinutes } from '../state';
import useStandardOverlay from '../hooks/useStandardOverlay';

/* Totem → home world (pour récupérer l'accent selon archétype) */
const TOTEM_HOME = {
  lion: 'foret', ours: 'temple', aigle: 'oasis',
  daim: 'lac', baleine: 'montagne', renard: 'communaute',
};

/* PATIENCE TEXTS — Fraunces italic, 30s window, fade 1.5s, hold 8s */
const PATIENCE_TEXTS = {
  lion:    ['Tu peux rester.', 'C\'est calme ici.', 'Tu n\'es pas pressée.', 'Rien à prouver.'],
  ours:    ['Pose-toi.', 'Le froid est dehors.', 'Ici c\'est doux.', 'Tu peux fondre.'],
  aigle:   ['Tu vois tout.', 'Rien à attraper.', 'L\'air te porte.', 'Tu es libre.'],
  daim:    ['Tu peux te poser.', 'L\'eau est calme.', 'La lune est là.', 'Tu peux ressentir.'],
  baleine: ['Tu es immense.', 'Tu vois loin.', 'Le temps est lent.', 'Tu peux remonter.'],
  renard:  ['Tu n\'es pas seule.', 'L\'aube vient.', 'Tu peux respirer.', 'Tu es vue.'],
};

/* DEEP TEXTS — apparaissent à 90s, plus profonds */
const DEEP_TEXTS = {
  lion:    ['Tu as traversé.', 'Tu peux te reposer.', 'Tu es ici.'],
  ours:    ['Tu n\'es plus seule.', 'Tu peux te livrer.', 'C\'est dedans.'],
  aigle:   ['Tu vois clair.', 'Tu peux descendre.', 'Le soleil est là.'],
  daim:    ['Tu peux pleurer.', 'L\'eau te porte.', 'Tu es douce.'],
  baleine: ['Tu sais.', 'Tu peux laisser.', 'Le silence parle.'],
  renard:  ['Tu reviens.', 'Le jour se lève.', 'Tu es légère.'],
};

const MAX_SECONDS = 300; // 5 min cap
const LONG_PRESS_MS = 800;

export default function EspaceVrai({ worldKey = 'foret', onClose }) {
  const profile = getProfile();
  const totemKey = profile?.totem || 'lion';
  /* Accent = accent du monde lié au totem de l'utilisateur, fallback worldKey */
  const homeKey = TOTEM_HOME[totemKey] || worldKey;
  const world = WORLDS[homeKey] || WORLDS[worldKey] || WORLDS.foret;
  const accent = world.accent;
  const accentRgb = world.accentRgb;
  const wash = world.wash || 'wash-dawn';

  const [elapsed, setElapsed] = useState(0);
  const [currentText, setCurrentText] = useState(null); // { text, fadeIn }
  const [ripples, setRipples] = useState([0, 1, 2]); // ids initiaux phase 1
  const [longPressing, setLongPressing] = useState(false);
  const [resume, setResume] = useState(null); // { minutes } | null
  const [exiting, setExiting] = useState(false);

  const elapsedRef = useRef(0);
  const lastTextWindowRef = useRef(-1); // window index (par 30s)
  const longPressTimerRef = useRef(null);
  const exitInFlightRef = useRef(false);
  const textFadeTimerRef = useRef(null);
  const resumeHoldTimerRef = useRef(null);
  const resumeFadeTimerRef = useRef(null);
  const closeTimerRef = useRef(null);

  /* ============ Tick d'horloge ============ */
  useEffect(() => {
    const id = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
      if (elapsedRef.current >= MAX_SECONDS) {
        triggerResumeExit();
      }
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ============ Ripples — phase 1 burst (0-3s) puis lent (toutes les 8s) ============ */
  useEffect(() => {
    let rippleId = 3;
    /* Phase 1 : 3 ripples staggered tous les 800ms — déjà initialisés */
    /* Après 3s : ripple toutes les 8s */
    const slowInterval = setInterval(() => {
      setRipples((r) => {
        const next = [...r, rippleId++];
        // keep last 3 only
        return next.slice(-3);
      });
    }, 8000);
    return () => clearInterval(slowInterval);
  }, []);

  /* ============ Patience / Deep texts par fenêtre 30s ============ */
  useEffect(() => {
    const windowIndex = Math.floor(elapsed / 30);
    /* Première patience window à 30s (windowIndex >= 1) */
    if (windowIndex >= 1 && windowIndex !== lastTextWindowRef.current) {
      lastTextWindowRef.current = windowIndex;
      const isDeep = elapsed >= 90;
      const pool = isDeep
        ? (DEEP_TEXTS[totemKey] || DEEP_TEXTS.lion)
        : (PATIENCE_TEXTS[totemKey] || PATIENCE_TEXTS.lion);
      const pick = pool[Math.floor(Math.random() * pool.length)];
      setCurrentText({ text: pick, fadeIn: Date.now() });
      /* Fade out après 8s — tracké dans ref pour survivre aux re-runs du useEffect */
      if (textFadeTimerRef.current) clearTimeout(textFadeTimerRef.current);
      textFadeTimerRef.current = setTimeout(() => {
        textFadeTimerRef.current = null;
        setCurrentText((c) => (c && c.text === pick ? null : c));
      }, 8000);
    }
  }, [elapsed, totemKey]);

  /* Cleanup tous les timers au démontage */
  useEffect(() => () => {
    if (textFadeTimerRef.current) { clearTimeout(textFadeTimerRef.current); textFadeTimerRef.current = null; }
    if (resumeHoldTimerRef.current) { clearTimeout(resumeHoldTimerRef.current); resumeHoldTimerRef.current = null; }
    if (resumeFadeTimerRef.current) { clearTimeout(resumeFadeTimerRef.current); resumeFadeTimerRef.current = null; }
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
  }, []);

  /* ============ Exit handlers ============ */
  const finalize = useCallback(() => {
    if (exitInFlightRef.current) return;
    exitInFlightRef.current = true;
    const mins = Math.floor(elapsedRef.current / 60);
    try { haptic([8, 60, 8]); } catch {}
    try { addMinutes(mins); } catch {}
    try { ls.set('espace_vrai_last', Date.now()); } catch {}
    onClose?.();
  }, [onClose]);

  const triggerResumeExit = useCallback(() => {
    if (resume || exitInFlightRef.current) return;
    const mins = Math.floor(elapsedRef.current / 60);
    setResume({ minutes: mins });
    /* fade in 600ms + hold 4000ms + fade out 600ms → finalize */
    resumeHoldTimerRef.current = setTimeout(() => {
      resumeHoldTimerRef.current = null;
      setExiting(true);
      resumeFadeTimerRef.current = setTimeout(() => {
        resumeFadeTimerRef.current = null;
        finalize();
      }, 600);
    }, 600 + 4000);
  }, [resume, finalize]);

  const handleClose = useCallback(() => {
    if (exitInFlightRef.current) return;
    /* fade-out 280ms then onClose */
    setExiting(true);
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      finalize();
    }, 280);
  }, [finalize]);

  /* ============ Long-press anywhere ============ */
  const startLongPress = useCallback(() => {
    if (resume || exitInFlightRef.current) return;
    setLongPressing(true);
    longPressTimerRef.current = setTimeout(() => {
      setLongPressing(false);
      try { haptic([4, 30, 4]); } catch {}
      triggerResumeExit();
    }, LONG_PRESS_MS);
  }, [resume, triggerResumeExit]);

  const cancelLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setLongPressing(false);
  }, []);

  useEffect(() => () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  /* ============ Format counter (cap displayed : 1:30 target durant phase 2) ============ */
  const totalCap = MAX_SECONDS;
  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // Comportement iOS standard (scroll lock body + ESC + focus trap + ARIA)
  const { dialogProps, containerRef } = useStandardOverlay({
    open: !exiting,
    onClose: handleClose,
    labelText: 'Espace de présence',
  });

  return (
    <div
      ref={containerRef}
      {...dialogProps}
      className={wash}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        color: 'var(--ink)',
        overflow: 'hidden',
        opacity: exiting ? 0 : 1,
        transition: 'opacity 280ms var(--ease-out)',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
      onMouseDown={startLongPress}
      onMouseUp={cancelLongPress}
      onMouseLeave={cancelLongPress}
      onTouchStart={startLongPress}
      onTouchEnd={cancelLongPress}
      onTouchCancel={cancelLongPress}
    >
      {/* Local keyframes */}
      <style>{`
        @keyframes ev-ripple {
          from { transform: translate(-50%, -50%) scale(0); opacity: 0.45; }
          to   { transform: translate(-50%, -50%) scale(2);   opacity: 0;    }
        }
        @keyframes ev-pulse {
          0%, 100% { transform: scale(1);    opacity: 0.55; }
          50%      { transform: scale(1.06); opacity: 0.75; }
        }
        @keyframes ev-fadein {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        @keyframes ev-textfade {
          0%   { opacity: 0; transform: translateY(8px); }
          18%  { opacity: 1; transform: translateY(0);   }
          82%  { opacity: 1; transform: translateY(0);   }
          100% { opacity: 0; transform: translateY(-4px); }
        }
        @keyframes ev-press-grow {
          from { transform: translate(-50%, -50%) scale(1);    opacity: 0.0; }
          to   { transform: translate(-50%, -50%) scale(1.18); opacity: 0.55; }
        }
      `}</style>

      {/* Close button — top-right (44×44 tap target) */}
      <button
        type="button"
        aria-label="Fermer"
        onClick={(e) => { e.stopPropagation(); handleClose(); }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        data-press={true}
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
          right: 12,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'rgba(255, 252, 245, 0.78)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '0.5px solid rgba(26, 26, 47, 0.10)',
          color: 'var(--ink)',
          fontSize: 15,
          lineHeight: 1,
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 4,
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        ✕
      </button>

      {/* Phase 1 — title (0s-3s, fade out 3-5s) */}
      <div
        style={{
          position: 'absolute',
          top: '14%',
          left: 0,
          right: 0,
          textAlign: 'center',
          padding: '0 28px',
          opacity: elapsed < 6 ? 1 : 0,
          transition: 'opacity 1200ms var(--ease-out)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 'clamp(28px, 7vw, 38px)',
            lineHeight: 1.15,
            color: 'var(--ink)',
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            animation: 'ev-fadein 1200ms var(--ease-out) both',
          }}
        >
          Espace de présence.
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--content-secondary)',
            lineHeight: 1.5,
            animation: 'ev-fadein 1400ms 200ms var(--ease-out) both',
          }}
        >
          Pose-toi. Tu n'as rien à faire.
        </div>
      </div>

      {/* Ripples — emanate from center */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        {ripples.map((id, idx) => (
          <span
            key={id}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 180,
              height: 180,
              borderRadius: '50%',
              border: `1px solid ${accent}`,
              opacity: 0,
              animation: `ev-ripple 3000ms linear ${idx * 800}ms forwards`,
            }}
          />
        ))}
      </div>

      {/* Center pulsating circle — apparait après 2s */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 1,
          opacity: elapsed >= 2 ? 1 : 0,
          transition: 'opacity 1600ms var(--ease-out)',
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${accentRgb}, 0.28) 0%, ${accentRgb}, 0.10) 55%, transparent 80%)`,
            animation: 'ev-pulse 4000ms var(--ease-in-out) infinite',
          }}
        />
        {/* Long-press visual feedback */}
        {longPressing && (
          <span
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 120,
              height: 120,
              borderRadius: '50%',
              border: `1px solid ${accent}`,
              animation: `ev-press-grow ${LONG_PRESS_MS}ms var(--ease-out) forwards`,
            }}
          />
        )}
      </div>

      {/* Patience / Deep texts — middle/bottom area */}
      {currentText && (
        <div
          key={currentText.fadeIn}
          style={{
            position: 'absolute',
            bottom: '28%',
            left: 0,
            right: 0,
            textAlign: 'center',
            padding: '0 32px',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 18,
              lineHeight: 1.4,
              color: 'var(--content-secondary)',
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              animation: 'ev-textfade 8000ms var(--ease-out) both',
            }}
          >
            {currentText.text}
          </div>
        </div>
      )}

      {/* Bottom — caps label + counter */}
      <div
        style={{
          position: 'absolute',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 38px)',
          left: 0,
          right: 0,
          textAlign: 'center',
          pointerEvents: 'none',
          zIndex: 2,
          opacity: elapsed >= 3 ? 1 : 0,
          transition: 'opacity 1200ms var(--ease-out)',
        }}
      >
        <div
          className="neya-mark"
          style={{
            color: 'var(--content-tertiary)',
            letterSpacing: '0.22em',
          }}
        >
          ESPACE DE PRÉSENCE
        </div>
        <div
          style={{
            marginTop: 6,
            fontFamily: 'var(--font-ui)',
            fontSize: 12,
            color: 'var(--content-secondary)',
            letterSpacing: '0.06em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {fmt(elapsed)} / {fmt(totalCap)}
        </div>
        <div
          style={{
            marginTop: 8,
            fontFamily: 'var(--font-body)',
            fontSize: 11,
            color: 'var(--content-secondary)',
            opacity: 0.95,
            letterSpacing: '0.04em',
          }}
        >
          Reste appuyée pour terminer
        </div>
      </div>

      {/* Résumé overlay */}
      {resume && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 5,
            background: 'rgba(251, 246, 232, 0.86)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '0 32px',
            gap: 14,
            animation: exiting
              ? 'ev-fadein 600ms reverse var(--ease-out) forwards'
              : 'ev-fadein 600ms var(--ease-out) both',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 22,
              lineHeight: 1.3,
              color: 'var(--ink)',
              fontVariationSettings: 'var(--fraunces-italic-soft)',
            }}
          >
            Tu es restée {resume.minutes} {resume.minutes <= 1 ? 'minute' : 'minutes'}.
          </div>
          <div
            className="neya-mark"
            style={{
              color: accent,
              letterSpacing: '0.28em',
            }}
          >
            MERCI
          </div>
        </div>
      )}
    </div>
  );
}
