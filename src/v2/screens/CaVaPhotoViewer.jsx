/* ============================================================
   ÇA VA ? V2 — ÇA VA? · CaVaPhotoViewer
   ============================================================
   Photo viewer plein écran cinéma-grade pour la galerie ÇA VA?
   (120 photos éditoriales lifestyle/lookbook).

   Fond ink #0a0808 quasi noir, photos centrées objectFit:contain
   (letterboxing), caption optionnelle (place pill + quote italic).

   Comportements :
   - Ouverture : fade-in fond + zoom 0.85→1 (320ms)
   - Body scroll lock + cleanup
   - Swipe horizontal → photo précédente / suivante (280ms)
   - Tap zones latérales 25% × 60% gauche/droite invisibles
   - Double-tap → zoom 1×/2.5× au point tappé
   - Swipe vertical bas >120px → close avec fade
   - Tap fond hors photo → close
   - ESC keyboard → close
   - Préload N-1 et N+1 via new Image()
   - Haptic léger sur changement, fermer désactivé pendant zoom>1

   Signature API stable (contrat Agent 1) :
   ({ photoIndex, totalPhotos, onClose, getPhotoSrc, getCaption })
   ============================================================ */

import { useCallback, useEffect, useRef, useState } from 'react';
import { haptic } from '../state';

const INK_BG = '#0a0808';
const CREAM = '#FBF6E8';
const FRAUNCES_ITALIC = 'var(--fraunces-italic-soft, "opsz" 144, "SOFT" 100, "WONK" 1)';

const OPEN_MS = 320;
const NAV_MS = 280;
const CLOSE_MS = 280;
const DOUBLE_TAP_MS = 280;
const SWIPE_H_THRESHOLD = 60;   // px déclenchement nav horizontale
const SWIPE_V_CLOSE = 120;      // px swipe vertical bas pour fermer

