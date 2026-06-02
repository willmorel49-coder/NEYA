/* ============================================================
   BoueeModal — Mini-flow "Une bouée concrète"
   ============================================================
   Affiche une bouée tirée du pool (filtré optionnellement par level),
   bouton Fait -> onDone({ type: 'bouee', boueeId, action })
   ============================================================ */

import { useEffect, useMemo, useState } from 'react';
import Overlay from './Overlay';
import { haptic } from '../../v2/state';

const BOUEES = [
  { id: 'b01', action: 'Bois trois verres d\'eau, tranquillement.',                level: 'corps',  icon: '◯' },
  { id: 'b02', action: 'Ouvre la fenêtre cinq minutes. Respire.',                  level: 'corps',  icon: '◐' },
  { id: 'b03', action: 'Envoie un message court à une personne aimée.',            level: 'lien',   icon: '♡' },
  { id: 'b04', action: 'Marche dix minutes dehors, sans téléphone.',               level: 'corps',  icon: '↗' },
  { id: 'b05', action: 'Mange quelque chose de simple. Lentement.',                level: 'corps',  icon: '◓' },
  { id: 'b06', action: 'Écris trois lignes dans ton carnet.',                      level: 'esprit', icon: '✎' },
  { id: 'b07', action: 'Appelle quelqu\'un dont tu n\'as pas eu de nouvelles.',    level: 'lien',   icon: '☎' },
  { id: 'b08', action: 'Range un seul tiroir, un seul.',                           level: 'esprit', icon: '□' },
  { id: 'b09', action: 'Prends une douche tiède, lentement.',                      level: 'corps',  icon: '◇' },
  { id: 'b10', action: 'Écoute une chanson que tu n\'as plus écoutée depuis longtemps.', level: 'esprit', icon: '♪' },
  { id: 'b11', action: 'Sors prendre un café (ou un thé) hors de chez toi.',       level: 'monde',  icon: '☕' },
  { id: 'b12', action: 'Demande de l\'aide pour une petite chose aujourd\'hui.',   level: 'lien',   icon: '✦' },
  { id: 'b13', action: 'Touche une plante, sens-la.',                              level: 'corps',  icon: '❦' },
  { id: 'b14', action: 'Ne fais rien pendant cinq minutes. Vraiment rien.',        level: 'esprit', icon: '·' },
];

export default function BoueeModal({ open, onDone, onClose, levels }) {
  const [mounted, setMounted] = useState(false);

  const bouee = useMemo(() => {
    if (!open) return null;
    const pool = levels && levels.length ? BOUEES.filter((b) => levels.includes(b.level)) : BOUEES;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [open, levels]);

  useEffect(() => {
    if (!open) {
      setMounted(false);
      return;
    }
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  if (!open || !bouee) return null;

  const handleDone = () => {
    haptic([4, 30, 4]);
    onDone?.({ type: 'bouee', boueeId: bouee.id, action: bouee.action });
  };

  return (
    <Overlay backdrop="light" onClose={onClose} ariaLabel="Une bouée">
      <style>{`
        @keyframes boueePulse {
          0%, 100% { transform: scale(1); opacity: 0.92; }
          50%      { transform: scale(1.04); opacity: 1; }
        }
      `}</style>
      <div style={{
        minHeight: '100dvh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '40px 24px', textAlign: 'center', gap: 22,
      }}>
        {/* Eyebrow titre */}
        <div
          style={{
            fontFamily: "'Inter', -apple-system, sans-serif",
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--ink-soft, #4A6070)',
            opacity: mounted ? 0.75 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(-4px)',
            transition: 'opacity 480ms cubic-bezier(0.22, 0.61, 0.36, 1) 80ms, transform 480ms cubic-bezier(0.22, 0.61, 0.36, 1) 80ms',
          }}
        >
          Une chose, juste.
        </div>

        {/* Icon dans un cercle pearl glass */}
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(253, 232, 240, 0.55)',
            border: '1px solid rgba(200, 112, 144, 0.22)',
            boxShadow: '0 6px 24px rgba(200, 112, 144, 0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'scale(1)' : 'scale(0.92)',
            transition: 'opacity 560ms cubic-bezier(0.22, 0.61, 0.36, 1) 180ms, transform 560ms cubic-bezier(0.22, 0.61, 0.36, 1) 180ms',
          }}
        >
          <span
            style={{
              fontSize: 42,
              lineHeight: 1,
              color: 'var(--rose-700, #C87090)',
              animation: mounted ? 'boueePulse 3.6s ease-in-out infinite' : 'none',
              animationDelay: '600ms',
            }}
          >
            {bouee.icon}
          </span>
        </div>

        {/* Action — au premier plan typographique */}
        <p
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 26,
            lineHeight: 1.4,
            color: 'var(--ink, #0A2438)',
            maxWidth: 320,
            margin: 0,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 620ms cubic-bezier(0.22, 0.61, 0.36, 1) 320ms, transform 620ms cubic-bezier(0.22, 0.61, 0.36, 1) 320ms',
          }}
        >
          {bouee.action}
        </p>

        <button
          onClick={handleDone}
          style={{
            marginTop: 16,
            minHeight: 56, minWidth: 220,
            padding: '14px 32px',
            background: 'var(--rose-700, #C87090)',
            color: 'white',
            border: 'none',
            borderRadius: 14,
            fontFamily: 'inherit',
            fontSize: 15,
            letterSpacing: '0.01em',
            cursor: 'pointer',
            boxShadow: '0 8px 22px rgba(200, 112, 144, 0.28)',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 520ms cubic-bezier(0.22, 0.61, 0.36, 1) 460ms, transform 520ms cubic-bezier(0.22, 0.61, 0.36, 1) 460ms',
          }}
        >
          Je le fais.
        </button>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--ink-soft, #4A6070)',
            opacity: mounted ? 0.6 : 0,
            fontSize: 13,
            padding: 12,
            minHeight: 44,
            cursor: 'pointer',
            transition: 'opacity 520ms cubic-bezier(0.22, 0.61, 0.36, 1) 560ms',
          }}
        >
          Plus tard
        </button>
      </div>
    </Overlay>
  );
}
