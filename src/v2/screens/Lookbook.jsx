/* ============================================================
   NÉYA V2 — ÇA VA? Lookbook
   ============================================================
   Editorial immersive gallery for the capsule shooting.
   Pinterest-style 2-col irregular grid + hand-written quote
   interludes. Cream wash (#F4F0E8), Fraunces italic on quotes,
   Sora caps on marks + captions, Inter for body.
   Slide-up 420ms / slide-down 320ms. No bounce.
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { haptic } from '../state';

/* ----- Photo & capsule data ------------------------------ */

const PHOTOS = [
  { id: 'libre-hoodie',    src: '/cava/products/libre-hoodie.jpg',    aspect: '3/4', name: 'Hoodie crème',     price: 89, capsule: 'Libre' },
  { id: 'libre-tshirt',    src: '/cava/products/libre-tshirt.jpg',    aspect: '4/5', name: 'T-shirt broderie', price: 39, capsule: 'Libre' },
  { id: 'cava-sweat',      src: '/cava/products/cava-sweat.jpg',      aspect: '1/1', name: 'Sweat oversize',   price: 95, capsule: 'Ça Va' },
  { id: 'cava-tshirt',     src: '/cava/products/cava-tshirt.jpg',     aspect: '3/4', name: 'T-shirt poche',    price: 39, capsule: 'Ça Va' },
  { id: 'vr-hoodie',       src: '/cava/products/vr-hoodie.jpg',       aspect: '4/5', name: 'Hoodie manifeste', price: 95, capsule: 'Vraiment ?' },
  { id: 'vr-tshirt',       src: '/cava/products/vr-tshirt.jpg',       aspect: '1/1', name: 'T-shirt phrase',   price: 42, capsule: 'Vraiment ?' },
];

const CAPSULES = [
  {
    key: 'libre',
    name: 'Libre',
    accent: 'var(--cava-warm)',
    cover: '/cava/capsules/capsule-libre.png',
    tagline: 'Pour ceux qui se relèvent.',
  },
  {
    key: 'cava',
    name: 'Ça Va',
    accent: 'var(--cava-blue)',
    cover: '/cava/capsules/capsule-cava.png',
    tagline: 'Pour ceux qui n’ont pas besoin de mentir.',
  },
  {
    key: 'vraiment',
    name: 'Vraiment ?',
    accent: 'var(--cava-purple)',
    cover: '/cava/capsules/capsule-vraiment.png',
    tagline: 'Pour ceux qui osent la question.',
  },
];

const HERO_BG = '/cava/products/libre-hoodie.jpg';

/* ----- Component ----------------------------------------- */

