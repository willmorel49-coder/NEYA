/* ============================================================
   NÉYA V2 — MilestoneToast (discrete presence acknowledgment)
   ============================================================
   Anti-toxic. No flame, no XP, no level, no progress bar.
   Just a short, soft moment that reconnaît la présence —
   conforme spec V2 : "des rappels discrets sont permis".
   ============================================================ */

import { useEffect, useState } from 'react';
import { haptic, checkMilestone } from '../state';

export default function MilestoneToast({ day, onClose }) {
  const milestone = checkMilestone(day);
  const [mounted, setMounted] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!milestone) return;
    // Fade-in
    const m = setTimeout(() => setMounted(true), 30);
    // Gentle triple haptic — pas une explosion festive
    haptic([4, 60, 4, 60, 4]);
    // Auto-dismiss après 6s si l'utilisateur ne fait rien
    const auto = setTimeout(() => dismiss(), 6000);
    return () => {
      clearTimeout(m);
      clearTimeout(auto);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!milestone) return null;

  function dismiss() {
    setLeaving(true);
    setTimeout(() => onClose?.(), 320);
  }

  function handleContinue() {
    haptic(4);
    dismiss();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Présence — ${milestone.label}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'rgba(255, 252, 245, 0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        opacity: leaving ? 0 : mounted ? 1 : 0,
        transition: leaving
          ? 'opacity 320ms var(--ease-narrative, cubic-bezier(0.22, 1, 0.36, 1))'
          : 'opacity 420ms var(--ease-narrative, cubic-bezier(0.22, 1, 0.36, 1))',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <style>{`
        @keyframes milestoneCardRise {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        [data-milestone-cta]:active {
          transform: scale(0.95);
        }
      `}</style>

      <div
        style={{
          width: '100%',
          maxWidth: 320,
          padding: '28px 24px',
          background: 'var(--cream-light, #FFFCF5)',
          borderRadius: 'var(--radius-lg, 18px)',
          boxShadow: 'var(--shadow-card, 0 4px 24px rgba(26, 26, 47, 0.08))',
          border: '1px solid var(--hairline, rgba(26, 26, 47, 0.08))',
          textAlign: 'center',
          animation: mounted && !leaving
            ? 'milestoneCardRise 520ms var(--ease-narrative, cubic-bezier(0.22, 1, 0.36, 1)) both'
            : 'none',
        }}
      >
        {/* Top mark — PRÉSENCE */}
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--content-tertiary, #7A7A8C)',
            marginBottom: 18,
          }}
        >
          Présence
        </div>

        {/* Fraunces italic label */}
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 'clamp(28px, 7vw, 36px)',
            fontWeight: 400,
            lineHeight: 1.08,
            letterSpacing: '-0.018em',
            color: 'var(--ink, #1A1A2F)',
            marginBottom: 16,
          }}
        >
          {milestone.label}
        </div>

        {/* Phrase douce */}
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            lineHeight: 1.55,
            color: 'var(--ink-soft, #4A4A5F)',
            marginBottom: 18,
          }}
        >
          {milestone.phrase}
        </div>

        {/* Compteur factuel + glyphe tilleul (rare, précieux) */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontFamily: 'var(--font-ui)',
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--ink, #1A1A2F)',
            marginBottom: 24,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: 'var(--tilleul, #D4E08C)',
              display: 'inline-block',
            }}
          />
          <span>{day} jours</span>
        </div>

        {/* CTA Continuer */}
        <button
          data-milestone-cta
          onClick={handleContinue}
          style={{
            display: 'inline-block',
            padding: '12px 28px',
            border: 'none',
            borderRadius: 999,
            background: 'var(--ink, #1A1A2F)',
            color: 'var(--cream-light, #FFFCF5)',
            fontFamily: 'var(--font-ui)',
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: '0.02em',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            transition: 'transform 140ms var(--ease-out, cubic-bezier(0.22, 1, 0.36, 1))',
            touchAction: 'manipulation',
          }}
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
