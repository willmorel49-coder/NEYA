/* ============================================================
   Header — Sticky glass top bar avec back + titre + action
   ============================================================ */

import BackButton from './BackButton';

export default function Header({ title, onBack, action }) {
  return (
    <>
      {onBack && <BackButton onClick={onBack} />}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 70px 14px',
          background: 'rgba(238, 243, 248, 0.78)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: '0.5px solid rgba(194, 216, 232, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 64,
          textAlign: 'center',
        }}
      >
        {title && (
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 'clamp(22px, 5.5vw, 26px)',
              color: 'var(--blue-900)',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {title}
          </h1>
        )}
        {action && (
          <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }}>
            {action}
          </div>
        )}
      </header>
    </>
  );
}
