/* ============================================================
   ÇA VA ? V3 — Crise (écran d'apaisement immersif)
   ============================================================
   Un seul écran, pas de phases multiples. Conçu pour couper
   une crise d'angoisse en quelques minutes.

   Composants :
     1. Painterly Oasis full-bleed (visuel apaisant)
     2. Cercle de respiration inspire 4s / expire 6s
        (expire long = activation système parasympathique)
     3. Musique douce qui joue en boucle (Silencieuse)
     4. Numéro 3114 accessible (Prévention suicide FR, 24/7)
     5. Bouton "Je vais mieux" pour sortir

   Pas de timer pressure. Pas de jugement. Pas de streak.
   Sortie possible à tout moment, mais ESC clavier désactivé
   (escapeCloses: false) — volontairement dans le flow.
   ============================================================ */

import { useState, useEffect, useRef, useMemo } from 'react';
import { recordCrisisEntry, recordCrisisExit, getProfile, haptic } from '../state';
import { Overlay, HeroTitle, CTA } from '../../components/ui';

const PHONE_NUMBER = '3114'; // Numéro national prévention suicide FR (24/7, gratuit)

/* Images refuge (apaisantes) */
const REFUGE_IMAGES = {
  oasis:  '/img/world-oasis.png',
  lac:    '/img/world-lac.png',
  foret:  '/img/world-foret.png',
  temple: '/img/world-temple.png',
};

/* Musiques exercices (du dossier musiques-exercices) */
/* Path construit via encodeURIComponent pour gérer correctement les caractères spéciaux (accents). */
const REFUGE_MUSIC_KEYS = ['sunrise-breath', 'douce-nuit', 'guéris', 'tethered-to-the-wreckage'];
const REFUGE_MUSIC = REFUGE_MUSIC_KEYS.reduce((acc, key) => {
  acc[key] = `/musiques-exercices/${encodeURIComponent(key)}.mp3`;
  return acc;
}, {});

/* Rythmes de respiration */
const RHYTHMS = {
  '4-6':   { inspire: 4000, hold: 0,    expire: 6000, label: 'Apaisant', desc: 'Inspire 4s · Expire 6s' },
  '5-5':   { inspire: 5000, hold: 0,    expire: 5000, label: 'Cohérence', desc: 'Inspire 5s · Expire 5s' },
  '4-7-8': { inspire: 4000, hold: 7000, expire: 8000, label: 'Profond',  desc: 'Inspire 4s · Retiens 7s · Expire 8s' },
};

const COMFORT_LINES = [
  'Tu es là. Respire avec moi.',
  'Inspire doucement par le nez.',
  'Expire lentement par la bouche.',
  'Ton corps sait revenir au calme.',
  'Chaque souffle te ramène à toi.',
  'Tu n\'as rien à faire d\'autre.',
];

