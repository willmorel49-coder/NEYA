/* ============================================================
   ÇA VA ? V3 — Aide & Ressources (palette bleu/rose · glass)
   ============================================================
   Push vers vraie aide pro (3114, SOS Amitié, 3919) sans honte.
   Refonte V3 : Blobs rose-blue, glass cards, Cormorant italic,
   CTA gradient bleu, Urgence accent rose.
   ============================================================ */

import { useState, useEffect } from 'react';
import { haptic } from '../state';
import useEdgeSwipeBack from '../hooks/useEdgeSwipeBack';
import useStandardOverlay from '../hooks/useStandardOverlay';
import Blobs from '../../components/Blobs';

const URGENCE = [
  {
    name: '3114',
    italic: 'Le numéro national de prévention du suicide',
    desc: 'Anonyme. Gratuit. 24h/24. Des écoutants formés répondent.',
    tel: '3114',
  },
  {
    name: 'SOS Amitié',
    italic: 'Détresse psychologique, isolement',
    desc: '24h/24, anonyme. 09 72 39 40 50.',
    tel: '0972394050',
  },
  {
    name: '3919',
    italic: 'Violences conjugales, famille',
    desc: '24h/24, anonyme, gratuit. Pour toi ou pour quelqu’un.',
    tel: '3919',
  },
];

const LIGNES = [
  { name: 'Suicide écoute',   tel: '0145394000', desc: '24h/24' },
  { name: 'Drogues info',     tel: '0800231313', desc: 'Addictions' },
  { name: 'Alcool écoute',    tel: '0980980930', desc: 'Tous les jours 8-2h' },
  { name: 'Fil Santé Jeunes', tel: '0800235236', desc: '< 25 ans' },
  { name: 'Stop Djihadisme',  tel: '0800005696', desc: 'Famille' },
];

const TEMOIGNAGES = [
  {
    quote:
      'J’ai attendu trois ans avant d’appeler le 3114. Vingt minutes de discussion. Tout n’a pas changé. Mais j’ai respiré.',
    author: 'A., 31 ans',
  },
  {
    quote:
      'Je voulais une psy parfaite. J’en ai vu cinq. La sixième m’a écoutée vraiment. C’est ok de chercher.',
    author: 'M., 27 ans',
  },
  {
    quote:
      'Le truc qui m’a aidé : dire à mon frère que ça allait pas. C’est lui qui a appelé pour moi.',
    author: 'L., 34 ans',
  },
];

const TROUVER = [
  { strong: 'Demande un avis', tail: ' à ton médecin traitant.' },
  {
    strong: 'Cherche par approche',
    tail: ' (TCC, thérapie analytique, EMDR, gestalt…).',
  },
  {
    strong: 'Premier rendez-vous = test',
    tail: ' — tu peux changer si ça ne le fait pas.',
  },
  {
    strong: 'Le coût',
    tail: ' : remboursement Mon Soutien Psy (8 séances/an), CMP gratuit, mutuelle.',
  },
];

