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
  { id: 'ed-01', src: '/cava/brand/editorial-01.jpg', aspect: '3/4', caption: 'Dans un monde brutal, j\'ai choisi ma silence.', place: 'Mykonos' },
  { id: 'ed-02', src: '/cava/brand/editorial-02.jpg', aspect: '4/5', caption: 'Prends soin de toi. Ça change tout.',           place: 'Patmos' },
  { id: 'ed-03', src: '/cava/brand/editorial-03.jpg', aspect: '3/4', caption: 'No bad days. La question qui cache la réponse.', place: 'Cadillac Ranch' },
  { id: 'ed-04', src: '/cava/brand/editorial-04.jpg', aspect: '3/4', caption: 'Mental health matters. Parlons-en.',             place: 'Manifeste' },
  { id: 'ed-05', src: '/cava/brand/editorial-05.jpg', aspect: '4/5', caption: 'ÇA VA ? — sous les montgolfières.',              place: 'Cappadoce' },
  { id: 'ed-06', src: '/cava/brand/editorial-06.jpg', aspect: '3/4', caption: 'Le chemin existe, même quand on ne le voit pas.', place: 'Maroc' },
  { id: 'ed-07', src: '/cava/brand/editorial-07.jpg', aspect: '3/4', caption: 'Sourire jaune. Lieu abandonné.',                  place: 'Industriel' },
  { id: 'ed-08', src: '/cava/brand/editorial-08.jpg', aspect: '4/5', caption: 'Rue de la santé mentale. Parlons plus, jugeons moins.', place: 'Paris' },
  { id: 'ed-09', src: '/cava/brand/editorial-09.jpg', aspect: '3/4', caption: 'Et c\'est OK.',                                    place: 'Paris' },
  { id: 'ed-10', src: '/cava/brand/editorial-10.jpg', aspect: '3/4', caption: 'On fait comme on peut. Et c\'est déjà bien.',    place: 'Tokyo' },
  { id: 'ed-11', src: '/cava/brand/editorial-11.jpg', aspect: '4/5', caption: 'Épuisé·e par l\'avenir.',                         place: 'Marrakech' },
  { id: 'ed-12', src: '/cava/brand/editorial-12.jpg', aspect: '3/4', caption: 'Ça va ?',                                         place: 'Lookbook' },
  { id: 'ed-13', src: '/cava/brand/editorial-13.jpg', aspect: '4/5', caption: 'Ça va ?',                                         place: 'Lookbook' },
  { id: 'ed-14', src: '/cava/brand/editorial-14.jpg', aspect: '3/4', caption: 'Ça va ?',                                         place: 'Lookbook' },
  { id: 'ed-15', src: '/cava/brand/editorial-15.jpg', aspect: '4/5', caption: 'Ça va ?',                                         place: 'Lookbook' },
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
          padding: 'calc(env(safe-area-inset-top, 0px) + 12px) 14px 12px',
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
            paddingLeft: 6,
          }}
        >
          ÇA VA ?<span style={{ opacity: 0.4, margin: '0 6px' }}>·</span>LOOKBOOK
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Fermer le lookbook"
          data-press
          style={{
            appearance: 'none',
            border: '0.5px solid rgba(26, 26, 47, 0.10)',
            background: 'rgba(255, 252, 245, 0.6)',
            color: 'var(--cava-ink)',
            fontSize: 16,
            cursor: 'pointer',
            width: 44,
            height: 44,
            minWidth: 44,
            minHeight: 44,
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            WebkitTapHighlightColor: 'transparent',
            flexShrink: 0,
          }}
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
                'radial-gradient(ellipse at 50% 50%, rgba(26,26,47,0.45) 0%, rgba(26,26,47,0.18) 45%, rgba(26,26,47,0) 70%), linear-gradient(180deg, rgba(244,240,232,0.55) 0%, rgba(244,240,232,0) 28%, rgba(244,240,232,0) 62%, rgba(244,240,232,0.78) 100%)',
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
                fontWeight: 500,
                color: '#FBF6E8',
                letterSpacing: '0.04em',
                textShadow: '0 1px 16px rgba(26,26,47,0.78), 0 0 4px rgba(26,26,47,0.55)',
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
              color: 'var(--ink-soft, #4A4A5F)',
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
              color: 'var(--ink-soft, #4A4A5F)',
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
            padding: '80px 24px calc(env(safe-area-inset-bottom, 0px) + 64px)',
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
            type="button"
            onClick={handleClose}
            data-press
            aria-label="Fermer le lookbook"
            style={{
              marginTop: 36,
              appearance: 'none',
              border: '1px solid rgba(26,26,47,0.32)',
              background: 'transparent',
              color: 'var(--cava-ink)',
              padding: '14px 32px',
              minHeight: 48,
              borderRadius: 999,
              fontFamily: 'var(--font-ui)',
              fontSize: 10,
              letterSpacing: 'var(--tracking-caps)',
              textTransform: 'uppercase',
              fontWeight: 600,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
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
          alt={photo.caption || photo.place || 'ÇA VA?'}
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
      {/* Fallback : place centered */}
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
            color: 'var(--ink-soft, #4A4A5F)',
            fontWeight: 600,
          }}
        >
          {photo.place}
        </div>
      )}
      {/* Caption : place tag top-left + italic quote bottom (always visible on mobile) */}
      {!error && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              padding: '3px 8px',
              borderRadius: 4,
              background: 'rgba(26,26,47,0.42)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              fontFamily: 'var(--font-ui)',
              fontSize: 8.5,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#FBF6E8',
              fontWeight: 600,
              opacity: showCaption ? 1 : 0,
              transition: 'opacity 240ms ease-out',
              pointerEvents: 'none',
            }}
          >
            {photo.place}
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              right: 10,
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 11.5,
              lineHeight: 1.3,
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              color: '#FBF6E8',
              opacity: showCaption ? 0.95 : 0,
              transition: 'opacity 240ms ease-out',
              textShadow: '0 1px 8px rgba(26,26,47,0.7)',
              pointerEvents: 'none',
            }}
          >
            « {photo.caption} »
          </div>
        </>
      )}
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
