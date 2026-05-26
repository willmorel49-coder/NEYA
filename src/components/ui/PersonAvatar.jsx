/* ============================================================
   PersonAvatar — Signature ÇA VA? (silhouette dos + cheveux teal)
   ============================================================
   SVG inline minimal pour usage dans coin haut-gauche du Ciel.
   Halo teal #12C4B0 pulsant en arrière.
============================================================ */

export default function PersonAvatar({ size = 36, style = {} }) {
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        ...style,
      }}
    >
      {/* Halo teal */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: -size * 0.3,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(18,196,176,0.30) 0%, transparent 70%)',
          animation: 'avatar-halo-pulse 4.2s ease-in-out infinite',
        }}
      />
      {/* Silhouette */}
      <svg
        viewBox="0 0 36 36"
        width={size}
        height={size}
        fill="none"
        style={{ position: 'relative' }}
      >
        {/* Tête + cheveux teal */}
        <circle cx="18" cy="13" r="5.5" fill="#12C4B0" />
        <path d="M12 13 Q 12 9, 18 8 Q 24 9, 24 13" fill="#12C4B0" opacity="0.6" />
        {/* Épaules / dos */}
        <path
          d="M8 30 Q 8 22, 14 19 L 22 19 Q 28 22, 28 30 Z"
          fill="rgba(251, 246, 232, 0.92)"
          stroke="rgba(251, 246, 232, 0.6)"
          strokeWidth="0.4"
        />
      </svg>
    </div>
  );
}
