/* ============================================================
   ÇA VA ? V4 — Souvenirs (Design System unifié)
   ============================================================
   Affiche les traces collectées des rituels passés.
   Pas de score, pas de classement — uniquement des passages.
   ============================================================ */

import { useState, useEffect, useMemo, useRef } from 'react';
import { getSouvenirs, clearSouvenirs, haptic } from '../state';
import { WORLDS } from '../worlds';
import useEdgeSwipeBack from '../hooks/useEdgeSwipeBack';
import useStandardOverlay from '../hooks/useStandardOverlay';
import {
  Header,
  GlassCard,
  Eyebrow,
  HeroTitle,
  Body,
  CTA,
  tokens,
} from '../../components/ui';

const FILTERS = [
  { id: 'all',           label: 'Tout' },
  { id: 'meditation',    label: 'Méditations' },
  { id: 'espace-vrai',   label: 'Espace Vrai' },
  { id: 'bilan',         label: 'Bilans' },
  { id: 'world-unlock',  label: 'Mondes' },
];

const TYPE_EYEBROW = {
  'meditation':   'méditation',
  'espace-vrai':  'espace vrai',
  'bilan':        'bilan',
  'world-unlock': 'monde',
};

function timeAgo(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'à l’instant';
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d}j`;
  if (d < 30) return `il y a ${Math.floor(d / 7)}sem`;
  return `il y a ${Math.floor(d / 30)}m`;
}

function accentForSouvenir(s) {
  if (s.world && WORLDS[s.world] && WORLDS[s.world].accent) return WORLDS[s.world].accent;
  return 'var(--rose-700)';
}

export default function Souvenirs({ onClose }) {
  const [souvenirs, setSouvenirs] = useState(() => getSouvenirs() || []);
  const [filter, setFilter] = useState('all');
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const aliveRef = useRef(true);
  const timeoutsRef = useRef([]);

  const safeTimeout = (fn, ms) => {
    const id = setTimeout(() => {
      if (aliveRef.current) fn();
    }, ms);
    timeoutsRef.current.push(id);
    return id;
  };

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => {
      cancelAnimationFrame(id);
      aliveRef.current = false;
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, []);

  const doClose = () => {
    if (closing) return;
    haptic(3);
    setClosing(true);
    safeTimeout(() => onClose?.(), 320);
  };

  const {
    bindContainer: bindEdge,
    translateX: edgeX,
    isDragging: edgeDragging,
  } = useEdgeSwipeBack({ onClose: doClose });

  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closing,
    onClose: doClose,
    labelText: 'Mes souvenirs',
  });

  const filteredList = useMemo(() => {
    if (filter === 'all') return souvenirs;
    return souvenirs.filter((s) => s.type === filter);
  }, [souvenirs, filter]);

  const handleFilter = (id) => {
    if (filter === id) return;
    haptic(2);
    setFilter(id);
  };

  const handleClearAll = () => {
    if (!souvenirs.length) return;
    haptic([4, 30, 4]);
    const ok = window.confirm('Effacer tous tes souvenirs ?');
    if (!ok) return;
    clearSouvenirs();
    setSouvenirs([]);
    safeTimeout(() => doClose(), 200);
  };

  const verticalTransform = closing
    ? 'translateY(100%)'
    : mounted
      ? 'translateY(0)'
      : 'translateY(100%)';
  const opacity = closing ? 0 : mounted ? 1 : 0;
  const composedTransform = `translateX(${edgeX}px) ${verticalTransform}`;
  const composedTransition = edgeDragging
    ? 'none'
    : closing
      ? 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1), opacity 320ms cubic-bezier(0.16, 1, 0.3, 1)'
      : 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 420ms cubic-bezier(0.16, 1, 0.3, 1)';

  return (
    <div
      ref={containerRef}
      {...dialogProps}
      {...bindEdge}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 240,
        background: tokens.bg,
        color: tokens.textPrimary,
        overflow: 'hidden',
        opacity,
        transform: composedTransform,
        transition: composedTransition,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* Edge swipe-back hint */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: 1,
          height: 80,
          transform: 'translateY(-50%)',
          background: 'rgba(26, 90, 127, 0.20)',
          opacity: edgeDragging ? 0.5 : 0,
          transition: 'opacity 180ms cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />

      {/* Scrollable content with sticky Header */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          boxSizing: 'border-box',
        }}
      >
        <Header title="Mes souvenirs" onBack={doClose} />

        <div
          style={{
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
          }}
        >
          {/* Hero */}
          <div
            style={{
              padding: '24px 24px 18px',
              textAlign: 'center',
            }}
          >
            <HeroTitle size="md">Ce qui reste.</HeroTitle>
            <div style={{ marginTop: 10, maxWidth: 340, marginInline: 'auto' }}>
              <Body variant="body-sm" style={{ textAlign: 'center' }}>
                Les traces de tes passages. Aucune note, aucune comparaison.
              </Body>
            </div>
          </div>

          {/* Filter chips */}
          <div
            style={{
              padding: '4px 18px 18px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  data-press
                  onClick={() => handleFilter(f.id)}
                  style={{
                    appearance: 'none',
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                    padding: '10px 18px',
                    minHeight: 40,
                    borderRadius: 999,
                    border: active
                      ? `1px solid ${tokens.rose700}`
                      : '1px solid rgba(255, 255, 255, 0.85)',
                    background: active
                      ? tokens.gradientRose
                      : 'rgba(255, 255, 255, 0.65)',
                    backdropFilter: tokens.glass.blur,
                    WebkitBackdropFilter: tokens.glass.blur,
                    color: active ? '#FFFFFF' : tokens.blue700,
                    fontFamily: tokens.fonts.ui,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    boxShadow: active ? '0 4px 14px rgba(200, 112, 144, 0.25)' : 'none',
                    transition: 'border-color 200ms cubic-bezier(0.16, 1, 0.3, 1), color 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* List zone */}
          <div style={{ padding: '0 18px 8px' }}>
            {filteredList.length === 0 ? (
              souvenirs.length === 0 ? (
                /* Primary empty state */
                <div
                  style={{
                    minHeight: '60vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '64px 24px',
                  }}
                >
                  <div
                    aria-hidden
                    style={{
                      position: 'relative',
                      width: 140,
                      height: 140,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 28,
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at center, rgba(200, 112, 144, 0.33) 0%, rgba(200, 112, 144, 0.14) 38%, transparent 70%)',
                        filter: 'blur(2px)',
                      }}
                    />
                    <div
                      style={{
                        position: 'relative',
                        fontFamily: tokens.fonts.display,
                        fontSize: 88,
                        lineHeight: 1,
                        color: tokens.rose700,
                        textShadow: '0 2px 18px rgba(200, 112, 144, 0.55)',
                      }}
                    >
                      ◈
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <HeroTitle size="sm">Tes souvenirs t’attendent.</HeroTitle>
                  </div>

                  <div style={{ maxWidth: 280, marginBottom: 22 }}>
                    <Body variant="body-sm" style={{ textAlign: 'center' }}>
                      Chaque méditation, chaque rituel, chaque bilan laissera ici sa trace. Reviens dans quelques jours.
                    </Body>
                  </div>

                  <CTA variant="ghost" size="md" onClick={doClose}>
                    Commencer maintenant ↗
                  </CTA>
                </div>
              ) : (
                /* Filtered empty state */
                <div
                  style={{
                    minHeight: '60vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '48px 24px',
                  }}
                >
                  <div
                    aria-hidden
                    style={{
                      position: 'relative',
                      width: 96,
                      height: 96,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 18,
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at center, rgba(200, 112, 144, 0.26) 0%, rgba(200, 112, 144, 0.10) 40%, transparent 72%)',
                        filter: 'blur(2px)',
                      }}
                    />
                    <div
                      style={{
                        position: 'relative',
                        fontFamily: tokens.fonts.display,
                        fontSize: 48,
                        lineHeight: 1,
                        color: tokens.rose700,
                        opacity: 0.85,
                      }}
                    >
                      ◈
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: tokens.fonts.display,
                      fontStyle: 'italic',
                      fontWeight: 300,
                      fontSize: 17,
                      lineHeight: 1.4,
                      color: tokens.textPrimary,
                      marginBottom: 8,
                      maxWidth: 280,
                    }}
                  >
                    Rien encore dans «&nbsp;{(FILTERS.find((f) => f.id === filter) || {}).label || filter}&nbsp;».
                  </div>
                  <div style={{ maxWidth: 260 }}>
                    <Body variant="body-sm" style={{ textAlign: 'center' }}>
                      Essaie un autre filtre.
                    </Body>
                  </div>
                </div>
              )
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {filteredList.map((s) => {
                  const accent = accentForSouvenir(s);
                  const eyebrow = TYPE_EYEBROW[s.type] || s.type;
                  return (
                    <GlassCard
                      key={s.id}
                      radius="md"
                      elevation="soft"
                      padding="14px 16px"
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                          marginBottom: 6,
                        }}
                      >
                        <Eyebrow color={accent}>{eyebrow}</Eyebrow>
                        <Eyebrow color="muted">{timeAgo(s.ts)}</Eyebrow>
                      </div>

                      <div
                        style={{
                          fontFamily: tokens.fonts.display,
                          fontStyle: 'italic',
                          fontWeight: 300,
                          fontSize: 17,
                          lineHeight: 1.35,
                          color: tokens.textPrimary,
                          marginBottom: s.detail ? 6 : 0,
                        }}
                      >
                        {s.label}
                      </div>

                      {s.detail && (
                        <Body variant="body-sm">{s.detail}</Body>
                      )}
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom whisper */}
          <div
            style={{
              padding: '28px 24px 16px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                fontFamily: tokens.fonts.display,
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: 13,
                lineHeight: 1.55,
                color: tokens.textSecondary,
                maxWidth: 300,
              }}
            >
              Ces souvenirs t’appartiennent. Tu peux tout effacer si tu veux.
            </div>
            <CTA
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={!souvenirs.length}
              style={{ color: tokens.rose700, opacity: souvenirs.length ? 0.85 : 0.3 }}
            >
              Tout effacer
            </CTA>
          </div>
        </div>
      </div>
    </div>
  );
}
