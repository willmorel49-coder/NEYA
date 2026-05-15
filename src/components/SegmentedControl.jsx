/* ============================================================
   SegmentedControl — NÉYA Design System v2 · Apple iOS HIG
   ============================================================
   Apple iOS-13+ style segmented control : grouped horizontal
   strip with a single sliding indicator highlighting the
   active segment. Distinct from pearl pills (one indicator,
   not many active states).

   Signature :
   <SegmentedControl
     segments={[{ value, label, icon?: string }, ...]}
     active="value"
     onChange={(value) => ...}
     accent="var(--ink)"
     size="md"            // 'sm' | 'md' | 'lg'
   />

   Constraints :
   - Cream-light palette (no #fff)
   - Sliding indicator behind active segment
   - Transition spring-subtle for tiny overshoot
   - haptic 4 on change
   - data-press on each segment
   ============================================================ */

import { haptic } from '../v2/state';

const SIZE_PRESETS = {
  sm: { padding: '6px 12px', font: 11 },
  md: { padding: '8px 14px', font: 12 },
  lg: { padding: '10px 18px', font: 13 },
};

export default function SegmentedControl({
  segments = [],
  active,
  onChange,
  accent = 'var(--ink)',
  size = 'md',
}) {
  const preset = SIZE_PRESETS[size] || SIZE_PRESETS.md;
  const activeIndex = Math.max(
    0,
    segments.findIndex((s) => s.value === active)
  );
  const count = segments.length || 1;
  const segmentWidthPct = 100 / count;

  const handleTap = (value) => {
    if (value === active) return;
    haptic(4);
    if (onChange) onChange(value);
  };

  // ── STYLES ──────────────────────────────────────────────
  const container = {
    position: 'relative',
    display: 'flex',
    alignItems: 'stretch',
    width: '100%',
    background: 'rgba(26, 26, 47, 0.06)',
    borderRadius: 'var(--radius-pill, 9999px)',
    padding: 3,
    boxSizing: 'border-box',
    WebkitTapHighlightColor: 'transparent',
  };

  // Sliding indicator behind active segment.
  // Width is computed from segment count, X is translated by activeIndex.
  const indicator = {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: 3,
    width: `calc((100% - 6px) / ${count})`,
    background: 'var(--cream-light)',
    borderRadius: 'var(--radius-pill, 9999px)',
    boxShadow: '0 1px 4px rgba(26, 26, 47, 0.10)',
    transform: `translateX(${activeIndex * 100}%)`,
    transition: 'transform 320ms var(--ease-spring-subtle)',
    pointerEvents: 'none',
    zIndex: 0,
  };

  const segmentBtn = (isActive) => ({
    appearance: 'none',
    background: 'transparent',
    border: 'none',
    flex: 1,
    minWidth: 0,
    padding: preset.padding,
    cursor: 'pointer',
    fontFamily: 'var(--font-ui, Sora)',
    fontSize: preset.font,
    fontWeight: 500,
    letterSpacing: '0.04em',
    color: isActive ? accent : 'var(--content-tertiary)',
    WebkitTapHighlightColor: 'transparent',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    lineHeight: 1.2,
    position: 'relative',
    zIndex: 1,
    transition: 'color 220ms var(--ease-out-ios)',
    whiteSpace: 'nowrap',
    textAlign: 'center',
  });

  return (
    <div
      style={container}
      role="tablist"
      aria-label="Segmented control"
    >
      {/* Sliding indicator */}
      <div style={indicator} aria-hidden="true" />

      {segments.map((seg) => {
        const isActive = seg.value === active;
        return (
          <button
            key={seg.value}
            data-press
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => handleTap(seg.value)}
            style={segmentBtn(isActive)}
          >
            {seg.icon && (
              <span
                aria-hidden="true"
                style={{
                  fontSize: preset.font + 2,
                  lineHeight: 1,
                  display: 'inline-flex',
                }}
              >
                {seg.icon}
              </span>
            )}
            <span>{seg.label}</span>
          </button>
        );
      })}
    </div>
  );
}
