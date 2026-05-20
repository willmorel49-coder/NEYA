/* ============================================================
   Overlay — Backdrop + container fullscreen (DS V4)
   ============================================================
   Pattern :
   <Overlay onClose={...} backdrop="dark"|"light"|"clear" closeOnBackdrop>
     {children}
   </Overlay>

   - position fixed inset 0, z-index 9999
   - backdrop variants : dark / light / clear
   - entrance opacity 0->1 sur 320ms ease-out
   - ESC + tap backdrop = onClose si closeOnBackdrop
   - body overflow lock pendant mount
   - focus trap basique (Tab loop sur enfants focusables)
   - prefers-reduced-motion respect
   ============================================================ */

import { useEffect, useRef, useState } from 'react';

const BACKDROPS = {
  dark: {
    background: 'rgba(10, 36, 56, 0.85)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  },
  light: {
    background: 'rgba(238, 243, 248, 0.92)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },
  clear: {
    background: 'transparent',
  },
};

function getFocusable(container) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.hasAttribute('aria-hidden'));
}

export default function Overlay({
  children,
  onClose,
  backdrop = 'dark',
  closeOnBackdrop = true,
  zIndex = 9999,
  role = 'dialog',
  ariaLabel,
  style = {},
  ...rest
}) {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  // Respect prefers-reduced-motion
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Entrance animation
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Body scroll lock
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // ESC + focus trap
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const prevActive = document.activeElement;
    const focusables = getFocusable(containerRef.current);
    if (focusables.length > 0) {
      focusables[0].focus();
    } else if (containerRef.current) {
      containerRef.current.setAttribute('tabindex', '-1');
      containerRef.current.focus();
    }

    const handleKey = (e) => {
      if (e.key === 'Escape' && closeOnBackdrop && onClose) {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const items = getFocusable(containerRef.current);
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      if (prevActive && typeof prevActive.focus === 'function') {
        try { prevActive.focus(); } catch (_) {}
      }
    };
  }, [closeOnBackdrop, onClose]);

  const handleBackdropClick = (e) => {
    if (!closeOnBackdrop) return;
    if (e.target === e.currentTarget && onClose) onClose();
  };

  const backdropStyle = BACKDROPS[backdrop] ?? BACKDROPS.dark;
  const duration = reduced ? 0 : 320;

  return (
    <div
      ref={containerRef}
      role={role}
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex,
        ...backdropStyle,
        opacity: mounted ? 1 : 0,
        transition: `opacity ${duration}ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
