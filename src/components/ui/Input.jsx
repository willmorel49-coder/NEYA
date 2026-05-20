/* ============================================================
   Input — Single-line glass input avec accent border-left
   ============================================================
   Pattern :
     <Input value="" onChange={...} placeholder="..." label="..."
            type="text|email|tel|search"
            accent="blue|rose|violet" size="sm|md|lg"
            error={...} prefix={<Icon/>} suffix={<Icon/>} />
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

const SIZES = {
  sm: { height: 40, fontSize: 14, padX: 16, padY: 10 },
  md: { height: 48, fontSize: 15, padX: 18, padY: 14 },
  lg: { height: 56, fontSize: 16, padX: 20, padY: 16 },
};

const Input = forwardRef(function Input(
  {
    value,
    onChange,
    placeholder = '',
    label,
    type = 'text',
    accent = 'blue',
    size = 'md',
    error,
    prefix,
    suffix,
    disabled = false,
    maxLength,
    autoFocus = false,
    inputMode,
    name,
    id,
    onBlur,
    onFocus,
    style = {},
    inputStyle = {},
    ...rest
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const reactId = useId();
  const fieldId = id || `input-${reactId}`;
  const accentColor = ACCENTS[accent] ?? ACCENTS.blue;
  const focusAccent = error ? ACCENTS.rose : accentColor;
  const focusShadow = error ? FOCUS_SHADOWS.rose : (FOCUS_SHADOWS[accent] ?? FOCUS_SHADOWS.blue);
  const s = SIZES[size] ?? SIZES.md;

  const borderLeftWidth = focused || error ? 4 : 3;
  const borderLeftColor = error ? ACCENTS.rose : focused ? focusAccent : accentColor;

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
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minHeight: s.height,
          padding: `${s.padY}px ${s.padX}px`,
          paddingLeft: s.padX + (borderLeftWidth - 3),
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
        {prefix && (
          <span
            aria-hidden
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              flexShrink: 0,
              color: 'var(--text-muted)',
            }}
          >
            {prefix}
          </span>
        )}

        <input
          ref={ref}
          id={fieldId}
          name={name}
          type={type}
          inputMode={inputMode}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          autoFocus={autoFocus}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          style={{
            flex: 1,
            minWidth: 0,
            appearance: 'none',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: 400,
            fontSize: s.fontSize,
            lineHeight: 1.4,
            color: 'var(--blue-900)',
            padding: 0,
            ...inputStyle,
          }}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...rest}
        />

        {suffix && (
          <span
            aria-hidden
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              flexShrink: 0,
              color: 'var(--text-muted)',
            }}
          >
            {suffix}
          </span>
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

export default Input;
