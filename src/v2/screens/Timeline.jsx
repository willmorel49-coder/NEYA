/* ============================================================
   Timeline — Vue narrative des check-ins passés
   ============================================================
   Liste verticale, plus récent en haut.
   Cap 90 jours (cf. helpers/checkins.js getAllCheckins).
   Tap ligne -> overlay détail.
   ============================================================ */

import { useState, useMemo, useEffect } from 'react';
import { getAllCheckins, MOOD_COLORS, MOOD_LABELS } from '../helpers/checkins';
import Overlay from '../../components/ui/Overlay';

const ACTION_LABELS = {
  'breath':         'respiration',
  'write':          'écriture',
  'bouee':          'bouée',
  'citation':       'citation gardée',
  'voice-legacy':   'voix (legacy)',
};

const ACTION_VERBS = {
  'breath':         'tu as respiré',
  'write':          'tu as écrit',
  'bouee':          'tu as pris une bouée',
  'citation':       'tu as gardé une citation',
  'voice-legacy':   'tu as laissé ta voix',
};

const MOOD_PHRASE = {
  'ca-va':            'Tu allais bien',
  'ca-va-pas-trop':   'Tu allais pas trop',
  'pas-terrible':     'Ça n\'allait pas',
};

function formatDateShort(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' });
}

