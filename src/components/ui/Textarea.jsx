/* ============================================================
   Textarea — Multiline glass input avec accent border-left
   ============================================================
   Pattern :
     <Textarea value="" onChange={...} placeholder="..." rows={4}
               maxLength={280} accent="blue|rose|violet"
               showCounter={true} error={...} />
   ============================================================ */

import { useState, useId, forwardRef } from 'react';
import Eyebrow from './Eyebrow';

const ACCENTS = {
  blue: 'var(--blue-700)',
  rose: 'var(--rose-700)',
  violet: 'var(--violet)',
};

const FOCUS_SHADOWS = {
  blue: '0 0 0 4px rgba(26, 90, 127, 0.10)',
  rose: '0 0 0 4px rgba(200, 112, 144, 0.10)',
  violet: '0 0 0 4px rgba(127, 90, 138, 0.10)',
};

const Textarea = forwardRef(function Textarea(
  {
    value,
    onChange,
    placeholder = '',
    label,
    rows = 4,
    maxLength,
    accent = 'blue',
    showCounter = false,
    error,
    disabled = false,
    autoFocus = false,
    name,
    id,
    onBlur,
    onFocus,
    style = {},
    textareaStyle = {},
    ...rest
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const reactId = useId();
  const fieldId = id || `textarea-${reactId}`;
  const accentColor = ACCENTS[accent] ?? ACCENTS.blue;
  const focusAccent = error ? ACCENTS.rose : accentColor;
  const focusShadow = error ? FOCUS_SHADOWS.rose : (FOCUS_SHADOWS[accent] ?? FOCUS_SHADOWS.blue);

  const borderLeftWidth = focused || error ? 4 : 3;
  const borderLeftColor = error ? ACCENTS.rose : focused ? focusAccent : accentColor;

  const valLength = typeof value === 'string' ? value.length : 0;
  const nearMax = maxLength && (maxLength - valLength) < Math.max(1, Math.floor(maxLength * 0.1));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', ...style }}>
      {label && (
        <label htmlFor={fieldId}>
          <Eyebrow color="muted">{label}</Eyebrow>
        </label>
      )}

      <div
        style={{
          position: 'relative',
          width: '100%',
          padding: '16px 18px',
          paddingLeft: 18 + (borderLeftWidth - 3),
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          border: '1px solid rgba(255, 255, 255, 0.85)',
          borderLeft: `${borderLeftWidth}px solid ${borderLeftColor}`,
          borderRadius: 16,
          boxShadow: focused
            ? focusShadow
            : '0 4px 24px rgba(10, 36, 56, 0.07)',
          transition: 'border 240ms cubic-bezier(0.22,0.61,0.36,1), box-shadow 240ms cubic-bezier(0.22,0.61,0.36,1)',
          opacity: disabled ? 0.6 : 1,
          boxSizing: 'border-box',
        }}
      >
        <textarea
          ref={ref}
          id={fieldId}
          name={name}
          rows={rows}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          autoFocus={autoFocus}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            appearance: 'none',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: 400,
            fontSize: 15,
            lineHeight: 1.6,
            color: 'var(--blue-900)',
            padding: 0,
            margin: 0,
            paddingBottom: showCounter ? 18 : 0,
            ...textareaStyle,
          }}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...rest}
        />

        {showCounter && maxLength && (
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              right: 14,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 11,
              fontWeight: 500,
              color: nearMax ? 'var(--rose-700)' : 'var(--text-muted)',
              fontVariantNumeric: 'tabular-nums',
              pointerEvents: 'none',
              transition: 'color 240ms cubic-bezier(0.22,0.61,0.36,1)',
            }}
          >
            {valLength}/{maxLength}
          </div>
        )}
      </div>

      {error && (
        <div
          id={`${fieldId}-error`}
          role="alert"
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 11,
            fontWeight: 500,
            lineHeight: 1.4,
            color: 'var(--rose-700)',
            marginTop: 2,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
});

export default Textarea;
