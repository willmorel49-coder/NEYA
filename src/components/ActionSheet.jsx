/* ============================================================
   ActionSheet — NÉYA Design System v2 · Apple iOS HIG
   ============================================================
   iOS-style bottom action sheet : two stacked grouped cards
   (Actions + Cancel), 8px gap, slide-up animation 360ms,
   staggered 40ms. Backdrop tap = dismiss.

   Signature :
   <ActionSheet
     title="..."             // optional
     description="..."       // optional
     actions={[
       { label, role: 'default'|'destructive', icon?, onTap },
     ]}
     cancelLabel="Annuler"
     onClose={() => ...}
   />

   Constraints respected :
   - Cream-light palette (no #fff), ink text
   - data-press scale(0.95)
   - No bounce / spring rebound
   - Haptic 6 (destructive) / 4 (default + cancel)
   ============================================================ */

import { useState, useEffect } from 'react';
import { haptic } from '../v2/state';
import useStandardOverlay from '../v2/hooks/useStandardOverlay';

const EASE_OUT_IOS = 'cubic-bezier(0.32, 0.72, 0, 1)';
const EASE_IN_IOS  = 'cubic-bezier(0.32, 0, 0.72, 1)';

export default function ActionSheet({
  title,
  description,
  actions = [],
  cancelLabel = 'Annuler',
  onClose,
}) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);

  // Entry animation : flip mounted true after first paint.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setTimeout(() => setMounted(true), 30);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const triggerClose = () => {
    if (closing) return;
    setClosing(true);
    setMounted(false);
    // Wait for slide-down to finish before unmounting via parent.
    setTimeout(() => {
      if (onClose) onClose();
    }, 280);
  };

  const handleBackdrop = () => {
    haptic(4);
    triggerClose();
  };

  const handleAction = (action) => {
    if (action.role === 'destructive') haptic(6);
    else haptic(4);
    if (action.onTap) action.onTap();
    triggerClose();
  };

  const handleCancel = () => {
    haptic(4);
    triggerClose();
  };

  // Comportement iOS standard (scroll lock body + ESC + focus trap + ARIA)
  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closing,
    onClose: triggerClose,
    labelText: title || 'Confirmer une action',
  });

  // ── STYLES ──────────────────────────────────────────────
  const backdrop = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(26, 26, 47, 0.40)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    pointerEvents: 'auto',
    opacity: mounted ? 1 : 0,
    transition: `opacity 240ms ${closing ? EASE_IN_IOS : 'ease'}`,
    padding: '0 8px calc(env(safe-area-inset-bottom, 0px) + 12px)',
  };

  const sheetWrap = {
    width: '100%',
    maxWidth: 520,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    pointerEvents: 'auto',
  };

  const group = {
    background: 'var(--cream-light)',
    borderRadius: 'var(--radius-lg, 22px)',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(26, 26, 47, 0.10)',
  };

  const groupActionsStyle = {
    ...group,
    transform: mounted ? 'translateY(0)' : 'translateY(100%)',
    transition: `transform ${closing ? 280 : 360}ms ${closing ? EASE_IN_IOS : EASE_OUT_IOS}`,
  };

  const groupCancelStyle = {
    ...group,
    transform: mounted ? 'translateY(0)' : 'translateY(100%)',
    transition: `transform ${closing ? 280 : 360}ms ${closing ? EASE_IN_IOS : EASE_OUT_IOS}`,
    transitionDelay: closing ? '0ms' : '40ms',
  };

  const headerStyle = {
    padding: description ? '14px 22px 4px 22px' : '14px 22px 12px 22px',
    fontFamily: 'var(--font-ui, Sora)',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--ink-soft)',
    textAlign: 'center',
    lineHeight: 1.3,
  };

  const descStyle = {
    padding: '0 22px 14px 22px',
    fontFamily: 'var(--font-body, Inter)',
    fontSize: 12,
    color: 'var(--ink-soft)',
    textAlign: 'center',
    lineHeight: 1.4,
  };

  const hairline = {
    height: '0.5px',
    background: 'rgba(26, 26, 47, 0.08)',
    width: '100%',
  };

  const rowStyle = (role) => ({
    appearance: 'none',
    background: 'transparent',
    border: 'none',
    width: '100%',
    minHeight: 52,
    padding: '16px 22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    fontFamily: 'var(--font-ui, Sora)',
    fontSize: 17,
    fontWeight: role === 'destructive' ? 500 : 500,
    color: role === 'destructive' ? 'var(--crisis)' : 'var(--ink)',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
    letterSpacing: '-0.01em',
    lineHeight: 1.2,
  });

  const cancelRowStyle = {
    appearance: 'none',
    background: 'transparent',
    border: 'none',
    width: '100%',
    minHeight: 52,
    padding: '16px 22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-ui, Sora)',
    fontSize: 17,
    fontWeight: 600,
    color: 'var(--ink)',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
    letterSpacing: '-0.01em',
    lineHeight: 1.2,
  };

  const iconStyle = {
    fontSize: 17,
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
  };

  // Whether the header block (title / description) takes a slot at the top
  // of the actions group. If yes, no divider after the header block.
  const hasHeader = Boolean(title || description);

  return (
    <div
      style={backdrop}
      onClick={handleBackdrop}
      role="presentation"
    >
      <div
        ref={containerRef}
        {...dialogProps}
        style={sheetWrap}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Group 1 — Header + actions */}
        <div style={groupActionsStyle}>
          {hasHeader && (
            <>
              {title && <div style={headerStyle}>{title}</div>}
              {description && <div style={descStyle}>{description}</div>}
              {actions.length > 0 && <div style={hairline} />}
            </>
          )}
          {actions.map((action, i) => (
            <div key={i}>
              <button
                data-press
                type="button"
                onClick={() => handleAction(action)}
                style={rowStyle(action.role)}
              >
                {action.icon && (
                  <span style={iconStyle} aria-hidden="true">
                    {action.icon}
                  </span>
                )}
                <span>{action.label}</span>
              </button>
              {i < actions.length - 1 && <div style={hairline} />}
            </div>
          ))}
        </div>

        {/* Group 2 — Cancel */}
        <div style={groupCancelStyle}>
          <button
            data-press
            type="button"
            onClick={handleCancel}
            style={cancelRowStyle}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
