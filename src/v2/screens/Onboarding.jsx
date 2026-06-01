/* ============================================================
   Onboarding V6 — 1 écran manifeste + Commencer
   ============================================================ */

import { patchProfile, haptic } from '../state';

export default function Onboarding({ onDone }) {
  const handleStart = () => {
    haptic([4, 30, 4]);
    patchProfile({ onboarding: { completed: true, completedAt: new Date().toISOString() } });
    onDone?.();
  };

  return (
    <div style={{
      minHeight: '100dvh',
      padding: '60px 28px 80px',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg, #EEF3F8)',
    }}>
      <div style={{
        fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase',
        opacity: 0.5, marginBottom: 28,
      }}>
        ÇA VA?
      </div>

      <h1 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontStyle: 'italic',
        fontSize: 36,
        lineHeight: 1.15,
        marginBottom: 24,
        color: 'var(--ink)',
      }}>
        Cette app te demande<br/>
        chaque jour comment<br/>
        tu vas.
      </h1>

      <p style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontStyle: 'italic',
        fontSize: 22,
        lineHeight: 1.4,
        opacity: 0.75,
        marginBottom: 32,
        color: 'var(--ink)',
      }}>
        Et te répond.
      </p>

      <p style={{ fontSize: 13, opacity: 0.6, lineHeight: 1.6, maxWidth: 320 }}>
        Trois options pour répondre. Tu décides ce qui suit — respirer, écrire, ou poser une bouée du jour.
      </p>

      <button
        onClick={handleStart}
        style={{
          marginTop: 'auto',
          minHeight: 56,
          padding: '16px 32px',
          background: 'rgba(255,255,255,0.7)',
          color: 'var(--ink)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 16,
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontSize: 18,
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
        }}
      >
        Commencer →
      </button>
    </div>
  );
}
