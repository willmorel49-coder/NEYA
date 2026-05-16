/* ============================================================
   NÉYA V2 — Habitudes (overlay rituels du jour, LIGHT MODE)
   ============================================================
   Cinq-six gestes simples. Tap → toggle done/undone.
   Respiration → ouvre BreathingCircle via onOpenMeditation.
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import {
  getHabitsToday,
  markHabitDone,
  unmarkHabit,
  getProfile,
  haptic,
} from '../state';
import { WORLDS } from '../worlds';
import useStandardOverlay from '../hooks/useStandardOverlay';

// Mapping totem → monde d'origine (pour wash + accent)
const TOTEM_HOME = {
  lion: 'foret',
  ours: 'temple',
  aigle: 'oasis',
  daim: 'lac',
  baleine: 'montagne',
  renard: 'communaute',
};

const HABITS = [
  { id: 'respiration', icon: '◯', title: 'Respiration consciente', subtitle: 'Souffle · 5 min',          minutes: 5  },
  { id: 'marche',      icon: '↗', title: 'Marche posée',           subtitle: 'Présence · 10 min',        minutes: 10 },
  { id: 'ecriture',    icon: '✎', title: 'Trois lignes',           subtitle: 'Écriture · 3 min',         minutes: 3  },
  { id: 'silence',     icon: '◇', title: 'Silence habité',         subtitle: 'Présence · 4 min',         minutes: 4  },
  { id: 'gratitude',   icon: '♡', title: 'Une chose qui va',       subtitle: 'Reconnaissance · 1 min',   minutes: 1  },
  { id: 'cocon',       icon: '✺', title: 'Rituel du cocon',        subtitle: 'Sanctuaire · 2 min',       minutes: 2  },
];

function formatTodayFr() {
  try {
    return new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  } catch {
    return '';
  }
}

export default function Habitudes({ onClose, onOpenMeditation }) {
  const profile = getProfile();
  const totemKey = profile?.totem || 'lion';
  const worldKey = TOTEM_HOME[totemKey] || 'foret';
  const world = WORLDS[worldKey] || WORLDS.foret;
  const accent = world.accent;
  const washClass = world.wash || 'wash-dawn';

  const [habits, setHabits] = useState(() => getHabitsToday());
  const [popping, setPopping] = useState(null); // habitId being pop-animated
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const popTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const closingRef = useRef(false);

  // Progress count — subtle marker (no bars, no %, just the number as anchor)
  const doneCount = HABITS.reduce((acc, h) => acc + (habits[h.id] ? 1 : 0), 0);
  const TILLEUL = '#d4e08c';

  // Slide-up reveal on mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Cleanup tous les timers au démontage
  useEffect(() => () => {
    if (popTimerRef.current) { clearTimeout(popTimerRef.current); popTimerRef.current = null; }
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
  }, []);

  // Re-sync habits si la fenêtre regagne le focus (cas du nouveau jour passé en background)
  useEffect(() => {
    const onFocus = () => {
      try {
        const fresh = getHabitsToday();
        setHabits({ ...fresh });
      } catch {}
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, []);

  const handleClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    haptic(3);
    setClosing(true);
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      onClose?.();
    }, 320);
  };

  const toggle = (habit) => {
    if (closingRef.current) return;
    // Cas spécial : respiration ouvre la méditation guidée
    if (habit.id === 'respiration' && typeof onOpenMeditation === 'function') {
      haptic(6);
      onOpenMeditation();
      return;
    }
    const isDone = !!habits[habit.id];
    if (isDone) {
      const next = unmarkHabit(habit.id);
      setHabits({ ...next });
      haptic(2);
    } else {
      const next = markHabitDone(habit.id);
      setHabits({ ...next });
      setPopping(habit.id);
      haptic([4, 30, 4]);
      if (popTimerRef.current) clearTimeout(popTimerRef.current);
      popTimerRef.current = setTimeout(() => {
        popTimerRef.current = null;
        setPopping(null);
      }, 450);
    }
  };

  const dateLine = formatTodayFr();

  // Animation in/out
  const transform = closing
    ? 'translateY(100%)'
    : mounted
      ? 'translateY(0)'
      : 'translateY(100%)';

  const backdropOpacity = closing ? 0 : mounted ? 1 : 0;

  // Comportement iOS standard (scroll lock body + ESC + focus trap + ARIA)
  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closing,
    onClose: handleClose,
    labelText: 'Mes habitudes du jour',
  });

  return (
    <div
      ref={containerRef}
      {...dialogProps}
      className={washClass}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 80,
        background: 'var(--cream)',
        color: 'var(--ink)',
        overflow: 'hidden',
        opacity: backdropOpacity,
        transform,
        transition: closing
          ? 'transform 320ms var(--ease-out-ios), opacity 320ms var(--ease-out-ios)'
          : 'transform 420ms var(--ease-out-ios), opacity 420ms var(--ease-out-ios)',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* Subtle accent halo (totem wash) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120%',
          height: '60%',
          background: `radial-gradient(ellipse at center, ${world.accentRgb || 'rgba(194,144,81'}, 0.10) 0%, transparent 65%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Back button — top-left, 44×44 hit zone (iOS HIG nav) */}
      <button
        type="button"
        onClick={handleClose}
        data-press
        aria-label="Retour"
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
          left: 12,
          appearance: 'none',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '12px 14px',
          minWidth: 44,
          minHeight: 44,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontFamily: '"Sora", system-ui, sans-serif',
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--content-tertiary)',
          zIndex: 2,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span style={{ fontSize: 16, lineHeight: 1, marginRight: 2 }}>‹</span>
        Retour
      </button>

      {/* Close button — top right (44×44 tap target) */}
      <button
        type="button"
        onClick={handleClose}
        data-press
        aria-label="Fermer"
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 8px)',
          right: 12,
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: '1px solid var(--hairline)',
          background: 'rgba(251, 246, 232, 0.6)',
          color: 'var(--ink)',
          fontSize: 15,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 2,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        ✕
      </button>

      {/* Scrollable content */}
      <div
        style={{
          position: 'relative',
          height: '100%',
          overflowY: 'auto',
          padding: 'calc(env(safe-area-inset-top, 0px) + 80px) 22px calc(env(safe-area-inset-bottom, 0px) + 40px)',
          boxSizing: 'border-box',
          zIndex: 1,
        }}
      >
        {/* Header zone */}
        <div style={{ marginBottom: 22 }}>
          <div
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--content-tertiary)',
              fontWeight: 500,
              marginBottom: 10,
            }}
          >
            Rituels du jour
          </div>
          <h1
            style={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 38,
              lineHeight: 1.05,
              color: 'var(--ink)',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Aujourd’hui.
          </h1>
          <div
            style={{
              marginTop: 8,
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 12,
              color: 'var(--content-secondary)',
              fontVariantNumeric: 'tabular-nums',
              textTransform: 'lowercase',
            }}
          >
            {dateLine}
          </div>
        </div>

        {/* Sub-header microline */}
        <div
          style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontStyle: 'italic',
            fontSize: 14,
            color: 'var(--content-secondary)',
            marginBottom: 14,
            lineHeight: 1.4,
          }}
        >
          Cinq gestes simples pour ce qui compte.
        </div>

        {/* Progress marker — subtle, no bar, no % */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 6,
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 18,
              lineHeight: 1,
              color: doneCount >= 1 ? TILLEUL : 'var(--content-tertiary)',
              fontVariantNumeric: 'tabular-nums',
              transition: 'color 320ms var(--ease-out-ios)',
            }}
          >
            {doneCount}
          </span>
          <span
            style={{
              fontFamily: '"Sora", system-ui, sans-serif',
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--content-tertiary)',
            }}
          >
            / 6 rituels aujourd’hui
          </span>
        </div>

        {/* Dot row — tap-to-toggle nav (mirrors habit row tap) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginBottom: 24,
          }}
        >
          {HABITS.map((h) => {
            const isDone = !!habits[h.id];
            return (
              <button
                key={`dot-${h.id}`}
                type="button"
                data-press
                onClick={() => toggle(h)}
                aria-label={`${h.title} — ${isDone ? 'complété' : 'à venir'}`}
                style={{
                  appearance: 'none',
                  width: 44,
                  height: 44,
                  padding: 0,
                  borderRadius: '50%',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                }}
              >
                <span
                  aria-hidden
                  style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: isDone ? TILLEUL : 'transparent',
                    border: isDone ? `1px solid ${TILLEUL}` : '1px solid var(--hairline)',
                    transition: 'background 240ms var(--ease-out-ios), border-color 240ms var(--ease-out-ios)',
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Habit list */}
        <div
          className="stagger"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {HABITS.map((h) => {
            const done = !!habits[h.id];
            const isPopping = popping === h.id;
            return (
              <div
                key={h.id}
                role="button"
                tabIndex={0}
                data-press
                onClick={() => toggle(h)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle(h);
                  }
                }}
                className={isPopping ? 'tilleul-pop' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '16px 16px',
                  minHeight: 64,
                  borderRadius: 18,
                  background: 'rgba(255, 252, 245, 0.55)',
                  border: '1px solid var(--hairline)',
                  boxShadow: '0 1px 2px rgba(26, 26, 47, 0.03)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  transition: 'background 240ms var(--ease-out-ios), border-color 240ms var(--ease-out-ios)',
                  outline: 'none',
                }}
              >
                {/* Leading icon */}
                <div
                  aria-hidden
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: '"Sora", system-ui, sans-serif',
                    fontSize: 22,
                    lineHeight: 1,
                    color: accent,
                    background: 'rgba(255, 252, 245, 0.7)',
                    border: '1px solid var(--hairline-faint)',
                    flexShrink: 0,
                  }}
                >
                  {h.icon}
                </div>

                {/* Text block */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: '"Sora", system-ui, sans-serif',
                      fontWeight: 500,
                      fontSize: 14,
                      color: 'var(--ink)',
                      lineHeight: 1.3,
                      letterSpacing: '-0.005em',
                    }}
                  >
                    {h.title}
                  </div>
                  <div
                    style={{
                      marginTop: 3,
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: 12,
                      color: 'var(--content-secondary)',
                      lineHeight: 1.35,
                    }}
                  >
                    {h.subtitle}
                  </div>
                </div>

                {/* Trailing status chip */}
                <div
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 11,
                    fontWeight: 500,
                    padding: '6px 10px',
                    borderRadius: 999,
                    background: done
                      ? 'rgba(212, 224, 140, 0.32)'
                      : 'var(--hairline)',
                    color: done
                      ? 'var(--emerald)'
                      : 'var(--content-tertiary)',
                    letterSpacing: '0.01em',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'background 240ms var(--ease-out-ios), color 240ms var(--ease-out-ios)',
                  }}
                >
                  {done ? (
                    <>
                      Complété{' '}
                      <span
                        style={{
                          fontFamily: '"Fraunces", Georgia, serif',
                          fontStyle: 'italic',
                        }}
                      >
                        ✓
                      </span>
                    </>
                  ) : (
                    'À venir'
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer whisper */}
        <div
          style={{
            marginTop: 32,
            textAlign: 'center',
            fontFamily: '"Fraunces", Georgia, serif',
            fontStyle: 'italic',
            fontSize: 13,
            color: 'var(--content-secondary)',
            lineHeight: 1.5,
            padding: '0 12px',
          }}
        >
          Tu n’as rien à prouver. Touche ce qui t’appelle.
        </div>
      </div>
    </div>
  );
}