export default function Aide({ onClose }) {
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('neya:fullscreen-overlay', { detail: { open: true } }));
    }
    return () => {
      cancelAnimationFrame(id);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('neya:fullscreen-overlay', { detail: { open: false } }));
      }
    };
  }, []);

  const handleClose = () => {
    haptic(2);
    setClosing(true);
    setTimeout(() => onClose?.(), 320);
  };

  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closing,
    onClose: handleClose,
    labelText: 'Aide & support',
  });

  const {
    bindContainer: bindEdge,
    translateX: edgeX,
    isDragging: edgeDragging,
  } = useEdgeSwipeBack({ onClose: handleClose });

  const callTel = (tel) => {
    haptic(6);
    try { window.location.href = `tel:${tel}`; } catch {}
  };

  const openExternal = (url) => {
    haptic(4);
    try { window.open(url, '_blank', 'noopener,noreferrer'); } catch {}
  };

  const translateY = closing ? '100%' : mounted ? '0%' : '100%';
  const transitionMs = closing ? 320 : 420;

  return (
    <div
      ref={containerRef}
      {...dialogProps}
      {...bindEdge}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 240,
        background: 'var(--bg)',
        color: 'var(--blue-900)',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        transform: `translate(${edgeX}px, ${translateY})`,
        transition: edgeDragging
          ? 'none'
          : `transform ${transitionMs}ms cubic-bezier(0.16, 1, 0.3, 1)`,
        willChange: 'transform',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <Blobs variant="rose-blue" />

      {/* Edge swipe-back hint */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: '50%',
          left: 0,
          width: 1,
          height: 80,
          transform: 'translateY(-50%)',
          background: 'rgba(26, 90, 127, 0.20)',
          opacity: edgeDragging ? 0.5 : 0,
          transition: 'opacity 180ms cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none',
          zIndex: 6,
        }}
      />

      {/* Glass pill back button */}
      <button
        type="button"
        data-press
        onClick={handleClose}
        aria-label="Retour"
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top, 0px) + 14px)',
          left: 16,
          zIndex: 80,
          appearance: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          minHeight: 44,
          padding: '10px 14px',
          borderRadius: 999,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          color: 'var(--blue-700)',
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.02em',
          lineHeight: 1,
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(10, 36, 56, 0.10)',
          WebkitTapHighlightColor: 'transparent',
          transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1), background 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
        Retour
      </button>

      {/* Sticky header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 90px 12px',
          background: 'rgba(238, 243, 248, 0.78)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '0.5px solid rgba(194, 216, 232, 0.25)',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(22px, 5.5vw, 26px)',
            lineHeight: 1.1,
            color: 'var(--blue-900)',
            letterSpacing: '-0.01em',
          }}
        >
          Aide & ressources
        </h1>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* HERO */}
        <section style={{ padding: '24px 22px 28px' }}>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 'clamp(26px, 7vw, 32px)',
              lineHeight: 1.18,
              margin: 0,
              color: 'var(--blue-900)',
              letterSpacing: '-0.01em',
            }}
          >
            « Tu n’as pas à porter ça <span style={{ color: 'var(--rose-700)' }}>seul·e</span>. »
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 400,
              color: 'var(--text-secondary)',
              margin: '14px 0 0',
              lineHeight: 1.6,
              maxWidth: 460,
            }}
          >
            Tu peux parler à quelqu’un. Maintenant. Gratuitement. Sans rendez-vous.
            Ces lignes répondent.
          </p>
        </section>

        {/* URGENCE — accent rose */}
        <section style={{ padding: '0 22px 28px' }}>
          <SectionTitle label="Écoute 24h/24" />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              marginTop: 14,
            }}
          >
            {URGENCE.map((line) => (
              <UrgenceCard key={line.tel} line={line} onCall={callTel} />
            ))}
          </div>
        </section>

        {/* TROUVER UN·E THÉRAPEUTE */}
        <section style={{ padding: '0 22px 28px' }}>
          <SectionTitle label="Trouver quelqu’un" />
          <article
            style={{
              marginTop: 14,
              padding: '18px 20px 20px',
              borderRadius: 20,
              background: 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.85)',
              boxShadow: '0 4px 24px rgba(10, 36, 56, 0.07)',
            }}
          >
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: 22,
                lineHeight: 1.25,
                margin: '0 0 14px',
                color: 'var(--blue-900)',
              }}
            >
              « Comment trouver le ou la bonne ? »
            </h3>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {TROUVER.map((row, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    fontWeight: 400,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.55,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      color: 'var(--violet)',
                      fontSize: 13,
                      lineHeight: 1.55,
                      flexShrink: 0,
                    }}
                  >
                    ✦
                  </span>
                  <span>
                    <strong
                      style={{
                        color: 'var(--blue-900)',
                        fontWeight: 600,
                      }}
                    >
                      {row.strong}
                    </strong>
                    {row.tail}
                  </span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              data-press
              onClick={() =>
                openExternal('https://monsoutienpsy.sante.gouv.fr/')
              }
              style={{
                appearance: 'none',
                border: 'none',
                background: 'transparent',
                color: 'var(--blue-700)',
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: '0.02em',
                padding: '12px 0 0',
                marginTop: 8,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                textAlign: 'left',
                display: 'inline-block',
              }}
            >
              Voir Mon Soutien Psy →
            </button>
          </article>
        </section>

        {/* LIGNES SPÉCIALISÉES */}
        <section style={{ padding: '0 22px 28px' }}>
          <SectionTitle label="Autres lignes" />
          <div
            style={{
              marginTop: 14,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10,
            }}
          >
            {LIGNES.map((line) => (
              <LigneMini key={line.tel} line={line} onCall={callTel} />
            ))}
          </div>
        </section>

        {/* TÉMOIGNAGES */}
        <section style={{ padding: '0 22px 24px' }}>
          <SectionTitle label="Ils s’en sont sortis" />
          <div
            style={{
              marginTop: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            {TEMOIGNAGES.map((t, i) => (
              <figure
                key={i}
                style={{
                  margin: 0,
                  paddingLeft: 14,
                  borderLeft: '2px solid var(--rose-500)',
                }}
              >
                <blockquote
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic',
                    fontWeight: 300,
                    fontSize: 16,
                    color: 'var(--blue-900)',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  « {t.quote} »
                </blockquote>
                <figcaption
                  style={{
                    marginTop: 8,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 10,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                  }}
                >
                  · {t.author}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* FOOTER WHISPER */}
        <footer
          style={{
            padding: '8px 22px calc(env(safe-area-inset-bottom, 0px) + 48px)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 16,
              color: 'var(--text-secondary)',
              lineHeight: 1.55,
              margin: 0,
              maxWidth: 320,
              marginInline: 'auto',
            }}
          >
            Tu peux revenir ici chaque fois que tu veux. Cette page ne s’efface pas.
          </p>
        </footer>
      </div>
    </div>
  );
}

/* ============================================================
   SectionTitle — Inter uppercase 14/600 blue-900
   ============================================================ */
function SectionTitle({ label }) {
  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'var(--blue-900)',
      }}
    >
      {label}
    </div>
  );
}

