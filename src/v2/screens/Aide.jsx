/* ============================================================
   NÉYA V2 — Aide & Ressources
   ============================================================
   Premise : users may be mentally suffering. Push toward real
   professional help (3114, SOS Amitié, 3919) without shaming
   digital comfort. No tracking, no analytics, no judgment.

   Sections :
     Hero       — italic Fraunces, opening softness
     Urgence    — 3 cards 24h/24 (3114, SOS Amitié, 3919)
     Thérapeute — comment trouver + Mon Soutien Psy
     Lignes     — 5 lignes spécialisées (suicide, drogues, alcool…)
     Témoignages — 3 voix anonymes
     Footer     — whisper "tu peux revenir"

   Style : LIGHT cream + ink · wash-temple background
   Animations : slide-up 420ms / slide-down 320ms
   ============================================================ */

import { useState, useEffect } from 'react';
import { haptic } from '../state';
import useEdgeSwipeBack from '../hooks/useEdgeSwipeBack';

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
    desc: '24h/24, anonyme, gratuit. Pour toi ou pour quelqu\'un.',
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
      'J\'ai attendu trois ans avant d\'appeler le 3114. Vingt minutes de discussion. Tout n\'a pas changé. Mais j\'ai respiré.',
    author: 'A., 31 ans',
  },
  {
    quote:
      'Je voulais une psy parfaite. J\'en ai vu cinq. La sixième m\'a écoutée vraiment. C\'est ok de chercher.',
    author: 'M., 27 ans',
  },
  {
    quote:
      'Le truc qui m\'a aidé : dire à mon frère que ça allait pas. C\'est lui qui a appelé pour moi.',
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

  // Slide-up enter
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleClose = () => {
    haptic(2);
    setClosing(true);
    setTimeout(() => onClose?.(), 320);
  };

  // Edge swipe-back (iOS HIG) — horizontal left-edge drag
  const {
    bindContainer: bindEdge,
    translateX: edgeX,
    isDragging: edgeDragging,
  } = useEdgeSwipeBack({ onClose: handleClose });

  const callTel = (tel) => {
    haptic(6);
    try {
      window.location.href = `tel:${tel}`;
    } catch {}
  };

  const openExternal = (url) => {
    haptic(4);
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {}
  };

  const translateY = closing ? '100%' : mounted ? '0%' : '100%';
  const transitionMs = closing ? 320 : 420;

  return (
    <div
      {...bindEdge}
      className="wash-temple"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 240,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        color: 'var(--ink)',
        transform: `translate(${edgeX}px, ${translateY})`,
        transition: edgeDragging
          ? 'none'
          : `transform ${transitionMs}ms var(--ease-out-ios)`,
        willChange: 'transform',
      }}
    >
      {/* Edge swipe-back hint — discreet left hairline */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: '50%',
          left: 0,
          width: 1,
          height: 80,
          transform: 'translateY(-50%)',
          background: 'var(--ink-faint, rgba(26, 26, 47, 0.18))',
          opacity: edgeDragging ? 0.5 : 0,
          transition: 'opacity 180ms var(--ease-out-ios)',
          pointerEvents: 'none',
          zIndex: 6,
        }}
      />
      {/* ════════════════════════════════════════════════════════
         TOP BAR
         ════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px 14px',
          background:
            'linear-gradient(to bottom, var(--cream) 70%, rgba(251, 246, 232, 0))',
        }}
      >
        <button
          type="button"
          data-press
          onClick={handleClose}
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
            color: 'var(--content-tertiary, var(--ink-soft))',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1, marginRight: 2 }}>‹</span>
          Retour
        </button>
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            color: 'var(--ink-soft)',
            fontWeight: 500,
          }}
        >
          Aide & Ressources
        </span>
        <button
          type="button"
          data-press
          onClick={handleClose}
          aria-label="Fermer"
          style={{
            appearance: 'none',
            border: 'none',
            background: 'transparent',
            color: 'var(--ink-soft)',
            fontSize: 18,
            lineHeight: 1,
            cursor: 'pointer',
            padding: 6,
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          ✕
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════
         HERO
         ════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: '20px 24px 36px',
          textAlign: 'left',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 7vw, 36px)',
            fontStyle: 'italic',
            fontWeight: 300,
            lineHeight: 1.18,
            margin: 0,
            color: 'var(--ink)',
          }}
          dangerouslySetInnerHTML={{
            __html:
              "« Tu n'as pas à porter ça <em class='neya-key'>seul·e</em>. »",
          }}
        />
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            color: 'var(--ink-soft)',
            margin: '14px 0 0',
            lineHeight: 1.55,
            maxWidth: 460,
          }}
        >
          Tu peux parler à quelqu'un. Maintenant. Gratuitement. Sans
          rendez-vous. Ces lignes répondent.
        </p>
      </section>

      {/* ════════════════════════════════════════════════════════
         URGENCE — Lignes d'écoute 24h/24
         ════════════════════════════════════════════════════════ */}
      <section style={{ padding: '0 24px 36px' }}>
        <SectionTitle label="Écoute 24h/24" accent="var(--terracotta)" />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginTop: 18,
          }}
        >
          {URGENCE.map((line) => (
            <UrgenceCard key={line.tel} line={line} onCall={callTel} />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         TROUVER UN·E THÉRAPEUTE
         ════════════════════════════════════════════════════════ */}
      <section style={{ padding: '0 24px 36px' }}>
        <SectionTitle label="Trouver quelqu'un" accent="var(--ochre)" />

        <div
          style={{
            marginTop: 18,
            background: 'var(--cream-light)',
            border: '0.5px solid rgba(194, 144, 81, 0.32)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px 20px',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontStyle: 'italic',
              fontWeight: 300,
              lineHeight: 1.25,
              margin: '0 0 14px',
              color: 'var(--ink)',
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
                  fontFamily: 'var(--font-ui)',
                  fontSize: 13,
                  color: 'var(--ink-soft)',
                  lineHeight: 1.55,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    color: 'var(--tilleul)',
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
                      color: 'var(--ink)',
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
              color: 'var(--ochre)',
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: 0,
              padding: '10px 0 0',
              marginTop: 6,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              textAlign: 'left',
              display: 'inline-block',
            }}
          >
            Voir Mon Soutien Psy →
          </button>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         LIGNES SPÉCIALISÉES
         ════════════════════════════════════════════════════════ */}
      <section style={{ padding: '0 24px 36px' }}>
        <SectionTitle label="Autres lignes" accent="var(--mist-blue)" />

        <div
          style={{
            marginTop: 18,
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

      {/* ════════════════════════════════════════════════════════
         TÉMOIGNAGES
         ════════════════════════════════════════════════════════ */}
      <section style={{ padding: '0 24px 32px' }}>
        <SectionTitle label="Ils s'en sont sortis" accent="var(--emerald)" />

        <div
          style={{
            marginTop: 18,
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
                borderLeft: '1px solid rgba(52, 145, 127, 0.40)',
              }}
            >
              <blockquote
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 14,
                  fontStyle: 'italic',
                  fontWeight: 300,
                  color: 'var(--ink)',
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                « {t.quote} »
              </blockquote>
              <figcaption
                style={{
                  marginTop: 8,
                  fontFamily: 'var(--font-ui)',
                  fontSize: 9,
                  letterSpacing: '0.222em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-whisper)',
                  fontWeight: 500,
                }}
              >
                · {t.author}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         FOOTER WHISPER
         ════════════════════════════════════════════════════════ */}
      <footer
        style={{
          padding: '8px 24px 56px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 13,
            fontStyle: 'italic',
            fontWeight: 300,
            color: 'var(--ink-whisper)',
            lineHeight: 1.55,
            margin: 0,
            maxWidth: 320,
            marginInline: 'auto',
          }}
        >
          Tu peux revenir ici chaque fois que tu veux. Cette page ne s'efface
          pas.
        </p>
      </footer>
    </div>
  );
}

