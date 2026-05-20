/* ============================================================
   ÇA VA ? — Bilan de la semaine (DA V3 · bleu / rose / glass)
   ============================================================
   Refonte selon /NOUVELLE DA/CLAUDE.md
   · Bg var(--bg) + <Blobs variant="blue-rose" />
   · Topbar back + titre Cormorant italic
   · 7 cards journées (glass, radius 16)
   · Stat numbers Inter 600/24px var(--blue-700)
   · Graphique bars gradient var(--gradient-main)
   · CTA "Terminer la semaine" gradient bleu full-width 50px radius
   ============================================================ */

import { useEffect, useRef, useState } from 'react';
import {
  haptic,
  getProfile,
  saveBilanSemaine,
  hasSeenBilanSemaineThisWeek,
} from '../state';
import useStandardOverlay from '../hooks/useStandardOverlay';
import Blobs from '../../components/Blobs';

/* ─── Helpers semaine ──────────────────────────────────────── */

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const DAY_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

function startOfWeek(d = new Date()) {
  const date = new Date(d);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - (day - 1));
  date.setHours(0, 0, 0, 0);
  return date;
}

function isoDate(d) {
  return d.toISOString().split('T')[0];
}

/* Compte par jour de la semaine courante : rituels faits + présence (lastVisit). */
function buildWeekData(profile) {
  const start = startOfWeek();
  const av = profile?.aventure || {};
  const rituelsFaits = av.rituelsFaits || {};

  // Carte ISO date -> nb rituels faits ce jour
  const ritualsByDay = {};
  Object.values(rituelsFaits).forEach((r) => {
    if (!r || !r.lastDoneAt) return;
    const k = isoDate(new Date(r.lastDoneAt));
    ritualsByDay[k] = (ritualsByDay[k] || 0) + 1;
  });

  const lastVisitISO = profile?.progress?.lastVisit;

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = isoDate(d);
    const today = isoDate(new Date());
    const rituels = ritualsByDay[key] || 0;
    const visited = lastVisitISO === key || rituels > 0;
    const isToday = key === today;
    const isPast = d.getTime() < new Date(today).getTime();
    days.push({
      index: i,
      label: DAY_LABELS[i],
      full: DAY_FULL[i],
      rituels,
      visited,
      isToday,
      isPast,
      key,
    });
  }
  return days;
}

/* ─── Composant principal ──────────────────────────────────── */

