/* ============================================================
   ÇA VA ? V10 — Storytelling éditorial + nav templates + viewer collection
   ============================================================
   Itérations sprint Will :
   - Hero dark réduit de moitié (220-320px clamp)
   - Tagline "mensongère" déplacée en eyebrow émotionnel Manifeste
   - Photos collections cliquables → viewer plein écran
   - Copy raccourci (1 phrase percutante par card)
   - Mini-nav templates sticky (5 anchors)
   ============================================================ */

import { useState, useCallback, useEffect } from 'react';
import { haptic } from '../state';
import CaVaPhotoViewer from './CaVaPhotoViewer';
import Blobs from '../../components/Blobs';

const TOTAL = 120;
const PHOTO = (n) => `/cava/brand/cava-${String(n).padStart(3, '0')}.jpg`;
const SEL = (name) => `/cava/selection/${name}`;
const EXTERNAL_URL = 'https://www.cava-brand.com';

/* ─── Pièces phares (Chapitre III) ─── */

const PIECES = [
  {
    id: 'pas',
    src: SEL('sel-01-pas.jpeg'),
    eyebrow: 'La pièce victoire',
    title: 'Chaque pas est une victoire',
    quote: 'Pour celles et ceux qui avancent quand c’est dur.',
    body: 'La phrase au dos, la question devant.',
  },
  {
    id: 'sensibilite',
    src: SEL('sel-02-sensibilite.jpeg'),
    eyebrow: 'La pièce manifeste',
    title: 'Ma sensibilité est mon super-pouvoir',
    quote: 'Pour celles et ceux qui ressentent fort.',
    body: 'Ce qui fragilise est ce qui rend vivant.',
  },
  {
    id: 'prevert',
    src: SEL('sel-03-prevert.jpeg'),
    eyebrow: 'La pièce poésie',
    title: 'Prenez soin de vous',
    quote: 'Même si le bonheur vous oublie un peu, ne l’oubliez jamais.',
    body: 'Une douceur qu’on emmène avec soi.',
  },
];

/* ─── Collection I — Ma belle anxiété (Chapitre IV.A) ─── */

const COLLECTION_ANXIETE = [
  {
    id: 'anx-01',
    src: SEL('anx-01-super-pouvoir.jpeg'),
    title: 'Super-pouvoir',
    quote: 'Mon anxiété est mon super-pouvoir.',
    price: '39 €',
  },
  {
    id: 'anx-02',
    src: SEL('anx-02-camus.jpeg'),
    title: 'Camus',
    quote: 'Au milieu de l’hiver, j’apprenais enfin qu’il y avait en moi un été invincible.',
    price: '39 €',
  },
  {
    id: 'anx-03',
    src: SEL('anx-03-train.jpeg'),
    title: 'Le train',
    quote: 'Le monde avance trop vite pour moi.',
    price: '39 €',
  },
  {
    id: 'anx-04',
    src: SEL('anx-04-matt-haig.jpeg'),
    title: 'Matt Haig',
    quote: 'L’anxiété est une bête irrationnelle.',
    price: '39 €',
  },
  {
    id: 'anx-05',
    src: SEL('anx-05-prevert-bis.jpeg'),
    title: 'Prévert · Fleur',
    quote: 'Même si le bonheur vous oublie un peu, ne l’oubliez jamais complètement.',
    price: '39 €',
  },
  {
    id: 'anx-06',
    src: SEL('anx-06-soleil.jpeg'),
    title: 'Soleil',
    quote: 'Le soleil reviendra, je le sais.',
    price: '39 €',
  },
  {
    id: 'anx-07',
    src: SEL('anx-07-fatigue.jpeg'),
    title: 'Fatigue',
    quote: 'Fatigué d’être fatigué.',
    price: '39 €',
  },
  {
    id: 'sel-02',
    src: SEL('sel-02-sensibilite.jpeg'),
    title: 'Sensibilité',
    quote: 'Ma sensibilité est mon super-pouvoir.',
    price: '39 €',
  },
  {
    id: 'sel-03',
    src: SEL('sel-03-prevert.jpeg'),
    title: 'Prévert',
    quote: 'Prenez soin de vous.',
    price: '39 €',
  },
];

/* ─── Collection II — Fruits & métaphores (Chapitre IV.B) ─── */

