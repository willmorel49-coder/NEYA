/* ============================================================
   ÇA VA? — Onglet Marque V6 (page courte intentionnelle)
   ============================================================
   Refonte radicale post-V5 : 2005 → ~350 lignes.
   Une page-repère entre deux check-ins. Pas un magazine.

   Sections :
     1. Hero typographique (cover photo + manifeste anchor)
     2. Manifeste court (3 paragraphes)
     3. Citations (3 anchors poétiques)
     4. Sélection visuelle (8 photos brand, grille 2×4)
     5. CTA externe → cava-brand.com
     6. Pied de page

   Anti-pattern ROBOT.md "scroll infini sur ÇA VA?" → page
   condensée. L'utilisateur arrive ici depuis BottomNav V6 ;
   pas de bouton retour (la nav reste visible).
   ============================================================ */

import { useEffect, useRef, useState, useCallback } from 'react';
import { haptic } from '../state';
import { Eyebrow, HeroTitle, SectionTitle, Body, CTA, Overlay } from '../../components/ui';

const EXTERNAL_URL = 'https://www.cava-brand.com';
const PHOTO = (n) => `/cava/brand/cava-${String(n).padStart(3, '0')}.jpg`;

/* Sélection curatée : 8 photos emblématiques parmi les 120 */
const SELECTION = [
  { id: 1,  src: PHOTO(1),  alt: 'ÇA VA? — pièce signature' },
  { id: 7,  src: PHOTO(7),  alt: 'ÇA VA? — détail brand' },
  { id: 12, src: PHOTO(12), alt: 'ÇA VA? — édito' },
  { id: 23, src: PHOTO(23), alt: 'ÇA VA? — silhouette' },
  { id: 34, src: PHOTO(34), alt: 'ÇA VA? — texture' },
  { id: 48, src: PHOTO(48), alt: 'ÇA VA? — atelier' },
  { id: 67, src: PHOTO(67), alt: 'ÇA VA? — campagne' },
  { id: 89, src: PHOTO(89), alt: 'ÇA VA? — broderie' },
];

/* Citations anchors (sélectionnées depuis citations.js, ids 19, 21, 20) */
const ANCHORS = [
  {
    text: "Au milieu de l'hiver, j'apprenais enfin qu'il y avait en moi un été invincible.",
    author: 'Albert Camus',
  },
  {
    text: "Même si le bonheur vous oublie un peu, ne l'oubliez jamais complètement.",
    author: 'Jacques Prévert',
  },
  {
    text: "L'anxiété est une bête irrationnelle.",
    author: 'Matt Haig',
  },
];

/* ============================================================
   PhotoLightbox — viewer inline simple (tap → image plein écran)
   ============================================================ */

function PhotoLightbox({ photo, onClose }) {
  if (!photo) return null;
  return (
    <Overlay onClose={onClose} backdrop="dark" ariaLabel={photo.alt}>
      <button
        type="button"
        onClick={() => { haptic(3); onClose(); }}
        aria-label="Fermer"
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 14px)',
          right: 14,
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.25)',
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          color: '#fff',
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 18,
          fontWeight: 300,
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ✕
      </button>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          boxSizing: 'border-box',
        }}
      >
        <img
          src={photo.src}
          alt={photo.alt}
          decoding="async"
          style={{
            maxWidth: '100%',
            maxHeight: '88vh',
            objectFit: 'contain',
            borderRadius: 12,
            boxShadow: '0 18px 56px rgba(0, 0, 0, 0.55)',
          }}
        />
      </div>
    </Overlay>
  );
}

/* ============================================================
   CaVa — Onglet Marque V6
   ============================================================ */

