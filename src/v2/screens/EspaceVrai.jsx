/* ============================================================
   ÇA VA ? V4 — EspaceVrai (RITUEL signature, LIGHT MODE refonte)
   ============================================================
   Espace de présence libre : 90s+ minimum, 5 min max.
   Pas de structure imposée — juste BE.
   Long-press anywhere (800ms) → résumé rituel → onClose.
   ============================================================ */

import { useState, useEffect, useRef, useCallback } from 'react';
import { getProfile, haptic, ls, addMinutes } from '../state';
import useStandardOverlay from '../hooks/useStandardOverlay';
import Blobs from '../../components/Blobs';

/* PATIENCE TEXTS — Cormorant italic, 30s window, fade 1.5s, hold 8s */
const PATIENCE_TEXTS = {
  lion:    ['Tu peux rester ici.', 'C’est calme, maintenant.', 'Tu n’es pas pressée.', 'Rien à prouver, ici.'],
  ours:    ['Pose-toi, ici.', 'Le froid est dehors.', 'Ici, c’est doux.', 'Tu peux fondre, maintenant.'],
  aigle:   ['Tu vois tout, d’ici.', 'Rien à attraper, maintenant.', 'L’air te porte, ici.', 'Tu es libre, ici.'],
  daim:    ['Tu peux te poser ici.', 'L’eau est calme, maintenant.', 'La lune est là, présence douce.', 'Tu peux ressentir, ici.'],
  baleine: ['Tu es immense, ici.', 'Tu vois loin, maintenant.', 'Le temps est lent, ici.', 'Tu peux remonter, doucement.'],
  renard:  ['Tu n’es pas seule, ici.', 'L’aube vient, maintenant.', 'Tu peux respirer, ici.', 'Tu es vue, maintenant.'],
};

/* DEEP TEXTS — apparaissent à 90s, plus profonds */
const DEEP_TEXTS = {
  lion:    ['Tu as traversé.', 'Tu peux te reposer, ici.', 'Tu es ici, maintenant.'],
  ours:    ['Tu n’es plus seule.', 'Tu peux te livrer, ici.', 'C’est dedans, maintenant.'],
  aigle:   ['Tu vois clair, maintenant.', 'Tu peux descendre, ici.', 'Le soleil est là.'],
  daim:    ['Tu peux pleurer, ici.', 'L’eau te porte, maintenant.', 'Tu es douce, ici.'],
  baleine: ['Tu sais, maintenant.', 'Tu peux laisser, ici.', 'Le silence parle, ici.'],
  renard:  ['Tu reviens, ici.', 'Le jour se lève, maintenant.', 'Tu es légère, ici.'],
};

/* Mots-clés à passer en italique Cormorant à l’intérieur des phrases */
const ITALIC_KEYWORDS = ['présence', 'ici', 'maintenant', 'doucement', 'silence', 'aube'];

const MAX_SECONDS = 300; // 5 min cap
const LONG_PRESS_MS = 800;

