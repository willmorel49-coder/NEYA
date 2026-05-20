/* ============================================================
   ÇA VA ? V4 — MoodTracker (Design System unifié)
   ============================================================
   One-tap mood input + 7-day strip visualization.
   Anti-toxique : pas de note, pas de moyenne, pas de classement.
   Privacy : tout reste local (mood_history).
   ============================================================ */

import { useState, useEffect, useMemo, useRef } from 'react';
import { ls, haptic } from '../state';
import useStandardOverlay from '../hooks/useStandardOverlay';
import {
  Header,
  GlassCard,
  Eyebrow,
  HeroTitle,
  Body,
  tokens,
} from '../../components/ui';

const STORAGE_KEY = 'mood_history';
const MAX_ENTRIES = 100;

const MOODS = [
  { key: 'lourd',  label: 'Lourd',  glyph: '●', color: 'var(--violet)' },
  { key: 'agite',  label: 'Agité',  glyph: '◆', color: 'var(--rose-700)' },
  { key: 'neutre', label: 'Neutre', glyph: '◇', color: 'var(--text-secondary)' },
  { key: 'calme',  label: 'Calme',  glyph: '○', color: 'var(--blue-500)' },
  { key: 'leger',  label: 'Léger',  glyph: '✦', color: 'var(--rose-300)' },
];

const MOOD_MAP = MOODS.reduce((acc, m) => { acc[m.key] = m; return acc; }, {});

const DAY_LABELS_SHORT = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];

function startOfDay(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function buildLast7Days(history) {
  const today = startOfDay(Date.now());
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = today - i * 86400000;
    const dayEnd = dayStart + 86400000;
    let latest = null;
    for (let j = history.length - 1; j >= 0; j--) {
      const e = history[j];
      if (e.ts >= dayStart && e.ts < dayEnd) {
        if (!latest || e.ts > latest.ts) latest = e;
      }
    }
    const dateObj = new Date(dayStart);
    days.push({
      ts: dayStart,
      label: i === 0 ? 'AUJ.' : `J-${i}`,
      day: DAY_LABELS_SHORT[dateObj.getDay()],
      mood: latest?.mood || null,
      intensity: latest?.intensity || null,
    });
  }
  return days;
}

function getTodayLatest(history) {
  const today = startOfDay(Date.now());
  const tomorrow = today + 86400000;
  let latest = null;
  for (let j = history.length - 1; j >= 0; j--) {
    const e = history[j];
    if (e.ts >= today && e.ts < tomorrow) {
      if (!latest || e.ts > latest.ts) latest = e;
    }
  }
  return latest;
}