function formatDateLong(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatActions(actions) {
  if (!actions || actions.length === 0) return 'juste passé·e';
  return actions.map((a) => ACTION_LABELS[a.type] || a.type).join(' + ');
}

function formatLine(c) {
  const moodPhrase = MOOD_PHRASE[c.mood] || MOOD_LABELS[c.mood] || c.mood;
  if (!c.actions || c.actions.length === 0) {
    return `${moodPhrase} · tu es juste passé·e`;
  }
  const verbs = c.actions.map((a) => ACTION_VERBS[a.type] || ACTION_LABELS[a.type] || a.type);
  return `${moodPhrase} · ${verbs.join(', ')}`;
}

export default function Timeline({ open, onClose }) {
  const [detail, setDetail] = useState(null);
  const [detailMounted, setDetailMounted] = useState(false);
  const checkins = useMemo(() => (open ? getAllCheckins() : []), [open]);

  // Animation entrée détail (fade + scale)
  useEffect(() => {
    if (!detail) {
      setDetailMounted(false);
      return;
    }
    const id = requestAnimationFrame(() => setDetailMounted(true));
    return () => cancelAnimationFrame(id);
  }, [detail]);

  if (!open) return null;

  return (
    <Overlay backdrop="default" onClose={onClose} ariaLabel="Ton chemin">
      <div style={{
        minHeight: '100dvh',
        padding: '40px 20px 96px',
        WebkitOverflowScrolling: 'touch',
        overflowY: 'auto',
        maxWidth: 560,
        margin: '0 auto',
      }}>
        <button
          onClick={onClose}
          style={{
            minHeight: 44, minWidth: 44,
            background: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 22,
            marginBottom: 28,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 18,
            color: 'var(--ink)',
          }}
          aria-label="Fermer"
        >
          ←
        </button>

        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontSize: 34,
          lineHeight: 1.15,
          marginBottom: 6,
          color: 'var(--ink)',
          fontWeight: 500,
        }}>
          Ton chemin
        </h1>
        <p style={{ fontSize: 13, opacity: 0.55, marginBottom: 36, letterSpacing: '0.01em' }}>
          {checkins.length === 0
            ? 'Bientôt, tes jours seront ici.'
            : `${checkins.length} jour${checkins.length > 1 ? 's' : ''} derrière toi.`}
        </p>

        {checkins.length === 0 ? (
          <div style={{
            marginTop: 80,
            textAlign: 'center',
            padding: '0 24px',
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: 'rgba(0,0,0,0.12)',
              margin: '0 auto 20px',
            }} />
            <p style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 20,
              lineHeight: 1.5,
              opacity: 0.75,
              color: 'var(--ink)',
              margin: 0,
            }}>
              Rien encore.
              <br />
              Reviens demain — un jour de plus dans le fil.
            </p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {checkins.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setDetail(c)}
                  className="timeline-row"
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'flex-start', gap: 16,
                    padding: '20px 10px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    minHeight: 56,
                    color: 'var(--ink)',
                    borderRadius: 8,
                    transition: 'background 180ms ease',
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      width: 12, height: 12,
                      borderRadius: '50%',
                      background: MOOD_COLORS[c.mood] || '#aaa',
                      boxShadow: `0 0 0 4px ${MOOD_COLORS[c.mood] || '#aaa'}1a`,
                      marginTop: 8,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 11,
                      opacity: 0.55,
                      letterSpacing: '0.08em',
                      textTransform: 'lowercase',
                    }}>
                      {formatDateShort(c.date)}
                    </div>
                    <div style={{
                      fontSize: 14,
                      color: 'var(--ink)',
                      marginTop: 4,
                      lineHeight: 1.45,
                    }}>
                      {formatLine(c)}
                    </div>
                    {c.citation?.text && (
                      <div style={{
                        fontSize: 12,
                        opacity: 0.55,
                        marginTop: 8,
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontStyle: 'italic',
                        lineHeight: 1.45,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        « {c.citation.text} »
                      </div>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {checkins.length >= 90 && (
          <p style={{
            opacity: 0.55,
            fontStyle: 'italic',
            textAlign: 'center',
            marginTop: 32,
            fontSize: 13,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            letterSpacing: '0.01em',
          }}>
            Plus de trois mois ici.
            <br />
            Tu reviens, et c'est tout ce qui compte.
          </p>
        )}
      </div>

      {detail && (
        <Overlay backdrop="dark" onClose={() => setDetail(null)} ariaLabel="Détail du jour">
          <div
            style={{
              padding: '48px 28px',
              maxWidth: 480,
              margin: '60px auto',
              opacity: detailMounted ? 1 : 0,
              transform: detailMounted ? 'scale(1) translateY(0)' : 'scale(0.98) translateY(8px)',
              transition: 'opacity 280ms ease, transform 280ms ease',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              fontSize: 11,
              opacity: 0.6,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              <span
                aria-hidden="true"
                style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: MOOD_COLORS[detail.mood] || '#aaa',
                  boxShadow: `0 0 0 3px ${MOOD_COLORS[detail.mood] || '#aaa'}26`,
                  display: 'inline-block',
                }}
              />
              <span>{formatDateLong(detail.date)}{detail.time ? ` · ${detail.time}` : ''}</span>
            </div>

            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 30,
              lineHeight: 1.2,
              margin: '16px 0 28px',
              color: 'var(--ink)',
              fontWeight: 500,
            }}>
              {MOOD_LABELS[detail.mood]}
            </h2>

            {detail.actions?.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{
                  fontSize: 10,
                  opacity: 0.55,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}>
                  Ce que tu as fait
                </div>
                {detail.actions.map((a, i) => (
                  <div key={i} style={{ fontSize: 14, opacity: 0.9, marginTop: 8, lineHeight: 1.5 }}>
                    <span style={{ color: MOOD_COLORS[detail.mood] || 'var(--ink)', marginRight: 8 }}>✓</span>
                    {ACTION_LABELS[a.type] || a.type}
                    {a.text && (
                      <div style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontStyle: 'italic',
                        fontSize: 14,
                        opacity: 0.75,
                        marginLeft: 22,
                        marginTop: 6,
                        lineHeight: 1.55,
                        color: MOOD_COLORS[detail.mood] || 'var(--ink)',
                      }}>
                        « {a.text} »
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {detail.citation?.text && (
              <div style={{ paddingTop: 20, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <p style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: 'italic',
                  fontSize: 17,
                  lineHeight: 1.55,
                  margin: 0,
                  color: 'var(--ink)',
                }}>
                  « {detail.citation.text} »
                </p>
                {detail.citation.author && (
                  <p style={{ fontSize: 11, opacity: 0.6, marginTop: 8, letterSpacing: '0.04em' }}>
                    — {detail.citation.author}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={() => setDetail(null)}
              style={{
                marginTop: 36,
                minHeight: 48, minWidth: 120,
                padding: '12px 28px',
                background: 'rgba(255,255,255,0.55)',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 14,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 14,
                color: 'var(--ink)',
                letterSpacing: '0.02em',
              }}
              aria-label="Fermer le détail"
            >
              Fermer
            </button>
          </div>
        </Overlay>
      )}

      <style>{`
        .timeline-row:active {
          background: rgba(0,0,0,0.04) !important;
        }
        @media (hover: hover) {
          .timeline-row:hover {
            background: rgba(0,0,0,0.025) !important;
          }
        }
      `}</style>
    </Overlay>
  );
}
