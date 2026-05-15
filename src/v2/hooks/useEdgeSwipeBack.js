/* ============================================================
   NÉYA V2 — useEdgeSwipeBack
   ============================================================
   Pure-JS hook iOS HIG : left-edge swipe-back to dismiss overlay.
   - Gesture only initiates if touch/click starts within `edgeWidth`
     px from the LEFT edge of the viewport.
   - Tracks horizontal delta; positive only (no left rubber-band).
   - On release :
       delta > screenW * threshold OR velocity > velocityThreshold
       → haptic(4) + onClose()
       Else → spring-back to 0 over 320ms var(--ease-spring-ios)
   - Touch + mouse compatible (mouse listeners attached on window
     during drag only, after onMouseDown).
   - Coexists with useSwipeToDismiss (vertical handle drag) — they
     operate on different bindings and different axes.
   ============================================================ */

import { useCallback, useRef, useState, useEffect } from 'react';
import { haptic } from '../state';

export default function useEdgeSwipeBack({
  onClose,
  edgeWidth = 24,
  threshold = 0.4,
  velocity: velocityThreshold = 0.5,
} = {}) {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Refs — mutables, don't trigger re-renders
  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);
  const lastX = useRef(0);
  const draggingRef = useRef(false);
  const springTimer = useRef(null);
  const mouseHandlersRef = useRef(null);

  useEffect(() => {
    return () => {
      if (springTimer.current) clearTimeout(springTimer.current);
      // cleanup any dangling mouse listeners
      if (mouseHandlersRef.current) {
        const { move, up } = mouseHandlersRef.current;
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
        mouseHandlersRef.current = null;
      }
    };
  }, []);

  const pointFromEvent = (e) => {
    if (e.touches && e.touches.length) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    if (e.changedTouches && e.changedTouches.length) {
      return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const onStart = useCallback(
    (e) => {
      const { x, y } = pointFromEvent(e);
      // Only initiate if the gesture starts within the LEFT edge zone
      if (x > edgeWidth) {
        draggingRef.current = false;
        return false;
      }
      startX.current = x;
      startY.current = y;
      lastX.current = x;
      startTime.current = Date.now();
      draggingRef.current = true;
      setIsDragging(true);
      if (springTimer.current) {
        clearTimeout(springTimer.current);
        springTimer.current = null;
      }
      return true;
    },
    [edgeWidth]
  );

  const onMove = useCallback((e) => {
    if (!draggingRef.current) return;
    const { x } = pointFromEvent(e);
    lastX.current = x;
    const deltaX = x - startX.current;
    if (deltaX > 0) {
      setTranslateX(deltaX);
    } else {
      // no rubber-band on the left — just clamp at 0
      setTranslateX(0);
    }
  }, []);

  const onEnd = useCallback(
    (e) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      const point = e ? pointFromEvent(e) : { x: lastX.current };
      const x = point.x ?? lastX.current;
      const deltaX = x - startX.current;
      const deltaTime = Math.max(1, Date.now() - startTime.current);
      const v = deltaX / deltaTime; // px/ms
      const screenW =
        typeof window !== 'undefined' ? window.innerWidth || 375 : 375;

      setIsDragging(false);

      // Cancel if user released without meaningful drag (e.g. clicked at edge)
      if (deltaX <= 0) {
        setTranslateX(0);
        return;
      }

      if (deltaX > screenW * threshold || v > velocityThreshold) {
        // dismissal
        haptic(4);
        onClose?.();
        // reset after a tick so we don't flash
        setTimeout(() => {
          setTranslateX(0);
        }, 320);
      } else {
        // spring back to 0
        setTranslateX(0);
        springTimer.current = setTimeout(() => {
          springTimer.current = null;
        }, 320);
      }
    },
    [onClose, threshold, velocityThreshold]
  );

  // Pointer event handlers to spread on the overlay root
  const bindContainer = {
    onTouchStart: (e) => {
      onStart(e);
    },
    onTouchMove: (e) => {
      onMove(e);
    },
    onTouchEnd: (e) => {
      onEnd(e);
    },
    onTouchCancel: (e) => {
      onEnd(e);
    },
    onMouseDown: (e) => {
      const started = onStart(e);
      if (!started) return;
      // mouse move/up bind on window during drag
      const handleMove = (ev) => onMove(ev);
      const handleUp = (ev) => {
        onEnd(ev);
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
        mouseHandlersRef.current = null;
      };
      mouseHandlersRef.current = { move: handleMove, up: handleUp };
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    },
    // no-ops but kept for API symmetry
    onMouseMove: () => {},
    onMouseUp: () => {},
  };

  return {
    bindContainer,
    translateX,
    isDragging,
  };
}
