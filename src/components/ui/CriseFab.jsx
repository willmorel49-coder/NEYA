/* ============================================================
   CriseFab — FAB discret pour ouvrir l'overlay Crise
   ============================================================
   Toujours visible (sauf overlay fullscreen actif), bottom-right.
   ============================================================ */

import { haptic } from '../../v2/state';

export default function CriseFab({ onClick, hidden = false }) {
  if (hidden) return null;
  return (
    <button
      onClick={() => { haptic(6); onClick?.(); }}
      aria-label="Aide en cas de crise"
      title="Aide"
      style={{
        position: 'fixed',
        bottom: 'calc(72px + env(safe-area-inset-bottom, 0))',
        right: 16,
        width: 56, height: 56,
        borderRadius: '50%',
        background: 'rgba(190, 30, 50, 0.92)',
        color: 'white',
        border: 'none',
        boxShadow: '0 4px 14px rgba(190, 30, 50, 0.35)',
        fontSize: 22,
        fontFamily: 'inherit',
        cursor: 'pointer',
        zIndex: 110,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.92,
      }}
    >
      ◉
    </button>
  );
}
