/* ============================================================
   ÇA VA ? V8 — Boutique éditoriale (refonte DA Mai 2026)
   ============================================================
   Structure (CLAUDE.md §9 TAB 4) :
     1. Topbar glass clair
     2. Hero dark plein largeur (SEUL endroit autorisé)
     3. Manifeste fond clair (3 lignes Cormorant)
     4. QuoteBlock — citation glass card barre accent gradient
     5. Collections grid 2 col — 6 cards glass
     6. QuoteBlock — citation 2
     7. VoixRow — grid 3 col photos cava-brand
     8. Final dark + CTA "VOIR LA COLLECTION" gradient rose
   ============================================================
   Palette : bleu/rose/violet · Fonts : Cormorant + Inter
   Photos brand : HERO=1, BREATH=22/33, VOIX=[7,75,105],
                  COLL=[12,48,67,84,96,118]
   ============================================================ */

import { useState, useCallback } from 'react';
import { haptic } from '../state';
import CaVaPhotoViewer from './CaVaPhotoViewer';
import Blobs from '../../components/Blobs';

const TOTAL = 120;
const PHOTO = (n) => `/cava/brand/cava-${String(n).padStart(3, '0')}.jpg`;
const EXTERNAL_URL = 'https://www.cava-brand.com';

const HERO_PHOTO = 1;
const BREATH_1 = 22;
const BREATH_2 = 33;

const VOIX = [
  { idx: 7,   quote: 'Je vais bien en version limitée.' },
  { idx: 75,  quote: 'Certaines tempêtes portent des fleurs.' },
  { idx: 105, quote: 'Le masque tombe quand personne regarde.' },
];

const COLLECTIONS = [
  { idx: 12,  title: 'Brume',     price: '79 €',  tag: 'Bleu',    tagColor: '#1A5A7F' },
  { idx: 48,  title: 'Murmure',   price: '89 €',  tag: 'Rose',    tagColor: '#C87090' },
  { idx: 67,  title: 'Silence',   price: '94 €',  tag: 'Violet',  tagColor: '#7F5A8A' },
  { idx: 84,  title: 'Lueur',     price: '79 €',  tag: 'Rose',    tagColor: '#C87090' },
  { idx: 96,  title: 'Marée',     price: '105 €', tag: 'Bleu',    tagColor: '#1A5A7F' },
  { idx: 118, title: 'Aube',      price: '89 €',  tag: 'Violet',  tagColor: '#7F5A8A' },
];

const CAPTION_MAP = VOIX.reduce((acc, v) => {
  acc[v.idx] = { place: '', quote: v.quote };
  return acc;
}, {});

export default function CaVa() {
  const [viewer, setViewer] = useState(null);
  const openViewer = useCallback((idx) => { haptic(3); setViewer({ idx }); }, []);
  const closeViewer = useCallback(() => setViewer(null), []);
  const getPhotoSrc = useCallback((idx) => PHOTO(idx), []);
  const getCaption = useCallback((idx) => CAPTION_MAP[idx] || null, []);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--bg)',
          color: 'var(--blue-900)',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Blobs variant="rose-blue" />
        <TopBar />
        <Hero />
        <Manifeste />
        <QuoteBlock quote="Tout le monde demande « ça va ? ». Très peu sont prêts à entendre la vraie réponse." />
        <Collections onOpen={openViewer} />
        <QuoteBlock quote="Tu peux souffrir et rester beau, humain, vivant." />
        <VoixRow onOpen={openViewer} />
        <Final />
      </div>

      {viewer && (
        <CaVaPhotoViewer
          photoIndex={viewer.idx}
          totalPhotos={TOTAL}
          onClose={closeViewer}
          getPhotoSrc={getPhotoSrc}
          getCaption={getCaption}
        />
      )}
    </>
  );
}

/* ─── 1. Top bar (glass clair) ─── */

