/* ============================================================
   NÉYA V2 — usePullToRefresh
   ============================================================
   Pure-JS hook iOS HIG : drag-down from top to refresh.
   - Triggers only if container scrollTop === 0 at touch start
   - Rubber band : pullY = min(deltaY * 0.6, 120)
   - Threshold default 80 px → haptic 4 au franchissement (false→true)
   - Release ≥ threshold : await onRefresh(), spring back 320ms,
     haptic [6, 30, 6] au démarrage du refresh
   - Release < threshold : spring back 320ms
   - bindScroll : { onTouchStart, onTouchMove, onTouchEnd }
   ============================================================ */

import { useCallback, useRef, useState, useEffect } from 'react';
import { haptic } from '../state';

export default function usePullToRefresh({ onRefresh, threshold = 80 } = {}) {
  const [pullY, setPullY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reachedThreshold, setReachedThreshold] = useState(false);

  const startY = useRef(0);
  const startTime = useRef(0);
  const activeRef = useRef(false); // touch is currently a valid pull (started at scrollTop 0)
  const reachedRef = useRef(false);
  const containerRef = useRef(null);
  const animTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (animTimer.current) clearTimeout(animTimer.current);
    };
  }, []);

  const clientYFromEvent = (e) => {
    if (e.touches && e.touches.length) return e.touches[0].clientY;
    if (e.changedTouches && e.changedTouches.length) return e.changedTouches[0].clientY;
    return e.clientY;
  };

  const springBack = useCallback(() => {
    // Trigger the spring transition driven by isPulling=false
    setPullY(0);
    if (animTimer.current) clearTimeout(animTimer.current);
    animTimer.current = setTimeout(() => {
      animTimer.current = null;
    }, 320);
  }, []);

  const onTouchStart = useCallback((e) => {
    if (isRefreshing) return;
    const container = e.currentTarget;
    containerRef.current = container;
    // Only initiate pull if user is already scrolled at the top
    if (container && container.scrollTop > 0) {
      activeRef.current = false;
      return;
    }
    activeRef.current = true;
    startY.current = clientYFromEvent(e);
    startTime.current = Date.now();
    reachedRef.current = false;
    setReachedThreshold(false);
  }, [isRefreshing]);

  const onTouchMove = useCallback((e) => {
    if (!activeRef.current || isRefreshing) return;
    const y = clientYFromEvent(e);
    const deltaY = y - startY.current;
    if (deltaY <= 0) {
      // user is dragging up while still active — let the scroll happen
      setPullY(0);
      setIsPulling(false);
      return;
    }
    // rubber band : 60% drag-to-pull ratio, clamped at 120
    const next = Math.min(deltaY * 0.6, 120);
    setIsPulling(true);
    setPullY(next);

    const nowReached = next >= threshold;
    if (nowReached && !reachedRef.current) {
      reachedRef.current = true;
      setReachedThreshold(true);
      haptic(4);
    } else if (!nowReached && reachedRef.current) {
      reachedRef.current = false;
      setReachedThreshold(false);
    }
  }, [isRefreshing, threshold]);

  const onTouchEnd = useCallback(async () => {
    if (!activeRef.current) return;
    activeRef.current = false;
    setIsPulling(false);

    if (reachedRef.current && !isRefreshing) {
      // fire refresh
      setIsRefreshing(true);
      haptic([6, 30, 6]);
      try {
        await onRefresh?.();
      } catch {
        // swallow — UX must always spring back
      }
      // animate pullY → 0 over 320ms (driven by isPulling=false transition)
      setPullY(0);
      if (animTimer.current) clearTimeout(animTimer.current);
      animTimer.current = setTimeout(() => {
        setIsRefreshing(false);
        setReachedThreshold(false);
        reachedRef.current = false;
        animTimer.current = null;
      }, 320);
    } else {
      // spring back to 0
      springBack();
      setReachedThreshold(false);
      reachedRef.current = false;
    }
  }, [isRefreshing, onRefresh, springBack]);

  const bindScroll = {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel: onTouchEnd,
  };

  return {
    bindScroll,
    pullY,
    isPulling,
    isRefreshing,
    reachedThreshold,
  };
}
