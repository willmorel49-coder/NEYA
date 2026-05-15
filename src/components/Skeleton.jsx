/* ============================================================
   NÉYA — Skeleton.jsx
   ------------------------------------------------------------
   Reusable loading placeholder (Apple HIG).
   Shimmer animation via background-position translation.
   Respects prefers-reduced-motion (handled in tokens.css —
   .skeleton-base becomes a static muted rectangle).
   ============================================================ */

import React from 'react';

const VARIANT_DEFAULTS = {
  text:   { height: 14, radius: 4 },
  card:   { height: undefined, radius: 'var(--radius-lg, 22px)' },
  circle: { height: undefined, radius: '50%' },
  pill:   { height: undefined, radius: 'var(--radius-pill, 9999px)' },
};

export default function Skeleton({
  width = '100%',
  height,
  radius,
  variant = 'text',
  count = 1,
  gap = 8,
  style,
  className,
  ...rest
}) {
  const defaults = VARIANT_DEFAULTS[variant] || VARIANT_DEFAULTS.text;

  // Resolve dimensions
  let resolvedHeight = height ?? defaults.height ?? 14;
  let resolvedWidth = width;

  // For circle : ensure equal width/height
  if (variant === 'circle') {
    const size = height ?? width ?? 40;
    resolvedHeight = size;
    resolvedWidth = size;
  }

  const resolvedRadius = radius ?? defaults.radius ?? 4;

  const baseStyle = {
    width: typeof resolvedWidth === 'number' ? `${resolvedWidth}px` : resolvedWidth,
    height: typeof resolvedHeight === 'number' ? `${resolvedHeight}px` : resolvedHeight,
    borderRadius: typeof resolvedRadius === 'number' ? `${resolvedRadius}px` : resolvedRadius,
    display: 'block',
    flexShrink: 0,
    ...style,
  };

  const combinedClassName = ['skeleton-base', className].filter(Boolean).join(' ');

  if (count <= 1) {
    return (
      <span
        aria-hidden="true"
        role="presentation"
        className={combinedClassName}
        style={baseStyle}
        {...rest}
      />
    );
  }

  // Stacked skeletons with gap
  return (
    <span
      aria-hidden="true"
      role="presentation"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: `${gap}px`,
        width: baseStyle.width,
      }}
      {...rest}
    >
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={combinedClassName}
          style={{ ...baseStyle, width: '100%' }}
        />
      ))}
    </span>
  );
}
