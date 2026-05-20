/* ============================================================
   Toggle — iOS-style switch
   ============================================================
   Pattern :
     <Toggle checked={bool} onChange={fn} label="..."
             color="blue|rose|violet" />
   ============================================================ */

import { useId } from 'react';
import { haptic } from '../../v2/state';

const GRADIENTS = {
  blue: 'linear-gradient(135deg, #1A5A7F, #2A8ABF)',
  rose: 'linear-gradient(135deg, #C87090, #E080A8)',
  violet: 'linear-gradient(135deg, #7F5A8A, #AF80BA)',
};

export default function Toggle({
  checked = false,
  onChange,
  label,
  color = 'blue',
  disabled = false,
  hapticOnToggle = true,
  id,
  style = {},
}) {
  const reactId = useId();
  const fieldId = id || `toggle-${reactId}`;
  const grad = GRADIENTS[color] ?? GRADIENTS.blue;

  const handleToggle = () => {
    if (disabled) return;
    if (hapticOnToggle) haptic(2);
    onChange?.(!checked);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        minHeight: 44,
        width: '100%',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
      onClick={handleToggle}
    >
      {label && (
        <label
          htmlFor={fieldId}
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 15,
            fontWeight: 400,
            lineHeight: 1.5,
            color: 'var(--text-secondary)',
            cursor: 'inherit',
            flex: 1,
            minWidth: 0,
          }}
        >
          {label}
        </label>
      )}

      <button
        type="button"
        role="switch"
        id={fieldId}
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
        style={{
          appearance: 'none',
          position: 'relative',
          width: 44,
          height: 26,
          padding: 0,
          background: checked ? grad : 'var(--blue-300)',
          border: 'none',
          borderRadius: 13,
          cursor: disabled ? 'not-allowed' : 'pointer',
          flexShrink: 0,
          transition: 'background 240ms cubic-bezier(0.22,0.61,0.36,1)',
          boxShadow: checked
            ? '0 2px 8px rgba(10, 36, 56, 0.18) inset'
            : '0 1px 3px rgba(10, 36, 56, 0.10) inset',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: 2,
            left: 2,
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: '#FFFFFF',
            boxShadow: '0 2px 6px rgba(10, 36, 56, 0.25), 0 1px 2px rgba(10, 36, 56, 0.10)',
            transform: checked ? 'translateX(18px)' : 'translateX(0)',
            transition: 'transform 240ms cubic-bezier(0.22,0.61,0.36,1)',
          }}
        />
      </button>
    </div>
  );
}
