/* ============================================================
   PoseEtoileModal — Flow 3 étapes pour poser son étoile du jour
   ============================================================
   Modes :
     - 'pose' (default) : flow 3 étapes (couleur → note → naissance)
     - 'view'           : lecture seule, va direct à StepBorn avec l'étoile du jour
   Étape 1 : choix couleur (5 pastilles)
   Étape 2 : mot libre optionnel
   Étape 3 : étoile naît (animation 2s) + citation
   ============================================================ */

import { useState, useEffect } from 'react';
import { addStar, getTodayStar } from '../../v2/helpers/stars';
import { haptic } from '../../v2/state';
import Overlay from './Overlay';
import CTA from './CTA';
import Textarea from './Textarea';
import { useToast } from './ToastProvider';

const COLORS = [
  { key: 'bleu',   label: 'Calme, présent',         hex: '#6F9DB5', emoji: '🔵' },
  { key: 'rose',   label: 'Doux, sensible',         hex: '#E8A0B8', emoji: '🌸' },
  { key: 'violet', label: 'Introspectif, lourd',    hex: '#AF80BA', emoji: '🟣' },
  { key: 'peche',  label: 'Fatigue, plat',          hex: '#D4A878', emoji: '🌅' },
  { key: 'orage',  label: 'Orage, crise',           hex: '#4A6070', emoji: '🌧' },
];

export default function PoseEtoileModal({ open, onClose, onPosed, mode = 'pose' }) {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [color, setColor] = useState(null);
  const [note, setNote] = useState('');
  const [bornStar, setBornStar] = useState(null);

  // Reset on open — en mode 'view', on bootstrap directement avec l'étoile du jour
  useEffect(() => {
    if (open) {
      if (mode === 'view') {
        const todayStar = getTodayStar();
        if (todayStar) {
          setBornStar(todayStar);
          setStep(3);
        } else {
          // Pas d'étoile aujourd'hui — fallback en mode pose (sécurité)
          setStep(1);
          setColor(null);
          setNote('');
          setBornStar(null);
        }
      } else {
        setStep(1);
        setColor(null);
        setNote('');
        setBornStar(null);
      }
    }
  }, [open, mode]);

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
    toast.show({
      message: note.trim() ? 'Étoile posée.' : 'Le silence aussi compte.',
      variant: 'success',
      duration: 3000,
    });
    // Auto-close après 4s (uniquement en mode pose)
    setTimeout(() => {
      onPosed?.(star);
      onClose?.();
    }, 4000);
  };

  return (
    <Overlay
      backdrop="dark"
      closeOnBackdrop={mode === 'view' || step !== 3}
      onClose={onClose}
      ariaLabel={mode === 'view' ? "Ton étoile d'aujourd'hui" : 'Pose ton étoile'}
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
          position: 'relative',
        }}
      >
        {mode === 'view' && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            style={{
              position: 'absolute',
              top: 'calc(env(safe-area-inset-top, 0px) + 14px)',
              right: 14,
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: 'rgba(251, 246, 232, 0.85)',
              fontSize: 20,
              fontWeight: 300,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            ×
          </button>
        )}
        {step === 1 && mode === 'pose' && (
          <StepColor onPick={handlePickColor} />
        )}
        {step === 2 && mode === 'pose' && (
          <StepNote
            color={color}
            note={note}
            setNote={setNote}
            onConfirm={handleConfirmNote}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && bornStar && (
          <StepBornSafe star={bornStar} mode={mode} />
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

/* Wrapper défensif : capture toute exception de render (B2) */
function StepBornSafe({ star, mode }) {
  try {
    return <StepBorn star={star} mode={mode} />;
  } catch (e) {
    return <StepBornFallback star={star} mode={mode} />;
  }
}

function StepBorn({ star, mode }) {
  // B2 — guards défensifs : star.citation peut être absent (données pré-V5, migration partielle)
  const citationText = star?.citation?.text || null;
  const citationAuthor = star?.citation?.author || null;
  const starColor = star?.color || 'rose';

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
          background: `var(--star-${starColor}, #E8A0B8)`,
          margin: '0 auto 24px',
          boxShadow: `0 0 40px var(--star-${starColor}, #E8A0B8), 0 0 80px var(--star-${starColor}, #E8A0B8)`,
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
        {mode === 'view' ? "Ton étoile d'aujourd'hui" : 'Posé.'}
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
        {citationText ? `« ${citationText} »` : '✦'}
      </p>
      {citationAuthor && (
        <p
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 12,
            fontWeight: 500,
            color: 'rgba(251, 246, 232, 0.55)',
            margin: 0,
          }}
        >
          — {citationAuthor}
        </p>
      )}
      {star?.note && (
        <p
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 15,
            color: 'rgba(251, 246, 232, 0.70)',
            margin: '18px auto 0',
            maxWidth: 340,
            lineHeight: 1.45,
          }}
        >
          « {star.note} »
        </p>
      )}
    </div>
  );
}

/* Fallback ultime — si même StepBorn lève (par exemple var CSS exotique) */
function StepBornFallback({ star, mode }) {
  return (
    <div style={{ textAlign: 'center', animation: 'modal-fade-in 360ms ease-out both' }}>
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: '#E8A0B8',
          margin: '0 auto 24px',
          boxShadow: '0 0 40px #E8A0B8',
        }}
      />
      <p
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 22,
          color: '#FBF6E8',
          margin: 0,
        }}
      >
        ✦
      </p>
      <p
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 12,
          color: 'rgba(251, 246, 232, 0.55)',
          marginTop: 14,
        }}
      >
        {mode === 'view' ? "Ton étoile est là." : 'Posé.'}
      </p>
    </div>
  );
}
