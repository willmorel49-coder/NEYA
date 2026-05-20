/* ============================================================
   EmptyState — Pattern uniforme pour listes vides
   ============================================================
   - Container center, padding 48 vertical, gap 16
   - Icon 48×48 dans cercle 80×80 glass blur 24 + halo
   - Title : HeroTitle size="sm" var(--blue-900)
   - Description : Body var(--text-secondary), max 320, centré
   - Action en bas (optionnel)
   ============================================================ */

import Icon from './Icon';
import HeroTitle from './HeroTitle';
import Body from './Body';

export default function EmptyState({
  icon,
  iconNode,
  title,
  description,
  action,
  style = {},
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 16,
        padding: '48px 24px',
        ...style,
      }}
    >
      {(icon || iconNode) && (
        <div
          aria-hidden="true"
          style={{
            position: 'relative',
            width: 80,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* halo subtle var(--blue-100) */}
          <span
            style={{
              position: 'absolute',
              inset: -10,
              borderRadius: '50%',
              background: 'radial-gradient(circle at center, var(--blue-100) 0%, transparent 70%)',
              filter: 'blur(6px)',
              opacity: 0.65,
            }}
          />
          {/* cercle glass */}
          <span
            style={{
              position: 'relative',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.85)',
              boxShadow: '0 4px 24px rgba(10, 36, 56, 0.07)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--blue-700)',
            }}
          >
            {iconNode || <Icon name={icon} size={32} color="var(--blue-700)" strokeWidth={1.5} />}
          </span>
        </div>
      )}

      {title && (
        <div style={{ marginTop: 4 }}>
          <HeroTitle size="sm" color="primary">
            {title}
          </HeroTitle>
        </div>
      )}

      {description && (
        <div style={{ maxWidth: 320 }}>
          <Body variant="body-sm" style={{ textAlign: 'center' }}>
            {description}
          </Body>
        </div>
      )}

      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
}
