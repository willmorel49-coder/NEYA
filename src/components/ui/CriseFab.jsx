/* ============================================================
   CriseFab — FAB discret pour ouvrir l'overlay Crise
   ============================================================
   Toujours visible (sauf overlay fullscreen actif), bottom-right.
   Glass blanc neutre + halo doux qui respire — trouvable
   en cas de besoin sans crier en permanence. Texte « Aide »
   pour lever toute ambiguïté (pas un bouton inconnu).
   ============================================================ */

import { haptic } from '../../v2/state';

export default function CriseFab({ onClick, hidden = false }) {
  if (hidden) return null;
  return (
    <>
      <style>{`
        @keyframes criseFabBreathe {
          0%, 100% { box-shadow: 0 4px 14px rgba(20, 24, 36, 0.18), 0 0 0 0 rgba(247, 210, 221, 0); }
          50%      { box-shadow: 0 4px 14px rgba(20, 24, 36, 0.22), 0 0 0 6px rgba(247, 210, 221, 0.10); }
        }
      `}</style>
      <button
        onClick={() => { haptic(6); onClick?.(); }}
        aria-label="Aide d'écoute"
        title="Aide d'écoute"
        style={{
          position: 'fixed',
          bottom: 'calc(72px + env(safe-area-inset-bottom, 0))',
          right: 16,
          minWidth: 56, height: 56,
          padding: '0 18px',
          borderRadius: 28,
          background: 'rgba(255, 250, 250, 0.88)',
          color: '#1a1f2e',
          border: '1px solid rgba(20, 24, 36, 0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          fontSize: 13,
          fontFamily: 'inherit',
          fontWeight: 500,
          letterSpacing: '0.02em',
          cursor: 'pointer',
          zIndex: 110,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          animation: 'criseFabBreathe 8s ease-in-out infinite',
        }}
      >
        <span aria-hidden style={{
          color: '#c87a8e',
          fontSize: 11,
          lineHeight: 1,
        }}>✦</span>
        <span>Aide</span>
      </button>
    </>
  );
}
