/* ============================================================
   ÇA VA ? V2 — Espaces IRL (overlay : annuaire d'espaces réels)
   ============================================================
   Le digital est un pont — le but est la vie réelle.
   Annuaire curé d'espaces où l'on peut venir seul·e, sans être
   jugé·e : cafés solidaires, marches, ateliers, groupes de
   parole, jardins partagés, pair-aidance, etc.
   Anti-isolation push. Anti-honte ("tu n'as pas à y aller").
   Données illustratives V1 — à enrichir avec partenaires ÇA VA ?.
   ============================================================ */

import { useState, useEffect, useMemo } from 'react';
import { haptic } from '../state';
import { useToast, TOAST_PRESETS } from '../../components/Toast';
import useStandardOverlay from '../hooks/useStandardOverlay';

/* ============================================================
   HARDCODED LIST — V1 illustrative, à enrichir partenaires ÇA VA ?
   ============================================================ */

const ESPACES = [
  {
    id: 'pari-cafe-vie',
    city: 'Paris', district: '11e',
    name: 'Café La Vie',
    type: 'café solidaire',
    desc: 'Café-discussion ouvert. Tu peux venir seul·e, t\'asseoir, dire bonjour. Personne ne juge.',
    icon: '☕',
    color: 'var(--ochre)',
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
    color: 'var(--emerald)',
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
    color: 'var(--mist-blue)',
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
    color: 'var(--emerald)',
    times: 'Sam · 14h-18h',
    address: 'Friche La Belle de Mai',
    url: null,
  },
  {
    id: 'toulouse-cafe-parole',
    city: 'Toulouse', district: 'Saint-Cyprien',
    name: 'Café-Parole',
    type: 'café-débat',
    desc: 'Café mensuel autour d\'un thème (solitude, deuil, sommeil…). Première fois = bienvenue.',
    icon: '☕',
    color: 'var(--ochre)',
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
    color: 'var(--mist-blue)',
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
    color: 'var(--tilleul)',
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
    color: 'var(--terracotta)',
    times: 'Mer + Sam · 18h30',
    address: 'Centre Maraichers 75020',
    url: null,
  },
  {
    id: 'national-aa',
    city: 'National', district: 'AA France',
    name: 'Alcooliques Anonymes',
    type: 'groupe AA',
    desc: 'Réunions ouvertes ou fermées partout en France. Anonymat absolu. Tu n\'as qu\'à dire ton prénom (ou pas).',
    icon: '◯',
    color: 'var(--mist-blue)',
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
    color: 'var(--terracotta)',
    times: 'Plusieurs/jour · outremangeurs.org',
    address: 'outremangeurs.org',
    url: 'https://outremangeurs.org',
  },
];

/* ============================================================
   FILTERS
   ============================================================ */

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
  'cours collectif', // prix libre
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

/* ============================================================
   COMPONENT
   ============================================================ */

export default function EspacesIRL({ onClose }) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [revealCount, setRevealCount] = useState(0);
  const showToast = useToast();

  // Slide-up reveal
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Stagger card reveal
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

  // Comportement iOS standard (scroll lock body + ESC + focus trap + ARIA)
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
    // Copy address
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
      className="wash-renard"
      style={overlayStyle({ mounted, closing })}
    >
      {/* Top bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'calc(env(safe-area-inset-top, 0px) + 4px) 12px 14px',
          gap: 8,
          zIndex: 4,
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
            color: 'var(--content-tertiary)',
            WebkitTapHighlightColor: 'transparent',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1, marginRight: 2 }}>‹</span>
          Retour
        </button>
        <div
          className="neya-mark"
          style={{
            color: 'var(--content-tertiary)',
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            textAlign: 'center',
            flex: '1 1 auto',
            minWidth: 0,
          }}
        >
          ESPACES IRL · ICI ET MAINTENANT
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
            border: '0.5px solid var(--hairline)',
            background: 'rgba(255, 255, 255, 0.78)',
            color: 'var(--ink)',
            fontSize: 14,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            WebkitTapHighlightColor: 'transparent',
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>

      {/* Scrollable content */}
      <div
        style={{
          height: '100%',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding:
            'calc(env(safe-area-inset-top, 0px) + 66px) 22px calc(env(safe-area-inset-bottom, 0px) + 60px)',
        }}
      >
        {/* Hero */}
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(26px, 7vw, 32px)',
            lineHeight: 1.15,
            color: 'var(--ink)',
            letterSpacing: '-0.015em',
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            maxWidth: 340,
          }}
        >
          «&nbsp;Sors. Personne ne te <em className="neya-key">verra trembler</em>.&nbsp;»
        </h1>
        <p
          style={{
            margin: '12px 0 26px',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            lineHeight: 1.55,
            color: 'var(--ink-soft)',
            maxWidth: 340,
          }}
        >
          Des endroits où on accueille sans poser de question. Tu peux venir
          seul·e.
        </p>

        {/* Filter chips */}
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
                  padding: '8px 14px',
                  borderRadius: 999,
                  border: active
                    ? '0.5px solid var(--ink)'
                    : '0.5px solid var(--hairline)',
                  background: active
                    ? 'var(--ink)'
                    : 'rgba(251, 246, 232, 0.55)',
                  color: active
                    ? 'var(--cream)'
                    : disabled
                      ? 'var(--content-tertiary)'
                      : 'var(--ink-soft)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.4 : 1,
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'transform 180ms var(--ease-out-ios), background 220ms var(--ease-out-ios), color 220ms var(--ease-out-ios)',
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
            gap: 14,
          }}
        >
          {filtered.length === 0 && (
            <div
              style={{
                padding: '28px 18px',
                borderRadius: 16,
                border: '0.5px dashed var(--hairline)',
                background: 'rgba(251, 246, 232, 0.45)',
                color: 'var(--ink-soft)',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                lineHeight: 1.55,
                textAlign: 'center',
              }}
            >
              Aucun espace pour ce filtre. La liste s’enrichira.
            </div>
          )}

          {filtered.map((espace, idx) => {
            // Find the original index for stagger reveal timing
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
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 13,
            lineHeight: 1.55,
            color: 'var(--content-tertiary)',
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            maxWidth: 340,
          }}
        >
          Cette liste s’enrichira. Si tu connais un espace, écris-nous. (Pour
          l’instant, en local seulement.)
        </p>
        <p
          style={{
            margin: '8px 0 0',
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--content-tertiary)',
            opacity: 0.7,
          }}
        >
          À enrichir avec partenaires ÇA VA ?
        </p>
      </div>

    </div>
  );
}