export default function MoodTracker({ onClose }) {
  const [history, setHistory] = useState(() => ls.get(STORAGE_KEY, []) || []);
  const [selected, setSelected] = useState(null);
  const [intensity, setIntensity] = useState(3);
  const [showCheck, setShowCheck] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const checkTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const closingRef = useRef(false);

  useEffect(() => {
    const latest = getTodayLatest(history);
    if (latest) {
      setSelected(latest.mood);
      setIntensity(latest.intensity || 3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => () => {
    if (checkTimerRef.current) { clearTimeout(checkTimerRef.current); checkTimerRef.current = null; }
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
  }, []);

  const days = useMemo(() => buildLast7Days(history), [history]);

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

  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closing,
    onClose: handleClose,
    labelText: 'Mon humeur',
  });

  const persistEntry = (moodKey, intensityValue) => {
    const entry = { ts: Date.now(), mood: moodKey, intensity: intensityValue };
    const next = [...history, entry].slice(-MAX_ENTRIES);
    setHistory(next);
    ls.set(STORAGE_KEY, next);
  };

  const handleMoodTap = (moodKey) => {
    if (closingRef.current) return;
    haptic(4);
    setSelected(moodKey);
    persistEntry(moodKey, intensity);
    setShowCheck(true);
    if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
    checkTimerRef.current = setTimeout(() => {
      checkTimerRef.current = null;
      setShowCheck(false);
    }, 600);
  };

  const handleIntensityTap = (value) => {
    if (closingRef.current) return;
    haptic(2);
    setIntensity(value);
    if (selected) {
      persistEntry(selected, value);
    }
  };

  const transform = closing
    ? 'translateY(100%)'
    : mounted
      ? 'translateY(0)'
      : 'translateY(100%)';

  const backdropOpacity = closing ? 0 : mounted ? 1 : 0;
  const selectedMood = selected ? MOOD_MAP[selected] : null;

  return (
    <div
      ref={containerRef}
      {...dialogProps}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 240,
        background: tokens.bg,
        color: tokens.textPrimary,
        overflow: 'hidden',
        opacity: backdropOpacity,
        transform,
        transition: closing
          ? 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1), opacity 320ms cubic-bezier(0.16, 1, 0.3, 1)'
          : 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 420ms cubic-bezier(0.16, 1, 0.3, 1)',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* Soft accent halo */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-18%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120%',
          height: '55%',
          background: 'radial-gradient(ellipse at center, rgba(200, 112, 144, 0.10) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      {/* Scrollable container with sticky header */}
      <div
        style={{
          position: 'relative',
          height: '100%',
          overflowY: 'auto',
          zIndex: 1,
        }}
      >
        <Header title="Humeur" onBack={handleClose} />

        <div
          style={{
            padding: '12px 22px calc(env(safe-area-inset-bottom, 0px) + 40px)',
            boxSizing: 'border-box',
          }}
        >
          {/* Sub-line */}
          <div style={{ marginBottom: 14 }}>
            <Body variant="body-sm">Aujourd’hui, là, maintenant.</Body>
          </div>

          {/* Hero question */}
          <div style={{ marginBottom: 22 }}>
            <HeroTitle size="md">Comment tu sens, là ?</HeroTitle>
          </div>

          {/* Choice strip — grid 5 mobile */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 8,
              marginBottom: 18,
            }}
          >
            {MOODS.map((m) => {
              const isActive = selected === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  data-press
                  onClick={() => handleMoodTap(m.key)}
                  aria-label={`Humeur ${m.label}`}
                  style={{
                    appearance: 'none',
                    height: 80,
                    padding: '14px 8px',
                    borderRadius: 16,
                    background: isActive
                      ? tokens.gradientMain
                      : 'rgba(255, 255, 255, 0.65)',
                    border: `1px solid ${isActive ? m.color : 'rgba(255, 255, 255, 0.85)'}`,
                    boxShadow: isActive
                      ? `0 0 0 1px ${m.color}, 0 4px 16px rgba(10, 36, 56, 0.12)`
                      : '0 4px 24px rgba(10, 36, 56, 0.07)',
                    backdropFilter: tokens.glass.blur,
                    WebkitBackdropFilter: tokens.glass.blur,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                    transition: 'background 240ms cubic-bezier(0.16, 1, 0.3, 1), border-color 240ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 240ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      fontFamily: tokens.fonts.ui,
                      fontSize: 24,
                      lineHeight: 1,
                      color: isActive ? '#FFFFFF' : m.color,
                    }}
                  >
                    {m.glyph}
                  </span>
                  <span
                    style={{
                      fontFamily: tokens.fonts.ui,
                      fontSize: 10,
                      fontWeight: 500,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: isActive ? '#FFFFFF' : tokens.textPrimary,
                    }}
                  >
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Intensity slider — appears after mood tap */}
          <div
            style={{
              opacity: selected ? 1 : 0,
              transform: selected ? 'translateY(0)' : 'translateY(4px)',
              transition: 'opacity 320ms cubic-bezier(0.16, 1, 0.3, 1), transform 320ms cubic-bezier(0.16, 1, 0.3, 1)',
              marginBottom: 26,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 14,
              background: 'rgba(255, 255, 255, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              backdropFilter: tokens.glass.blur,
              WebkitBackdropFilter: tokens.glass.blur,
              pointerEvents: selected ? 'auto' : 'none',
            }}
          >
            <span
              style={{
                fontFamily: tokens.fonts.display,
                fontStyle: 'italic',
                fontSize: 13,
                color: tokens.textSecondary,
                flexShrink: 0,
              }}
            >
              Plutôt…
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map((v) => {
                const active = v <= intensity;
                return (
                  <button
                    key={v}
                    type="button"
                    data-press
                    onClick={() => handleIntensityTap(v)}
                    aria-label={`Intensité ${v}`}
                    style={{
                      appearance: 'none',
                      width: 44,
                      height: 44,
                      padding: 0,
                      margin: '-8px -2px',
                      borderRadius: '50%',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        display: 'inline-block',
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: active
                          ? (selectedMood?.color || tokens.blue500)
                          : 'transparent',
                        border: `1px solid ${active ? (selectedMood?.color || tokens.blue500) : tokens.blue300}`,
                        transition: 'background 200ms cubic-bezier(0.16, 1, 0.3, 1), border-color 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* History header */}
          <div style={{ marginBottom: 12 }}>
            <Eyebrow color="muted">Mes 7 derniers jours</Eyebrow>
          </div>

          {/* History strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 6,
              marginBottom: 28,
            }}
          >
            {days.map((d, idx) => {
              const moodDef = d.mood ? MOOD_MAP[d.mood] : null;
              const isToday = idx === 6;
              return (
                <div
                  key={d.ts}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 2px 8px',
                    borderRadius: 10,
                    background: moodDef
                      ? 'rgba(255, 255, 255, 0.65)'
                      : 'rgba(255, 255, 255, 0.30)',
                    backdropFilter: tokens.glass.blur,
                    WebkitBackdropFilter: tokens.glass.blur,
                    border: `1px solid ${isToday ? tokens.blue300 : 'transparent'}`,
                    minHeight: 56,
                    position: 'relative',
                  }}
                >
                  {/* Color stripe */}
                  <div
                    aria-hidden
                    style={{
                      width: '60%',
                      height: 3,
                      borderRadius: 2,
                      background: moodDef ? moodDef.color : 'transparent',
                      marginBottom: 2,
                    }}
                  />
                  {/* Glyph */}
                  <div
                    aria-hidden
                    style={{
                      fontFamily: tokens.fonts.ui,
                      fontSize: 14,
                      lineHeight: 1,
                      color: moodDef ? moodDef.color : tokens.textMuted,
                      minHeight: 14,
                    }}
                  >
                    {moodDef ? moodDef.glyph : '·'}
                  </div>
                  {/* Day label */}
                  <div
                    style={{
                      fontFamily: tokens.fonts.ui,
                      fontSize: 9,
                      fontWeight: 500,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: isToday ? tokens.textPrimary : tokens.textMuted,
                      lineHeight: 1,
                    }}
                  >
                    {d.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom whisper */}
          <div
            style={{
              textAlign: 'center',
              fontFamily: tokens.fonts.display,
              fontStyle: 'italic',
              fontSize: 13,
              color: tokens.textSecondary,
              lineHeight: 1.5,
              padding: '0 12px',
            }}
          >
            Tu peux revenir aussi souvent que tu veux.
          </div>
        </div>
      </div>

      {/* Rose ✓ confirmation overlay */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          opacity: showCheck ? 1 : 0,
          transition: 'opacity 600ms cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 90,
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: 'rgba(200, 112, 144, 0.18)',
            border: `1px solid ${tokens.rose500}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: tokens.fonts.display,
            fontStyle: 'italic',
            fontSize: 44,
            color: tokens.rose700,
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            boxShadow: '0 4px 24px rgba(200, 112, 144, 0.25)',
          }}
        >
          ✓
        </div>
      </div>
    </div>
  );
}