function TopBar() {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 22px 14px',
        background: 'rgba(255, 255, 255, 0.78)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        borderBottom: '0.5px solid rgba(10, 36, 56, 0.08)',
      }}
    >
      <span
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 20,
          letterSpacing: '-0.01em',
          color: 'var(--blue-900)',
        }}
      >
        ÇA VA?
      </span>
      <a
        href={EXTERNAL_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => haptic(4)}
        data-press
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--blue-900)',
          opacity: 0.85,
          textDecoration: 'none',
          padding: '12px 14px',
          minHeight: 44,
          minWidth: 44,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        Boutique <span style={{ opacity: 0.6 }} aria-hidden>↗</span>
      </a>
    </div>
  );
}

/* ─── 2. Hero dark (SEUL bloc dark plein largeur autorisé) ─── */

function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(480px, 70vh, 560px)',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0A2438, #1A5A7F)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 3 blobs glow internes */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,112,144,0.55) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: -80,
          left: -70,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(42,138,191,0.55) 0%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 340,
          height: 340,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(127,90,138,0.40) 0%, transparent 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          padding: '0 22px',
          color: '#FFFFFF',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(72px, 18vw, 96px)',
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            color: '#FFFFFF',
          }}
        >
          ÇA VA?
        </h1>
        <p
          style={{
            margin: '24px auto 0',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
            fontSize: 'clamp(14px, 4vw, 17px)',
            lineHeight: 1.5,
            letterSpacing: '0.01em',
            color: 'rgba(255,255,255,0.92)',
            maxWidth: 340,
          }}
        >
          La phrase la plus mensongère du monde.
        </p>
      </div>
    </section>
  );
}

/* ─── 3. Manifeste (3 lignes Cormorant italic centré) ─── */

function Manifeste() {
  return (
    <section
      style={{
        position: 'relative',
        zIndex: 1,
        padding: '72px 28px 64px',
        background: 'var(--bg)',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          margin: '0 auto',
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 'clamp(18px, 5vw, 22px)',
          lineHeight: 1.6,
          letterSpacing: '0.005em',
          color: 'var(--blue-900)',
          maxWidth: 480,
        }}
      >
        Pas née pour vendre.<br />
        Née parce que trop de gens souffrent en silence.<br />
        Le vêtement comme support de présence.
      </p>
    </section>
  );
}

/* ─── 4 & 6. QuoteBlock (glass card barre accent gradient bleu→rose) ─── */

function QuoteBlock({ quote }) {
  return (
    <section
      style={{
        position: 'relative',
        zIndex: 1,
        padding: '8px 16px 32px',
      }}
    >
      <div
        style={{
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.85)',
          borderRadius: 24,
          boxShadow: '0 4px 24px rgba(10, 36, 56, 0.07)',
          padding: '28px 24px 28px 28px',
          overflow: 'hidden',
        }}
      >
        {/* Barre accent gauche : gradient bleu→rose */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            top: 16,
            bottom: 16,
            width: 3,
            background: 'linear-gradient(180deg, #1A5A7F 0%, #C87090 100%)',
            borderRadius: '0 2px 2px 0',
          }}
        />
        <p
          style={{
            margin: 0,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(16px, 4.5vw, 18px)',
            lineHeight: 1.55,
            letterSpacing: '0.003em',
            color: 'var(--blue-900)',
          }}
        >
          « {quote} »
        </p>
      </div>
    </section>
  );
}

/* ─── 5. Collections grid 2 col — 6 cards glass ─── */

