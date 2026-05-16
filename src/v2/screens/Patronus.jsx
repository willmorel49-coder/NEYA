/* ============================================================
   NÉYA V3 — Patronus reveal (archétype celebration)
   ============================================================
   3-phase celebratory reveal triggered once after Onboarding.
   - Phase 1 (0 → 1.8s)  : spirit photo + archetype label
   - Phase 2 (1.8 → 5s)  : hairline + chemin + 3 forces stagger
   - Phase 3 (5s+)       : CTA "Entrer dans ton espace"

   Single-use : sets `patronus_seen` on close.
   Light wash background per totem world. Fraunces italic on
   the archetype label + chemin only. Tilleul reserved for the
   single hairline accent.
   ============================================================ */

import { useEffect, useRef, useState } from 'react';
import { getProfile, haptic, ls } from '../state';
import useStandardOverlay from '../hooks/useStandardOverlay';

/* ---------- Mapping totem → archetype data ---------- */

const PATRONUS_DATA = {
  lion: {
    label: 'Résilience',
    spirit: 'Lion blanc',
    photo: '/img/spirit-lion.png',
    accentRgb: '194, 144, 81',
    accentHex: '#C29051',
    chemin: 'Ton chemin est celui de la traversée.',
    forces: [
      'Tu te relèves toujours.',
      'Tu transmutes la douleur en lumière.',
      'Tu traces la voie pour les autres.',
    ],
  },
  ours: {
    label: 'Lumière',
    spirit: 'Ours polaire',
    photo: '/img/spirit-ours.png',
    accentRgb: '115, 151, 188',
    accentHex: '#7397BC',
    chemin: "Ton chemin est celui de l'ancrage doux.",
    forces: [
      'Tu ancres ceux qui vacillent.',
      'Tu protèges sans bruit.',
      'Tu rayonnes par ta seule présence.',
    ],
  },
  aigle: {
    label: 'Vision',
    spirit: 'Aigle céleste',
    photo: '/img/spirit-aigle.png',
    glyph: '△',
    accentRgb: '159, 88, 76',
    accentHex: '#9F584C',
    chemin: 'Ton chemin est celui de la perspective.',
    forces: [
      'Tu vois au-delà du moment.',
      "Tu nommes ce que d'autres ressentent.",
      "Tu offres la clarté quand tout s'embrouille.",
    ],
  },
  daim: {
    label: 'Présence',
    spirit: 'Daim lunaire',
    photo: '/img/spirit-daim.png',
    accentRgb: '123, 111, 168',
    accentHex: '#7B6FA8',
    chemin: "Ton chemin est celui de l'ici et maintenant.",
    forces: [
      "Tu habites l'instant.",
      'Tu sens avant de penser.',
      'Tu offres ta présence en cadeau.',
    ],
  },
  baleine: {
    label: 'Sagesse',
    spirit: 'Baleine sage',
    photo: '/img/spirit-baleine.png',
    accentRgb: '52, 145, 127',
    accentHex: '#34917F',
    chemin: 'Ton chemin est celui de la profondeur.',
    forces: [
      'Tu vois loin parce que tu vois lentement.',
      "Tu ne fuis pas l'obscurité — tu y descends.",
      "Tu remontes avec ce que personne n'a vu.",
    ],
  },
  renard: {
    label: 'Lien',
    spirit: "Renard de l'aube",
    photo: '/img/spirit-renard.png',
    glyph: '▽',
    accentRgb: '212, 152, 128',
    accentHex: '#D49880',
    chemin: "Ton chemin est celui de l'écho partagé.",
    forces: [
      "Tu reconnais ce qui n'est pas dit.",
      "Tu fais sentir aux autres qu'ils ne sont pas seuls.",
      "Tu portes la lumière de l'aube — l'espoir doux.",
    ],
  },
};

/* Helper : transforme '194, 144, 81' + alpha en chaîne rgba() valide. */
const toRgba = (rgb, alpha) => `rgba(${rgb}, ${alpha})`;

/* totem → wash class (light pastel background per archetype world) */
const TOTEM_WASH = {
  lion: 'wash-dawn',
  ours: 'wash-temple',
  aigle: 'wash-oasis',
  daim: 'wash-lac',
  baleine: 'wash-montagne',
  renard: 'wash-renard',
};

/* ============================================================
   Component
   ============================================================ */

