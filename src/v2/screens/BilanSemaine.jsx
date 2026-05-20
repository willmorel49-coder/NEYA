/* ============================================================
   ÇA VA ? — Bilan de la semaine (DA V4 · bleu / rose / glass)
   ============================================================
   Migré vers /components/ui : BackButton, GlassCard, Eyebrow,
   HeroTitle, Body, CTA, Stat.
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
import {
  BackButton,
  GlassCard,
  Eyebrow,
  HeroTitle,
  Body,
  CTA,
  Stat,
} from '../../components/ui';

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

      {/* BackButton DS V4 */}
      <BackButton onClick={doClose} />

      {/* Topbar : titre centré (back fixed) */}
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
        <HeroTitle size="sm" style={{ textAlign: 'center' }}>
          {'Ta semaine'}
        </HeroTitle>
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
          <Body
            style={{
              marginTop: 4,
              fontWeight: 300,
              fontSize: 14,
              maxWidth: 360,
            }}
          >
            {alreadyDone
              ? 'Tu as déjà posé ta semaine. Voici ce qu’elle dit.'
              : 'Voici ce que ta semaine raconte. Sans note. Sans jugement.'}
          </Body>

          {/* Stats — deux cards glass */}
          <div
            style={{
              marginTop: 22,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            <GlassCard radius="md" elevation="soft" padding="14px 16px">
              <Stat value={joursPresents} label="Jours présent·e" color="blue" size="md" />
            </GlassCard>
            <GlassCard radius="md" elevation="soft" padding="14px 16px">
              <Stat value={totalRituels} label="Rituels faits" color="blue" size="md" />
            </GlassCard>
          </div>

          {/* Graphique bars gradient */}
          <GlassCard
            radius="xxl"
            elevation="soft"
            padding="20px 18px 16px"
            style={{ marginTop: 22 }}
            aria-label="Graphique de la semaine"
          >
            <Eyebrow color="blue" style={{ marginBottom: 14 }}>
              {'Rythme de la semaine'}
            </Eyebrow>

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
                        fontFamily: "'Inter', system-ui, sans-serif",
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
          </GlassCard>

          {/* 7 cards journées */}
          <section
            aria-label="Détail des journées"
            style={{ marginTop: 22 }}
          >
            <Eyebrow color="blue" style={{ marginBottom: 12 }}>
              {'Tes 7 journées'}
            </Eyebrow>

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
                <li key={d.key}>
                  <GlassCard
                    radius="md"
                    elevation="soft"
                    padding="12px 14px"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      border: d.isToday
                        ? '1px solid var(--blue-300)'
                        : '1px solid rgba(255, 255, 255, 0.85)',
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
                        fontFamily: "'Inter', system-ui, sans-serif",
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
                          fontFamily: "'Inter', system-ui, sans-serif",
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
                              fontFamily: "'Inter', system-ui, sans-serif",
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
                      <Body
                        variant="caption"
                        style={{ marginTop: 2, fontWeight: 300, color: 'var(--text-secondary)' }}
                      >
                        {d.visited
                          ? d.rituels > 0
                            ? `${d.rituels} rituel${d.rituels > 1 ? 's' : ''}`
                            : 'Présent·e'
                          : 'Pas de trace'}
                      </Body>
                    </div>

                    <div
                      aria-hidden
                      style={{
                        fontFamily: "'Inter', system-ui, sans-serif",
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
                  </GlassCard>
                </li>
              ))}
            </ul>
          </section>

          {/* Mot de la fin */}
          <GlassCard
            radius="xxl"
            elevation="soft"
            padding="18px 18px"
            style={{
              marginTop: 24,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 20,
              lineHeight: 1.35,
              color: 'var(--blue-900)',
              textAlign: 'center',
            }}
          >
            {'« Tu peux laisser la semaine se déposer. »'}
          </GlassCard>
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
        <CTA
          variant="primary"
          size="md"
          onClick={handleFinishWeek}
          disabled={closing}
          full
          style={{ maxWidth: 440 }}
        >
          {alreadyDone ? 'Fermer' : 'Terminer la semaine'}
        </CTA>
      </div>
    </div>
  );
}
