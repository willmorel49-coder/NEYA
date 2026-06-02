/* ============================================================
   Onboarding V6 — 1 écran manifeste + Commencer
   ============================================================ */

import { useEffect, useState } from 'react';
import { patchProfile, haptic } from '../state';

export default function Onboarding({ onDone }) {
  // Fade-in séquentiel — tag, titre, sub, paragraphe, CTA
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    const delays = [120, 480, 920, 1380, 1840];
    const timers = delays.map((d, i) =>
      setTimeout(() => setRevealed((r) => Math.max(r, i + 1)), d)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleStart = () => {
    haptic([4, 30, 4]);
    patchProfile({ onboarding: { completed: true, completedAt: new Date().toISOString() } });
    onDone?.();
  };

  // Style helper — fade-in + léger rise
  const reveal = (index) => ({
    opacity: revealed > index ? 1 : 0,
    transform: revealed > index ? 'translateY(0)' : 'translateY(6px)',
    transition: 'opacity 720ms ease, transform 720ms ease',
  });

  return (
    <div style={{
      position: 'relative',
      minHeight: '100dvh',
      padding: '64px 28px 56px',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg, #EEF3F8)',
      overflow: 'hidden',
    }}>
      {/* Gradient cream subtil — chaleur en haut, plus frais en bas */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(120% 70% at 50% -10%, rgba(255,243,228,0.55) 0%, rgba(238,243,248,0) 60%)',
        pointerEvents: 'none',
      }} />
      {/* Grain léger DA pearl glass */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.18 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        opacity: 0.06,
        mixBlendMode: 'multiply',
        pointerEvents: 'none',
      }} />

      {/* Contenu */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{
          fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase',
          opacity: 0.5, marginBottom: 44,
          ...reveal(0),
        }}>
          ÇA VA?
        </div>

        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 40,
          lineHeight: 1.12,
          letterSpacing: '-0.01em',
          marginBottom: 20,
          color: 'var(--ink)',
          ...reveal(1),
        }}>
          Et toi,<br/>
          ça va vraiment&nbsp;?
        </h1>

        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontSize: 20,
          lineHeight: 1.45,
          opacity: 0.72,
          marginBottom: 40,
          color: 'var(--ink)',
          maxWidth: 320,
          ...reveal(2),
        }}>
          T'as pas besoin d'aller bien<br/>
          pour commencer.
        </p>

        <div style={{
          fontSize: 13.5,
          lineHeight: 1.7,
          opacity: 0.62,
          maxWidth: 320,
          color: 'var(--ink)',
          ...reveal(3),
        }}>
          <p style={{ margin: 0 }}>
            Chaque jour, on te demande comment tu vas.
          </p>
          <p style={{ margin: '6px 0 0' }}>
            On te répond avec quelque chose d'utile —<br/>
            respirer, écrire, ou juste une bouée.
          </p>
        </div>

        <button
          onClick={handleStart}
          style={{
            marginTop: 'auto',
            minHeight: 56,
            padding: '18px 32px',
            background: 'rgba(255,255,255,0.78)',
            color: 'var(--ink)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 18,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 19,
            letterSpacing: '0.01em',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 8px 24px -12px rgba(20,30,50,0.18)',
            ...reveal(4),
          }}
        >
          On y va.
        </button>
      </div>
    </div>
  );
}