export default function Patronus({ onClose }) {
  const profile = getProfile();
  const totem = profile?.totem || 'lion';
  const archetype = PATRONUS_DATA[totem] || PATRONUS_DATA.lion;
  const washClass = TOTEM_WASH[totem] || 'wash-dawn';

  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState(0); // 0=entry · 1=chemin+forces · 2=CTA
  const [forceStep, setForceStep] = useState(0); // 0..3 (how many forces visible)
  const closedRef = useRef(false);

  const alreadySeen = ls.get('patronus_seen', false);
  useEffect(() => {
    if (alreadySeen && !closedRef.current) {
      closedRef.current = true;
      onClose?.();
    }
  }, [alreadySeen, onClose]);

  /* Mount sequencing + single-use guard */
  useEffect(() => {
    // Already seen — close immediately, no animation
    if (ls.get('patronus_seen', false)) {
      if (!closedRef.current) {
        closedRef.current = true;
        onClose?.();
      }
      return;
    }

    haptic([4, 60, 4]);
    const rAF = requestAnimationFrame(() => setMounted(true));
    // Phase 2 — chemin + first force at 1800ms
    const t1 = setTimeout(() => {
      setPhase(1);
      setForceStep(1);
    }, 1800);
    const t2 = setTimeout(() => setForceStep(2), 2600);
    const t3 = setTimeout(() => setForceStep(3), 3400);
    // Phase 3 — CTA at 5000ms
    const t4 = setTimeout(() => {
      setPhase(2);
      haptic([4, 80, 4]);
    }, 5000);

    return () => {
      cancelAnimationFrame(rAF);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []); // eslint-disable-line

  // Factorise la logique de fermeture (état + persistance + callback).
  const persistAndClose = (hapticPattern) => {
    if (closedRef.current) return;
    closedRef.current = true;
    haptic(hapticPattern);
    ls.set('patronus_seen', true);
    onClose?.();
  };

  const handleCtaTap = () => persistAndClose([8, 60, 8]);
  const handleSkip = () => persistAndClose(4);

  // Comportement iOS standard (scroll lock body + ESC + focus trap + ARIA).
  // closedRef garde anti double-fire conservé via persistAndClose lui-même.
  // aria-labelledby pointe sur l'élément contenant le nom de l'archétype
  // (ex. "Lion blanc") plutôt qu'un libellé générique.
  const archLabelId = 'patronus-archetype-label';
  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closedRef.current,
    onClose: handleSkip,
    labelledBy: archLabelId,
  });

  const haloGradient = `radial-gradient(circle, ${toRgba(archetype.accentRgb, 0.45)} 0%, transparent 70%)`;

  if (alreadySeen) return null;

  return (
    <div
      ref={containerRef}
      {...dialogProps}
      className={washClass}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 900,
        overflow: 'hidden',
        color: 'var(--ink)',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 1400ms var(--ease-narrative)',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <style>{`
        @keyframes patronusRise {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 0.92; transform: translateY(0); }
        }
        @keyframes patronusHalo {
          0%, 100% { opacity: 0.78; transform: translate(-50%, -50%) scale(1); }
          50%      { opacity: 1;    transform: translate(-50%, -50%) scale(1.04); }
        }
      `}</style>

      {/* Top-right explicit skip — 44×44 hit zone */}
      <button
        type="button"
        data-press
        onClick={handleSkip}
        aria-label="Passer"
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          right: 18,
          zIndex: 3,
          appearance: 'none',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          cursor: 'pointer',
          padding: '12px 14px',
          minWidth: 44,
          minHeight: 44,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"Sora", system-ui, sans-serif',
          fontWeight: 500,
          fontSize: 11,
          letterSpacing: '0.222em',
          textTransform: 'uppercase',
          color: 'var(--content-secondary)',
          opacity: mounted ? 0.95 : 0,
          transition: 'opacity 1400ms var(--ease-narrative) 600ms',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        Passer ›
      </button>

      {/* Progressive cream vignette for cinematic focus */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, rgba(251,246,232,0) 38%, rgba(251,246,232,0.55) 100%)',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 1800ms var(--ease-narrative)',
          pointerEvents: 'none',
        }}
      />

      {/* Center stack */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 28px',
          boxSizing: 'border-box',
          textAlign: 'center',
        }}
      >
        {/* ---------- Photo + Halo ---------- */}
        <div
          style={{
            position: 'relative',
            width: 220,
            height: 220,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          {/* Halo */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 220,
              height: 220,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: haloGradient,
              opacity: mounted ? 0.9 : 0,
              transition: 'opacity 1800ms var(--ease-narrative)',
              animation: mounted
                ? 'patronusHalo 6s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite 1800ms'
                : 'none',
              pointerEvents: 'none',
            }}
          />
          {/* Spirit photo / glyph */}
          {archetype.photo ? (
            <img
              src={archetype.photo}
              alt={archetype.spirit}
              style={{
                position: 'relative',
                width: 132,
                height: 132,
                borderRadius: '50%',
                objectFit: 'cover',
                boxShadow: 'var(--shadow-product)',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'scale(1)' : 'scale(0.9)',
                transition:
                  'opacity 1800ms var(--ease-narrative), transform 1800ms var(--ease-narrative)',
              }}
            />
          ) : (
            <div
              style={{
                position: 'relative',
                width: 132,
                height: 132,
                borderRadius: '50%',
                background: 'var(--cream, #FBF6E8)',
                boxShadow: 'var(--shadow-product)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: '"Fraunces", Georgia, serif',
                fontWeight: 300,
                fontSize: 56,
                color: archetype.accentHex,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'scale(1)' : 'scale(0.9)',
                transition:
                  'opacity 1800ms var(--ease-narrative), transform 1800ms var(--ease-narrative)',
              }}
            >
              {archetype.glyph}
            </div>
          )}
        </div>

        {/* ---------- Caps mark ---------- */}
        <div
          style={{
            fontFamily: '"Sora", system-ui, sans-serif',
            fontWeight: 500,
            fontSize: 9,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            color: 'var(--content-tertiary)',
            marginBottom: 12,
            opacity: mounted ? 1 : 0,
            transition: 'opacity 1400ms var(--ease-narrative) 400ms',
          }}
        >
          TON ARCHÉTYPE
        </div>

        {/* ---------- Archetype label (Fraunces) ---------- */}
        <h1
          id={archLabelId}
          style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(40px, 11vw, 56px)',
            lineHeight: 1.05,
            color: 'var(--ink)',
            fontVariationSettings: "'opsz' 144, 'SOFT' 100",
            margin: '0 0 8px 0',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(6px)',
            transition:
              'opacity 1400ms var(--ease-narrative) 600ms, transform 1400ms var(--ease-narrative) 600ms',
          }}
        >
          {archetype.label}
        </h1>

        {/* ---------- Spirit (small line) ---------- */}
        <div
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 400,
            fontSize: 14,
            color: 'var(--content-secondary)',
            opacity: mounted ? 1 : 0,
            transition: 'opacity 1400ms var(--ease-narrative) 800ms',
          }}
        >
          {archetype.spirit}
        </div>

        {/* ---------- Hairline (tilleul accent) ---------- */}
        <div
          aria-hidden
          style={{
            width: 32,
            height: 1,
            background: 'var(--tilleul, #D4E08C)',
            margin: '28px auto 22px',
            opacity: phase >= 1 ? 1 : 0,
            transform: `scaleX(${phase >= 1 ? 1 : 0.2})`,
            transformOrigin: 'center',
            transition:
              'opacity 900ms var(--ease-narrative), transform 900ms var(--ease-narrative)',
          }}
        />

        {/* ---------- Chemin (Fraunces italic) ---------- */}
        <div
          style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 18,
            lineHeight: 1.4,
            color: 'var(--ink)',
            maxWidth: 320,
            fontVariationSettings: "'opsz' 144, 'SOFT' 100",
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'translateY(0)' : 'translateY(6px)',
            transition:
              'opacity 900ms var(--ease-narrative) 120ms, transform 900ms var(--ease-narrative) 120ms',
            marginBottom: 28,
          }}
        >
          « {archetype.chemin} »
        </div>

        {/* ---------- 3 Forces (stagger fade-in-up) ---------- */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            maxWidth: 360,
            marginBottom: 40,
          }}
        >
          {archetype.forces.map((f, i) => (
            <div
              key={i}
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 400,
                fontSize: 15,
                lineHeight: 1.45,
                color: 'var(--ink)',
                opacity: forceStep > i ? 0.92 : 0,
                transform: forceStep > i ? 'translateY(0)' : 'translateY(8px)',
                transition:
                  'opacity 700ms var(--ease-narrative), transform 700ms var(--ease-narrative)',
              }}
            >
              {f}
            </div>
          ))}
        </div>

        {/* ---------- CTA ---------- */}
        <button
          type="button"
          data-press
          onClick={handleCtaTap}
          style={{
            position: 'relative',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            padding: '14px 28px',
            borderRadius: 999,
            background: 'var(--ink, #1a1a2f)',
            color: 'var(--cream, #FBF6E8)',
            fontFamily: '"Sora", system-ui, sans-serif',
            fontWeight: 500,
            fontSize: 13,
            letterSpacing: '0.04em',
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? 'scale(1)' : 'scale(0.96)',
            transition:
              'opacity 800ms var(--ease-narrative), transform 800ms var(--ease-narrative)',
            pointerEvents: phase >= 2 ? 'auto' : 'none',
            WebkitTapHighlightColor: 'transparent',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
          onTouchEnd={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Entrer dans ton espace
        </button>
      </div>
    </div>
  );
}