export default function Lookbook({ onClose }) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    haptic([6]);
    return () => {};
  }, []);

  const handleClose = () => {
    haptic([4]);
    setClosing(true);
    setTimeout(() => onClose?.(), 320);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 950,
        background: '#F4F0E8',
        color: 'var(--cava-ink)',
        transform: closing
          ? 'translateY(100%)'
          : mounted ? 'translateY(0)' : 'translateY(100%)',
        transition: closing
          ? 'transform 320ms cubic-bezier(0.4, 0, 1, 1)'
          : 'transform 420ms cubic-bezier(0.16, 0.84, 0.44, 1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* ===== Sticky top bar ===== */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          background: 'rgba(244, 240, 232, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(26, 26, 47, 0.06)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 10,
            letterSpacing: 'var(--tracking-caps)',
            textTransform: 'uppercase',
            color: 'var(--cava-ink)',
            fontWeight: 600,
          }}
        >
          ÇA VA ?<span style={{ opacity: 0.4, margin: '0 6px' }}>·</span>LOOKBOOK
        </div>
        <button
          onClick={handleClose}
          aria-label="Fermer"
          style={{
            border: 'none',
            background: 'transparent',
            color: 'var(--cava-ink)',
            fontSize: 20,
            cursor: 'pointer',
            padding: 4,
            lineHeight: 1,
            transition: 'transform 120ms ease-out',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
          onTouchEnd={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          ✕
        </button>
      </header>

      {/* ===== Scrollable body ===== */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* ===== Section 1 — Hero shot ===== */}
        <section
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '4 / 5',
            background: `#E9E2D2 url(${HERO_BG}) center/cover no-repeat`,
            overflow: 'hidden',
          }}
        >
          {/* vignette gradient top + bottom */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(244,240,232,0.55) 0%, rgba(244,240,232,0) 28%, rgba(244,240,232,0) 62%, rgba(244,240,232,0.78) 100%)',
              pointerEvents: 'none',
            }}
          />
          {/* center text */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 22px',
              textAlign: 'center',
            }}
          >
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: 'clamp(32px, 9vw, 44px)',
                lineHeight: 1.12,
                color: '#FBF6E8',
                letterSpacing: '-0.01em',
                margin: 0,
                textShadow: '0 1px 24px rgba(26,26,47,0.32)',
              }}
            >
              « Tu n’as pas besoin{' '}
              <em
                className="neya-key"
                style={{ fontStyle: 'italic', fontWeight: 400 }}
              >
                d’aller bien.
              </em>{' '}
              »
            </h1>
            <p
              style={{
                marginTop: 18,
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                color: 'rgba(251, 246, 232, 0.84)',
                letterSpacing: '0.04em',
                textShadow: '0 1px 12px rgba(26,26,47,0.42)',
              }}
            >
              Capsule Libre · Printemps 2026
            </p>
          </div>
        </section>

        {/* ===== Section 2 — Pinterest 2-col irregular grid ===== */}
        <section
          style={{
            padding: '20px 12px 28px',
            background: '#F4F0E8',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              columnGap: 8,
            }}
          >
            {PHOTOS.map((p) => (
              <PhotoTile key={p.id} photo={p} />
            ))}
          </div>
        </section>

        {/* ===== Section 3 — Quote interlude (Hendrix) ===== */}
        <section
          style={{
            background: 'var(--cream-light, #FFFCF5)',
            padding: '64px 24px',
            textAlign: 'center',
            borderTop: '1px solid rgba(26,26,47,0.05)',
            borderBottom: '1px solid rgba(26,26,47,0.05)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 'clamp(22px, 6vw, 28px)',
              lineHeight: 1.32,
              color: 'var(--cava-ink)',
              letterSpacing: '-0.005em',
              margin: 0,
              maxWidth: 520,
              marginInline: 'auto',
            }}
          >
            « Quand le pouvoir de l’amour dépassera l’amour du pouvoir,
            le monde connaîtra la paix. »
          </p>
          <div
            style={{
              marginTop: 22,
              fontFamily: 'var(--font-ui)',
              fontSize: 9,
              letterSpacing: 'var(--tracking-caps)',
              textTransform: 'uppercase',
              color: 'var(--ink-whisper, #7A7A8C)',
              fontWeight: 600,
            }}
          >
            Jimi Hendrix
          </div>
        </section>

        {/* ===== Section 4 — Capsule trio ===== */}
        <section
          style={{
            padding: '36px 18px 24px',
            background: '#F4F0E8',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 9,
              letterSpacing: 'var(--tracking-caps)',
              textTransform: 'uppercase',
              color: 'var(--ink-whisper, #7A7A8C)',
              textAlign: 'center',
              marginBottom: 26,
              fontWeight: 600,
            }}
          >
            Les Trois Capsules
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            {CAPSULES.map((c) => (
              <CapsuleCard key={c.key} capsule={c} />
            ))}
          </div>
        </section>

        {/* ===== Section 5 — Manifest closer ===== */}
        <section
          style={{
            padding: '80px 24px 96px',
            background: 'var(--cream-light, #FFFCF5)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 'clamp(22px, 6.4vw, 26px)',
              lineHeight: 1.32,
              color: 'var(--cava-ink)',
              margin: 0,
            }}
          >
            « Briser le masque du <em style={{ fontWeight: 400 }}>ça va</em>. »
          </p>
          <button
            onClick={handleClose}
            style={{
              marginTop: 36,
              border: '1px solid rgba(26,26,47,0.32)',
              background: 'transparent',
              color: 'var(--cava-ink)',
              padding: '14px 32px',
              borderRadius: 999,
              fontFamily: 'var(--font-ui)',
              fontSize: 9,
              letterSpacing: 'var(--tracking-caps)',
              textTransform: 'uppercase',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'transform 120ms ease-out, background 180ms ease-out',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
            onTouchEnd={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Fermer
          </button>
        </section>
      </div>
    </div>
  );
}

/* ----- PhotoTile (with hover caption + fallback) ----- */

function PhotoTile({ photo }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [hover, setHover] = useState(false);

  // Detect coarse pointer (mobile) → always show caption
  const isCoarse =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(pointer: coarse)').matches;
  const showCaption = isCoarse || hover;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: photo.aspect,
        background: 'var(--cream-light, #FFFCF5)',
        borderRadius: 8,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 140ms ease-out',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
      onTouchEnd={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {!error && (
        <img
          src={photo.src}
          alt={photo.name}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 420ms ease-out',
          }}
        />
      )}
      {/* Fallback : caps name centered */}
      {error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 14px',
            textAlign: 'center',
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            letterSpacing: 'var(--tracking-caps)',
            textTransform: 'uppercase',
            color: 'var(--ink-whisper, #7A7A8C)',
            fontWeight: 600,
          }}
        >
          {photo.name}
        </div>
      )}
      {/* Caption (hover desktop / always mobile) */}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          right: 8,
          fontFamily: 'var(--font-ui)',
          fontSize: 9,
          letterSpacing: 'var(--tracking-caps)',
          textTransform: 'uppercase',
          color: error ? 'var(--ink-whisper)' : '#FBF6E8',
          fontWeight: 600,
          opacity: showCaption ? 1 : 0,
          transition: 'opacity 220ms ease-out',
          textShadow: error ? 'none' : '0 1px 6px rgba(26,26,47,0.55)',
          pointerEvents: 'none',
        }}
      >
        {photo.name} · {photo.price}€
      </div>
    </div>
  );
}

/* ----- CapsuleCard ----- */

function CapsuleCard({ capsule }) {
  const [error, setError] = useState(false);
  // V1 : tap = no action. TODO Will : tap → close lookbook + open capsule in CaVa.
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--cream-light, #FFFCF5)',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid rgba(26,26,47,0.05)',
        cursor: 'pointer',
        transition: 'transform 140ms ease-out',
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
      onTouchEnd={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 10',
          background: '#EFE7D5',
          overflow: 'hidden',
        }}
      >
        {!error ? (
          <img
            src={capsule.cover}
            alt={capsule.name}
            loading="lazy"
            onError={() => setError(true)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 28,
              color: capsule.accent,
            }}
          >
            {capsule.name}
          </div>
        )}
      </div>
      <div
        style={{
          padding: '16px 18px 18px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 24,
            fontWeight: 400,
            color: capsule.accent,
            lineHeight: 1.1,
          }}
        >
          {capsule.name}
        </div>
        <div
          style={{
            marginTop: 6,
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: 'var(--ink-soft, #4A4A5F)',
            lineHeight: 1.4,
          }}
        >
          {capsule.tagline}
        </div>
      </div>
    </div>
  );
}
