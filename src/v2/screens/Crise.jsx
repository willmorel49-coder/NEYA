/* ============================================================
   Crise — Overlay safety (V6 simplifié)
   ============================================================
   Plein écran : titre rassurant + bloc ressources (3114 / 15) +
   bouton sortir. Tracking via recordCrisisEntry / recordCrisisExit.
   ============================================================ */

import { useEffect } from 'react';
import Overlay from '../../components/ui/Overlay';
import { recordCrisisEntry, recordCrisisExit, haptic } from '../state';

export default function Crise({ open, onClose }) {
  useEffect(() => {
    if (open) {
      recordCrisisEntry();
      haptic([4, 60, 4]);
    }
  }, [open]);

  const handleClose = () => {
    recordCrisisExit();
    onClose?.();
  };

  if (!open) return null;

  return (
    <Overlay
      backdrop="dark"
      onClose={handleClose}
      ariaLabel="Tu n'es pas seul·e"
      style={{ background: 'rgba(15, 20, 30, 0.96)', backdropFilter: 'blur(20px)' }}
    >
      <div style={{
        minHeight: '100dvh',
        padding: '40px 24px 60px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        color: '#fffafa',
      }}>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontSize: 30,
          textAlign: 'center',
          margin: '20px 0 32px',
        }}>
          Tu n'es pas seul·e.
        </h1>

        <p style={{ fontSize: 14, opacity: 0.75, textAlign: 'center', maxWidth: 320, lineHeight: 1.6, marginBottom: 32 }}>
          Respire doucement.<br/>
          Si tu veux parler, quelqu'un t'écoute.
        </p>

        <div style={{
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 16,
          padding: 24,
          maxWidth: 360,
          width: '100%',
          marginBottom: 24,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 12 }}>
            Si tu veux parler
          </div>
          <a href="tel:3114" style={{
            display: 'block',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 32,
            color: '#f7d2dd',
            textDecoration: 'none',
            marginBottom: 4,
          }}>
            3114
          </a>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Suicide écoute · gratuit · 24h/24</div>

          <div style={{ margin: '20px 0', height: 1, background: 'rgba(255,255,255,0.1)' }} />

          <a href="tel:15" style={{
            display: 'block',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 28,
            color: '#f7d2dd',
            textDecoration: 'none',
            marginBottom: 4,
          }}>
            15
          </a>
          <div style={{ fontSize: 12, opacity: 0.7 }}>SAMU · urgence vitale</div>
        </div>

        <p style={{ fontSize: 12, opacity: 0.55, textAlign: 'center', maxWidth: 320, lineHeight: 1.5, marginBottom: 32 }}>
          Si tu es en danger immédiat, appelle.
          <br/>Si tu veux juste parler, le 3114 t'écoute, sans jugement.
        </p>

        <button
          onClick={handleClose}
          style={{
            marginTop: 'auto',
            minHeight: 44, padding: '10px 24px',
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.7)',
            border: 'none', borderRadius: 12,
            fontSize: 13, fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          Sortir
        </button>
      </div>
    </Overlay>
  );
}
