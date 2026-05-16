/* ============================================================
   NÉYA V3 — Manifeste (Notre histoire · ÇA VA?)
   ============================================================
   Editorial spread, scrollable top-to-bottom. Brand voice :
   « Briser le masque du ça va. »
   Light cream + ink + palette ÇA VA? stricte (terracotta /
   ochre / emerald / sage / mist-blue / cream). Pas de tilleul.
   Slide-up 420ms · slide-down 320ms.
   ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { haptic } from '../state';
import useEdgeSwipeBack from '../hooks/useEdgeSwipeBack';

const TERRACOTTA = '#9F584C';
const OCHRE      = '#C29051';
const EMERALD    = '#34917F';
const SAGE       = '#9AAFA0';
const MIST_BLUE  = '#7397BC';
const CREAM      = '#FBF6E8';
const CREAM_DIM  = '#F0EBDD';
const INK        = '#1A1A2F';
const INK_SOFT   = '#4A4A5F';
const INK_WHISPER = '#7A7A8C';

const CAPSULES = [
  {
    name: 'Libre',
    color: TERRACOTTA,
    tagline: 'Pour ceux qui se relèvent.',
    desc: 'Sweat et tee crème, broderie main rouge sang. Le vêtement qui dit la chaleur quand les mots manquent.',
  },
  {
    name: 'Ça Va',
    color: MIST_BLUE,
    tagline: 'Pour ceux qui hésitent à répondre.',
    desc: 'Coton bio, point de chaînette bleu brume. Une question cousue à même la poitrine, comme une invitation.',
  },
  {
    name: 'Vraiment ?',
    color: EMERALD,
    tagline: 'Pour ceux qui veulent enfin la vraie réponse.',
    desc: 'Pièce d’atelier numérotée, broderie vert racine. Le mot qui ouvre la parole, brodé pour durer.',
  },
];

const VALUES = [
  { icon: '♡', title: 'DOUCEUR',  color: TERRACOTTA, desc: 'Aucune urgence. Le textile prend son temps.' },
  { icon: '✿', title: 'VÉRITÉ',   color: EMERALD,    desc: 'Pas de slogan creux. Chaque mot a été pensé.' },
  { icon: '☉', title: 'SLOWNESS', color: OCHRE,      desc: 'Trois personnes, à la main. Cinq pièces par jour.' },
];

/* Petit cœur dessiné main, inline SVG */
function HandHeart({ color = TERRACOTTA, size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 28"
      fill="none"
      aria-hidden="true"
      style={{ display: 'inline-block' }}
    >
      <path
        d="M16 24.5C14.5 23 4.5 16.5 4.5 9.8c0-3.4 2.7-5.8 5.6-5.8 2.4 0 4.4 1.6 5.9 3.5 1.5-1.9 3.5-3.5 5.9-3.5 2.9 0 5.6 2.4 5.6 5.8 0 6.7-10 13.2-11.5 14.7z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default function Manifeste({ onClose }) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const aliveRef = useRef(true);
  const timeoutsRef = useRef([]);

  const safeTimeout = (fn, ms) => {
    const id = setTimeout(() => {
      if (aliveRef.current) fn();
    }, ms);
    timeoutsRef.current.push(id);
    return id;
  };

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => {
      cancelAnimationFrame(id);
      aliveRef.current = false;
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, []);

  const doClose = () => {
    if (closing) return;
    haptic(3);
    setClosing(true);
    safeTimeout(() => onClose?.(), 320);
  };

  // Edge swipe-back (iOS HIG)
  const {
    bindContainer: bindEdge,
    translateX: edgeX,
    isDragging: edgeDragging,
  } = useEdgeSwipeBack({ onClose: doClose });

  const verticalTransform = closing
    ? 'translateY(100%)'
    : mounted
      ? 'translateY(0)'
      : 'translateY(100%)';
  const transform = `translateX(${edgeX}px) ${verticalTransform}`;
  const opacity = closing ? 0 : mounted ? 1 : 0;

  return (
    <div
      {...bindEdge}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 90,
        background: CREAM,
        color: INK,
        overflowY: 'auto',
        overflowX: 'hidden',
        opacity,
        transform,
        transition: edgeDragging
          ? 'none'
          : closing
            ? 'transform 320ms var(--ease-out-ios), opacity 320ms var(--ease-out-ios)'
            : 'transform 420ms var(--ease-out-ios), opacity 420ms var(--ease-out-ios)',
        WebkitFontSmoothing: 'antialiased',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* ── Section 7 — Top bar sticky ─────────────────────── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 5,
          padding: 'calc(env(safe-area-inset-top, 0px) + 12px) 22px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(251, 246, 232, 0.92)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(26, 26, 47, 0.06)',
        }}
      >
        <button
          type="button"
          data-press
          onClick={doClose}
          aria-label="Retour"
          style={{
            appearance: 'none',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '12px 14px',
            minWidth: 44,
            minHeight: 44,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: INK_SOFT,
            WebkitTapHighlightColor: 'transparent',
            marginLeft: -14,
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1, marginRight: 2 }}>‹</span>
          Retour
        </button>
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            color: INK_SOFT,
          }}
        >
          ÇA VA ? · MANIFESTE
        </div>
        <button
          type="button"
          data-press
          onClick={doClose}
          aria-label="Fermer"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '1px solid rgba(26, 26, 47, 0.10)',
            background: 'transparent',
            color: INK,
            fontSize: 16,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            transition: 'transform 120ms var(--ease-out-ios)',
          }}
        >
          ✕
        </button>
      </div>

      {/* ── Section 1 — Cover ──────────────────────────────── */}
      <section
        style={{
          padding: '40px 24px 56px',
          textAlign: 'left',
          position: 'relative',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            color: INK_SOFT,
            marginBottom: 28,
          }}
        >
          ÇA VA ? · MANIFESTE
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(40px, 12vw, 56px)',
            lineHeight: 1.04,
            letterSpacing: '-0.018em',
            color: INK,
            margin: 0,
            fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1',
          }}
        >
          « Briser le masque du{' '}
          <em
            className="neya-key"
            style={{
              fontStyle: 'italic',
              fontWeight: 300,
              color: TERRACOTTA,
              fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1',
            }}
          >
            ça va.
          </em>
           »
        </h1>

        <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
          <HandHeart color={TERRACOTTA} size={26} />
          <div style={{ height: 1, width: 40, background: 'rgba(26, 26, 47, 0.15)' }} />
        </div>

        <p
          style={{
            marginTop: 22,
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            lineHeight: 1.6,
            color: INK_SOFT,
            maxWidth: 440,
          }}
        >
          Nous existons pour faire de la mode un langage qui libère la parole
          sur la santé mentale.
        </p>
      </section>

      {/* ── Section 2 — Notre raison d'être ────────────────── */}
      <section
        style={{
          margin: '0 16px 32px',
          padding: '32px 24px 36px',
          background: CREAM_DIM,
          borderRadius: 22,
          border: '1px solid rgba(26, 26, 47, 0.05)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            color: TERRACOTTA,
            marginBottom: 18,
          }}
        >
          POURQUOI
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 26,
            lineHeight: 1.18,
            letterSpacing: '-0.014em',
            color: INK,
            margin: 0,
            fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1',
          }}
        >
          « Personne ne dit comment ça va vraiment. »
        </h2>

        <p
          style={{
            marginTop: 20,
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            lineHeight: 1.65,
            color: INK_SOFT,
          }}
        >
          Chaque jour, des millions de personnes répondent «&nbsp;ça va&nbsp;» sans
          y croire. La mode, elle aussi, est devenue un masque. Nous proposons
          l’inverse&nbsp;: un vêtement qui dit ce que tu n’oses pas
          dire. Une broderie qui parle pour toi.
        </p>
      </section>

      {/* ── Section 3 — Les capsules ───────────────────────── */}
      <section style={{ padding: '0 24px 16px' }}>
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            color: INK_SOFT,
            marginBottom: 22,
          }}
        >
          LES CAPSULES
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {CAPSULES.map((c) => (
            <article key={c.name}>
              <div
                style={{
                  width: 56,
                  height: 2,
                  background: c.color,
                  marginBottom: 14,
                  borderRadius: 1,
                }}
              />
              <div
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: '0.222em',
                  textTransform: 'uppercase',
                  color: c.color,
                  marginBottom: 10,
                }}
              >
                {c.name.toUpperCase()}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  fontSize: 22,
                  lineHeight: 1.22,
                  letterSpacing: '-0.012em',
                  color: INK,
                  marginBottom: 10,
                  fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1',
                }}
              >
                {c.tagline}
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: INK_SOFT,
                  margin: 0,
                }}
              >
                {c.desc}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Section 4 — L'atelier ──────────────────────────── */}
      <section
        style={{
          padding: '56px 24px 56px',
          marginTop: 32,
          borderTop: '1px solid rgba(26, 26, 47, 0.06)',
          borderBottom: '1px solid rgba(26, 26, 47, 0.06)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            color: TERRACOTTA,
            marginBottom: 18,
          }}
        >
          L’ATELIER
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 26,
            lineHeight: 1.2,
            letterSpacing: '-0.014em',
            color: INK,
            margin: 0,
            fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1',
          }}
        >
          « Chaque broderie est faite à la main. »
        </h2>

        <p
          style={{
            marginTop: 20,
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            lineHeight: 1.65,
            color: INK_SOFT,
            maxWidth: 460,
          }}
        >
          Notre atelier est à Paris, rue de Belleville. Trois personnes brodent
          chaque commande. Aucune machine, aucune décoration&nbsp;; juste du
          fil sur du coton bio.
        </p>

        <div
          style={{
            marginTop: 28,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            opacity: 0.85,
          }}
        >
          {[TERRACOTTA, OCHRE, EMERALD, SAGE, MIST_BLUE].map((col) => (
            <HandHeart key={col} color={col} size={18} />
          ))}
        </div>
      </section>

      {/* ── Section 5 — Les valeurs ────────────────────────── */}
      <section style={{ padding: '48px 24px 48px' }}>
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            color: INK_SOFT,
            marginBottom: 26,
          }}
        >
          NOS VALEURS
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          {VALUES.map((v) => (
            <div
              key={v.title}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 28,
                  lineHeight: 1,
                  color: v.color,
                  flex: '0 0 32px',
                  textAlign: 'center',
                }}
              >
                {v.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.222em',
                    textTransform: 'uppercase',
                    color: INK,
                    marginBottom: 6,
                  }}
                >
                  {v.title}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 12,
                    lineHeight: 1.55,
                    color: INK_SOFT,
                  }}
                >
                  {v.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 6 — La citation ────────────────────────── */}
      <section
        style={{
          margin: '0 0 0',
          padding: '64px 28px 80px',
          background:
            'radial-gradient(circle at 50% 20%, #FBE8D8 0%, transparent 60%), ' +
            'radial-gradient(circle at 30% 80%, #F8F2E0 0%, transparent 65%), ' +
            CREAM,
          textAlign: 'left',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 26,
          }}
        >
          <HandHeart color={TERRACOTTA} size={20} />
          <div style={{ height: 1, width: 32, background: 'rgba(26, 26, 47, 0.18)' }} />
        </div>

        <blockquote
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(22px, 6vw, 28px)',
            lineHeight: 1.28,
            letterSpacing: '-0.012em',
            color: INK,
            margin: 0,
            maxWidth: 520,
            fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1',
          }}
        >
          « When the power of love overcomes the love of power, the world
          will know peace. »
        </blockquote>

        <div
          style={{
            marginTop: 28,
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            color: INK_SOFT,
          }}
        >
          JIMI HENDRIX · CITATION TRANSMISE PAR ÇA VA?
        </div>
      </section>

      {/* ── Footer minimal ─────────────────────────────────── */}
      <footer
        style={{
          padding: '32px 24px calc(env(safe-area-inset-bottom, 0px) + 56px)',
          textAlign: 'center',
          borderTop: '1px solid rgba(26, 26, 47, 0.06)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 24,
            color: INK,
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: 6,
            fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1',
          }}
        >
          ça va
          <HandHeart color={TERRACOTTA} size={16} />
          ?
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            color: INK_SOFT,
          }}
        >
          PARIS · BELLEVILLE · 2026
        </div>
      </footer>
    </div>
  );
}
