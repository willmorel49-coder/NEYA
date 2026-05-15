/* ============================================================
   NÉYA V2 — Crise (4-screen safety flow, LIGHT mode contemplatif)
   ============================================================
   Phases :
     1. Reconnaissance — Daim glyph + hero italic + "Respirer maintenant"
     2. Respiration   — BreathingCircle 220, 60s session
     3. Choix         — 3 cards (3115 · Écrire · Continuer respirer)
     4. Sortie douce  — Adieu daim + "Retour à NÉYA"
     'journal'        — Textarea protégé pour décharger

   Anti-toxique : pas de timer pressure phase 1, pas de streak, pas de
   comparaison. Crisis data → minimum analytics (entry/exit timestamps).
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { recordCrisisEntry, recordCrisisExit, ls, haptic } from '../state';
import BreathingCircle from '../../components/BreathingCircle';
import Button from '../../components/Button';

const todayKey = () => new Date().toISOString().split('T')[0];

export default function Crise({ onClose }) {
  const [phase, setPhase] = useState(1);
  const [journalText, setJournalText] = useState('');
  const exitedRef = useRef(false);

  // Mount/unmount safety timestamps
  useEffect(() => {
    recordCrisisEntry();
    return () => {
      if (!exitedRef.current) {
        recordCrisisExit();
      }
    };
  }, []);

  // Body scroll lock pendant ouverture (anti-fond bougeant)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleClose = () => {
    if (!exitedRef.current) {
      recordCrisisExit();
      exitedRef.current = true;
    }
    onClose?.();
  };

  const goPhase = (p) => {
    haptic(4);
    setPhase(p);
  };

  const callPhoneLine = () => {
    haptic(6);
    try {
      // 3114 = numéro national prévention du suicide (FR, gratuit 24/7)
      window.location.href = 'tel:3114';
    } catch {}
  };

  const saveJournal = () => {
    if (journalText.trim()) {
      try {
        ls.set(`crisis_journal_${todayKey()}`, journalText.trim());
      } catch {}
    }
    haptic(4);
    setJournalText('');
    setPhase(3);
  };

  return (
    <div
      className="wash-lac"
      role="dialog"
      aria-modal="true"
      aria-label="Espace de crise"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        overflow: 'hidden',
        color: 'var(--ink)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Discreet escape — always visible top-right (safe-area), except phase 4 already a CTA */}
      {phase !== 4 && phase !== 1 && (
        <button
          type="button"
          onClick={handleClose}
          aria-label="Fermer l'espace de crise"
          style={{
            position: 'absolute',
            top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
            right: 14,
            zIndex: 5,
            appearance: 'none',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            padding: '12px 14px',
            minWidth: 44,
            minHeight: 44,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-ui)',
            fontWeight: 500,
            fontSize: 11,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            color: 'var(--ink-whisper)',
            opacity: 0.65,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          Fermer
        </button>
      )}

      {/* ============================================================
         PHASE 1 — Reconnaissance
         ============================================================ */}
      {phase === 1 && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '64px 28px 40px',
            textAlign: 'center',
          }}
        >
          {/* Daim glyph in lavender halo */}
          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 28,
            }}
          >
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  'radial-gradient(circle, rgba(195, 190, 239, 0.45) 0%, rgba(195, 190, 239, 0.18) 50%, transparent 80%)',
                border: '0.5px solid rgba(195, 190, 239, 0.55)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 64,
                  color: 'var(--lavender-warm)',
                  lineHeight: 1,
                  fontStyle: 'italic',
                }}
              >
                ✦
              </span>
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--type-hero)',
                fontStyle: 'italic',
                fontWeight: 300,
                lineHeight: 1.2,
                margin: 0,
                color: 'var(--ink)',
                maxWidth: 320,
              }}
              dangerouslySetInnerHTML={{
                __html: "« Tu n'es pas <em class='neya-key'>seul·e.</em> »",
              }}
            />

            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 'var(--type-body)',
                color: 'var(--ink-soft)',
                margin: 0,
                lineHeight: 1.5,
                maxWidth: 280,
              }}
            >
              Respire avec moi. Une minute.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              marginTop: 'auto',
              paddingTop: 48,
            }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => goPhase(2)}
              worldAccent="var(--lavender-lit)"
              style={{ minWidth: 220 }}
            >
              Respirer maintenant
            </Button>
            <button
              type="button"
              onClick={handleClose}
              style={{
                appearance: 'none',
                border: 'none',
                background: 'transparent',
                color: 'var(--ink-whisper)',
                fontFamily: 'var(--font-ui)',
                fontSize: 'var(--type-body-sm)',
                cursor: 'pointer',
                padding: '14px 20px',
                minHeight: 48,
                letterSpacing: 0,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              Plus tard
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
         PHASE 2 — Respiration (60s session)
         ============================================================ */}
      {phase === 2 && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 28px 40px',
            textAlign: 'center',
            gap: 48,
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--type-h2)',
              fontStyle: 'italic',
              fontWeight: 300,
              lineHeight: 1.25,
              margin: 0,
              color: 'var(--ink)',
              position: 'absolute',
              top: 96,
              left: 0,
              right: 0,
            }}
          >
            Tu es là. Une minute.
          </h2>

          <BreathingCircle
            size={220}
            durationMs={60000}
            onComplete={() => goPhase(3)}
          />
        </div>
      )}

      {/* ============================================================
         PHASE 3 — Choix (3 glass pearl cards)
         ============================================================ */}
      {phase === 3 && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '72px 24px 40px',
            gap: 28,
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--type-h2)',
              fontStyle: 'italic',
              fontWeight: 300,
              lineHeight: 1.25,
              margin: 0,
              color: 'var(--ink)',
              textAlign: 'center',
            }}
          >
            Et maintenant ?
          </h2>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              marginTop: 8,
            }}
          >
            <ChoiceCard
              title="Parler à quelqu'un maintenant"
              subtitle="3114 · 24h/24, gratuit, confidentiel"
              onClick={callPhoneLine}
              accent="var(--terracotta)"
            />
            <ChoiceCard
              title="Écrire ce que je ressens"
              subtitle="Carnet protégé, jamais partagé"
              onClick={() => goPhase('journal')}
              accent="var(--lavender-warm)"
            />
            <ChoiceCard
              title="Continuer de respirer"
              subtitle="Une minute de plus"
              onClick={() => goPhase(2)}
              accent="var(--lavender-lit)"
            />
          </div>

          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              justifyContent: 'center',
              paddingTop: 24,
            }}
          >
            <Button
              variant="ghost"
              size="md"
              onClick={() => goPhase(4)}
            >
              Continuer →
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================
         PHASE 'journal' — Textarea protégé
         ============================================================ */}
      {phase === 'journal' && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '72px 24px 32px',
            gap: 18,
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--type-h2)',
              fontStyle: 'italic',
              fontWeight: 300,
              lineHeight: 1.25,
              margin: 0,
              color: 'var(--ink)',
              textAlign: 'center',
            }}
          >
            Pose ce qui pèse.
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--type-body-sm)',
              color: 'var(--ink-whisper)',
              margin: 0,
              textAlign: 'center',
            }}
          >
            Personne ne le lira. C'est pour toi.
          </p>

          <textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="Tout ce que tu veux..."
            autoFocus
            style={{
              flex: 1,
              minHeight: 180,
              resize: 'none',
              padding: 18,
              border: '0.5px solid rgba(26, 26, 47, 0.12)',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(255, 252, 245, 0.85)',
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--type-body)',
              color: 'var(--ink)',
              lineHeight: 1.6,
              outline: 'none',
              boxShadow: 'var(--shadow-soft)',
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 12,
              paddingTop: 8,
            }}
          >
            <Button variant="ghost" size="md" onClick={() => setPhase(3)}>
              Retour
            </Button>
            <Button variant="primary" size="md" onClick={saveJournal}>
              Garder
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================
         PHASE 4 — Sortie douce
         ============================================================ */}
      {phase === 4 && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '64px 28px 40px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 28,
            }}
          >
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  'radial-gradient(circle, rgba(195, 190, 239, 0.40) 0%, rgba(195, 190, 239, 0.15) 50%, transparent 80%)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 44,
                  color: 'var(--lavender-warm)',
                  lineHeight: 1,
                  fontStyle: 'italic',
                }}
              >
                ✦
              </span>
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--type-h2)',
                fontStyle: 'italic',
                fontWeight: 300,
                lineHeight: 1.3,
                margin: 0,
                color: 'var(--ink)',
                maxWidth: 320,
              }}
              dangerouslySetInnerHTML={{
                __html:
                  "« Tu peux revenir quand tu veux. <em class='neya-key'>Le daim veille.</em> »",
              }}
            />
          </div>

          <div
            style={{
              marginTop: 'auto',
              paddingTop: 48,
            }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={handleClose}
              worldAccent="var(--lavender-lit)"
              style={{ minWidth: 220 }}
            >
              Retour à NÉYA
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ChoiceCard — glass pearl card (phase 3)
   ============================================================ */
function ChoiceCard({ title, subtitle, onClick, accent }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        appearance: 'none',
        textAlign: 'left',
        background: 'rgba(255, 252, 245, 0.78)',
        border: '0.5px solid rgba(26, 26, 47, 0.08)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 20px',
        minHeight: 64,
        boxShadow: 'var(--shadow-soft)',
        cursor: 'pointer',
        transition: 'transform 200ms var(--ease-out), box-shadow 200ms var(--ease-out)',
        WebkitTapHighlightColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 4,
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'scale(0.985)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 14,
          fontWeight: 500,
          color: 'var(--ink)',
          lineHeight: 1.3,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: accent,
            marginRight: 10,
            verticalAlign: 'middle',
          }}
        />
        {title}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 12,
          color: 'var(--ink-whisper)',
          lineHeight: 1.4,
          paddingLeft: 16,
        }}
      >
        {subtitle}
      </div>
    </button>
  );
}
