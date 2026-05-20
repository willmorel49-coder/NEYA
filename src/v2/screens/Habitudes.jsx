/* ============================================================
   ÇA VA ? V4 — Habitudes (overlay rituels du jour) [DS V4]
   ============================================================
   Migré vers /components/ui : BackButton, GlassCard, Eyebrow,
   HeroTitle, Body, CTA.
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
import {
  BackButton,
  GlassCard,
  Eyebrow,
  HeroTitle,
  Body,
  CTA,
  useToast,
} from '../../components/ui';

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
  const toast = useToast();
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
      toast.show({ message: 'Habit gardée.', variant: 'success' });
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

      {/* BackButton DS V4 */}
      <BackButton onClick={handleClose} />

      {/* Topbar : titre centré */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 90px 6px',
          zIndex: 2,
        }}
      >
        <HeroTitle size="sm" style={{ textAlign: 'center' }}>
          Tes habitudes
        </HeroTitle>
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
          <Body
            variant="caption"
            style={{ textTransform: 'lowercase', fontVariantNumeric: 'tabular-nums' }}
          >
            {dateLine}
          </Body>
          <Eyebrow color="muted" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {doneCount} / {total}
          </Eyebrow>
        </div>

        {/* Sub-header microline */}
        <Body
          italic
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 16,
            fontWeight: 300,
            marginBottom: 18,
            padding: '0 4px',
            lineHeight: 1.4,
          }}
        >
          Cinq gestes simples pour ce qui compte.
        </Body>

        {/* Habit list — GlassCard list */}
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
              <div key={h.id} className={isPopping ? 'tilleul-pop' : undefined}>
                <GlassCard
                  radius="xxl"
                  elevation="soft"
                  padding="16px 16px"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    minHeight: 72,
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
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
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
                    <Body variant="caption" style={{ marginTop: 4, fontWeight: 300 }}>
                      {h.subtitle}
                    </Body>
                  </div>

                  {/* Trailing : status chip si done, CTA pill si pending */}
                  {done ? (
                    <button
                      type="button"
                      data-press
                      onClick={(e) => toggle(h, e)}
                      aria-label={`${h.title} — complété, retirer`}
                      style={{
                        appearance: 'none',
                        cursor: 'pointer',
                        fontFamily: "'Inter', system-ui, sans-serif",
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
                    <CTA
                      size="sm"
                      variant="primary"
                      onClick={(e) => toggle(h, e)}
                      aria-label={`Démarrer ${h.title}`}
                      style={{ flexShrink: 0 }}
                    >
                      Démarrer
                    </CTA>
                  )}
                </GlassCard>
              </div>
            );
          })}
        </div>

        {/* Footer whisper */}
        <Body
          variant="whisper"
          style={{
            marginTop: 32,
            textAlign: 'center',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 300,
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            padding: '0 12px',
          }}
        >
          Tu n{'’'}as rien à prouver. Touche ce qui t{'’'}appelle.
        </Body>
      </div>
    </div>
  );
}