const COLLECTION_FRUITS = [
  {
    id: 'fruit-01',
    src: SEL('fruit-01-banane.jpeg'),
    title: 'La banane',
    quote: 'J’ai plus la banane, mais je souris quand même.',
    price: '39 €',
  },
  {
    id: 'fruit-02',
    src: SEL('fruit-02-peche.jpeg'),
    title: 'La pêche',
    quote: 'J’garde la pêche en public, je craque en silence.',
    price: '39 €',
  },
];

/* ─── Essentiels intemporels (Chapitre IV.C) ─── */

const COLLECTION_ESSENTIELS = [
  {
    id: 'ess-tee',
    src: SEL('sel-04-noir-coeur.jpeg'),
    title: 'T-shirt cœur',
    desc: 'Le noir signature.',
    quote: 'Le noir signature, cœur doré.',
    price: '39 €',
  },
  {
    id: 'ess-hoodie',
    src: SEL('ess-01-hoodie-noir.jpeg'),
    title: 'Hoodie cœur',
    desc: 'Le hoodie cocon.',
    quote: 'Le hoodie cocon, cœur doré.',
    price: '79 €',
  },
];

/* ─── Les voix (Chapitre V) ─── */

const VOIX = [
  { idx: 7,   quote: 'Je vais bien, version limitée.' },
  { idx: 75,  quote: 'Certaines tempêtes portent des fleurs.' },
  { idx: 105, quote: 'Le masque tombe quand personne regarde.' },
];

const CAPTION_MAP = VOIX.reduce((acc, v) => {
  acc[v.idx] = { place: '', quote: v.quote };
  return acc;
}, {});

const COLLECTIONS_MAP = {
  anxiete: COLLECTION_ANXIETE,
  fruits: COLLECTION_FRUITS,
  essentiels: COLLECTION_ESSENTIELS,
};

export default function CaVa() {
  const [viewer, setViewer] = useState(null);
  const [viewerCollection, setViewerCollection] = useState(null);

  const openViewer = useCallback((idx) => { haptic(3); setViewer({ idx }); }, []);
  const closeViewer = useCallback(() => setViewer(null), []);
  const getPhotoSrc = useCallback((idx) => PHOTO(idx), []);
  const getCaption = useCallback((idx) => CAPTION_MAP[idx] || null, []);

  const openCollection = useCallback((collection, index) => {
    haptic(3);
    setViewerCollection({ collection, index });
  }, []);
  const closeCollection = useCallback(() => setViewerCollection(null), []);

  const scrollToAnchor = useCallback((id) => {
    haptic(2);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

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
        <MiniNav onJump={scrollToAnchor} />
        <ChapitreManifeste />
        <ChapitreRaisonEtre />
        <ChapitrePieces />
        <ChapitreCollectionAnxiete onOpen={openCollection} />
        <ChapitreCollectionFruits onOpen={openCollection} />
        <ChapitreCollectionEssentiels onOpen={openCollection} />
        <ChapitreVoix onOpen={openViewer} />
        <ChapitreFinal />
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

      {viewerCollection && (
        <CavaCollectionViewer
          collection={viewerCollection.collection}
          index={viewerCollection.index}
          items={COLLECTIONS_MAP[viewerCollection.collection]}
          onClose={closeCollection}
        />
      )}
    </>
  );
}

/* ============================================================
   1. TopBar (glass clair sticky)
   ============================================================ */

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

/* ============================================================
   2. Hero dark RÉDUIT (clamp 220-320, sans tagline)
   ============================================================ */

function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(220px, 32vh, 320px)',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0A2438, #1A5A7F)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div aria-hidden style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,112,144,0.55) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'absolute', bottom: -50, left: -45, width: 190, height: 190, borderRadius: '50%', background: 'radial-gradient(circle, rgba(42,138,191,0.55) 0%, transparent 70%)', filter: 'blur(55px)', pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(127,90,138,0.40) 0%, transparent 70%)', filter: 'blur(70px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 22px', color: '#FFFFFF' }}>
        <h1
          style={{
            margin: 0,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(56px, 13vw, 72px)',
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            color: '#FFFFFF',
          }}
        >
          ÇA VA?
        </h1>
      </div>
    </section>
  );
}

/* ============================================================
   2bis. Mini-nav templates (5 anchors, sticky)
   ============================================================ */

