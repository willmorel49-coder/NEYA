/* ============================================================
   Toast — NÉYA Design System v2 · Apple iOS HIG
   ============================================================
   Toast / Banner iOS-style : pill-shaped cream-light pearl
   sliding down from the top safe-area. Single line message,
   optional icon, auto-dismiss 2.4s by default. Tap to dismiss
   early. Single active toast at a time (queue length 1, new
   replaces previous).

   Usage :
     // 1. Wrap the app once
     <ToastProvider>
       <App />
     </ToastProvider>

     // 2. In any descendant
     const showToast = useToast();
     showToast({ ...TOAST_PRESETS.success, message: 'Mantra gardé.' });
     showToast({ ...TOAST_PRESETS.copied,  message: 'Adresse copiée.' });

   Standalone usage :
     <Toast
       message="…"
       icon="✓"
       accent="var(--tilleul)"
       duration={2400}
       onDismiss={() => …}
     />

   Constraints :
   - Cream-light pearl, ink text — pure #fff banned
   - Apple iOS easings (no spring/bounce)
   - Auto-dismiss + tap dismiss (haptic 4)
   - Slide-down + fade-in 360ms · slide-up + fade-out 280ms
   ============================================================ */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { haptic } from '../v2/state';

const EASE_OUT_IOS = 'cubic-bezier(0.32, 0.72, 0, 1)';
const EASE_IN_IOS  = 'cubic-bezier(0.32, 0, 0.72, 1)';

/* ============================================================
   PRESETS — pre-built shortcuts (icon + accent)
   ============================================================ */

export const TOAST_PRESETS = {
  success: { icon: '✓', accent: 'var(--tilleul)' },
  info:    { icon: '○', accent: 'var(--mist-blue)' },
  warning: { icon: '!', accent: 'var(--ochre)' },
  saved:   { icon: '✓', accent: 'var(--emerald)' },
  copied:  { icon: '⌘', accent: 'var(--mist-blue)' },
};

/* ============================================================
   <Toast> — standalone presentational component
   ============================================================ */

export default function Toast({
  message,
  icon,
  accent = 'var(--tilleul)',
  duration = 2400,
  onDismiss,
}) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const autoTimerRef = useRef(null);
  const exitTimerRef = useRef(null);

  // Slide-down + fade-in after first paint
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setTimeout(() => setMounted(true), 20);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Auto-dismiss
  useEffect(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    autoTimerRef.current = setTimeout(() => triggerDismiss(), duration);
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const triggerDismiss = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    setMounted(false);
    exitTimerRef.current = setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 280);
  };

  const handleTap = () => {
    haptic(4);
    triggerDismiss();
  };

  const wrapperStyle = {
    position: 'fixed',
    top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
    left: '50%',
    transform: `translateX(-50%) translateY(${mounted ? '0px' : '-18px'})`,
    opacity: mounted ? 1 : 0,
    transition: `transform ${closing ? 280 : 360}ms ${closing ? EASE_IN_IOS : EASE_OUT_IOS}, opacity ${closing ? 280 : 360}ms ${closing ? EASE_IN_IOS : EASE_OUT_IOS}`,
    zIndex: 9999,
    pointerEvents: 'auto',
    maxWidth: 320,
    width: 'auto',
  };

  const pillStyle = {
    appearance: 'none',
    border: `0.5px solid ${accent}`,
    background: 'rgba(255, 252, 245, 0.94)',
    backdropFilter: 'blur(18px) saturate(160%)',
    WebkitBackdropFilter: 'blur(18px) saturate(160%)',
    boxShadow: 'var(--shadow-card)',
    borderRadius: 'var(--radius-pill)',
    padding: '12px 18px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
    color: 'var(--ink)',
    fontFamily: 'var(--font-ui, Sora)',
    fontSize: 13,
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: '-0.005em',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 320,
  };

  const iconStyle = {
    fontSize: 16,
    lineHeight: 1,
    color: accent,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  return (
    <div style={wrapperStyle} role="status" aria-live="polite">
      <div
        data-press
        onClick={handleTap}
        style={pillStyle}
      >
        {icon && (
          <span style={iconStyle} aria-hidden="true">
            {icon}
          </span>
        )}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {message}
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   ToastProvider / useToast — context + queue length 1
   ============================================================ */

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  // current toast object : { id, message, icon, accent, duration } | null
  const [current, setCurrent] = useState(null);

  const showToast = useCallback((opts) => {
    if (!opts || !opts.message) return;
    // Replace previous (queue length 1)
    setCurrent({
      id: Date.now() + Math.random(),
      message: opts.message,
      icon: opts.icon,
      accent: opts.accent || 'var(--tilleul)',
      duration: typeof opts.duration === 'number' ? opts.duration : 2400,
    });
  }, []);

  const handleDismiss = useCallback(() => {
    setCurrent(null);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {current && (
        <Toast
          key={current.id}
          message={current.message}
          icon={current.icon}
          accent={current.accent}
          duration={current.duration}
          onDismiss={handleDismiss}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback no-op so calling outside provider never crashes
    return () => {};
  }
  return ctx;
}
