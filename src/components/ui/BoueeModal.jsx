/* ============================================================
   BoueeModal — Mini-flow "Une bouée concrète"
   ============================================================
   Affiche une bouée tirée du pool (filtré optionnellement par level),
   bouton Fait -> onDone({ type: 'bouee', boueeId, action })
   ============================================================ */

import { useMemo } from 'react';
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
  const bouee = useMemo(() => {
    if (!open) return null;
    const pool = levels && levels.length ? BOUEES.filter((b) => levels.includes(b.level)) : BOUEES;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [open, levels]);

  if (!open || !bouee) return null;

  const handleDone = () => {
    haptic([4, 30, 4]);
    onDone?.({ type: 'bouee', boueeId: bouee.id, action: bouee.action });
  };

  return (
    <Overlay backdrop="dark" onClose={onClose} ariaLabel="Une bouée">
      <div style={{
        minHeight: '100dvh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '40px 24px', textAlign: 'center', gap: 24,
      }}>
        <div style={{ fontSize: 60, opacity: 0.7 }}>{bouee.icon}</div>
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontSize: 26,
          lineHeight: 1.4,
          color: 'var(--ink)',
          maxWidth: 320,
        }}>
          « {bouee.action} »
        </p>
        <button
          onClick={handleDone}
          style={{
            marginTop: 24,
            minHeight: 56, minWidth: 200,
            padding: '14px 32px',
            background: 'var(--rose-700, #BE185D)',
            color: 'white',
            border: 'none',
            borderRadius: 14,
            fontFamily: 'inherit',
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          Fait ✓
        </button>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', opacity: 0.5, fontSize: 13, padding: 12, cursor: 'pointer' }}
        >
          Plus tard
        </button>
      </div>
    </Overlay>
  );
}
