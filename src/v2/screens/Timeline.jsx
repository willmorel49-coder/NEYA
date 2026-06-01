/* ============================================================
   Timeline — Vue narrative des check-ins passés
   ============================================================
   Liste verticale, plus récent en haut.
   Cap 90 jours (cf. helpers/checkins.js getAllCheckins).
   Tap ligne -> overlay détail.
   ============================================================ */

import { useState, useMemo } from 'react';
import { getAllCheckins, MOOD_COLORS, MOOD_LABELS } from '../helpers/checkins';
import Overlay from '../../components/ui/Overlay';

const ACTION_LABELS = {
  'breath':         'respiration',
  'write':          'écriture',
  'bouee':          'bouée',
  'citation':       'citation gardée',
  'voice-legacy':   'voix (legacy)',
};

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

function formatActions(actions) {
  if (!actions || actions.length === 0) return 'juste passé·e';
  return actions.map((a) => ACTION_LABELS[a.type] || a.type).join(' + ');
}

export default function Timeline({ open, onClose }) {
  const [detail, setDetail] = useState(null);
  const checkins = useMemo(() => (open ? getAllCheckins() : []), [open]);

  if (!open) return null;

  return (
    <Overlay backdrop="default" onClose={onClose} ariaLabel="Ton mois">
      <div style={{
        minHeight: '100dvh',
        padding: '40px 20px 80px',
        WebkitOverflowScrolling: 'touch',
        overflowY: 'auto',
      }}>
        <button
          onClick={onClose}
          style={{
            minHeight: 44, minWidth: 44,
            background: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 22,
            marginBottom: 24,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
          aria-label="Fermer"
        >
          ←
        </button>

        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontSize: 32,
          lineHeight: 1.2,
          marginBottom: 4,
          color: 'var(--ink)',
        }}>
          Ton mois
        </h1>
        <p style={{ fontSize: 13, opacity: 0.55, marginBottom: 32 }}>
          {checkins.length} jour{checkins.length > 1 ? 's' : ''} où tu es revenu·e
        </p>

        {checkins.length === 0 ? (
          <p style={{ opacity: 0.5, fontStyle: 'italic', textAlign: 'center', marginTop: 60 }}>
            Pas encore d'historique. Commence par un check-in aujourd'hui.
          </p>
        ) : (
          checkins.map((c) => (
            <button
              key={c.id}
              onClick={() => setDetail(c)}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: '14px 8px',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                textAlign: 'left',
                fontFamily: 'inherit',
                cursor: 'pointer',
                minHeight: 56,
              }}
            >
              <div style={{
                width: 12, height: 12,
                borderRadius: '50%',
                background: MOOD_COLORS[c.mood] || '#aaa',
                marginTop: 6,
                flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, opacity: 0.5, letterSpacing: '0.05em' }}>{formatDate(c.date)}</div>
                <div style={{ fontSize: 14, color: 'var(--ink)', marginTop: 2 }}>
                  {MOOD_LABELS[c.mood] || c.mood} · {formatActions(c.actions)}
                </div>
                {c.citation?.text && (
                  <div style={{
                    fontSize: 11, opacity: 0.5, marginTop: 4,
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontStyle: 'italic',
                    maxWidth: 280,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    « {c.citation.text} »
                  </div>
                )}
              </div>
            </button>
          ))
        )}

        {checkins.length >= 90 && (
          <p style={{ opacity: 0.5, fontStyle: 'italic', textAlign: 'center', marginTop: 24, fontSize: 12 }}>
            Plus de 3 mois. Tu es revenu·e souvent.
          </p>
        )}
      </div>

      {detail && (
        <Overlay backdrop="dark" onClose={() => setDetail(null)} ariaLabel="Détail du jour">
          <div style={{ padding: 40, maxWidth: 480, margin: '60px auto' }}>
            <div style={{ fontSize: 11, opacity: 0.55, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {formatDate(detail.date)} · {detail.time}
            </div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 26,
              margin: '12px 0 24px',
              color: 'var(--ink)',
            }}>
              {MOOD_LABELS[detail.mood]}
            </h2>

            {detail.actions?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 10, opacity: 0.5, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Ce que tu as fait</div>
                {detail.actions.map((a, i) => (
                  <div key={i} style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>
                    ✓ {ACTION_LABELS[a.type] || a.type}
                    {a.text && <div style={{ fontSize: 13, opacity: 0.7, marginLeft: 18, marginTop: 4, fontStyle: 'italic' }}>« {a.text} »</div>}
                  </div>
                ))}
              </div>
            )}

            {detail.citation?.text && (
              <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontSize: 16, lineHeight: 1.5 }}>« {detail.citation.text} »</p>
                {detail.citation.author && <p style={{ fontSize: 11, opacity: 0.55, marginTop: 4 }}>— {detail.citation.author}</p>}
              </div>
            )}

            <button
              onClick={() => setDetail(null)}
              style={{
                marginTop: 32, minHeight: 44, padding: '10px 24px',
                background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Fermer
            </button>
          </div>
        </Overlay>
      )}
    </Overlay>
  );
}
