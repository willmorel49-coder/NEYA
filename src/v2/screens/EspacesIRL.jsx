/* ============================================================
   ÇA VA ? V4 — Espaces IRL (Design System unifié)
   ============================================================
   Le digital est un pont — le but est la vie réelle.
   Annuaire d'espaces où venir seul·e sans être jugé·e.
   ============================================================ */

import { useState, useEffect, useMemo } from 'react';
import { haptic } from '../state';
import { useToast, TOAST_PRESETS } from '../../components/Toast';
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

/* ============================================================
   HARDCODED LIST — V1 illustrative
   ============================================================ */

const ESPACES = [
  {
    id: 'pari-cafe-vie',
    city: 'Paris', district: '11e',
    name: 'Café La Vie',
    type: 'café solidaire',
    desc: 'Café-discussion ouvert. Tu peux venir seul·e, t’asseoir, dire bonjour. Personne ne juge.',
    icon: '☕',
    accent: tokens.blue700,
    times: 'Lun-ven · 9h-19h',
    address: '14 rue du Faubourg du Temple, 75011',
    url: null,
  },
  {
    id: 'pari-marche',
    city: 'Paris', district: 'Île Saint-Louis',
    name: 'Marche du Dimanche',
    type: 'groupe de marche',
    desc: 'Marche silencieuse de 8km tous les dimanches. Inscris-toi, viens, marche. Aucun mot obligé.',
    icon: '↗',
    accent: tokens.violet,
    times: 'Dim · 10h précises',
    address: 'Pont Saint-Louis · Métro Pont Marie',
    url: 'https://marche-du-dimanche.fr',
  },
  {
    id: 'lyon-atelier',
    city: 'Lyon', district: '1er',
    name: 'Atelier Présence',
    type: 'atelier de parole',
    desc: 'Groupes de parole hebdomadaires, max 8 personnes. Animé par une psychologue. Gratuit.',
    icon: '◯',
    accent: tokens.blue700,
    times: 'Mar · 18h-20h',
    address: '12 place des Terreaux, 69001',
    url: null,
  },
  {
    id: 'marseille-jardin',
    city: 'Marseille', district: 'Belle de Mai',
    name: 'Jardin Partagé',
    type: 'jardin solidaire',
    desc: 'Jardin associatif. Plante, arrose, observe. Personne ne te demande pourquoi tu es là.',
    icon: '❦',
    accent: tokens.violet,
    times: 'Sam · 14h-18h',
    address: 'Friche La Belle de Mai',
    url: null,
  },
  {
    id: 'toulouse-cafe-parole',
    city: 'Toulouse', district: 'Saint-Cyprien',
    name: 'Café-Parole',
    type: 'café-débat',
    desc: 'Café mensuel autour d’un thème (solitude, deuil, sommeil…). Première fois = bienvenue.',
    icon: '☕',
    accent: tokens.blue700,
    times: '1er jeudi · 19h-21h',
    address: 'Café Solidaire 31',
    url: null,
  },
  {
    id: 'national-3018',
    city: 'En ligne · National', district: 'Net Écoute',
    name: 'Net Écoute · 3018',
    type: 'tchat anonyme',
    desc: 'Tchat en ligne anonyme. Réponse rapide. Pour 18-25 ans en majorité, ouvert à tous.',
    icon: '◇',
    accent: tokens.blue500,
    times: 'Tous les jours · 9h-23h',
    address: 'https://e-enfance.org',
    url: 'https://e-enfance.org/numero-3018/',
  },
  {
    id: 'national-pair-aidance',
    city: 'National', district: 'Esemble',
    name: 'Espace Esemble',
    type: 'pair-aidance',
    desc: 'Groupes de soutien par les pairs (personnes qui ont vécu la même chose que toi). Animés en ligne ou présentiel selon ville.',
    icon: '✦',
    accent: tokens.violet,
    times: 'Variables · Inscription',
    address: 'esemble.org',
    url: 'https://esemble.org',
  },
  {
    id: 'pari-yoga-don',
    city: 'Paris', district: '20e',
    name: 'Yoga à prix libre',
    type: 'cours collectif',
    desc: 'Cours de yoga doux à prix libre (donne ce que tu peux, même 0). Pas de niveau requis.',
    icon: '◓',
    accent: tokens.rose700,
    times: 'Mer + Sam · 18h30',
    address: 'Centre Maraichers 75020',
    url: null,
  },
  {
    id: 'national-aa',
    city: 'National', district: 'AA France',
    name: 'Alcooliques Anonymes',
    type: 'groupe AA',
    desc: 'Réunions ouvertes ou fermées partout en France. Anonymat absolu. Tu n’as qu’à dire ton prénom (ou pas).',
    icon: '◯',
    accent: tokens.blue500,
    times: 'Plusieurs/jour · alcooliques-anonymes.fr',
    address: 'alcooliques-anonymes.fr',
    url: 'https://www.alcooliques-anonymes.fr',
  },
  {
    id: 'national-overeaters',
    city: 'National', district: 'OA France',
    name: 'Outremangeurs Anonymes',
    type: 'groupe OA',
    desc: 'Réunions par téléphone, Zoom, ou en présentiel. Trouble alimentaire = pas honte, accueil sans condition.',
    icon: '◐',
    accent: tokens.rose700,
    times: 'Plusieurs/jour · outremangeurs.org',
    address: 'outremangeurs.org',
    url: 'https://outremangeurs.org',
  },
];

