/* ============================================================
   Crise — Overlay safety (V6 simplifié + polish V6.1)
   ============================================================
   Plein écran : titre rassurant + invitation à rester +
   bloc ressources (3114 / 15) + disclaimer humain +
   bouton « Je reste là ». Tracking via recordCrisisEntry /
   recordCrisisExit. Pas de tap-backdrop close (anti-fermeture
   accidentelle en mode panique). Pas d'auto-close.
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
      closeOnBackdrop={false}
      style={{ background: 'rgba(15, 20, 30, 0.96)', backdropFilter: 'blur(20px)' }}
    >
      <div style={{
        minHeight: '100dvh',
        padding: '48px 24px calc(40px + env(safe-area-inset-bottom, 0))',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        color: '#fffafa',
      }}>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 32,
          textAlign: 'center',
          margin: '20px 0 24px',
          lineHeight: 1.2,
        }}>
          Tu n'es pas seul·e.
        </h1>

        <p style={{
          fontSize: 14,
          opacity: 0.78,
          textAlign: 'center',
          maxWidth: 320,
          lineHeight: 1.7,
          marginBottom: 12,
        }}>
          Respire, doucement.<br/>
          Tu peux juste rester ici un moment.
        </p>

        <p style={{
          fontSize: 12,
          opacity: 0.55,
          textAlign: 'center',
          maxWidth: 300,
          lineHeight: 1.6,
          marginBottom: 32,
          fontStyle: 'italic',
          fontFamily: "'Cormorant Garamond', Georgia, serif",
        }}>
          Pas obligé d'appeler.
        </p>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 18,
          padding: '24px 20px',
          maxWidth: 360,
          width: '100%',
          marginBottom: 24,
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 10,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            opacity: 0.55,
            marginBottom: 14,
          }}>
            Si tu veux qu'on t'écoute
          </div>
          <a
            href="tel:3114"
            aria-label="Appeler le 3114, suicide écoute, gratuit 24 heures sur 24"
            style={{
              display: 'block',
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 36,
              color: '#f7d2dd',
              textDecoration: 'none',
              marginBottom: 6,
              minHeight: 44,
              lineHeight: 1.2,
            }}
          >
            3114
          </a>
          <div style={{ fontSize: 12, opacity: 0.7, letterSpacing: '0.01em' }}>
            Suicide écoute · gratuit · 24h/24
          </div>

          <div style={{ margin: '22px auto', height: 1, width: '60%', background: 'rgba(255,255,255,0.08)' }} />

          <a
            href="tel:15"
            aria-label="Appeler le 15, SAMU, urgence vitale"
            style={{
              display: 'block',
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 30,
              color: '#f7d2dd',
              textDecoration: 'none',
              marginBottom: 6,
              minHeight: 44,
              lineHeight: 1.2,
            }}
          >
            15
          </a>
          <div style={{ fontSize: 12, opacity: 0.7, letterSpacing: '0.01em' }}>
            SAMU · urgence vitale
          </div>
        </div>

        <p style={{
          fontSize: 12,
          opacity: 0.58,
          textAlign: 'center',
          maxWidth: 320,
          lineHeight: 1.6,
          marginBottom: 32,
        }}>
          Si c'est tout de suite, appelle.<br/>
          Sinon le 3114 t'écoute, sans jugement.
        </p>

        <button
          onClick={handleClose}
          style={{
            marginTop: 'auto',
            minHeight: 44,
            minWidth: 140,
            padding: '12px 28px',
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,250,250,0.78)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14,
            fontSize: 13,
            fontFamily: 'inherit',
            letterSpacing: '0.02em',
            cursor: 'pointer',
          }}
        >
          Je reste là
        </button>
      </div>
    </Overlay>
  );
}
