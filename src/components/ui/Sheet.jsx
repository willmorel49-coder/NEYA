/* ============================================================
   Sheet — Bottom sheet iOS-style (DS V4)
   ============================================================
   Pattern :
   <Sheet open={open} onClose={...} title="..." snap="full|half|content">
     {children}
   </Sheet>

   - Slide-up depuis bottom 100%->0 en 400ms cubic-bezier(0.32,0.72,0,1)
   - Background var(--bg), border-top-radius 28
   - Shadow 0 -24px 64px rgba(10,36,56,0.25)
   - Drag handle visible top (40x4 var(--blue-300))
   - safe-area-bottom respect
   - snap full = 100dvh, half = 60dvh, content = auto max 85dvh
   - Drag-to-dismiss vertical (swipe down >80px = close)
   ============================================================ */

import { useEffect, useRef, useState } from 'react';
import Overlay from './Overlay';

const SNAP = {
  full: '100dvh',
  half: '60dvh',
  content: 'auto',
};

const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';

export default function Sheet({
  open = true,
  onClose,
  title,
  snap = 'content',
  children,
  closeOnBackdrop = true,
  style = {},
}) {
  const sheetRef = useRef(null);
  const dragRef = useRef({ startY: 0, currentY: 0, dragging: false });
  const [translate, setTranslate] = useState(100); // 100 = hidden offscreen
  const [transitioning, setTransitioning] = useState(true);

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Entrance animation
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setTranslate(0);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const triggerClose = () => {
    if (!onClose) return;
    setTransitioning(true);
    setTranslate(100);
    const delay = reduced ? 0 : 360;
    setTimeout(() => onClose(), delay);
  };

  // Drag handlers
  const onPointerDown = (e) => {
    if (!sheetRef.current) return;
    dragRef.current.startY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    dragRef.current.currentY = dragRef.current.startY;
    dragRef.current.dragging = true;
    setTransitioning(false);
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.dragging) return;
    const y = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    const delta = y - dragRef.current.startY;
    dragRef.current.currentY = y;
    if (delta > 0) {
      const heightPx = sheetRef.current?.offsetHeight || 600;
      const pct = (delta / heightPx) * 100;
      setTranslate(Math.min(100, pct));
    }
  };

  const onPointerUp = () => {
    if (!dragRef.current.dragging) return;
    const delta = dragRef.current.currentY - dragRef.current.startY;
    dragRef.current.dragging = false;
    setTransitioning(true);
    if (delta > 80) {
      triggerClose();
    } else {
      setTranslate(0);
    }
  };

  if (!open) return null;

  const sheetHeight = SNAP[snap] ?? SNAP.content;
  const duration = reduced ? 0 : 400;

  return (
    <Overlay
      backdrop="dark"
      onClose={closeOnBackdrop ? triggerClose : undefined}
      closeOnBackdrop={closeOnBackdrop}
      ariaLabel={title || 'Feuille'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg)',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          boxShadow: '0 -24px 64px rgba(10, 36, 56, 0.25)',
          height: sheetHeight,
          maxHeight: snap === 'content' ? '85dvh' : sheetHeight,
          width: '100%',
          maxWidth: 640,
          alignSelf: 'center',
          transform: `translateY(${translate}%)`,
          transition: transitioning ? `transform ${duration}ms ${EASE}` : 'none',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          ...style,
        }}
      >
        {/* Drag handle */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '10px 0 6px',
            cursor: 'grab',
            touchAction: 'none',
            flexShrink: 0,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              background: 'var(--blue-300)',
              opacity: 0.6,
            }}
          />
        </div>

        {/* Header */}
        {title ? (
          <div
            style={{
              position: 'sticky',
              top: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 20px 14px',
              background: 'var(--bg)',
              flexShrink: 0,
            }}
          >
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: 22,
                color: 'var(--blue-900)',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {title}
            </h2>
            {onClose && (
              <button
                type="button"
                onClick={triggerClose}
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
              onClick={triggerClose}
              aria-label="Fermer"
              style={{
                ...closeBtnStyle,
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 2,
              }}
            >
              ✕
            </button>
          )
        )}

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '4px 20px 20px',
          }}
        >
          {children}
        </div>
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
