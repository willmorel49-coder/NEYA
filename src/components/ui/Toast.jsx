/* ============================================================
   Toast — Design System V4 (CA VA ?)
   ============================================================
   Composant Toast individuel (rendered par le ToastProvider).
   - Position fixed top sous header back button (safe-area + 84)
   - Background glass cream-light pearl + blur 24
   - Border-left 4px selon variant (info / success / warning / crisis)
   - Padding 14x18, radius 16, shadow doux
   - Icon 24x24 leading (optionnel)
   - Message Body variant body-sm
   - Action CTA size sm variant ghost (optionnel)
   - Close X 24x24 trailing si pas d'action
   - Entrance opacity 0->1 + translateY(-12)->0 sur 320ms apple ease
   - Exit opacity 0 + translateY(-8) sur 200ms
   - Auto-dismiss configurable (default 4000ms)
   ============================================================ */

import { useEffect, useRef, useState } from 'react';
import { haptic } from '../../v2/state';
import Body from './Body';
import CTA from './CTA';

const EASE_OUT_APPLE = 'cubic-bezier(0.32, 0.72, 0, 1)';
const EASE_IN_APPLE  = 'cubic-bezier(0.32, 0, 0.72, 1)';

/* ============================================================
   Variants : border-left color
   ============================================================ */
const VARIANTS = {
  info: {
    borderColor: 'var(--blue-700)',
    iconColor: 'var(--blue-700)',
    defaultIcon: '○',
  },
  success: {
    borderColor: '#34917F',
    iconColor: '#34917F',
    defaultIcon: '✓',
  },
  warning: {
    borderColor: 'var(--rose-500)',
    iconColor: 'var(--rose-500)',
    defaultIcon: '!',
  },
  crisis: {
    borderColor: 'var(--rose-700)',
    iconColor: 'var(--rose-700)',
    defaultIcon: '⚠',
  },
};

export default function Toast({
  message,
  variant = 'info',
  icon,
  action,
  duration = 4000,
  onDismiss,
  topOffset = 0,
}) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const autoTimerRef = useRef(null);
  const exitTimerRef = useRef(null);

  const v = VARIANTS[variant] ?? VARIANTS.info;
  const displayIcon = icon !== undefined ? icon : v.defaultIcon;

  // Entrance after first paint
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setTimeout(() => setMounted(true), 16);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Auto-dismiss
  useEffect(() => {
    if (duration === Infinity || duration === 0) return undefined;
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
    }, 200);
  };

  const handleClose = () => {
    haptic(4);
    triggerDismiss();
  };

  const handleAction = () => {
    haptic(4);
    if (action?.onTap) action.onTap();
    triggerDismiss();
  };

  const wrapperStyle = {
    position: 'fixed',
    top: `calc(env(safe-area-inset-top, 0px) + 84px + ${topOffset}px)`,
    left: '50%',
    transform: `translateX(-50%) translateY(${mounted ? '0px' : closing ? '-8px' : '-12px'})`,
    opacity: mounted ? 1 : 0,
    transition: `transform ${closing ? 200 : 320}ms ${closing ? EASE_IN_APPLE : EASE_OUT_APPLE}, opacity ${closing ? 200 : 320}ms ${closing ? EASE_IN_APPLE : EASE_OUT_APPLE}`,
    zIndex: 300,
    pointerEvents: 'auto',
    width: 'min(420px, calc(100vw - 32px))',
    maxWidth: 'calc(100vw - 32px)',
  };

  const cardStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 18px',
    borderRadius: 16,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(24px) saturate(160%)',
    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
    border: '0.5px solid var(--blue-300)',
    borderLeft: `4px solid ${v.borderColor}`,
    boxShadow: '0 12px 32px rgba(10, 36, 56, 0.18)',
    WebkitTapHighlightColor: 'transparent',
  };

  const iconWrap = {
    width: 24,
    height: 24,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: v.iconColor,
    fontSize: 16,
    lineHeight: 1,
  };

  const closeBtnStyle = {
    appearance: 'none',
    border: 'none',
    background: 'transparent',
    width: 24,
    height: 24,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: 0,
    fontSize: 18,
    lineHeight: 1,
    WebkitTapHighlightColor: 'transparent',
  };

  return (
    <div style={wrapperStyle} role="status" aria-live="polite">
      <div style={cardStyle}>
        {displayIcon && (
          <span style={iconWrap} aria-hidden="true">
            {displayIcon}
          </span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Body variant="body-sm" style={{ color: 'var(--blue-900)' }}>
            {message}
          </Body>
        </div>
        {action ? (
          <CTA size="sm" variant="ghost" onClick={handleAction}>
            {action.label}
          </CTA>
        ) : (
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fermer"
            style={closeBtnStyle}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
