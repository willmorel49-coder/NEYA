/* ============================================================
   Modal — Dialog centre (DS V4)
   ============================================================
   Pattern :
   <Modal open={open} onClose={...} title="..." size="sm|md|lg">
     {children}
     <CTA>...</CTA>
   </Modal>

   - Overlay dark backdrop
   - Card center : background var(--bg), radius 28, padding 24
   - max-width sm 320 / md 400 / lg 520
   - Shadow 0 24px 64px rgba(10,36,56,0.30)
   - Entrance opacity 0->1 + scale 0.96->1 sur 280ms
   - Title Cormorant italic 24 var(--blue-900)
   - Close X top-right (si pas de header)
   - ESC + tap backdrop = close
   ============================================================ */

import { useEffect, useState } from 'react';
import Overlay from './Overlay';

const SIZES = {
  sm: 320,
  md: 400,
  lg: 520,
};

export default function Modal({
  open = true,
  onClose,
  title,
  size = 'md',
  closeOnBackdrop = true,
  children,
  style = {},
}) {
  const [mounted, setMounted] = useState(false);

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!open) return null;

  const maxWidth = SIZES[size] ?? SIZES.md;
  const duration = reduced ? 0 : 280;

  return (
    <Overlay
      backdrop="dark"
      onClose={onClose}
      closeOnBackdrop={closeOnBackdrop}
      ariaLabel={title || 'Dialogue'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg)',
          borderRadius: 28,
          padding: 24,
          width: '100%',
          maxWidth,
          maxHeight: 'calc(100dvh - 80px)',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          boxShadow: '0 24px 64px rgba(10, 36, 56, 0.30)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'scale(1)' : 'scale(0.96)',
          transition: `opacity ${duration}ms cubic-bezier(0.22, 0.61, 0.36, 1), transform ${duration}ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
          position: 'relative',
          ...style,
        }}
      >
        {title ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: 24,
                color: 'var(--blue-900)',
                margin: 0,
                lineHeight: 1.2,
                flex: 1,
              }}
            >
              {title}
            </h2>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                style={closeBtnStyle}
              >
                ✕
              </button>
            )}
          </div>
        ) : (
          onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              style={{
                ...closeBtnStyle,
                position: 'absolute',
                top: 12,
                right: 12,
              }}
            >
              ✕
            </button>
          )
        )}

        <div>{children}</div>
      </div>
    </Overlay>
  );
}

const closeBtnStyle = {
  appearance: 'none',
  width: 40,
  height: 40,
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.65)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255, 255, 255, 0.85)',
  color: 'var(--blue-900)',
  fontSize: 15,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  WebkitTapHighlightColor: 'transparent',
  padding: 0,
  flexShrink: 0,
};