function MiniNav({ onJump }) {
  const tabs = [
    { id: 'chap-manifeste', label: 'Manifeste' },
    { id: 'chap-anxiete', label: 'Anxiété' },
    { id: 'chap-fruits', label: 'Fruits' },
    { id: 'chap-essentiels', label: 'Essentiels' },
    { id: 'chap-voix', label: 'Voix' },
  ];
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        borderBottom: '0.5px solid var(--blue-300)',
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          data-press
          onClick={() => onJump(t.id)}
          style={{
            appearance: 'none',
            border: '1px solid var(--blue-300)',
            background: 'transparent',
            color: 'var(--blue-700)',
            borderRadius: 999,
            padding: '8px 14px',
            minHeight: 36,
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            flexShrink: 0,
          }}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}

/* ============================================================
   Helpers UI
   ============================================================ */

function Eyebrow({ children }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: "'Inter', sans-serif",
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: '#C87090',
      }}
    >
      {children}
    </span>
  );
}

/* ============================================================
   3. CHAPITRE I — Le manifeste (avec eyebrow émotionnel)
   ============================================================ */

function ChapitreManifeste() {
  return (
    <section
      id="chap-manifeste"
      style={{
        position: 'relative',
        zIndex: 1,
        padding: '80px 28px 56px',
        background: 'var(--bg)',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          margin: '0 auto 18px',
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 'clamp(20px, 5.5vw, 24px)',
          lineHeight: 1.3,
          letterSpacing: '-0.005em',
          color: 'var(--rose-700)',
          maxWidth: 460,
        }}
      >
        « ça va » — la phrase la plus mensongère du monde.
      </p>
      <div
        aria-hidden
        style={{
          width: 48,
          height: 0.5,
          background: 'var(--blue-300)',
          margin: '0 auto 22px',
        }}
      />
      <div style={{ marginBottom: 22 }}>
        <Eyebrow>I · Manifeste</Eyebrow>
      </div>
      <p
        style={{
          margin: '0 auto 18px',
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 'clamp(26px, 7vw, 36px)',
          lineHeight: 1.25,
          letterSpacing: '-0.005em',
          color: 'var(--blue-900)',
          maxWidth: 540,
        }}
      >
        Nous existons pour briser le masque du « ça va ».
      </p>
      <p
        style={{
          margin: '0 auto',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 300,
          fontSize: 15,
          lineHeight: 1.6,
          color: 'var(--blue-700)',
          maxWidth: 380,
        }}
      >
        Deux mots. Pour cacher tout.
      </p>
    </section>
  );
}

/* ============================================================
   4. CHAPITRE II — Notre raison d'être
   ============================================================ */

