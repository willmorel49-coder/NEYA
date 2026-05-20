/* ============================================================
   ÇA VA ? V4 — Aide & Ressources (Design System unifié)
   ============================================================
   Push vers vraie aide pro (3114, SOS Amitié, 3919) sans honte.
   Migré V4 : composants atomiques ../../components/ui.
   ============================================================ */

import { useState, useEffect } from 'react';
import { haptic } from '../state';
import useEdgeSwipeBack from '../hooks/useEdgeSwipeBack';
import useStandardOverlay from '../hooks/useStandardOverlay';
import Blobs from '../../components/Blobs';
import {
  Header,
  GlassCard,
  Eyebrow,
  HeroTitle,
  Body,
  CTA,
  tokens,
} from '../../components/ui';

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
        background: tokens.bg,
        color: tokens.textPrimary,
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

      <Header title="Aide & ressources" onBack={handleClose} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* HERO */}
        <section style={{ padding: '24px 22px 28px' }}>
          <HeroTitle size="md">
            « Tu n’as pas à porter ça <span style={{ color: tokens.rose700 }}>seul·e</span>. »
          </HeroTitle>
          <div style={{ marginTop: 14, maxWidth: 460 }}>
            <Body variant="body-sm">
              Tu peux parler à quelqu’un. Maintenant. Gratuitement. Sans rendez-vous.
              Ces lignes répondent.
            </Body>
          </div>
        </section>

        {/* URGENCE — accent rose */}
        <section style={{ padding: '0 22px 28px' }}>
          <Eyebrow color="primary" style={{ color: tokens.textPrimary }}>Écoute 24h/24</Eyebrow>
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
          <Eyebrow color="primary" style={{ color: tokens.textPrimary }}>Trouver quelqu’un</Eyebrow>
          <GlassCard radius="lg" elevation="soft" padding="18px 20px 20px" style={{ marginTop: 14 }}>
            <h3
              style={{
                fontFamily: tokens.fonts.display,
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: 22,
                lineHeight: 1.25,
                margin: '0 0 14px',
                color: tokens.textPrimary,
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
                    fontFamily: tokens.fonts.body,
                    fontSize: 14,
                    fontWeight: 400,
                    color: tokens.textSecondary,
                    lineHeight: 1.55,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      color: tokens.violet,
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
                        color: tokens.textPrimary,
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

            <div style={{ marginTop: 12 }}>
              <CTA
                variant="ghost"
                size="sm"
                onClick={() => openExternal('https://monsoutienpsy.sante.gouv.fr/')}
              >
                Voir Mon Soutien Psy →
              </CTA>
            </div>
          </GlassCard>
        </section>

        {/* LIGNES SPÉCIALISÉES */}
        <section style={{ padding: '0 22px 28px' }}>
          <Eyebrow color="primary" style={{ color: tokens.textPrimary }}>Autres lignes</Eyebrow>
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
          <Eyebrow color="primary" style={{ color: tokens.textPrimary }}>Ils s’en sont sortis</Eyebrow>
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
                  borderLeft: `2px solid ${tokens.rose500}`,
                }}
              >
                <blockquote
                  style={{
                    fontFamily: tokens.fonts.display,
                    fontStyle: 'italic',
                    fontWeight: 300,
                    fontSize: 16,
                    color: tokens.textPrimary,
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  « {t.quote} »
                </blockquote>
                <figcaption style={{ marginTop: 8 }}>
                  <Eyebrow color="muted">· {t.author}</Eyebrow>
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
              fontFamily: tokens.fonts.display,
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 16,
              color: tokens.textSecondary,
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
   UrgenceCard — GlassCard avec accent rose + CTA rose
   ============================================================ */
function UrgenceCard({ line, onCall }) {
  return (
    <GlassCard
      radius="lg"
      elevation="soft"
      padding="18px 20px"
      style={{
        borderLeft: `3px solid ${tokens.rose700}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div
        style={{
          fontFamily: tokens.fonts.ui,
          fontSize: 16,
          fontWeight: 600,
          color: tokens.textPrimary,
          lineHeight: 1.2,
        }}
      >
        {line.name}
      </div>
      <div
        style={{
          fontFamily: tokens.fonts.display,
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 16,
          color: tokens.textSecondary,
          lineHeight: 1.35,
        }}
      >
        {line.italic}
      </div>
      <div style={{ margin: '4px 0 14px' }}>
        <Body variant="body-sm">{line.desc}</Body>
      </div>

      <div>
        <CTA variant="rose" size="sm" onClick={() => onCall(line.tel)}>
          Appeler →
        </CTA>
      </div>
    </GlassCard>
  );
}

/* ============================================================
   LigneMini — GlassCard small, ton bleu
   ============================================================ */
function LigneMini({ line, onCall }) {
  return (
    <GlassCard
      radius="md"
      elevation="soft"
      padding="14px 16px"
      onClick={() => onCall(line.tel)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        color: tokens.textPrimary,
      }}
    >
      <div
        style={{
          fontFamily: tokens.fonts.ui,
          fontSize: 14,
          fontWeight: 600,
          color: tokens.blue700,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.2,
        }}
      >
        {formatTel(line.tel)}
      </div>
      <div
        style={{
          fontFamily: tokens.fonts.display,
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 15,
          color: tokens.textPrimary,
          lineHeight: 1.3,
        }}
      >
        {line.name}
      </div>
      <div style={{ marginTop: 2 }}>
        <Eyebrow color="muted">{line.desc}</Eyebrow>
      </div>
    </GlassCard>
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
