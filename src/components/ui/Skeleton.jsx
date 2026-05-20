/* ============================================================
   Skeleton — Loading placeholder (V4)
   ============================================================
   - background : linear-gradient shimmer (blue-100 tones)
   - animation : skeleton-shimmer 1.6s ease-in-out infinite
   - prefers-reduced-motion : static opacity, sans animation
   ----------------------------------------------------------------
   Variants exportés :
     - Skeleton (base)
     - SkeletonText
     - SkeletonCard
   ============================================================ */

const BASE_STYLE = {
  display: 'block',
  flexShrink: 0,
  background:
    'linear-gradient(90deg, rgba(194,216,232,0.20) 0%, rgba(194,216,232,0.40) 50%, rgba(194,216,232,0.20) 100%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-shimmer 1.6s ease-in-out infinite',
};

export default function Skeleton({
  width = '100%',
  height = 14,
  radius = 6,
  style = {},
  ...rest
}) {
  return (
    <span
      aria-hidden="true"
      role="presentation"
      className="skeleton-base"
      style={{
        ...BASE_STYLE,
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: typeof radius === 'number' ? `${radius}px` : radius,
        ...style,
      }}
      {...rest}
    />
  );
}

export function SkeletonText({
  lines = 3,
  gap = 8,
  height = 12,
  lastLineWidth = '60%',
  style = {},
}) {
  const n = Math.max(1, Math.min(5, lines));
  return (
    <span
      aria-hidden="true"
      role="presentation"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: `${gap}px`,
        width: '100%',
        ...style,
      }}
    >
      {Array.from({ length: n }).map((_, i) => {
        const isLast = i === n - 1;
        return (
          <Skeleton
            key={i}
            height={height}
            width={isLast && n > 1 ? lastLineWidth : '100%'}
            radius={4}
          />
        );
      })}
    </span>
  );
}

export function SkeletonCard({ style = {} }) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: 16,
        borderRadius: 20,
        background: 'rgba(255, 255, 255, 0.55)',
        border: '1px solid rgba(255, 255, 255, 0.7)',
        ...style,
      }}
    >
      <Skeleton width={48} height={48} radius="50%" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton height={12} width="80%" />
        <Skeleton height={12} width="55%" />
      </div>
    </div>
  );
}