export default function BilanSemaine({ onClose }) {
  const profile = getProfile();
  const alreadyDone = hasSeenBilanSemaineThisWeek();

  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const aliveRef = useRef(true);
  const timersRef = useRef([]);

  const weekData = buildWeekData(profile);

  const totalRituels = weekData.reduce((s, d) => s + d.rituels, 0);
  const joursPresents = weekData.filter((d) => d.visited).length;
  const maxRituels = Math.max(1, ...weekData.map((d) => d.rituels));

  const safeTimeout = (fn, ms) => {
    const id = setTimeout(() => {
      if (aliveRef.current) fn();
    }, ms);
    timersRef.current.push(id);
    return id;
  };

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => {
      cancelAnimationFrame(raf);
      aliveRef.current = false;
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  const doClose = () => {
    if (closing) return;
    haptic(3);
    setClosing(true);
    safeTimeout(() => onClose?.(), 420);
  };

  const handleFinishWeek = () => {
    haptic([4, 30, 4]);
    try {
      saveBilanSemaine({
        totalRituels,
        joursPresents,
        weekStart: weekData[0]?.key,
        days: weekData.map((d) => ({ key: d.key, rituels: d.rituels, visited: d.visited })),
      });
    } catch {
      // silencieux : pas de blocage UX
    }
    safeTimeout(() => doClose(), 240);
  };

  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closing,
    onClose: doClose,
    labelText: 'Bilan de la semaine',
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
        color: 'var(--text-primary)',
        transform: closing
          ? 'translateY(100%)'
          : mounted
            ? 'translateY(0)'
            : 'translateY(100%)',
        opacity: closing ? 0 : mounted ? 1 : 0,
        transition:
          'transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 420ms cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* Décor */}
      <Blobs variant="blue-rose" />

      {/* Glass pill back button — fixed top-left, z-index 80 */}
      <button
        type="button"
        data-press
        onClick={doClose}
        aria-label="Retour"
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

      {/* Topbar : titre centré Cormorant italic (back déplacé en position fixed) */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 90px 10px',
          flexShrink: 0,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(22px, 5.5vw, 26px)',
            lineHeight: 1.1,
            color: 'var(--blue-900)',
            letterSpacing: '-0.01em',
            textAlign: 'center',
          }}
        >
          {'Ta semaine'}
        </h1>
      </div>

      {/* Scrollable content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '8px 20px calc(env(safe-area-inset-bottom, 0px) + 120px)',
        }}
      >
        <div style={{ maxWidth: 480, marginInline: 'auto' }}>
          <div
            style={{
              marginTop: 4,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 300,
              fontSize: 14,
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              maxWidth: 360,
            }}
          >
            {alreadyDone
              ? 'Tu as déjà posé ta semaine. Voici ce qu’elle dit.'
              : 'Voici ce que ta semaine raconte. Sans note. Sans jugement.'}
          </div>

          {/* Stats — deux cards glass */}
          <div
            style={{
              marginTop: 22,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            <StatCard label="Jours présent·e" value={joursPresents} />
            <StatCard label="Rituels faits" value={totalRituels} />
          </div>

          {/* Graphique bars gradient var(--gradient-main) */}
          <section
            aria-label="Graphique de la semaine"
            style={{
              marginTop: 22,
              padding: '20px 18px 16px',
              borderRadius: 24,
              background: 'var(--glass-bg, rgba(255,255,255,0.65))',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid var(--glass-border, rgba(255,255,255,0.85))',
              boxShadow: 'var(--glass-shadow, 0 4px 24px rgba(10,36,56,0.07))',
            }}
          >
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--blue-700)',
                marginBottom: 14,
              }}
            >
              {'Rythme de la semaine'}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                alignItems: 'end',
                gap: 8,
                height: 96,
              }}
            >
              {weekData.map((d) => {
                const ratio = d.rituels > 0 ? d.rituels / maxRituels : 0;
                const height = Math.max(d.rituels > 0 ? 14 : 4, ratio * 84);
                return (
                  <div
                    key={d.key}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      height: '100%',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <div
                      aria-label={`${d.full} : ${d.rituels} rituel${d.rituels > 1 ? 's' : ''}`}
                      style={{
                        width: '100%',
                        maxWidth: 22,
                        height,
                        borderRadius: 8,
                        background:
                          d.rituels > 0
                            ? 'var(--gradient-main, linear-gradient(135deg,#1A5A7F,#7F5A8A,#C87090))'
                            : 'rgba(26,90,127,0.10)',
                        transition: 'height 360ms cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                    <div
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 10,
                        fontWeight: d.isToday ? 600 : 400,
                        color: d.isToday
                          ? 'var(--blue-700)'
                          : 'var(--text-muted)',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {d.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 7 cards journées glass radius 16 */}
          <section
            aria-label="Détail des journées"
            style={{ marginTop: 22 }}
          >
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--blue-700)',
                marginBottom: 12,
              }}
            >
              {'Tes 7 journées'}
            </div>

            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {weekData.map((d) => (
                <li
                  key={d.key}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 16,
                    background: 'var(--glass-bg, rgba(255,255,255,0.65))',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: d.isToday
                      ? '1px solid var(--blue-300)'
                      : '1px solid var(--glass-border, rgba(255,255,255,0.85))',
                    boxShadow: 'var(--glass-shadow, 0 4px 24px rgba(10,36,56,0.07))',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <div
                    aria-hidden
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: d.visited
                        ? 'var(--gradient-blue, linear-gradient(135deg,#1A5A7F,#2A8ABF))'
                        : 'transparent',
                      border: d.visited
                        ? 'none'
                        : '1px solid var(--blue-300)',
                      color: d.visited ? '#fff' : 'var(--blue-500)',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      flexShrink: 0,
                    }}
                  >
                    {d.label}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--blue-900)',
                      }}
                    >
                      {d.full}
                      {d.isToday && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 9,
                            fontWeight: 500,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: 'var(--rose-700)',
                          }}
                        >
                          {'aujourd’hui'}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        marginTop: 2,
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 300,
                        fontSize: 12,
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {d.visited
                        ? d.rituels > 0
                          ? `${d.rituels} rituel${d.rituels > 1 ? 's' : ''}`
                          : 'Présent·e'
                        : 'Pas de trace'}
                    </div>
                  </div>

                  <div
                    aria-hidden
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 24,
                      fontWeight: 600,
                      color: d.rituels > 0 ? 'var(--blue-700)' : 'var(--text-muted)',
                      fontVariantNumeric: 'tabular-nums',
                      minWidth: 24,
                      textAlign: 'right',
                    }}
                  >
                    {d.rituels}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Mot de la fin */}
          <div
            style={{
              marginTop: 24,
              padding: '18px 18px',
              borderRadius: 24,
              background: 'var(--glass-bg, rgba(255,255,255,0.65))',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid var(--glass-border, rgba(255,255,255,0.85))',
              boxShadow: 'var(--glass-shadow, 0 4px 24px rgba(10,36,56,0.07))',
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 20,
              lineHeight: 1.35,
              color: 'var(--blue-900)',
              textAlign: 'center',
            }}
          >
            {'« Tu peux laisser la semaine se déposer. »'}
          </div>
        </div>
      </div>

      {/* CTA bas — Terminer la semaine */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 3,
          padding: '14px 20px calc(env(safe-area-inset-bottom, 0px) + 18px)',
          background:
            'linear-gradient(to top, rgba(238,243,248,0.96), rgba(238,243,248,0))',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <button
          type="button"
          data-press
          onClick={handleFinishWeek}
          disabled={closing}
          style={{
            appearance: 'none',
            cursor: closing ? 'default' : 'pointer',
            WebkitTapHighlightColor: 'transparent',
            width: '100%',
            maxWidth: 440,
            height: 50,
            borderRadius: 50,
            border: 'none',
            background:
              'var(--gradient-blue, linear-gradient(135deg,#1A5A7F,#2A8ABF))',
            color: '#fff',
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            boxShadow: '0 8px 24px rgba(26,90,127,0.30)',
            transition:
              'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms cubic-bezier(0.16, 1, 0.3, 1)',
            opacity: closing ? 0.6 : 1,
          }}
        >
          {alreadyDone ? 'Fermer' : 'Terminer la semaine'}
        </button>
      </div>
    </div>
  );
}

/* ─── Sous-composants ──────────────────────────────────────── */

function StatCard({ label, value }) {
  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: 16,
        background: 'var(--glass-bg, rgba(255,255,255,0.65))',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid var(--glass-border, rgba(255,255,255,0.85))',
        boxShadow: 'var(--glass-shadow, 0 4px 24px rgba(10,36,56,0.07))',
      }}
    >
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 9,
          fontWeight: 500,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 6,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: 24,
          lineHeight: 1.1,
          color: 'var(--blue-700)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
    </div>
  );
}