const FILTERS = [
  { key: 'all',     label: 'Tout',              enabled: true  },
  { key: 'nearby',  label: 'Près de chez moi',  enabled: false },
  { key: 'free',    label: 'Pas cher / gratuit', enabled: true },
  { key: 'online',  label: 'En ligne',          enabled: true  },
];

const FREE_TYPES = new Set([
  'café solidaire',
  'café-débat',
  'atelier de parole',
  'jardin solidaire',
  'tchat anonyme',
  'pair-aidance',
  'cours collectif',
  'groupe AA',
  'groupe OA',
  'groupe de marche',
]);

function matchesFilter(espace, filter) {
  if (filter === 'all') return true;
  if (filter === 'online') {
    return /en ligne|national|tchat|téléphone|zoom/i.test(
      `${espace.city} ${espace.type} ${espace.desc}`
    );
  }
  if (filter === 'free') return FREE_TYPES.has(espace.type);
  return true;
}

export default function EspacesIRL({ onClose }) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [revealCount, setRevealCount] = useState(0);
  const showToast = useToast();

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

  useEffect(() => {
    if (!mounted) return;
    let i = 0;
    let timer = null;
    const total = ESPACES.length;
    const tick = () => {
      i += 1;
      setRevealCount(i);
      if (i < total) {
        timer = setTimeout(tick, 55);
      } else {
        timer = null;
      }
    };
    timer = setTimeout(tick, 120);
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [mounted]);

  const doClose = () => {
    if (closing) return;
    haptic(3);
    setClosing(true);
    setTimeout(() => onClose?.(), 320);
  };

  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closing,
    onClose: doClose,
    labelText: 'Espaces de soutien',
  });

  const switchFilter = (key, enabled) => {
    if (!enabled) {
      haptic(2);
      return;
    }
    haptic(4);
    setFilter(key);
  };

  const handleGo = (espace) => {
    haptic([6, 30, 6]);
    if (espace.url) {
      try { window.open(espace.url, '_blank', 'noopener,noreferrer'); } catch {}
      return;
    }
    try {
      navigator.clipboard?.writeText(espace.address);
    } catch {}
    showToast({ ...TOAST_PRESETS.copied, message: 'Adresse copiée.' });
  };

  const filtered = useMemo(
    () => ESPACES.filter((e) => matchesFilter(e, filter)),
    [filter]
  );

  return (
    <div
      ref={containerRef}
      {...dialogProps}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 240,
        background: tokens.bg,
        color: tokens.textPrimary,
        overflow: 'hidden',
        opacity: closing ? 0 : mounted ? 1 : 0,
        transform: closing
          ? 'translateY(100%)'
          : mounted
            ? 'translateY(0)'
            : 'translateY(100%)',
        transition: 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 420ms cubic-bezier(0.16, 1, 0.3, 1)',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <Blobs variant="blue-rose" />

      {/* Scrollable content with sticky header */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Header title="Espaces IRL" onBack={doClose} />

        <div
          style={{
            padding:
              '12px 22px calc(env(safe-area-inset-bottom, 0px) + 60px)',
          }}
        >
          {/* Hero */}
          <div style={{ maxWidth: 360 }}>
            <HeroTitle size="md">
              « Sors. Personne ne te <span style={{ color: tokens.rose700 }}>verra trembler</span>. »
            </HeroTitle>
            <div style={{ marginTop: 14, marginBottom: 26 }}>
              <Body variant="body-sm">
                Des endroits où on accueille sans poser de question. Tu peux venir
                seul·e.
              </Body>
            </div>
          </div>

          {/* Filter chips — glass */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              marginBottom: 22,
            }}
          >
            {FILTERS.map((f) => {
              const active = filter === f.key;
              const disabled = !f.enabled;
              return (
                <button
                  key={f.key}
                  type="button"
                  data-press={!disabled || undefined}
                  onClick={() => switchFilter(f.key, f.enabled)}
                  disabled={disabled}
                  style={{
                    appearance: 'none',
                    padding: '8px 16px',
                    borderRadius: 999,
                    border: active
                      ? `1px solid ${tokens.blue700}`
                      : '1px solid rgba(255, 255, 255, 0.85)',
                    background: active
                      ? tokens.gradientBlue
                      : 'rgba(255, 255, 255, 0.65)',
                    backdropFilter: tokens.glass.blur,
                    WebkitBackdropFilter: tokens.glass.blur,
                    color: active
                      ? '#FFFFFF'
                      : disabled
                        ? tokens.textMuted
                        : tokens.blue700,
                    fontFamily: tokens.fonts.ui,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.45 : 1,
                    WebkitTapHighlightColor: 'transparent',
                    boxShadow: active ? '0 4px 14px rgba(26, 90, 127, 0.25)' : 'none',
                    transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), background 220ms cubic-bezier(0.16, 1, 0.3, 1), color 220ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {f.label}
                  {disabled && (
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: 9,
                        opacity: 0.6,
                        letterSpacing: '0.12em',
                      }}
                    >
                      bientôt
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Cards list */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {filtered.length === 0 && (
              <div
                style={{
                  padding: '28px 18px',
                  borderRadius: 20,
                  border: `1px dashed ${tokens.blue300}`,
                  background: 'rgba(255, 255, 255, 0.45)',
                  backdropFilter: tokens.glass.blur,
                  WebkitBackdropFilter: tokens.glass.blur,
                  color: tokens.textSecondary,
                  fontFamily: tokens.fonts.body,
                  fontSize: 14,
                  lineHeight: 1.6,
                  textAlign: 'center',
                }}
              >
                Aucun espace pour ce filtre. La liste s’enrichira.
              </div>
            )}

            {filtered.map((espace) => {
              const originalIdx = ESPACES.findIndex((e) => e.id === espace.id);
              const visible = revealCount > originalIdx;
              return (
                <EspaceCard
                  key={espace.id}
                  espace={espace}
                  visible={visible}
                  onGo={() => handleGo(espace)}
                />
              );
            })}
          </div>

          {/* Footer */}
          <p
            style={{
              margin: '30px 0 4px',
              fontFamily: tokens.fonts.display,
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 15,
              lineHeight: 1.55,
              color: tokens.textSecondary,
              maxWidth: 360,
            }}
          >
            Cette liste s’enrichira. Si tu connais un espace, écris-nous. (Pour
            l’instant, en local seulement.)
          </p>
          <div style={{ marginTop: 8 }}>
            <Eyebrow color="muted">À enrichir avec partenaires ÇA VA ?</Eyebrow>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ESPACE CARD — GlassCard V4
   ============================================================ */

function EspaceCard({ espace, visible, onGo }) {
  return (
    <GlassCard
      radius="lg"
      elevation="soft"
      padding="18px 20px"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(14px)',
        transition: 'opacity 360ms cubic-bezier(0.16, 1, 0.3, 1), transform 360ms cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {/* Top row : icon + city */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            lineHeight: 1,
            color: espace.accent,
            flexShrink: 0,
          }}
          aria-hidden
        >
          {espace.icon}
        </div>
        <div
          style={{
            fontFamily: tokens.fonts.ui,
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: tokens.textMuted,
            textAlign: 'right',
            lineHeight: 1.3,
          }}
        >
          {espace.city}
          {espace.district && (
            <>
              <br />
              {espace.district}
            </>
          )}
        </div>
      </div>

      {/* Title + type */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: tokens.fonts.display,
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 20,
            lineHeight: 1.25,
            color: tokens.textPrimary,
            letterSpacing: '-0.005em',
          }}
        >
          {espace.name}
        </h3>
        <span
          style={{
            fontFamily: tokens.fonts.ui,
            fontSize: 11,
            fontWeight: 600,
            color: espace.accent,
            letterSpacing: '0.04em',
          }}
        >
          · {espace.type}
        </span>
      </div>

      {/* Description */}
      <Body variant="body-sm">{espace.desc}</Body>

      {/* Bottom row : times + address */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
          marginTop: 2,
          paddingTop: 12,
          borderTop: `0.5px solid ${tokens.blue300}`,
        }}
      >
        <div
          style={{
            fontFamily: tokens.fonts.ui,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: tokens.blue700,
            flex: '1 1 auto',
            minWidth: 0,
          }}
        >
          {espace.times}
        </div>
        <div
          style={{
            fontFamily: tokens.fonts.ui,
            fontSize: 11,
            fontWeight: 400,
            letterSpacing: '0.02em',
            color: tokens.textSecondary,
            textAlign: 'right',
            flex: '0 1 auto',
            wordBreak: 'break-word',
            maxWidth: '52%',
          }}
        >
          {espace.address}
        </div>
      </div>

      {/* CTA — outline blue */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <CTA variant="outline" size="sm" onClick={onGo}>
          Y aller <span aria-hidden style={{ fontSize: 13, opacity: 0.8 }}>→</span>
        </CTA>
      </div>
    </GlassCard>
  );
}