export default function CaVa(/* onClose ignoré : BottomNav V6 */) {
  const [lightbox, setLightbox] = useState(null);
  const heroImgRef = useRef(null);

  /* Fade-in séquentiel des sections au mount */
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setRevealed(true), 80);
    return () => window.clearTimeout(id);
  }, []);

  const openLightbox = useCallback((photo) => {
    haptic(4);
    setLightbox(photo);
  }, []);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  const openExternal = useCallback(() => {
    haptic(4);
    window.open(EXTERNAL_URL, '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <div
      style={{
        minHeight: '100%',
        background: 'var(--bg, #EEF3F8)',
        color: 'var(--ink, var(--blue-900))',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
        opacity: revealed ? 1 : 0,
        transition: 'opacity 520ms cubic-bezier(0.22, 0.61, 0.36, 1)',
      }}
    >
      {/* ── 1. Hero typographique avec photo signature ────────── */}
      <section
        style={{
          position: 'relative',
          height: 'clamp(360px, 64vh, 520px)',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #0F2434 0%, #1A3C52 100%)',
        }}
      >
        <img
          ref={heroImgRef}
          src={PHOTO(1)}
          alt=""
          aria-hidden="true"
          decoding="async"
          loading="eager"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.62,
            filter: 'saturate(0.85) contrast(1.04)',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(10,24,36,0.10) 0%, rgba(10,24,36,0.55) 70%, rgba(10,24,36,0.82) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 'clamp(28px, 6vw, 48px)',
            padding: '0 clamp(20px, 6vw, 32px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <Eyebrow color="rose" style={{ color: 'rgba(255,255,255,0.78)' }}>
            La marque
          </Eyebrow>
          <HeroTitle size="lg" color="white">
            ÇA VA?
          </HeroTitle>
          <p
            style={{
              margin: 0,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 'clamp(17px, 4.4vw, 21px)',
              lineHeight: 1.35,
              color: 'rgba(255,255,255,0.86)',
              maxWidth: 560,
              textWrap: 'balance',
            }}
          >
            « ça va » — la phrase la plus mensongère du monde.
          </p>
        </div>
      </section>

      {/* ── 2. Manifeste court (3 paragraphes) ───────────────── */}
      <section
        style={{
          padding: 'clamp(40px, 9vw, 64px) clamp(20px, 6vw, 32px) clamp(24px, 6vw, 40px)',
          maxWidth: 640,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
        }}
      >
        <Eyebrow color="rose">Manifeste</Eyebrow>
        <SectionTitle>Pour celles et ceux qui disent ça va quand ça ne va pas.</SectionTitle>
        <Body>
          ÇA VA? est née d'une phrase qu'on murmure trop souvent sans y croire. Une marque, puis
          une app — toutes deux pensées comme un endroit où poser le masque, doucement.
        </Body>
        <Body>
          Le vêtement porte les mots qu'on n'ose pas dire. L'app, elle, ouvre un espace pour les
          dire à soi-même. Pas de score, pas de comparaison. Juste un rendez-vous tendre avec ce
          qui passe en toi.
        </Body>
        <Body>
          On ne soigne rien. On accompagne. Tu n'as pas besoin d'aller bien pour commencer — il
          suffit d'être là, une minute, et de répondre vraiment à la question.
        </Body>
      </section>

      {/* ── 3. Citations anchors ─────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(24px, 6vw, 40px) clamp(20px, 6vw, 32px)',
          maxWidth: 640,
          margin: '0 auto',
        }}
      >
        <Eyebrow color="rose" style={{ marginBottom: 24 }}>
          Inspirations
        </Eyebrow>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {ANCHORS.map((q, i) => (
            <li
              key={i}
              style={{
                padding: '22px 0',
                borderTop: i === 0 ? '1px solid rgba(10,36,56,0.10)' : 'none',
                borderBottom: '1px solid rgba(10,36,56,0.10)',
              }}
            >
              <blockquote
                style={{
                  margin: 0,
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: 'italic',
                  fontWeight: 300,
                  fontSize: 'clamp(20px, 5.2vw, 26px)',
                  lineHeight: 1.32,
                  color: 'var(--blue-900)',
                  textWrap: 'pretty',
                }}
              >
                « {q.text} »
              </blockquote>
              <cite
                style={{
                  display: 'block',
                  marginTop: 10,
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontStyle: 'normal',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                }}
              >
                — {q.author}
              </cite>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 4. Sélection visuelle (grille 2×4) ───────────────── */}
      <section
        style={{
          padding: 'clamp(32px, 7vw, 48px) clamp(20px, 6vw, 32px) clamp(24px, 6vw, 40px)',
          maxWidth: 720,
          margin: '0 auto',
        }}
      >
        <Eyebrow color="rose" style={{ marginBottom: 8 }}>
          Sélection
        </Eyebrow>
        <SectionTitle style={{ marginBottom: 22 }}>Quelques pièces.</SectionTitle>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'clamp(8px, 2.4vw, 14px)',
          }}
        >
          {SELECTION.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => openLightbox(photo)}
              aria-label={`Voir : ${photo.alt}`}
              style={{
                appearance: 'none',
                border: 'none',
                padding: 0,
                margin: 0,
                background: 'rgba(10,36,56,0.04)',
                borderRadius: 14,
                overflow: 'hidden',
                aspectRatio: '3 / 4',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                minHeight: 44,
                position: 'relative',
                transition: 'transform 320ms cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 320ms cubic-bezier(0.22, 0.61, 0.36, 1)',
                boxShadow: '0 4px 14px rgba(10, 36, 56, 0.06)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 28px rgba(10, 36, 56, 0.14)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(10, 36, 56, 0.06)';
              }}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                decoding="async"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </button>
          ))}
        </div>
      </section>

      {/* ── 5. CTA externe ───────────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(28px, 6vw, 44px) clamp(20px, 6vw, 32px) clamp(20px, 5vw, 32px)',
          maxWidth: 640,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <Body variant="whisper" style={{ textAlign: 'center', maxWidth: 360 }}>
          La marque ÇA VA? — vêtements, éditos, atelier.
        </Body>
        <CTA variant="outline" size="md" onClick={openExternal}>
          Voir l'univers complet →
        </CTA>
      </section>

      {/* ── 6. Pied de page ──────────────────────────────────── */}
      <footer
        style={{
          padding: '24px 20px 8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          ÇA VA?
        </span>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 12,
            color: 'var(--text-muted)',
          }}
        >
          MMXXVI
        </span>
      </footer>

      <PhotoLightbox photo={lightbox} onClose={closeLightbox} />
    </div>
  );
}
