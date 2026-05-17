/* ============================================================
   ÇA VA ? V4 — Habitudes (overlay rituels du jour)
   ============================================================
   Palette bleu/rose · Glassmorphism · Cormorant italic.
   Liste de gestes simples : tap CTA "Démarrer" → toggle done.
   Respiration → ouvre BreathingCircle via onOpenMeditation.
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import {
  getHabitsToday,
  markHabitDone,
  unmarkHabit,
  haptic,
} from '../state';
import useStandardOverlay from '../hooks/useStandardOverlay';
import Blobs from '../../components/Blobs';

const HABITS = [
  { id: 'respiration', icon: '◯', title: 'Respiration consciente', subtitle: 'Souffle · 5 min',        minutes: 5  },
  { id: 'marche',      icon: '↗', title: 'Marche posée',           subtitle: 'Présence · 10 min',      minutes: 10 },
  { id: 'ecriture',    icon: '✎', title: 'Trois lignes',           subtitle: 'Écriture · 3 min',       minutes: 3  },
  { id: 'silence',     icon: '◇', title: 'Silence habité',         subtitle: 'Présence · 4 min',       minutes: 4  },
  { id: 'gratitude',   icon: '♡', title: 'Une chose qui va',       subtitle: 'Reconnaissance · 1 min', minutes: 1  },
  { id: 'cocon',       icon: '✺', title: 'Rituel du cocon',        subtitle: 'Sanctuaire · 2 min',     minutes: 2  },
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
  const [habits, setHabits] = useState(() => getHabitsToday());
  const [popping, setPopping] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const popTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const closingRef = useRef(false);

  const doneCount = HABITS.reduce((acc, h) => acc + (habits[h.id] ? 1 : 0), 0);
  const total = HABITS.length;
  const progressPct = Math.round((doneCount / total) * 100);

  // Slide-up reveal
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('neya:fullscreen-overlay', { detail: { open: true } }));
    }
    return () => {
      cancelAnimationFrame(id);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('neya:fullscreen-overlay', { detail: { open: false } }));
      }
    };
  }, []);

  // Cleanup timers
  useEffect(() => () => {
    if (popTimerRef.current) { clearTimeout(popTimerRef.current); popTimerRef.current = null; }
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
  }, []);

  // Re-sync habits on focus
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

  const toggle = (habit, e) => {
    if (e) e.stopPropagation();
    if (closingRef.current) return;
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

  const transform = closing
    ? 'translateY(100%)'
    : mounted
      ? 'translateY(0)'
      : 'translateY(100%)';
  const backdropOpacity = closing ? 0 : mounted ? 1 : 0;

  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closing,
    onClose: handleClose,
    labelText: 'Tes habitudes du jour',
  });

  return (
    <div
      ref={containerRef}
      {...dialogProps}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 80,
        background: 'var(--bg)',
        color: 'var(--blue-900)',
        overflow: 'hidden',
        opacity: backdropOpacity,
        transform,
        transition: closing
          ? 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1), opacity 320ms cubic-bezier(0.16, 1, 0.3, 1)'
          : 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 420ms cubic-bezier(0.16, 1, 0.3, 1)',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* Blobs décor */}
      <Blobs variant="rose-blue" />

      {/* Barre de progression — 2px gradient bleu, en haut */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 0px)',
          left: 0,
          right: 0,
          height: 2,
          background: 'rgba(26, 90, 127, 0.10)',
          zIndex: 3,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progressPct}%`,
            background: 'var(--gradient-blue)',
            transition: 'width 420ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>

      {/* Topbar : back + titre centré */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 14px 6px',
          zIndex: 2,
        }}
      >
        <button
          type="button"
          onClick={handleClose}
          data-press
          aria-label="Retour"
          style={{
            appearance: 'none',
            background: 'rgba(255, 255, 255, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            minWidth: 44,
            minHeight: 44,
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--blue-900)',
            fontSize: 18,
            lineHeight: 1,
            boxShadow: '0 4px 14px rgba(10, 36, 56, 0.06)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          ‹
        </button>

        <h1
          style={{
            margin: 0,
            fontFamily: 'Cormorant Garamond, var(--font-display), serif',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 30,
            lineHeight: 1.05,
            color: 'var(--blue-900)',
            letterSpacing: '-0.01em',
            textAlign: 'center',
          }}
        >
          Tes habitudes
        </h1>

        {/* Spacer pour équilibrer le bouton back */}
        <div aria-hidden style={{ width: 44, height: 44 }} />
      </div>

      {/* Scrollable content */}
      <div
        style={{
          position: 'relative',
          height: '100%',
          overflowY: 'auto',
          padding: 'calc(env(safe-area-inset-top, 0px) + 76px) 18px calc(env(safe-area-inset-bottom, 0px) + 40px)',
          boxSizing: 'border-box',
          zIndex: 1,
        }}
      >
        {/* Date + compteur */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: 18,
            padding: '0 4px',
          }}
        >
          <div
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 12,
              fontWeight: 300,
              color: 'var(--text-secondary)',
              textTransform: 'lowercase',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {dateLine}
          </div>
          <div
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {doneCount} / {total}
          </div>
        </div>

        {/* Sub-header microline */}
        <div
          style={{
            fontFamily: 'Cormorant Garamond, var(--font-display), serif',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 16,
            color: 'var(--text-secondary)',
            marginBottom: 18,
            padding: '0 4px',
            lineHeight: 1.4,
          }}
        >
          Cinq gestes simples pour ce qui compte.
        </div>

        {/* Habit list — glass cards */}
        <div
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
                className={isPopping ? 'tilleul-pop' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '16px 16px',
                  minHeight: 72,
                  borderRadius: 24,
                  background: 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.85)',
                  boxShadow: '0 4px 24px rgba(10, 36, 56, 0.07)',
                  transition: 'background 240ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {/* Leading icon — 24px var(--blue-700) */}
                <div
                  aria-hidden
                  style={{
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    lineHeight: 1,
                    color: 'var(--blue-700)',
                    flexShrink: 0,
                  }}
                >
                  {h.icon}
                </div>

                {/* Text block */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'Cormorant Garamond, var(--font-display), serif',
                      fontStyle: 'italic',
                      fontWeight: 400,
                      fontSize: 14,
                      color: 'var(--blue-900)',
                      lineHeight: 1.3,
                      letterSpacing: '-0.005em',
                    }}
                  >
                    {h.title}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontFamily: '"Inter", sans-serif',
                      fontWeight: 300,
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      lineHeight: 1.4,
                    }}
                  >
                    {h.subtitle}
                  </div>
                </div>

                {/* Trailing : status chip si done, CTA pill bleu si pending */}
                {done ? (
                  <button
                    type="button"
                    data-press
                    onClick={(e) => toggle(h, e)}
                    aria-label={`${h.title} — complété, retirer`}
                    style={{
                      appearance: 'none',
                      cursor: 'pointer',
                      fontFamily: '"Inter", sans-serif',
                      fontSize: 10,
                      fontWeight: 500,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      padding: '7px 12px',
                      borderRadius: 999,
                      background: 'rgba(26, 90, 127, 0.10)',
                      color: 'var(--blue-700)',
                      border: '1px solid rgba(26, 90, 127, 0.18)',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    Fait
                  </button>
                ) : (
                  <button
                    type="button"
                    data-press
                    onClick={(e) => toggle(h, e)}
                    aria-label={`Démarrer ${h.title}`}
                    style={{
                      appearance: 'none',
                      cursor: 'pointer',
                      fontFamily: '"Inter", sans-serif',
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      padding: '10px 16px',
                      borderRadius: 50,
                      background: 'var(--gradient-blue)',
                      color: '#FFFFFF',
                      border: 'none',
                      boxShadow: '0 4px 14px rgba(26, 90, 127, 0.25)',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    Démarrer
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer whisper */}
        <div
          style={{
            marginTop: 32,
            textAlign: 'center',
            fontFamily: 'Cormorant Garamond, var(--font-display), serif',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            padding: '0 12px',
          }}
        >
          Tu n{'’'}as rien à prouver. Touche ce qui t{'’'}appelle.
        </div>
      </div>
    </div>
  );
}
