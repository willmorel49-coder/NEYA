/* ============================================================
   NÉYA V3 — Souvenirs (collection memory archive)
   ============================================================
   Affiche les traces collectées des rituels passés.
   Pas de score, pas de classement — uniquement des passages.
   ============================================================ */

import { useState, useEffect, useMemo } from 'react';
import { getSouvenirs, clearSouvenirs, haptic } from '../state';
import { WORLDS } from '../worlds';
import useEdgeSwipeBack from '../hooks/useEdgeSwipeBack';

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

const TERRACOTTA = '#c29051';

function timeAgo(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'à l\'instant';
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d}j`;
  if (d < 30) return `il y a ${Math.floor(d / 7)}sem`;
  return `il y a ${Math.floor(d / 30)}m`;
}

function accentForSouvenir(s) {
  if (s.world && WORLDS[s.world]) return WORLDS[s.world].accent;
  return TERRACOTTA;
}

export default function Souvenirs({ onClose }) {
  const [souvenirs, setSouvenirs] = useState(() => getSouvenirs() || []);
  const [filter, setFilter] = useState('all');
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);

  // Slide-up reveal
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const doClose = () => {
    if (closing) return;
    haptic(3);
    setClosing(true);
    setTimeout(() => onClose?.(), 320);
  };

  // Edge swipe-back (iOS HIG) — horizontal left-edge drag
  const {
    bindContainer: bindEdge,
    translateX: edgeX,
    isDragging: edgeDragging,
  } = useEdgeSwipeBack({ onClose: doClose });

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
    setTimeout(() => doClose(), 200);
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
      ? 'transform 320ms var(--ease-out-ios), opacity 320ms var(--ease-out-ios)'
      : 'transform 420ms var(--ease-out-ios), opacity 420ms var(--ease-out-ios)';

  return (
    <div
      {...bindEdge}
      className="wash-temple"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 80,
        background: 'var(--cream, #FBF6E8)',
        color: 'var(--ink)',
        overflow: 'hidden',
        opacity,
        transform: composedTransform,
        transition: composedTransition,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* Edge swipe-back hint — discreet left hairline */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: 1,
          height: 80,
          transform: 'translateY(-50%)',
          background: 'var(--ink-faint, rgba(26, 26, 47, 0.18))',
          opacity: edgeDragging ? 0.5 : 0,
          transition: 'opacity 180ms var(--ease-out-ios)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />
      {/* Top bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '18px 22px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 3,
        }}
      >
        <div
          style={{
            fontFamily: '"Sora", system-ui, sans-serif',
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            color: 'var(--content-tertiary)',
          }}
        >
          MES SOUVENIRS
        </div>
        <button
          type="button"
          onClick={doClose}
          data-press
          aria-label="Fermer"
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '1px solid var(--hairline)',
            background: 'rgba(251, 246, 232, 0.6)',
            color: 'var(--ink)',
            fontSize: 14,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          ✕
        </button>
      </div>

      {/* Scrollable content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          paddingTop: 64,
          paddingBottom: 24,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          boxSizing: 'border-box',
        }}
      >
        {/* Hero */}
        <div
          style={{
            padding: '24px 24px 18px',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(26px, 7vw, 32px)',
              lineHeight: 1.2,
              color: 'var(--ink)',
              margin: '0 0 10px',
              letterSpacing: '-0.005em',
            }}
          >
            Ce qui reste.
          </h1>
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 13,
              lineHeight: 1.55,
              color: 'var(--ink-soft, var(--content-soft, var(--content-tertiary)))',
              margin: 0,
              maxWidth: 340,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Les traces de tes passages. Aucune note, aucune note de comparaison.
          </p>
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
                  padding: '7px 14px',
                  borderRadius: 999,
                  border: `1px solid ${active ? TERRACOTTA : 'var(--hairline)'}`,
                  background: 'var(--cream-light, rgba(255, 252, 245, 0.7))',
                  color: active ? TERRACOTTA : 'var(--ink)',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: 12,
                  fontWeight: active ? 600 : 500,
                  letterSpacing: '0.01em',
                  boxShadow: '0 1px 2px rgba(26, 26, 47, 0.03)',
                  transition: 'border-color 200ms var(--ease-out-ios), color 200ms var(--ease-out-ios)',
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
            <div
              style={{
                textAlign: 'center',
                padding: '32px 18px 24px',
              }}
            >
              <div
                style={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: 1.45,
                  color: 'var(--content-tertiary)',
                  marginBottom: 10,
                  maxWidth: 320,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                Tes premières traces apparaîtront bientôt.
              </div>
              <div
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: 12,
                  lineHeight: 1.55,
                  color: 'var(--content-tertiary)',
                  maxWidth: 300,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                Médite, écris, pose ta journée — chaque ritual laisse un souvenir ici.
              </div>
            </div>
          ) : (
            <div
              className="stagger"
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
                  <div
                    key={s.id}
                    style={{
                      background: 'var(--cream-light, rgba(255, 252, 245, 0.7))',
                      border: '1px solid var(--hairline)',
                      borderRadius: 'var(--radius-md, 16px)',
                      padding: '14px 16px',
                      boxShadow: 'var(--shadow-soft, 0 1px 2px rgba(26, 26, 47, 0.04))',
                    }}
                  >
                    {/* Top row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: '"Sora", system-ui, sans-serif',
                          fontSize: 9,
                          fontWeight: 500,
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          color: accent,
                        }}
                      >
                        {eyebrow}
                      </span>
                      <span
                        style={{
                          fontFamily: '"Sora", system-ui, sans-serif',
                          fontSize: 9,
                          fontWeight: 500,
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          color: 'var(--content-tertiary)',
                          textAlign: 'right',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {timeAgo(s.ts)}
                      </span>
                    </div>

                    {/* Title */}
                    <div
                      style={{
                        fontFamily: '"Fraunces", Georgia, serif',
                        fontStyle: 'italic',
                        fontWeight: 400,
                        fontSize: 17,
                        lineHeight: 1.35,
                        color: 'var(--ink)',
                        marginBottom: s.detail ? 6 : 0,
                      }}
                    >
                      {s.label}
                    </div>

                    {/* Optional detail */}
                    {s.detail && (
                      <div
                        style={{
                          fontFamily: 'Inter, system-ui, sans-serif',
                          fontSize: 12,
                          lineHeight: 1.5,
                          color: 'var(--ink-soft, var(--content-soft, var(--content-tertiary)))',
                        }}
                      >
                        {s.detail}
                      </div>
                    )}
                  </div>
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
              fontFamily: '"Fraunces", Georgia, serif',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 12,
              lineHeight: 1.55,
              color: 'var(--content-tertiary)',
              maxWidth: 300,
            }}
          >
            Ces souvenirs t'appartiennent. Tu peux tout effacer si tu veux.
          </div>
          <button
            type="button"
            data-press
            onClick={handleClearAll}
            disabled={!souvenirs.length}
            style={{
              appearance: 'none',
              border: 'none',
              background: 'transparent',
              padding: '6px 10px',
              cursor: souvenirs.length ? 'pointer' : 'default',
              WebkitTapHighlightColor: 'transparent',
              fontFamily: '"Sora", system-ui, sans-serif',
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: '0.222em',
              textTransform: 'uppercase',
              color: TERRACOTTA,
              opacity: souvenirs.length ? 0.7 : 0.3,
            }}
          >
            Tout effacer
          </button>
        </div>
      </div>
    </div>
  );
}