function ChapitreRaisonEtre() {
  return (
    <section
      style={{
        position: 'relative',
        zIndex: 1,
        padding: '24px 16px 56px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          gap: 16,
          alignItems: 'stretch',
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.85)',
          borderRadius: 24,
          boxShadow: '0 4px 24px rgba(10, 36, 56, 0.07)',
          padding: 12,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            minHeight: 220,
            borderRadius: 16,
            overflow: 'hidden',
            backgroundImage: `url(${PHOTO(7)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, transparent 30%, rgba(10,36,56,0.65) 100%)',
            }}
          />
        </div>
        <div
          style={{
            padding: '14px 8px 14px 6px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <Eyebrow>II · Raison d&rsquo;être</Eyebrow>
          <p
            style={{
              margin: 0,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 'clamp(20px, 5.5vw, 26px)',
              lineHeight: 1.25,
              letterSpacing: '-0.005em',
              color: 'var(--blue-900)',
            }}
          >
            Faire de la mode un langage qui libère la parole sur la santé mentale.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   5. CHAPITRE III — Les pièces qui parlent
   ============================================================ */

function ChapitrePieces() {
  return (
    <section
      style={{
        position: 'relative',
        zIndex: 1,
        padding: '16px 16px 48px',
      }}
    >
      <div style={{ padding: '0 6px 18px' }}>
        <Eyebrow>III · Les pièces</Eyebrow>
        <p
          style={{
            margin: '10px 0 0',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 22,
            lineHeight: 1.3,
            color: 'var(--blue-900)',
          }}
        >
          Trois pièces, trois voix qui osent.
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {PIECES.map((p) => (
          <PieceCard key={p.id} piece={p} />
        ))}
      </div>
    </section>
  );
}

function PieceCard({ piece }) {
  return (
    <article
      style={{
        position: 'relative',
        width: '100%',
        height: 420,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundImage: `url(${piece.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: 'rgba(10,36,56,0.04)',
        border: '1px solid rgba(255, 255, 255, 0.85)',
        boxShadow: '0 6px 28px rgba(10, 36, 56, 0.10)',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent 30%, rgba(10,36,56,0.78) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 18,
          right: 18,
          bottom: 20,
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#F3B8CC',
          }}
        >
          {piece.eyebrow}
        </span>
        <h3
          style={{
            margin: 0,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(22px, 6vw, 28px)',
            lineHeight: 1.2,
            letterSpacing: '-0.005em',
            color: '#FFFFFF',
          }}
        >
          « {piece.title} »
        </h3>
        <p
          style={{
            margin: 0,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 15,
            lineHeight: 1.4,
            color: 'rgba(255,255,255,0.88)',
          }}
        >
          {piece.body}
        </p>
      </div>
    </article>
  );
}

/* ============================================================
   6. CHAPITRE IV.A — Ma belle anxiété (carousel)
   ============================================================ */

function ChapitreCollectionAnxiete({ onOpen }) {
  return (
    <section
      id="chap-anxiete"
      style={{
        position: 'relative',
        zIndex: 1,
        padding: '16px 16px 36px',
      }}
    >
      <div style={{ padding: '0 6px 8px' }}>
        <span
          style={{
            display: 'inline-block',
            fontFamily: "'Inter', sans-serif",
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#BE185D',
          }}
        >
          IV · Collection
        </span>
        <p
          style={{
            margin: '12px 0 6px',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(32px, 8.5vw, 42px)',
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
            color: 'var(--blue-900)',
          }}
        >
          Ma belle anxiété
        </p>
        <p
          style={{
            margin: '0 0 8px',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 16,
            lineHeight: 1.4,
            color: 'var(--text-secondary)',
          }}
        >
          Des mots à porter.
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          9 pièces · 39-79 €
        </p>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 14,
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          padding: '14px 6px 14px',
          margin: '0 -16px',
          paddingLeft: 22,
          paddingRight: 22,
          scrollbarWidth: 'none',
        }}
      >
        {COLLECTION_ANXIETE.map((c, i) => (
          <PieceQuoteCard key={c.id} item={c} onClick={() => onOpen('anxiete', i)} />
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   6. CHAPITRE IV.B — Fruits & métaphores
   ============================================================ */

function ChapitreCollectionFruits({ onOpen }) {
  return (
    <section
      id="chap-fruits"
      style={{
        position: 'relative',
        zIndex: 1,
        padding: '16px 16px 36px',
      }}
    >
      <div style={{ padding: '0 6px 14px' }}>
        <span
          style={{
            display: 'inline-block',
            fontFamily: "'Inter', sans-serif",
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--violet)',
          }}
        >
          V · Collection
        </span>
        <p
          style={{
            margin: '12px 0 6px',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(32px, 8.5vw, 42px)',
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
            color: 'var(--blue-900)',
          }}
        >
          Fruits & métaphores
        </p>
        <p
          style={{
            margin: '0 0 8px',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 16,
            lineHeight: 1.4,
            color: 'var(--text-secondary)',
          }}
        >
          Sourire dehors, craquer dedans.
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          2 pièces · 39 €
        </p>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 14,
        }}
      >
        {COLLECTION_FRUITS.map((c, i) => (
          <FruitCard key={c.id} item={c} onClick={() => onOpen('fruits', i)} />
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   6. CHAPITRE IV.C — Essentiels intemporels
   ============================================================ */

function ChapitreCollectionEssentiels({ onOpen }) {
  return (
    <section
      id="chap-essentiels"
      style={{
        position: 'relative',
        zIndex: 1,
        padding: '16px 16px 48px',
      }}
    >
      <div style={{ padding: '0 6px 14px' }}>
        <Eyebrow>VI · Essentiels</Eyebrow>
        <p
          style={{
            margin: '12px 0 6px',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 24,
            lineHeight: 1.2,
            letterSpacing: '-0.005em',
            color: 'var(--blue-900)',
          }}
        >
          Les essentiels
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
            fontSize: 14,
            lineHeight: 1.55,
            color: 'var(--blue-700)',
            maxWidth: 420,
          }}
        >
          Le cœur doré sur les pièces qu’on porte tout le temps.
        </p>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 14,
        }}
      >
        {COLLECTION_ESSENTIELS.map((c, i) => (
          <EssentielCard key={c.id} item={c} onClick={() => onOpen('essentiels', i)} />
        ))}
      </div>
    </section>
  );
}

/* ─── Card "Ma belle anxiété" cliquable ─── */

function PieceQuoteCard({ item, onClick }) {
  return (
    <button
      type="button"
      data-press
      onClick={onClick}
      style={{
        flex: '0 0 78%',
        maxWidth: 300,
        scrollSnapAlign: 'start',
        appearance: 'none',
        border: '1px solid rgba(255, 255, 255, 0.85)',
        padding: 10,
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
        gap: 10,
        color: 'inherit',
        transition: 'transform 220ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '3 / 4',
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: 'rgba(10,36,56,0.04)',
          backgroundImage: `url(${item.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, transparent 30%, rgba(10,36,56,0.55) 100%)',
          }}
        />
        <p
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: 12,
            margin: 0,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 15,
            lineHeight: 1.3,
            color: '#FFFFFF',
            textShadow: '0 1px 6px rgba(0,0,0,0.45)',
          }}
        >
          « {item.quote} »
        </p>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 8,
          padding: '0 4px 4px',
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.04em',
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

/* ─── Card "Fruits" cliquable ─── */

function FruitCard({ item, onClick }) {
  return (
    <button
      type="button"
      data-press
      onClick={onClick}
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
        color: 'inherit',
        transition: 'transform 220ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 5',
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: 'rgba(10,36,56,0.04)',
          backgroundImage: `url(${item.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <p
        style={{
          margin: '0 2px',
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 15,
          lineHeight: 1.3,
          color: 'var(--blue-900)',
        }}
      >
        « {item.quote} »
      </p>
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
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.04em',
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

/* ─── Card "Essentiels" cliquable ─── */

function EssentielCard({ item, onClick }) {
  return (
    <button
      type="button"
      data-press
      onClick={onClick}
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
        color: 'inherit',
        transition: 'transform 220ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 5',
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: 'rgba(10,36,56,0.04)',
          backgroundImage: `url(${item.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          padding: '0 2px 4px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 8,
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
        <p
          style={{
            margin: 0,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
            fontSize: 12,
            lineHeight: 1.5,
            color: 'var(--blue-700)',
          }}
        >
          {item.desc}
        </p>
      </div>
    </button>
  );
}

/* ============================================================
   7. CHAPITRE VII — Les voix
   ============================================================ */

function ChapitreVoix({ onOpen }) {
  return (
    <section
      id="chap-voix"
      style={{
        position: 'relative',
        zIndex: 1,
        padding: '16px 16px 48px',
      }}
    >
      <div style={{ padding: '0 6px 18px' }}>
        <Eyebrow>VII · Les voix</Eyebrow>
        <p
          style={{
            margin: '10px 0 0',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 22,
            lineHeight: 1.3,
            color: 'var(--blue-900)',
          }}
        >
          Celles et ceux qui portent.
        </p>
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
                background: 'linear-gradient(to bottom, transparent 30%, rgba(10,36,56,0.78) 100%)',
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
              « {v.quote} »
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   8. CHAPITRE VIII — Final
   ============================================================ */

function ChapitreFinal() {
  return (
    <section
      style={{
        position: 'relative',
        margin: '16px',
        borderRadius: 28,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0A2438 0%, #1A5A7F 55%, #7F5A8A 100%)',
        color: '#FFFFFF',
        padding: '72px 24px calc(env(safe-area-inset-bottom, 0px) + 140px)',
        textAlign: 'center',
        boxShadow: '0 12px 40px rgba(10, 36, 56, 0.18)',
      }}
    >
      <div aria-hidden style={{ position: 'absolute', top: -50, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,112,144,0.40) 0%, transparent 70%)', filter: 'blur(70px)', pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'absolute', bottom: 40, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(127,90,138,0.42) 0%, transparent 70%)', filter: 'blur(70px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 2, marginBottom: 16 }}>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#F3B8CC',
          }}
        >
          VIII · Final
        </span>
      </div>

      <p
        style={{
          position: 'relative',
          zIndex: 2,
          margin: '0 auto 18px',
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 'clamp(26px, 7vw, 32px)',
          lineHeight: 1.3,
          letterSpacing: '-0.012em',
          color: '#FFFFFF',
          maxWidth: 420,
        }}
      >
        Quelque chose à dire ?
      </p>
      <p
        style={{
          position: 'relative',
          zIndex: 2,
          margin: '0 auto 36px',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 300,
          fontSize: 14,
          lineHeight: 1.6,
          color: 'rgba(255,255,255,0.82)',
          maxWidth: 360,
        }}
      >
        Chaque pièce ÇA VA? est une voix.
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
          display: 'block',
          padding: '17px 28px',
          minHeight: 44,
          background: 'linear-gradient(135deg, #C87090, #E080A8)',
          color: '#FFFFFF',
          borderRadius: 999,
          fontFamily: "'Inter', sans-serif",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          boxShadow: '0 8px 24px rgba(200,112,144,0.35)',
          WebkitTapHighlightColor: 'transparent',
          textAlign: 'center',
        }}
      >
        Voir toute la collection <span style={{ opacity: 0.85 }}>↗</span>
      </a>
    </section>
  );
}

/* ============================================================
   9. CavaCollectionViewer — viewer plein écran pour collections
   ============================================================
   Image plein écran (object-fit: contain, padding 16px)
   Fond noir rgba(10,36,56,0.92) + blur
   Citation Cormorant italic + prix + nom Inter
   Bouton X close 44×44 glass top-right
   Swipe horizontal (scroll-snap)
   Tap dehors = close · ESC = close
   ============================================================ */

function CavaCollectionViewer({ collection, index, items, onClose }) {
  const [currentIdx, setCurrentIdx] = useState(index);
  const setScrollerRef = useCallback((el) => {
    if (el && index > 0 && el.scrollLeft === 0) {
      el.scrollLeft = el.clientWidth * index;
    }
  }, [index]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        haptic(2);
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const handleScroll = useCallback((e) => {
    const w = e.currentTarget.clientWidth;
    if (!w) return;
    const i = Math.round(e.currentTarget.scrollLeft / w);
    if (i !== currentIdx && i >= 0 && i < items.length) {
      setCurrentIdx(i);
      haptic(2);
    }
  }, [currentIdx, items.length]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      haptic(2);
      onClose();
    }
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(10, 36, 56, 0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'cavaCollFade 280ms ease',
      }}
    >
      <style>{`
        @keyframes cavaCollFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Close button */}
      <button
        type="button"
        onClick={() => { haptic(3); onClose(); }}
        aria-label="Fermer"
        data-press
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
          color: '#FFFFFF',
          fontFamily: "'Inter', sans-serif",
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

      {/* Counter */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 22px)',
          left: 22,
          fontFamily: "'Inter', sans-serif",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.7)',
          zIndex: 2,
        }}
      >
        {currentIdx + 1} / {items.length}
      </div>

      {/* Scroll-snap horizontal */}
      <div
        ref={setScrollerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              flex: '0 0 100%',
              width: '100%',
              height: '100%',
              scrollSnapAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'calc(env(safe-area-inset-top, 0px) + 64px) 16px calc(env(safe-area-inset-bottom, 0px) + 24px)',
              boxSizing: 'border-box',
            }}
          >
            <img
              src={item.src}
              alt={item.title}
              style={{
                maxWidth: '100%',
                maxHeight: '65vh',
                objectFit: 'contain',
                borderRadius: 12,
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)',
              }}
            />
            <div
              style={{
                marginTop: 22,
                textAlign: 'center',
                maxWidth: 520,
                width: '100%',
                padding: '0 8px',
              }}
            >
              <p
                style={{
                  margin: '0 0 14px',
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: 'italic',
                  fontWeight: 300,
                  fontSize: 'clamp(20px, 5.5vw, 28px)',
                  lineHeight: 1.3,
                  letterSpacing: '-0.005em',
                  color: '#FFFFFF',
                }}
              >
                « {item.quote || item.desc} »
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'center',
                  gap: 14,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.78)',
                  }}
                >
                  {item.title}
                </span>
                <span aria-hidden style={{ color: 'rgba(255,255,255,0.4)' }}>·</span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#FFFFFF',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {item.price}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