/* ============================================================
   SectionTitle — caps 9 + hairline accent
   ============================================================ */
function SectionTitle({ label, accent }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 9,
          letterSpacing: '0.222em',
          textTransform: 'uppercase',
          color: 'var(--ink-soft)',
          fontWeight: 500,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <span
        aria-hidden
        style={{
          flex: 1,
          height: 1,
          background: accent,
          opacity: 0.45,
        }}
      />
    </div>
  );
}

/* ============================================================
   UrgenceCard — large card, terracotta hairline, terracotta CTA
   ============================================================ */
function UrgenceCard({ line, onCall }) {
  return (
    <article
      style={{
        background: 'var(--cream-light)',
        border: '0.5px solid rgba(159, 88, 76, 0.20)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 18px 16px',
        boxShadow: 'var(--shadow-soft)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--ink)',
          letterSpacing: 0,
          lineHeight: 1.2,
        }}
      >
        {line.name}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 16,
          fontStyle: 'italic',
          fontWeight: 300,
          color: 'var(--ink-soft)',
          lineHeight: 1.35,
        }}
      >
        {line.italic}
      </div>
      <p
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 12,
          color: 'var(--ink-soft)',
          margin: '4px 0 12px',
          lineHeight: 1.5,
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
          background: 'var(--terracotta)',
          color: 'var(--cream)',
          fontFamily: 'var(--font-ui)',
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: 0,
          padding: '9px 16px',
          borderRadius: 999,
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          boxShadow: '0 1px 6px rgba(159, 88, 76, 0.22)',
        }}
      >
        Appeler →
      </button>
    </article>
  );
}

/* ============================================================
   LigneMini — small 2-col card, ink CTA (less urgent)
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
        background: 'var(--cream-light)',
        border: '0.5px solid rgba(115, 151, 188, 0.28)',
        borderRadius: 'var(--radius-lg)',
        padding: '12px 14px 14px',
        boxShadow: 'var(--shadow-soft)',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        color: 'var(--ink)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--ink)',
          letterSpacing: 0,
          lineHeight: 1.2,
        }}
      >
        {formatTel(line.tel)}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 14,
          fontStyle: 'italic',
          fontWeight: 300,
          color: 'var(--ink-soft)',
          lineHeight: 1.3,
        }}
      >
        {line.name}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 9,
          letterSpacing: '0.222em',
          textTransform: 'uppercase',
          color: 'var(--ink-whisper)',
          fontWeight: 500,
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
  if (raw.length === 4) return raw; // 3114, 3919
  if (raw.length === 10) {
    return raw.match(/.{1,2}/g)?.join(' ') || raw;
  }
  return raw;
}