export default function CaVaPhotoViewer({
  photoIndex,
  totalPhotos,
  onClose,
  getPhotoSrc,
  getCaption,
}) {
  const safeTotal = Math.max(1, totalPhotos || 1);
  const clamp = (n) => Math.min(Math.max(1, n), safeTotal);

  const [idx, setIdx] = useState(clamp(photoIndex || 1));
  const [opened, setOpened] = useState(false);
  const [closing, setClosing] = useState(false);
  const [photoLoaded, setPhotoLoaded] = useState(false);

  // Drag / gesture state
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [navDir, setNavDir] = useState(0); // -1 prev, 1 next, 0 idle (animation hint)

  // Zoom state
  const [zoom, setZoom] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });

  const aliveRef = useRef(true);
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // Gesture refs
  const touchStart = useRef(null);
  const lastTapTime = useRef(0);
  const lastTapPos = useRef({ x: 0, y: 0 });
  const gestureLockedAxis = useRef(null); // 'x' | 'y' | null
  const navTimer = useRef(null);
  const closeTimer = useRef(null);
  const openTimer = useRef(null);

  /* ----------------------- lifecycle ----------------------- */
  useEffect(() => {
    aliveRef.current = true;
    return () => { aliveRef.current = false; };
  }, []);

  // Body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Mount-in animation flag (used to drive opacity/scale via CSS class)
  useEffect(() => {
    openTimer.current = setTimeout(() => {
      if (aliveRef.current) setOpened(true);
    }, 16);
    return () => {
      if (openTimer.current) clearTimeout(openTimer.current);
    };
  }, []);

  // ESC to close
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (navTimer.current) clearTimeout(navTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  // Preload neighbours on idx change
  useEffect(() => {
    if (typeof getPhotoSrc !== 'function') return;
    const preload = (n) => {
      if (n < 1 || n > safeTotal) return;
      try {
        const src = getPhotoSrc(n);
        if (src) {
          const img = new Image();
          img.src = src;
        }
      } catch {}
    };
    preload(idx - 1);
    preload(idx + 1);
    preload(idx - 2);
    preload(idx + 2);
  }, [idx, getPhotoSrc, safeTotal]);

  // Reset photoLoaded when index changes
  useEffect(() => {
    setPhotoLoaded(false);
  }, [idx]);

  /* ----------------------- handlers ----------------------- */
  const handleClose = useCallback(() => {
    if (closing) return;
    if (zoom > 1) return; // close désactivé pendant zoom
    setClosing(true);
    haptic(2);
    closeTimer.current = setTimeout(() => {
      if (aliveRef.current) onClose?.();
    }, CLOSE_MS);
  }, [closing, onClose, zoom]);

  const goTo = useCallback((nextIdx, dir) => {
    const next = clamp(nextIdx);
    if (next === idx) {
      // bounce-back if at edge
      setDragX(0);
      setNavDir(0);
      return;
    }
    haptic(4);
    setNavDir(dir);
    // Animate slide off then snap to new idx
    setDragX(dir === 1 ? -window.innerWidth * 0.18 : window.innerWidth * 0.18);
    if (navTimer.current) clearTimeout(navTimer.current);
    navTimer.current = setTimeout(() => {
      if (!aliveRef.current) return;
      setIdx(next);
      setDragX(0);
      setNavDir(0);
      // reset zoom on nav
      setZoom(1);
      setZoomOrigin({ x: 50, y: 50 });
    }, NAV_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, safeTotal]);

  const prev = useCallback(() => goTo(idx - 1, -1), [goTo, idx]);
  const next = useCallback(() => goTo(idx + 1, 1), [goTo, idx]);

  /* ----------------------- gestures ----------------------- */
  const onTouchStart = (e) => {
    if (closing) return;
    const t = e.touches[0];
    touchStart.current = {
      x: t.clientX,
      y: t.clientY,
      t: Date.now(),
    };
    gestureLockedAxis.current = null;
    setIsDragging(true);
  };

  const onTouchMove = (e) => {
    if (!touchStart.current || closing) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;

    if (zoom > 1) {
      // pendant zoom : on ne navigue pas, on laisse le navigateur (ou ignore)
      return;
    }

    // Axis lock after small displacement
    if (!gestureLockedAxis.current) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        gestureLockedAxis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      }
    }

    if (gestureLockedAxis.current === 'x') {
      // Resistance aux bords
      let eff = dx;
      if ((idx <= 1 && dx > 0) || (idx >= safeTotal && dx < 0)) {
        eff = dx * 0.28;
      }
      setDragX(eff);
      setDragY(0);
    } else if (gestureLockedAxis.current === 'y') {
      // Seul drag vers le bas compte pour fermer ; vers le haut rubber-band
      if (dy >= 0) setDragY(dy);
      else setDragY(dy * 0.18);
      setDragX(0);
    }
  };

  const onTouchEnd = (e) => {
    if (!touchStart.current || closing) {
      setIsDragging(false);
      return;
    }
    const end = (e.changedTouches && e.changedTouches[0]) || null;
    const now = Date.now();
    const dt = Math.max(1, now - touchStart.current.t);
    const dx = end ? end.clientX - touchStart.current.x : dragX;
    const dy = end ? end.clientY - touchStart.current.y : dragY;
    const moved = Math.abs(dx) > 4 || Math.abs(dy) > 4;
    const axis = gestureLockedAxis.current;

    setIsDragging(false);
    touchStart.current = null;
    gestureLockedAxis.current = null;

    // Tap detection (no move) → handle double-tap zoom or tap-to-close
    if (!moved && dt < 300) {
      handleTap(end);
      return;
    }

    if (axis === 'x' && zoom === 1) {
      const vX = dx / dt; // px/ms
      const farEnough = Math.abs(dx) > SWIPE_H_THRESHOLD || Math.abs(vX) > 0.4;
      if (farEnough) {
        if (dx < 0) next();
        else prev();
        return;
      }
      // snap back
      setDragX(0);
      setNavDir(0);
      return;
    }

    if (axis === 'y' && zoom === 1) {
      const vY = dy / dt;
      if (dy > SWIPE_V_CLOSE || vY > 0.6) {
        handleClose();
        return;
      }
      // snap back
      setDragY(0);
    }
  };

  const handleTap = (touchPoint) => {
    const now = Date.now();
    const cx = touchPoint ? touchPoint.clientX : 0;
    const cy = touchPoint ? touchPoint.clientY : 0;
    const prevTime = lastTapTime.current;
    const prevPos = lastTapPos.current;
    const dist = Math.hypot(cx - prevPos.x, cy - prevPos.y);

    if (now - prevTime < DOUBLE_TAP_MS && dist < 32) {
      // Double-tap → toggle zoom
      lastTapTime.current = 0;
      lastTapPos.current = { x: 0, y: 0 };
      toggleZoom(cx, cy);
      return;
    }

    lastTapTime.current = now;
    lastTapPos.current = { x: cx, y: cy };
  };

  const toggleZoom = (cx, cy) => {
    haptic(6);
    if (zoom > 1) {
      setZoom(1);
      setZoomOrigin({ x: 50, y: 50 });
      return;
    }
    // Compute origin in % within image bounds (fall back to viewport center)
    const img = imgRef.current;
    if (img) {
      const r = img.getBoundingClientRect();
      const ox = Math.min(Math.max(((cx - r.left) / r.width) * 100, 0), 100);
      const oy = Math.min(Math.max(((cy - r.top) / r.height) * 100, 0), 100);
      setZoomOrigin({ x: ox, y: oy });
    } else {
      setZoomOrigin({ x: 50, y: 50 });
    }
    setZoom(2.5);
  };

  /* ----------------------- background tap to close ----------------------- */
  const onBackgroundClick = (e) => {
    // si on a cliqué directement sur le scrim (pas via touch geste)
    if (e.target === containerRef.current && zoom === 1 && !isDragging) {
      handleClose();
    }
  };

  /* ----------------------- derived ----------------------- */
  const caption = (() => {
    try {
      if (typeof getCaption !== 'function') return null;
      const c = getCaption(idx);
      if (!c) return null;
      return c;
    } catch {
      return null;
    }
  })();

  const src = (() => {
    try {
      return typeof getPhotoSrc === 'function' ? getPhotoSrc(idx) : '';
    } catch {
      return '';
    }
  })();

  /* ----------------------- styles ----------------------- */
  // Container opacity (fade in / out) is independent from drag dy fade
  const dyFade = Math.max(0, 1 - Math.min(dragY, 360) / 360);
  const bgOpacity = closing ? 0 : (opened ? 1 : 0);

  return (
    <>
      <style>{`
        @keyframes cvpvFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cvpvCaptionIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>

      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Galerie photo ÇA VA?"
        onClick={onBackgroundClick}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 950,
          background: INK_BG,
          opacity: bgOpacity * dyFade,
          transition: `opacity ${closing ? CLOSE_MS : OPEN_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          overflow: 'hidden',
          touchAction: zoom > 1 ? 'auto' : 'none',
          WebkitTapHighlightColor: 'transparent',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {/* Photo layer */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6vh 4vw',
            transform: `translate(${dragX}px, ${dragY}px)`,
            transition: isDragging
              ? 'none'
              : `transform ${navDir !== 0 ? NAV_MS : 280}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            pointerEvents: 'none',
          }}
        >
          {src ? (
            <img
              ref={imgRef}
              src={src}
              alt={`Photo ÇA VA? ${idx} sur ${safeTotal}`}
              draggable={false}
              onLoad={() => { if (aliveRef.current) setPhotoLoaded(true); }}
              onError={() => { if (aliveRef.current) setPhotoLoaded(true); }}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                display: 'block',
                transform: `scale(${opened && !closing ? zoom : 0.85})`,
                transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                opacity: opened && !closing ? 1 : 0,
                transition: isDragging
                  ? 'transform 0ms, opacity 0ms'
                  : `transform ${OPEN_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${OPEN_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                borderRadius: 2,
                boxShadow: '0 24px 80px rgba(0, 0, 0, 0.55)',
                pointerEvents: 'auto',
                WebkitUserSelect: 'none',
                userSelect: 'none',
              }}
            />
          ) : null}
        </div>

        {/* Invisible tap zones (only when zoom == 1 and not closing) */}
        {zoom === 1 && !closing && (
          <>
            <button
              type="button"
              aria-label="Photo précédente"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              disabled={idx <= 1}
              style={{
                position: 'absolute',
                left: 0,
                top: '20%',
                width: '25%',
                height: '60%',
                background: 'transparent',
                border: 'none',
                cursor: idx > 1 ? 'pointer' : 'default',
                outline: 'none',
                WebkitTapHighlightColor: 'transparent',
                pointerEvents: idx > 1 ? 'auto' : 'none',
              }}
            />
            <button
              type="button"
              aria-label="Photo suivante"
              onClick={(e) => { e.stopPropagation(); next(); }}
              disabled={idx >= safeTotal}
              style={{
                position: 'absolute',
                right: 0,
                top: '20%',
                width: '25%',
                height: '60%',
                background: 'transparent',
                border: 'none',
                cursor: idx < safeTotal ? 'pointer' : 'default',
                outline: 'none',
                WebkitTapHighlightColor: 'transparent',
                pointerEvents: idx < safeTotal ? 'auto' : 'none',
              }}
            />
          </>
        )}

        {/* Top bar : close (left) + counter (right) */}
        <div
          style={{
            position: 'absolute',
            top: 'calc(env(safe-area-inset-top, 0px) + 14px)',
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 14px',
            pointerEvents: 'none',
            opacity: opened && !closing ? 1 : 0,
            transition: `opacity ${OPEN_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        >
          <button
            type="button"
            aria-label="Fermer la galerie"
            onClick={(e) => { e.stopPropagation(); handleClose(); }}
            disabled={zoom > 1}
            style={{
              pointerEvents: zoom > 1 ? 'none' : 'auto',
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '0.5px solid rgba(255, 255, 255, 0.16)',
              color: CREAM,
              fontSize: 16,
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              outline: 'none',
              WebkitTapHighlightColor: 'transparent',
              opacity: zoom > 1 ? 0.35 : 1,
              transition: 'opacity 180ms ease, background 180ms ease',
            }}
          >
            ✕
          </button>

          <div
            aria-live="polite"
            style={{
              pointerEvents: 'none',
              padding: '8px 12px',
              borderRadius: 999,
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              fontFamily: 'var(--font-ui, "Sora", system-ui, sans-serif)',
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: '0.222em',
              textTransform: 'uppercase',
              color: CREAM,
              opacity: 0.82,
            }}
          >
            {String(idx).padStart(2, '0')} / {String(safeTotal).padStart(2, '0')}
          </div>
        </div>

        {/* Caption (only if available) */}
        {caption && (
          <div
            key={`cap-${idx}`}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
              padding: '0 22px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              pointerEvents: 'none',
              opacity: photoLoaded && opened && !closing ? 1 : 0,
              animation: photoLoaded && opened && !closing
                ? 'cvpvCaptionIn 420ms cubic-bezier(0.22, 1, 0.36, 1) both'
                : 'none',
              transition: `opacity 280ms cubic-bezier(0.22, 1, 0.36, 1)`,
            }}
          >
            {caption.place && (
              <div
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  border: '0.5px solid rgba(255, 255, 255, 0.14)',
                  fontFamily: 'var(--font-ui, "Sora", system-ui, sans-serif)',
                  fontSize: 9,
                  fontWeight: 500,
                  letterSpacing: '0.222em',
                  textTransform: 'uppercase',
                  color: CREAM,
                }}
              >
                {String(caption.place).toUpperCase()}
              </div>
            )}
            {caption.quote && (
              <p
                style={{
                  margin: 0,
                  maxWidth: 480,
                  textAlign: 'center',
                  fontFamily: 'var(--font-display, "Fraunces", "Georgia", serif)',
                  fontStyle: 'italic',
                  fontVariationSettings: FRAUNCES_ITALIC,
                  fontSize: 'clamp(15px, 4.6vw, 19px)',
                  lineHeight: 1.4,
                  letterSpacing: '-0.005em',
                  color: CREAM,
                  opacity: 0.92,
                  textShadow: '0 1px 18px rgba(0, 0, 0, 0.55)',
                  fontWeight: 300,
                }}
              >
                « {caption.quote} »
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
