/* ============================================================
   NÉYA V2 — useSwipeToDismiss
   ============================================================
   Pure-JS hook iOS HIG : drag-down to dismiss sheet.
   - Threshold ~120px OR velocity > 0.5 px/ms → onClose()
   - Sinon spring-back natural (320ms var(--ease-spring-ios))
   - Rubber-band si on drag vers le haut (deltaY < 0)
   - Bind sur la drag-handle uniquement (jamais sur le body
     scrollable — sinon on intercepte le scroll de contenu)
   - Touch + mouse
   - haptic(4) au franchissement du seuil de dismissal
   ============================================================ */

import { useCallback, useRef, useState, useEffect } from 'react';
import { haptic } from '../state';

export default function useSwipeToDismiss({
  onClose,
  threshold = 120,
  velocity: velocityThreshold = 0.5,
} = {}) {
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [springBack, setSpringBack] = useState(false);

  // Refs — mutables, ne déclenchent pas de re-render
  const startY = useRef(0);
  const startTime = useRef(0);
  const lastY = useRef(0);
  const draggingRef = useRef(false);
  const springTimer = useRef(null);
  const dismissTimer = useRef(null);
  const mouseHandlersRef = useRef(null);

  useEffect(() => {
    return () => {
      if (springTimer.current) clearTimeout(springTimer.current);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      if (mouseHandlersRef.current) {
        const { move, up } = mouseHandlersRef.current;
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
        mouseHandlersRef.current = null;
      }
    };
  }, []);

  const clientYFromEvent = (e) => {
    if (e.touches && e.touches.length) return e.touches[0].clientY;
    if (e.changedTouches && e.changedTouches.length)
      return e.changedTouches[0].clientY;
    return e.clientY;
  };

  const onStart = useCallback((e) => {
    const y = clientYFromEvent(e);
    startY.current = y;
    lastY.current = y;
    startTime.current = Date.now();
    draggingRef.current = true;
    setIsDragging(true);
    setSpringBack(false);
    if (springTimer.current) {
      clearTimeout(springTimer.current);
      springTimer.current = null;
    }
  }, []);

  const onMove = useCallback((e) => {
    if (!draggingRef.current) return;
    const y = clientYFromEvent(e);
    lastY.current = y;
    const deltaY = y - startY.current;
    if (deltaY >= 0) {
      setTranslateY(deltaY);
    } else {
      // rubber-band : résiste vers le haut, ne dépasse pas 0 vraiment
      setTranslateY(deltaY * 0.18);
    }
  }, []);

  const onEnd = useCallback(
    (e) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      const y = clientYFromEvent(e) ?? lastY.current;
      const deltaY = y - startY.current;
      const deltaTime = Math.max(1, Date.now() - startTime.current);
      const v = deltaY / deltaTime; // px/ms

      setIsDragging(false);

      if (deltaY > threshold || v > velocityThreshold) {
        // dismissal — haptic + onClose
        haptic(4);
        // on laisse la sheet glisser vers le bas via translateY courant
        // puis on appelle onClose (parent animera la sortie)
        onClose?.();
        // reset après un tick pour ne pas flasher
        if (dismissTimer.current) clearTimeout(dismissTimer.current);
        dismissTimer.current = setTimeout(() => {
          setTranslateY(0);
          setSpringBack(false);
          dismissTimer.current = null;
        }, 320);
      } else {
        // spring-back vers 0
        setSpringBack(true);
        setTranslateY(0);
        springTimer.current = setTimeout(() => {
          setSpringBack(false);
          springTimer.current = null;
        }, 320);
      }
    },
    [onClose, threshold, velocityThreshold]
  );

  // Pointer event handlers à spread sur le handle
  const bindHandle = {
    onTouchStart: onStart,
    onTouchMove: onMove,
    onTouchEnd: onEnd,
    onTouchCancel: onEnd,
    onMouseDown: (e) => {
      onStart(e);
      // mouse move/up s'enregistrent au niveau window le temps du drag
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
    // no-ops mais présents pour API symétrique
    onMouseMove: () => {},
    onMouseUp: () => {},
  };

  return {
    bindHandle,
    translateY,
    isDragging,
    springBack,
  };
}