/* ============================================================
   UrgenceCard — glass card, rose CTA (urgence)
   ============================================================ */
function UrgenceCard({ line, onCall }) {
  return (
    <article
      style={{
        padding: '18px 20px',
        borderRadius: 20,
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.85)',
        borderLeft: '3px solid var(--rose-700)',
        boxShadow: '0 4px 24px rgba(10, 36, 56, 0.07)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 16,
          fontWeight: 600,
          color: 'var(--blue-900)',
          lineHeight: 1.2,
        }}
      >
        {line.name}
      </div>
      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 16,
          color: 'var(--text-secondary)',
          lineHeight: 1.35,
        }}
      >
        {line.italic}
      </div>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          fontWeight: 400,
          color: 'var(--text-secondary)',
          margin: '4px 0 14px',
          lineHeight: 1.55,
        }}
      >
        {line.desc}
      </p>

      <button
        type="button"
        data-press
        onClick={() => onCall(line.tel)}
        style={{
          appearance: 'none',
          alignSelf: 'flex-start',
          border: 'none',
          background: 'var(--gradient-rose)',
          color: '#FFFFFF',
          fontFamily: "'Inter', sans-serif",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          padding: '12px 22px',
          borderRadius: 999,
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          boxShadow: '0 4px 14px rgba(200, 112, 144, 0.30)',
          transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        Appeler →
      </button>
    </article>
  );
}

/* ============================================================
   LigneMini — small glass card, blue tone
   ============================================================ */
function LigneMini({ line, onCall }) {
  return (
    <button
      type="button"
      data-press
      onClick={() => onCall(line.tel)}
      style={{
        appearance: 'none',
        textAlign: 'left',
        padding: '14px 16px',
        borderRadius: 16,
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.85)',
        boxShadow: '0 4px 24px rgba(10, 36, 56, 0.07)',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        color: 'var(--blue-900)',
        transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--blue-700)',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.2,
        }}
      >
        {formatTel(line.tel)}
      </div>
      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 15,
          color: 'var(--blue-900)',
          lineHeight: 1.3,
        }}
      >
        {line.name}
      </div>
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginTop: 2,
        }}
      >
        {line.desc}
      </div>
    </button>
  );
}

/* ============================================================
   formatTel — pretty-print FR phone numbers
   ============================================================ */
function formatTel(raw) {
  if (!raw) return '';
  if (raw.length === 4) return raw;
  if (raw.length === 10) {
    return raw.match(/.{1,2}/g)?.join(' ') || raw;
  }
  return raw;
}