/* Rendu d’une phrase avec mots-clés en italique Cormorant */
function PhraseInter({ text }) {
  /* Découpe en préservant la ponctuation autour des mots-clés */
  const re = new RegExp(`(${ITALIC_KEYWORDS.join('|')})`, 'gi');
  const parts = text.split(re);
  return (
    <span>
      {parts.map((part, i) => {
        const isKey = ITALIC_KEYWORDS.includes(part.toLowerCase());
        if (isKey) {
          return (
            <em
              key={i}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontWeight: 300,
                color: 'var(--blue-700)',
              }}
            >
              {part}
            </em>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

export default function EspaceVrai({ worldKey, onClose }) {
  /* worldKey conservé pour compat (non utilisé dans la nouvelle DA palette unifiée) */
  void worldKey;

  const profile = getProfile();
  const totemKey = profile?.totem || 'lion';

  const [elapsed, setElapsed] = useState(0);
  const [currentText, setCurrentText] = useState(null);
  const [longPressing, setLongPressing] = useState(false);
  const [resume, setResume] = useState(null);
  const [exiting, setExiting] = useState(false);

  const elapsedRef = useRef(0);
  const lastTextWindowRef = useRef(-1);
  const longPressTimerRef = useRef(null);
  const exitInFlightRef = useRef(false);
  const textFadeTimerRef = useRef(null);
  const resumeHoldTimerRef = useRef(null);
  const resumeFadeTimerRef = useRef(null);
  const closeTimerRef = useRef(null);

  /* ============ Tick d’horloge ============ */
  useEffect(() => {
    const id = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
      if (elapsedRef.current >= MAX_SECONDS) {
        triggerResumeExit();
      }
    }, 1000);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('neya:fullscreen-overlay', { detail: { open: true } }));
    }
    return () => {
      clearInterval(id);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('neya:fullscreen-overlay', { detail: { open: false } }));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ============ Patience / Deep texts par fenêtre 30s ============ */
  useEffect(() => {
    const windowIndex = Math.floor(elapsed / 30);
    if (windowIndex >= 1 && windowIndex !== lastTextWindowRef.current) {
      lastTextWindowRef.current = windowIndex;
      const isDeep = elapsed >= 90;
      const pool = isDeep
        ? (DEEP_TEXTS[totemKey] || DEEP_TEXTS.lion)
        : (PATIENCE_TEXTS[totemKey] || PATIENCE_TEXTS.lion);
      const pick = pool[Math.floor(Math.random() * pool.length)];
      setCurrentText({ text: pick, fadeIn: Date.now() });
      if (textFadeTimerRef.current) clearTimeout(textFadeTimerRef.current);
      textFadeTimerRef.current = setTimeout(() => {
        textFadeTimerRef.current = null;
        setCurrentText((c) => (c && c.text === pick ? null : c));
      }, 8000);
    }
  }, [elapsed, totemKey]);

  /* Cleanup timers */
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

  /* ============ Format counter ============ */
  const totalCap = MAX_SECONDS;
  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const { dialogProps, containerRef } = useStandardOverlay({
    open: !exiting,
    onClose: handleClose,
    labelText: 'Espace de présence',
  });

  return (
    <div
      ref={containerRef}
      {...dialogProps}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'var(--bg)',
        color: 'var(--blue-900)',
        overflow: 'hidden',
        opacity: exiting ? 0 : 1,
        transition: 'opacity 280ms ease-out',
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
        @keyframes ev-pulse-rose {
          0%, 100% { transform: translate(-50%, -50%) scale(1);    opacity: 0.55; }
          50%      { transform: translate(-50%, -50%) scale(1.10); opacity: 0.85; }
        }
        @keyframes ev-pulse-blue {
          0%, 100% { transform: translate(-50%, -50%) scale(1.08); opacity: 0.45; }
          50%      { transform: translate(-50%, -50%) scale(1.18); opacity: 0.70; }
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
          to   { transform: translate(-50%, -50%) scale(1.18); opacity: 0.50; }
        }
      `}</style>

      {/* Blobs décoratifs rose + violet */}
      <Blobs variant="rose-violet" />

      {/* Glass pill back button — fixed top-left, z-index 80 (sous SOS qui est 100) */}
      <button
        type="button"
        aria-label="Retour"
        onClick={(e) => { e.stopPropagation(); handleClose(); }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top, 0px) + 14px)',
          left: 16,
          zIndex: 80,
          appearance: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          minHeight: 44,
          padding: '10px 14px',
          borderRadius: 999,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          color: 'var(--blue-700)',
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.02em',
          lineHeight: 1,
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(10, 36, 56, 0.10)',
          WebkitTapHighlightColor: 'transparent',
          transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1), background 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
        Retour
      </button>

      {/* Hero — "Espace de présence" Cormorant italic */}
      <div
        style={{
          position: 'absolute',
          top: '14%',
          left: 0,
          right: 0,
          textAlign: 'center',
          padding: '0 28px',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(36px, 9vw, 42px)',
            lineHeight: 1.15,
            color: 'var(--blue-900)',
            animation: 'ev-fadein 1200ms ease-out both',
          }}
        >
          Espace de présence
        </h1>
        <div
          style={{
            marginTop: 14,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            animation: 'ev-fadein 1400ms 200ms ease-out both',
          }}
        >
          <PhraseInter text="Pose-toi ici. Tu n’as rien à faire, maintenant." />
        </div>
      </div>

      {/* Cercles d’effet doux rose + bleu — pulse 6s */}
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
        {/* Cercle rose externe */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(200,112,144,0.22) 0%, rgba(200,112,144,0.06) 55%, transparent 78%)',
            filter: 'blur(8px)',
            animation: 'ev-pulse-rose 6000ms ease-in-out infinite',
          }}
        />
        {/* Cercle bleu interne décalé */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(26,90,127,0.18) 0%, rgba(26,90,127,0.05) 55%, transparent 78%)',
            filter: 'blur(6px)',
            animation: 'ev-pulse-blue 6000ms ease-in-out infinite 1200ms',
          }}
        />
        {/* Long-press visual feedback */}
        {longPressing && (
          <span
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 200,
              height: 200,
              borderRadius: '50%',
              border: '1px solid var(--rose-500)',
              animation: `ev-press-grow ${LONG_PRESS_MS}ms ease-out forwards`,
            }}
          />
        )}
      </div>

      {/* Patience / Deep texts — milieu/bas */}
      {currentText && (
        <div
          key={currentText.fadeIn}
          style={{
            position: 'absolute',
            bottom: '32%',
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
              fontFamily: "'Inter', sans-serif",
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: 18,
              lineHeight: 1.5,
              color: 'var(--text-secondary)',
              animation: 'ev-textfade 8000ms ease-out both',
            }}
          >
            <PhraseInter text={currentText.text} />
          </div>
        </div>
      )}

      {/* Compteur discret + label */}
      <div
        style={{
          position: 'absolute',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 110px)',
          left: 0,
          right: 0,
          textAlign: 'center',
          pointerEvents: 'none',
          zIndex: 2,
          opacity: elapsed >= 3 ? 1 : 0,
          transition: 'opacity 1200ms ease-out',
        }}
      >
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: 10,
            color: 'var(--text-muted)',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
          }}
        >
          Espace de présence
        </div>
        <div
          style={{
            marginTop: 6,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: 12,
            color: 'var(--text-secondary)',
            letterSpacing: '0.06em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {fmt(elapsed)} / {fmt(totalCap)}
        </div>
      </div>

      {/* Bouton "Sortir doucement" — pill glass + chevron */}
      <div
        style={{
          position: 'absolute',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 38px)',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 3,
        }}
      >
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleClose(); }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          aria-label="Sortir doucement"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '13px 22px',
            borderRadius: 50,
            background: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.85)',
            color: 'var(--blue-700)',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: 11,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            boxShadow: '0 4px 24px rgba(10,36,56,0.07)',
            minHeight: 44,
          }}
        >
          <span>Sortir doucement</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Résumé overlay */}
      {resume && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 5,
            background: 'rgba(238, 243, 248, 0.88)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '0 32px',
            gap: 14,
            animation: exiting
              ? 'ev-fadein 600ms reverse ease-out forwards'
              : 'ev-fadein 600ms ease-out both',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 26,
              lineHeight: 1.3,
              color: 'var(--blue-900)',
            }}
          >
            Tu es restée {resume.minutes} {resume.minutes <= 1 ? 'minute' : 'minutes'}.
          </div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: 10,
              color: 'var(--rose-700)',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
            }}
          >
            Merci
          </div>
        </div>
      )}
    </div>
  );
}
