/* ============================================================
   ÇA VA ? V2 — MoodTracker (overlay humeur express, LIGHT MODE)
   ============================================================
   One-tap mood input + 7-day strip visualization.
   Anti-toxique : pas de note, pas de moyenne, pas de classement.
   Privacy : tout reste local (neya_v2_mood_history).
   ============================================================ */

import { useState, useEffect, useMemo, useRef } from 'react';
import { ls, haptic } from '../state';
import useStandardOverlay from '../hooks/useStandardOverlay';

const STORAGE_KEY = 'mood_history';
const MAX_ENTRIES = 100;
const TILLEUL = '#d4e08c';

const MOODS = [
  { key: 'lourd',  label: 'Lourd',  glyph: '●', color: 'var(--deep-purple)' },
  { key: 'agite',  label: 'Agité',  glyph: '◆', color: 'var(--terracotta)'  },
  { key: 'neutre', label: 'Neutre', glyph: '◇', color: 'var(--ink-soft)'    },
  { key: 'calme',  label: 'Calme',  glyph: '○', color: 'var(--mist-blue)'   },
  { key: 'leger',  label: 'Léger',  glyph: '✦', color: 'var(--tilleul)'     },
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
    // Latest entry of that day
    let latest = null;
    for (let j = history.length - 1; j >= 0; j--) {
      const e = history[j];
      if (e.ts >= dayStart && e.ts < dayEnd) {
        if (!latest || e.ts > latest.ts) latest = e;
        // history is appended chronologically, but be safe
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
  const [selected, setSelected] = useState(null); // mood key
  const [intensity, setIntensity] = useState(3);
  const [showCheck, setShowCheck] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const checkTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const closingRef = useRef(false);

  // Pre-highlight today's latest entry
  useEffect(() => {
    const latest = getTodayLatest(history);
    if (latest) {
      setSelected(latest.mood);
      setIntensity(latest.intensity || 3);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Slide-up reveal
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Cleanup timers au démontage
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

  // Comportement iOS standard (scroll lock body + ESC + focus trap + ARIA)
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
      className="wash-renard"
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
          background: 'radial-gradient(ellipse at center, rgba(159, 88, 76, 0.10) 0%, transparent 65%)',
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
          zIndex: 3,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span style={{ fontSize: 16, lineHeight: 1, marginRight: 2 }}>‹</span>
        Retour
      </button>

      {/* Close button — 44×44 tap target */}
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
          background: 'rgba(255, 255, 255, 0.78)',
          color: 'var(--ink)',
          fontSize: 15,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 3,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        ✕
      </button>

      {/* Top caps line — centered */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 18px)',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--content-tertiary)',
          fontWeight: 500,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        Humeur
      </div>

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
        {/* Sub-line */}
        <div
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 13,
            color: 'var(--content-secondary)',
            marginBottom: 14,
            lineHeight: 1.4,
          }}
        >
          Aujourd’hui, là, maintenant.
        </div>

        {/* Hero question */}
        <h1
          style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(24px, 6vw, 30px)',
            lineHeight: 1.15,
            color: 'var(--ink)',
            margin: 0,
            marginBottom: 22,
            letterSpacing: '-0.01em',
          }}
        >
          Comment tu sens, là ?
        </h1>

        {/* Choice strip — grid 2-3 mobile, scrollable on small */}
        <div
          className="stagger"
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
                    ? 'rgba(255, 252, 245, 0.9)'
                    : 'rgba(255, 252, 245, 0.55)',
                  border: `1px solid ${isActive ? m.color : 'var(--hairline)'}`,
                  boxShadow: isActive
                    ? `0 0 0 1px ${m.color}, 0 2px 8px rgba(26, 26, 47, 0.06)`
                    : '0 1px 2px rgba(26, 26, 47, 0.03)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'background 240ms var(--ease-out-ios), border-color 240ms var(--ease-out-ios), box-shadow 240ms var(--ease-out-ios)',
                }}
              >
                <span
                  aria-hidden
                  style={{
                    fontFamily: '"Sora", system-ui, sans-serif',
                    fontSize: 24,
                    lineHeight: 1,
                    color: m.color,
                  }}
                >
                  {m.glyph}
                </span>
                <span
                  style={{
                    fontFamily: '"Sora", system-ui, sans-serif',
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--ink)',
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
            transition: 'opacity 320ms var(--ease-out-ios), transform 320ms var(--ease-out-ios)',
            marginBottom: 26,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            borderRadius: 14,
            background: 'rgba(255, 252, 245, 0.45)',
            border: '1px solid var(--hairline-faint)',
            pointerEvents: selected ? 'auto' : 'none',
          }}
        >
          <span
            style={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontStyle: 'italic',
              fontSize: 13,
              color: 'var(--content-secondary)',
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
                        ? (selectedMood?.color || 'var(--ink-soft)')
                        : 'transparent',
                      border: `1px solid ${active ? (selectedMood?.color || 'var(--ink-soft)') : 'var(--hairline)'}`,
                      transition: 'background 200ms var(--ease-out-ios), border-color 200ms var(--ease-out-ios)',
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* History header */}
        <div
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--content-tertiary)',
            fontWeight: 500,
            marginBottom: 12,
          }}
        >
          Mes 7 derniers jours
        </div>

        {/* History strip */}
        <div
          className="stagger"
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
                    ? 'rgba(255, 252, 245, 0.55)'
                    : 'var(--hairline-faint)',
                  border: `1px solid ${isToday ? 'var(--hairline)' : 'transparent'}`,
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
                    fontFamily: '"Sora", system-ui, sans-serif',
                    fontSize: 14,
                    lineHeight: 1,
                    color: moodDef ? moodDef.color : 'var(--ink-faint)',
                    minHeight: 14,
                  }}
                >
                  {moodDef ? moodDef.glyph : '·'}
                </div>
                {/* Day label */}
                <div
                  style={{
                    fontFamily: '"Sora", system-ui, sans-serif',
                    fontSize: 9,
                    fontWeight: 500,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: isToday ? 'var(--ink)' : 'var(--content-tertiary)',
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
            fontFamily: '"Fraunces", Georgia, serif',
            fontStyle: 'italic',
            fontSize: 13,
            color: 'var(--content-secondary)',
            lineHeight: 1.5,
            padding: '0 12px',
          }}
        >
          Tu peux revenir aussi souvent que tu veux.
        </div>
      </div>

      {/* Tilleul ✓ confirmation overlay */}
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
          transition: 'opacity 600ms var(--ease-out-ios)',
          zIndex: 4,
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: 'rgba(212, 224, 140, 0.18)',
            border: `1px solid ${TILLEUL}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"Fraunces", Georgia, serif',
            fontStyle: 'italic',
            fontSize: 44,
            color: TILLEUL,
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            boxShadow: '0 4px 24px rgba(212, 224, 140, 0.25)',
          }}
        >
          ✓
        </div>
      </div>
    </div>
  );
}