/* ============================================================
   ESPACE CARD
   ============================================================ */

function EspaceCard({ espace, visible, onGo }) {
  return (
    <article
      style={{
        background: 'var(--cream-light)',
        border: '0.5px solid var(--hairline)',
        borderRadius: 18,
        padding: '18px 20px',
        boxShadow: '0 6px 18px rgba(38, 32, 26, 0.06)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(14px)',
        transition:
          'opacity 360ms var(--ease-out-ios), transform 360ms var(--ease-out-ios)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {/* Top row : icon + city/district */}
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
            fontSize: 28,
            lineHeight: 1,
            color: espace.color,
            flexShrink: 0,
          }}
          aria-hidden
        >
          {espace.icon}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--content-tertiary)',
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
        <h2
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 18,
            lineHeight: 1.25,
            color: 'var(--ink)',
            letterSpacing: '-0.01em',
            fontVariationSettings: 'var(--fraunces-italic-soft)',
          }}
        >
          {espace.name}
        </h2>
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            fontWeight: 500,
            color: espace.color,
            letterSpacing: '0.01em',
          }}
        >
          · {espace.type}
        </span>
      </div>

      {/* Description */}
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          lineHeight: 1.55,
          color: 'var(--ink-soft)',
        }}
      >
        {espace.desc}
      </p>

      {/* Bottom row : times + address */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
          marginTop: 2,
          paddingTop: 10,
          borderTop: '0.5px solid var(--hairline)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--ink-soft)',
            flex: '1 1 auto',
            minWidth: 0,
          }}
        >
          {espace.times}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.06em',
            color: 'var(--ink-soft)',
            textAlign: 'right',
            flex: '0 1 auto',
            wordBreak: 'break-word',
            maxWidth: '52%',
          }}
        >
          {espace.address}
        </div>
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <button
          type="button"
          data-press
          onClick={onGo}
          style={{
            appearance: 'none',
            background: 'transparent',
            border: '0.5px solid var(--hairline)',
            borderRadius: 999,
            padding: '8px 16px',
            fontFamily: 'var(--font-ui)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.02em',
            color: 'var(--ink)',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            transition: 'transform 180ms var(--ease-out-ios), background 220ms var(--ease-out-ios)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          Y aller
          <span aria-hidden style={{ fontSize: 13, opacity: 0.7 }}>→</span>
        </button>
      </div>
    </article>
  );
}

/* ============================================================
   OVERLAY STYLE — slide-up 420ms, slide-down 320ms
   ============================================================ */

function overlayStyle({ mounted, closing }) {
  const transform = closing
    ? 'translateY(100%)'
    : mounted
      ? 'translateY(0)'
      : 'translateY(100%)';
  const opacity = closing ? 0 : mounted ? 1 : 0;
  const dur = closing ? '320ms' : '420ms';
  return {
    position: 'absolute',
    inset: 0,
    zIndex: 90,
    color: 'var(--ink)',
    overflow: 'hidden',
    opacity,
    transform,
    transition: `transform ${dur} var(--ease-out-ios), opacity ${dur} var(--ease-out-ios)`,
    WebkitFontSmoothing: 'antialiased',
  };
}