export default function Crise({ onClose }) {
  const profile = useMemo(() => getProfile(), []);
  const crise = profile.crise || {};
  const imageKey = crise.image || 'oasis';
  const musicKey = crise.music || 'sunrise-breath';
  const rhythmKey = crise.rhythm || '4-6';
  const rhythm = RHYTHMS[rhythmKey] || RHYTHMS['4-6'];
  const bgImage = REFUGE_IMAGES[imageKey] || REFUGE_IMAGES.oasis;
  const musicSrc = musicKey ? (REFUGE_MUSIC[musicKey] || REFUGE_MUSIC['sunrise-breath']) : null;

  const [phase, setPhase] = useState('inspire'); // 'inspire' | 'hold' | 'expire'
  const [lineIdx, setLineIdx] = useState(0);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const exitedRef = useRef(false);
  const audioRef = useRef(null);
  const phaseTimerRef = useRef(null);
  const lineTimerRef = useRef(null);
  const aliveRef = useRef(true);

  // Safety analytics
  useEffect(() => {
    recordCrisisEntry();
    return () => {
      if (!exitedRef.current) {
        recordCrisisExit();
      }
    };
  }, []);

  const handleClose = () => {
    if (exiting) return;
    if (!exitedRef.current) {
      recordCrisisExit();
      exitedRef.current = true;
    }
    haptic(3);
    setExiting(true);
    // Stop musique
    try { audioRef.current?.pause(); } catch (_) {}
    setTimeout(() => {
      if (aliveRef.current) onClose?.();
    }, 380);
  };

  // Cycle respiration — support 2 ou 3 phases (inspire / hold / expire)
  useEffect(() => {
    const hasHold = rhythm.hold > 0;
    const cycle = () => {
      if (!aliveRef.current) return;
      setPhase((p) => {
        let next;
        if (hasHold) {
          if (p === 'inspire') next = 'hold';
          else if (p === 'hold') next = 'expire';
          else next = 'inspire';
        } else {
          next = p === 'inspire' ? 'expire' : 'inspire';
        }
        if (next === 'inspire') haptic(2);
        return next;
      });
    };
    let nextDelay;
    if (phase === 'inspire') nextDelay = rhythm.inspire;
    else if (phase === 'hold') nextDelay = rhythm.hold;
    else nextDelay = rhythm.expire;
    phaseTimerRef.current = setTimeout(cycle, nextDelay);
    return () => clearTimeout(phaseTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, rhythmKey]);

  // Rotation des phrases de réconfort toutes les 8s
  useEffect(() => {
    lineTimerRef.current = setInterval(() => {
      if (!aliveRef.current) return;
      setLineIdx((i) => (i + 1) % COMFORT_LINES.length);
    }, 8000);
    return () => clearInterval(lineTimerRef.current);
  }, []);

  // Mount + cleanup
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    haptic(4);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('neya:fullscreen-overlay', { detail: { open: true } }));
    }
    return () => {
      cancelAnimationFrame(raf);
      aliveRef.current = false;
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
      if (lineTimerRef.current) clearInterval(lineTimerRef.current);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('neya:fullscreen-overlay', { detail: { open: false } }));
      }
    };
  }, []);

  // Tentative auto-play musique au mount (peut échouer sur iOS si user n'a pas interact)
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !musicSrc) return;
    a.volume = 0.32;
    const tryPlay = async () => {
      try {
        await a.play();
        if (aliveRef.current) setMusicPlaying(true);
      } catch (_) {
        // iOS bloque autoplay sans gesture user — l'utilisateur peut tap le bouton.
        if (aliveRef.current) setMusicPlaying(false);
      }
    };
    tryPlay();
  }, [musicSrc]);

  const toggleMusic = () => {
    const a = audioRef.current;
    if (!a) return;
    haptic(2);
    if (musicPlaying) {
      a.pause();
      setMusicPlaying(false);
    } else {
      a.play().then(() => setMusicPlaying(true)).catch(() => setMusicPlaying(false));
    }
  };

  const callHelpline = () => {
    haptic(6);
    try {
      window.location.href = `tel:${PHONE_NUMBER}`;
    } catch (_) {}
  };

  return (
    <Overlay
      backdrop="light"
      onClose={handleClose}
      closeOnBackdrop={false}
      ariaLabel="Espace de soutien"
      style={{
        overflow: 'hidden',
        opacity: exiting ? 0 : mounted ? 1 : 0,
        transition: 'opacity 380ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Painterly bg apaisant */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: 'crise-bg-ken-burns 40s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      />

      {/* Voile sombre apaisant */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(10, 12, 20, 0.58) 0%, rgba(10, 12, 20, 0.42) 50%, rgba(10, 12, 20, 0.72) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Bouton ✕ secours top-right — fermeture rapide discrète */}
      <button
        type="button"
        onClick={handleClose}
        data-press
        aria-label="Quitter le refuge"
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
          right: 12,
          width: 44,
          height: 44,
          borderRadius: 22,
          background: 'rgba(255, 255, 255, 0.70)',
          border: '0.5px solid rgba(26, 90, 127, 0.30)',
          color: 'var(--blue-900)',
          fontSize: 18,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          appearance: 'none',
          WebkitTapHighlightColor: 'transparent',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 4,
        }}
      >
        ✕
      </button>

      {/* Top — accès rapide 3114 + bouton musique */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 18px)',
          left: 22,
          right: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          zIndex: 3,
        }}
      >
        {/* Bouton musique on/off */}
        <button
          type="button"
          onClick={toggleMusic}
          data-press
          aria-label={musicPlaying ? 'Mettre la musique en pause' : 'Lancer la musique'}
          style={{
            appearance: 'none',
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'rgba(251, 246, 232, 0.16)',
            border: '1px solid rgba(251, 246, 232, 0.48)',
            color: 'var(--blue-900)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            WebkitTapHighlightColor: 'transparent',
            fontSize: 14,
            padding: 0,
            flexShrink: 0,
          }}
        >
          {musicPlaying ? '♪' : '♪̸'}
        </button>

        {/* Bouton appeler 3114 */}
        <button
          type="button"
          onClick={callHelpline}
          data-press
          aria-label="Appeler le 3114"
          style={{
            appearance: 'none',
            padding: '12px 18px',
            minHeight: 44,
            background: 'rgba(251, 246, 232, 0.94)',
            border: 'none',
            borderRadius: 999,
            color: 'var(--ink)',
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            WebkitTapHighlightColor: 'transparent',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
          }}
        >
          <span aria-hidden style={{ fontSize: 13 }}>☎</span>
          Appeler le {PHONE_NUMBER}
        </button>
      </div>

      {/* Cercle de respiration central — animation accentuée */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 340,
          height: 340,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Halo 4 anneaux concentriques très visibles */}
        {[0, 1, 2, 3].map((i) => {
          const isInspireOrHold = phase === 'inspire' || phase === 'hold';
          const scaleOpen = 1.0 + i * 0.14;     // beaucoup plus écarté (était 0.08)
          const scaleClose = 0.32 + i * 0.10;   // beaucoup plus serré (était 0.6+0.06)
          const phaseDuration = phase === 'inspire' ? rhythm.inspire : phase === 'hold' ? 320 : rhythm.expire;
          const baseOpacity = isInspireOrHold ? 0.32 - i * 0.06 : 0.55 - i * 0.10;
          const borderWidth = isInspireOrHold ? 1 : 1.5;
          return (
            <div
              key={i}
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: `${borderWidth}px solid #FBF6E8`,
                opacity: baseOpacity,
                transform: isInspireOrHold ? `scale(${scaleOpen})` : `scale(${scaleClose})`,
                transition: `transform ${phaseDuration}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${phaseDuration}ms cubic-bezier(0.4, 0, 0.2, 1), border-width ${phaseDuration}ms ease-out`,
                boxShadow: isInspireOrHold ? '0 0 24px rgba(255, 255, 255, 0.70)' : 'none',
              }}
            />
          );
        })}

        {/* Core orbe lumineuse — ÉCART AMPLIFIÉ (280 ↔ 70 au lieu de 220 ↔ 110) */}
        <div
          style={{
            width:  phase === 'expire' ? 70  : 280,
            height: phase === 'expire' ? 70  : 280,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(251, 246, 232, 0.95) 0%, rgba(251, 246, 232, 0.55) 35%, rgba(255, 255, 255, 0.80) 65%, transparent 100%)',
            opacity: phase === 'inspire' ? 0.96 : phase === 'hold' ? 1.0 : 0.42,
            filter: phase === 'expire' ? 'blur(4px)' : 'blur(1px)',
            boxShadow: (phase === 'inspire' || phase === 'hold')
              ? '0 0 80px 20px rgba(251, 246, 232, 0.32), 0 0 160px 40px rgba(255, 255, 255, 0.80)'
              : '0 0 30px 8px rgba(255, 255, 255, 0.80)',
            transition: phase === 'inspire'
              ? `width ${rhythm.inspire}ms cubic-bezier(0.34, 1.1, 0.64, 1), height ${rhythm.inspire}ms cubic-bezier(0.34, 1.1, 0.64, 1), opacity ${rhythm.inspire}ms cubic-bezier(0.4, 0, 0.2, 1), filter ${rhythm.inspire}ms ease-out, box-shadow ${rhythm.inspire}ms ease-out`
              : phase === 'hold'
              ? `all 320ms ease-out`
              : `width ${rhythm.expire}ms cubic-bezier(0.4, 0, 0.4, 1), height ${rhythm.expire}ms cubic-bezier(0.4, 0, 0.4, 1), opacity ${rhythm.expire}ms cubic-bezier(0.4, 0, 0.2, 1), filter ${rhythm.expire}ms ease-out, box-shadow ${rhythm.expire}ms ease-out`,
          }}
        />

        {/* Anneau central marqué — bordure plus nette qui suit la respiration */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            width:  phase === 'expire' ? 80  : 290,
            height: phase === 'expire' ? 80  : 290,
            borderRadius: '50%',
            border: '1.5px solid rgba(251, 246, 232, 0.65)',
            opacity: (phase === 'inspire' || phase === 'hold') ? 0.65 : 0.32,
            transition: phase === 'inspire'
              ? `width ${rhythm.inspire}ms cubic-bezier(0.34, 1.1, 0.64, 1), height ${rhythm.inspire}ms cubic-bezier(0.34, 1.1, 0.64, 1), opacity ${rhythm.inspire}ms ease-out`
              : phase === 'hold'
              ? `all 320ms ease-out`
              : `width ${rhythm.expire}ms cubic-bezier(0.4, 0, 0.4, 1), height ${rhythm.expire}ms cubic-bezier(0.4, 0, 0.4, 1), opacity ${rhythm.expire}ms ease-out`,
          }}
        />
        {/* Phase label */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <HeroTitle
            key={phase}
            size="sm"
            style={{
              fontSize: 30,
              opacity: 0.96,
              textShadow: '0 1px 12px rgba(0, 0, 0, 0.3)',
              animation: 'crise-label-fade 800ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {phase === 'inspire' ? 'Inspire' : phase === 'hold' ? 'Retiens' : 'Expire'}
          </HeroTitle>
        </div>
      </div>

      {/* Phrases de réconfort en haut, sous la barre 3114 */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 92px)',
          left: 22,
          right: 22,
          textAlign: 'center',
          zIndex: 2,
        }}
      >
        <HeroTitle
          key={lineIdx}
          size="sm"
          style={{
            fontSize: 17,
            lineHeight: 1.45,
            opacity: 0.92,
            textShadow: '0 1px 10px rgba(0, 0, 0, 0.42)',
            animation: 'crise-line-fade 1400ms cubic-bezier(0.16, 1, 0.3, 1)',
            textAlign: 'center',
          }}
        >
          {COMFORT_LINES[lineIdx]}
        </HeroTitle>
      </div>

      {/* Indicateur rythme */}
      <div
        style={{
          position: 'absolute',
          bottom: 'max(170px, calc(env(safe-area-inset-bottom, 0px) + 130px))',
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 2,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 9,
            letterSpacing: '0.42em',
            textTransform: 'uppercase',
            color: 'var(--blue-900)',
            opacity: 0.78,
            fontWeight: 600,
            textShadow: '0 1px 8px rgba(0, 0, 0, 0.55)',
          }}
        >
          {rhythm.desc}
        </span>
      </div>

      {/* Bouton "Je vais mieux" */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: 'max(96px, calc(env(safe-area-inset-bottom, 0px) + 60px))',
          zIndex: 3,
        }}
      >
        <CTA
          variant="outline"
          size="md"
          onClick={handleClose}
          aria-label="Je vais mieux, fermer"
          style={{
            background: 'rgba(255, 255, 255, 0.80)',
            border: '1px solid rgba(251, 246, 232, 0.58)',
            color: 'var(--blue-900)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            textShadow: '0 1px 8px rgba(0, 0, 0, 0.45)',
          }}
        >
          Je vais mieux
        </CTA>
      </div>

      {/* Audio */}
      {musicSrc && <audio ref={audioRef} src={musicSrc} loop preload="auto" />}

      {/* Keyframes */}
      <style>{`
        @keyframes crise-bg-ken-burns {
          0%   { transform: scale(1)    translate3d(0, 0, 0); }
          100% { transform: scale(1.05) translate3d(0, -1%, 0); }
        }
        @keyframes crise-label-fade {
          0%   { opacity: 0; transform: translateY(4px); }
          100% { opacity: 0.96; transform: translateY(0); }
        }
        @keyframes crise-line-fade {
          0%   { opacity: 0; transform: translateY(6px); }
          12%  { opacity: 0.92; transform: translateY(0); }
          88%  { opacity: 0.92; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-6px); }
        }
      `}</style>
    </Overlay>
  );
}
