/* ============================================================
   ContextMenu — ÇA VA ? Design System v2 · Apple iOS HIG
   ============================================================
   iOS-style long-press context menu : full-screen scrim +
   floating menu card anchored at the touch position. Items
   with optional icon, default or destructive role. Menu is
   clamped within viewport so it never goes off-screen.

   Signature :
   <ContextMenu
     isOpen={bool}
     position={{ x, y }}
     items={[{ label, role?: 'default'|'destructive', icon?, onTap }]}
     onClose={() => ...}
   />

   Constraints :
   - Cream-light palette (no #fff)
   - Scrim fade 200ms · menu scale 0.92→1 + opacity over 240ms spring-subtle
   - Close reverse 200ms ease-out-ios
   - haptic 4 (default) / 6 (destructive)
   - data-press on rows
   ============================================================ */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { haptic } from '../v2/state';

const MENU_WIDTH = 220;
const VIEWPORT_PADDING = 12;

export default function ContextMenu({
  isOpen,
  position,
  items = [],
  onClose,
}) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [clamped, setClamped] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);

  // Entry animation : flip mounted true after first paint.
  useEffect(() => {
    if (!isOpen) return;
    setClosing(false);
    const id = requestAnimationFrame(() => {
      setTimeout(() => setMounted(true), 16);
    });
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  // Clamp the menu position within the viewport — measured after layout.
  useLayoutEffect(() => {
    if (!isOpen || !position) return;
    const vw = typeof window !== 'undefined' ? window.innerWidth : 375;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 667;
    // Estimate height : 12px pad-top + (rowHeight ~ 44) * items + 12 pad-bot.
    const estHeight = Math.min(vh - 2 * VIEWPORT_PADDING, 24 + items.length * 44);
    let x = position.x;
    let y = position.y;
    // Clamp x : ensure x + width fits + padding on both sides.
    x = Math.min(Math.max(VIEWPORT_PADDING, x), vw - MENU_WIDTH - VIEWPORT_PADDING);
    // Clamp y : ensure y + height fits + padding.
    y = Math.min(Math.max(VIEWPORT_PADDING, y), vh - estHeight - VIEWPORT_PADDING);
    setClamped({ x, y });
  }, [isOpen, position, items.length]);

  const triggerClose = () => {
    if (closing) return;
    setClosing(true);
    setMounted(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 200);
  };

  const handleScrim = (e) => {
    e.stopPropagation();
    triggerClose();
  };

  const handleItem = (item) => {
    if (item.role === 'destructive') haptic(6);
    else haptic(4);
    if (item.onTap) item.onTap();
    triggerClose();
  };

  if (!isOpen) return null;

  // ── STYLES ──────────────────────────────────────────────
  const scrim = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(26, 26, 47, 0.30)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 1100,
    opacity: mounted ? 1 : 0,
    transition: 'opacity 200ms var(--ease-out-ios)',
    pointerEvents: 'auto',
  };

  const menuCard = {
    position: 'fixed',
    left: clamped.x,
    top: clamped.y,
    width: MENU_WIDTH,
    minWidth: MENU_WIDTH,
    background: 'rgba(255, 252, 245, 0.96)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '0.5px solid rgba(26, 26, 47, 0.08)',
    borderRadius: 'var(--radius-md, 14px)',
    boxShadow: '0 12px 40px rgba(26, 26, 47, 0.18)',
    overflow: 'hidden',
    zIndex: 1101,
    transform: mounted ? 'scale(1)' : 'scale(0.92)',
    opacity: mounted ? 1 : 0,
    transformOrigin: 'top left',
    transition: closing
      ? 'transform 200ms var(--ease-out-ios), opacity 200ms var(--ease-out-ios)'
      : 'transform 240ms var(--ease-spring-subtle), opacity 240ms var(--ease-out-ios)',
  };

  const rowStyle = (role) => ({
    appearance: 'none',
    background: 'transparent',
    border: 'none',
    width: '100%',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    cursor: 'pointer',
    fontFamily: 'var(--font-ui, Sora)',
    fontSize: 14,
    fontWeight: 500,
    color: role === 'destructive' ? 'var(--crisis)' : 'var(--ink)',
    WebkitTapHighlightColor: 'transparent',
    textAlign: 'left',
    lineHeight: 1.2,
  });

  const iconStyle = {
    fontSize: 18,
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    flexShrink: 0,
  };

  const hairline = {
    height: '0.5px',
    background: 'var(--hairline-faint, rgba(26, 26, 47, 0.06))',
    width: '100%',
  };

  return (
    <>
      <div style={scrim} onClick={handleScrim} role="presentation" />
      <div
        ref={menuRef}
        style={menuCard}
        role="menu"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {items.map((item, i) => (
          <div key={i}>
            <button
              data-press
              type="button"
              role="menuitem"
              onClick={() => handleItem(item)}
              style={rowStyle(item.role)}
            >
              {item.icon && (
                <span style={iconStyle} aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span style={{ flex: 1 }}>{item.label}</span>
            </button>
            {i < items.length - 1 && <div style={hairline} />}
          </div>
        ))}
      </div>
    </>
  );
}
