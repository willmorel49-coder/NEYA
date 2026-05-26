/* ============================================================
   PoseEtoileModal — Flow 3 étapes pour poser son étoile du jour
   ============================================================
   Étape 1 : choix couleur (5 pastilles)
   Étape 2 : mot libre optionnel
   Étape 3 : étoile naît (animation 2s) + citation
   ============================================================ */

import { useState, useEffect } from 'react';
import { addStar } from '../../v2/helpers/stars';
import { haptic } from '../../v2/state';
import Overlay from './Overlay';
import CTA from './CTA';
import Textarea from './Textarea';

const COLORS = [
  { key: 'bleu',   label: 'Calme, présent',         hex: '#6F9DB5', emoji: '🔵' },
  { key: 'rose',   label: 'Doux, sensible',         hex: '#E8A0B8', emoji: '🌸' },
  { key: 'violet', label: 'Introspectif, lourd',    hex: '#AF80BA', emoji: '🟣' },
  { key: 'peche',  label: 'Fatigue, plat',          hex: '#D4A878', emoji: '🌅' },
  { key: 'orage',  label: 'Orage, crise',           hex: '#4A6070', emoji: '🌧' },
];

export default function PoseEtoileModal({ open, onClose, onPosed }) {
  const [step, setStep] = useState(1);
  const [color, setColor] = useState(null);
  const [note, setNote] = useState('');
  const [bornStar, setBornStar] = useState(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep(1);
      setColor(null);
      setNote('');
      setBornStar(null);
    }
  }, [open]);

  if (!open) return null;

  const handlePickColor = (c) => {
    haptic([4, 30, 4]);
    setColor(c);
    setStep(2);
  };

  const handleConfirmNote = () => {
    haptic(6);
    const star = addStar({ color, note });
    setBornStar(star);
    setStep(3);
    // Auto-close après 4s
    setTimeout(() => {
      onPosed?.(star);
      onClose?.();
    }, 4000);
  };

  return (
    <Overlay
      backdrop="dark"
      closeOnBackdrop={step !== 3}
      onClose={onClose}
      ariaLabel="Pose ton étoile"
      style={{ background: 'rgba(5, 8, 16, 0.92)', backdropFilter: 'blur(30px)' }}
    >
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: '40px 24px',
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          color: '#FBF6E8',
        }}
      >
        {step === 1 && (
          <StepColor onPick={handlePickColor} />
        )}
        {step === 2 && (
          <StepNote
            color={color}
            note={note}
            setNote={setNote}
            onConfirm={handleConfirmNote}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && bornStar && (
          <StepBorn star={bornStar} />
        )}
      </div>
    </Overlay>
  );
}

function StepColor({ onPick }) {
  return (
    <div style={{ textAlign: 'center', animation: 'modal-fade-in 360ms ease-out both' }}>
      <p
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'rgba(232, 160, 184, 0.85)',
          margin: '0 0 14px',
        }}
      >
        Étape 1 sur 3
      </p>
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 32,
          lineHeight: 1.15,
          color: '#FBF6E8',
          margin: '0 0 36px',
        }}
      >
        Et toi, ça va vraiment&nbsp;?
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {COLORS.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => onPick(c.key)}
            style={{
              appearance: 'none',
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 22,
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              cursor: 'pointer',
              transition: 'transform 240ms cubic-bezier(0.22,0.61,0.36,1), border-color 240ms ease',
              fontFamily: 'inherit',
              color: '#FBF6E8',
              textAlign: 'left',
              WebkitTapHighlightColor: 'transparent',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.hex; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = ''; }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: c.hex,
                boxShadow: `0 0 16px ${c.hex}`,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontStyle: 'italic',
                fontSize: 17,
                color: 'rgba(251, 246, 232, 0.92)',
              }}
            >
              {c.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepNote({ color, note, setNote, onConfirm, onBack }) {
  return (
    <div style={{ animation: 'modal-fade-in 360ms ease-out both' }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          appearance: 'none',
          background: 'transparent',
          border: 'none',
          color: 'rgba(251, 246, 232, 0.6)',
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          padding: '8px 0',
          marginBottom: 18,
        }}
      >
        ‹ Retour
      </button>
      <p
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'rgba(232, 160, 184, 0.85)',
          margin: '0 0 14px',
        }}
      >
        Étape 2 sur 3
      </p>
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 26,
          lineHeight: 1.2,
          color: '#FBF6E8',
          margin: '0 0 8px',
        }}
      >
        Si tu veux, dis-le.
      </h2>
      <p
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 14,
          color: 'rgba(251, 246, 232, 0.65)',
          margin: '0 0 22px',
        }}
      >
        Un mot, une phrase, ou rien. Comme tu veux.
      </p>

      <div style={{ marginBottom: 24 }}>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="un mot, une phrase, ou rien."
          rows={5}
          maxLength={280}
          accent={color === 'rose' ? 'rose' : color === 'violet' ? 'violet' : 'blue'}
          showCounter={false}
          textareaStyle={{
            background: 'rgba(255, 255, 255, 0.06)',
            color: '#FBF6E8',
          }}
        />
      </div>

      <CTA variant={note.trim() ? 'rose' : 'outline'} size="lg" full onClick={onConfirm}>
        {note.trim() ? 'Déposer mon étoile' : 'Le silence aussi compte'}
      </CTA>
    </div>
  );
}

function StepBorn({ star }) {
  return (
    <div
      style={{
        textAlign: 'center',
        animation: 'modal-fade-in 360ms ease-out both',
      }}
    >
      {/* L'étoile qui naît */}
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: `var(--star-${star.color}, #E8A0B8)`,
          margin: '0 auto 24px',
          boxShadow: `0 0 40px var(--star-${star.color}, #E8A0B8), 0 0 80px var(--star-${star.color}, #E8A0B8)`,
          animation: 'star-born 2s cubic-bezier(0.22,0.61,0.36,1) both',
        }}
      />
      <p
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'rgba(232, 160, 184, 0.85)',
          margin: '0 0 14px',
        }}
      >
        Posé.
      </p>
      <p
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 22,
          lineHeight: 1.35,
          color: '#FBF6E8',
          maxWidth: 380,
          margin: '0 auto 14px',
        }}
      >
        « {star.citation.text} »
      </p>
      {star.citation.author && (
        <p
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 12,
            fontWeight: 500,
            color: 'rgba(251, 246, 232, 0.55)',
            margin: 0,
          }}
        >
          — {star.citation.author}
        </p>
      )}
    </div>
  );
}