function Collections({ onOpen }) {
  return (
    <section
      style={{
        position: 'relative',
        zIndex: 1,
        padding: '24px 16px 16px',
      }}
    >
      <div
        style={{
          padding: '0 6px 16px',
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--blue-700)',
          }}
        >
          La collection
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
        }}
      >
        {COLLECTIONS.map((c) => (
          <CollectionCard key={c.idx} item={c} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

function CollectionCard({ item, onOpen }) {
  return (
    <button
      data-press
      onClick={() => onOpen(item.idx)}
      aria-label={`${item.title} — ${item.price}`}
      style={{
        appearance: 'none',
        border: '1px solid rgba(255, 255, 255, 0.85)',
        padding: 12,
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 24,
        boxShadow: '0 4px 24px rgba(10, 36, 56, 0.07)',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 5',
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: 'rgba(10,36,56,0.04)',
          backgroundImage: `url(${PHOTO(item.idx)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            padding: '5px 10px',
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: 999,
            fontFamily: "'Inter', sans-serif",
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: item.tagColor,
          }}
        >
          {item.tag}
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 8,
          padding: '0 2px 4px',
        }}
      >
        <span
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 18,
            lineHeight: 1.1,
            color: 'var(--blue-900)',
          }}
        >
          {item.title}
        </span>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: '0.01em',
            color: 'var(--blue-700)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {item.price}
        </span>
      </div>
    </button>
  );
}

/* ─── 7. VoixRow (3 col 1/1 photos cava-brand) ─── */

function VoixRow({ onOpen }) {
  return (
    <section
      style={{
        position: 'relative',
        zIndex: 1,
        padding: '16px 16px 32px',
      }}
    >
      <div style={{ padding: '0 6px 16px' }}>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--blue-700)',
          }}
        >
          Les voix
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
        }}
      >
        {VOIX.map((v) => (
          <button
            key={v.idx}
            data-press
            onClick={() => onOpen(v.idx)}
            aria-label={v.quote}
            style={{
              appearance: 'none',
              border: '1px solid rgba(255, 255, 255, 0.85)',
              padding: 0,
              background: 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRadius: 16,
              overflow: 'hidden',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              position: 'relative',
              aspectRatio: '1 / 1',
              boxShadow: '0 4px 24px rgba(10, 36, 56, 0.07)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${PHOTO(v.idx)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(10,36,56,0) 45%, rgba(10,36,56,0.78) 100%)',
              }}
            />
            <p
              style={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                right: 8,
                margin: 0,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: 11,
                lineHeight: 1.25,
                color: '#FFFFFF',
                textAlign: 'left',
                textShadow: '0 1px 6px rgba(0,0,0,0.45)',
              }}
            >
              « {v.quote} »
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ─── 8. Final bloc dark gradient + CTA "VOIR LA COLLECTION" gradient rose ─── */

function Final() {
  return (
    <section
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0A2438, #1A5A7F)',
        color: '#FFFFFF',
        padding: '80px 22px calc(env(safe-area-inset-bottom, 0px) + 140px)',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -50,
          right: -60,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,112,144,0.40) 0%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 40,
          left: -60,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(127,90,138,0.42) 0%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }}
      />

      <p
        style={{
          position: 'relative',
          zIndex: 2,
          margin: '0 auto 18px',
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 'clamp(24px, 6.5vw, 30px)',
          lineHeight: 1.3,
          letterSpacing: '-0.012em',
          color: '#FFFFFF',
          maxWidth: 420,
        }}
      >
        Derrière chaque visage<br />
        peut se cacher<br />
        une bataille invisible.
      </p>
      <p
        style={{
          position: 'relative',
          zIndex: 2,
          margin: '0 auto 44px',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 300,
          fontSize: 14,
          lineHeight: 1.6,
          color: 'rgba(255,255,255,0.78)',
          maxWidth: 360,
        }}
      >
        Parfois, se sentir compris suffit à tout changer.
      </p>
      <a
        href={EXTERNAL_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => haptic(6)}
        data-press
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '15px 28px',
          minHeight: 44,
          background: 'linear-gradient(135deg, #C87090, #E080A8)',
          color: '#FFFFFF',
          borderRadius: 999,
          fontFamily: "'Inter', sans-serif",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          boxShadow: '0 8px 24px rgba(200,112,144,0.35)',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        Voir la collection <span style={{ opacity: 0.85 }}>↗</span>
      </a>
    </section>
  );
}
