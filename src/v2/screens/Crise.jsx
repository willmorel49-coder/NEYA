/* ============================================================
   NÉYA V3 — Crise (écran d'apaisement immersif)
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
import useStandardOverlay from '../hooks/useStandardOverlay';

const PHONE_NUMBER = '3114'; // Numéro national prévention suicide FR (24/7, gratuit)

/* Images refuge (apaisantes) */
const REFUGE_IMAGES = {
  oasis:  '/img/world-oasis.png',
  lac:    '/img/world-lac.png',
  foret:  '/img/world-foret.png',
  temple: '/img/world-temple.png',
};

/* Musiques exercices (du dossier musiques-exercices) */
const REFUGE_MUSIC = {
  'sunrise-breath':         '/musiques-exercices/sunrise-breath.mp3',
  'douce-nuit':             '/musiques-exercices/douce-nuit.mp3',
  'guéris':                 '/musiques-exercices/gu%C3%A9ris.mp3',
  'tethered-to-the-wreckage': '/musiques-exercices/tethered-to-the-wreckage.mp3',
};

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

  const { dialogProps, containerRef } = useStandardOverlay({
    open: !exiting,
    onClose: handleClose,
    labelText: 'Espace de soutien',
    escapeCloses: false,
  });

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
    return () => {
      cancelAnimationFrame(raf);
      aliveRef.current = false;
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
      if (lineTimerRef.current) clearInterval(lineTimerRef.current);
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
    <div
      ref={containerRef}
      {...dialogProps}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        overflow: 'hidden',
        background: '#0a0c14',
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
            'linear-gradient(180deg, rgba(10, 12, 20, 0.45) 0%, rgba(10, 12, 20, 0.35) 50%, rgba(10, 12, 20, 0.65) 100%)',
          pointerEvents: 'none',
        }}
      />

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
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(251, 246, 232, 0.10)',
            border: '0.5px solid rgba(251, 246, 232, 0.22)',
            color: '#FBF6E8',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            WebkitTapHighlightColor: 'transparent',
            fontSize: 13,
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
            padding: '10px 18px',
            minHeight: 40,
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

      {/* Cercle de respiration central */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 280,
          height: 280,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Halo 3 anneaux — hold = état maintenu (taille inspire conservée) */}
        {[0, 1, 2].map((i) => {
          const isInspireOrHold = phase === 'inspire' || phase === 'hold';
          const scaleOpen = 1 + i * 0.08;
          const scaleClose = 0.6 + i * 0.06;
          const phaseDuration = phase === 'inspire' ? rhythm.inspire : phase === 'hold' ? 300 : rhythm.expire;
          return (
            <div
              key={i}
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: `0.5px solid #FBF6E8`,
                opacity: isInspireOrHold ? 0.16 - i * 0.04 : 0.32 - i * 0.08,
                transform: isInspireOrHold ? `scale(${scaleOpen})` : `scale(${scaleClose})`,
                transition: `all ${phaseDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
              }}
            />
          );
        })}
        {/* Core orbe lumineuse */}
        <div
          style={{
            width: (phase === 'inspire' || phase === 'hold') ? 220 : 110,
            height: (phase === 'inspire' || phase === 'hold') ? 220 : 110,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(251, 246, 232, 0.82) 0%, rgba(251, 246, 232, 0.18) 60%, transparent 100%)',
            opacity: phase === 'inspire' ? 0.85 : phase === 'hold' ? 0.92 : 0.55,
            filter: 'blur(2px)',
            transition: `width ${phase === 'inspire' ? rhythm.inspire : phase === 'hold' ? 300 : rhythm.expire}ms cubic-bezier(0.4, 0, 0.2, 1), height ${phase === 'inspire' ? rhythm.inspire : phase === 'hold' ? 300 : rhythm.expire}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${phase === 'inspire' ? rhythm.inspire : phase === 'hold' ? 300 : rhythm.expire}ms cubic-bezier(0.4, 0, 0.2, 1)`,
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
          <span
            key={phase}
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 30,
              letterSpacing: '-0.014em',
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              color: '#FBF6E8',
              opacity: 0.96,
              textShadow: '0 1px 12px rgba(0, 0, 0, 0.3)',
              animation: 'crise-label-fade 800ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {phase === 'inspire' ? 'Inspire' : phase === 'hold' ? 'Retiens' : 'Expire'}
          </span>
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
        <p
          key={lineIdx}
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 17,
            lineHeight: 1.45,
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            color: '#FBF6E8',
            opacity: 0.92,
            textShadow: '0 1px 10px rgba(0, 0, 0, 0.42)',
            animation: 'crise-line-fade 1400ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {COMFORT_LINES[lineIdx]}
        </p>
      </div>

      {/* Indicateur rythme */}
      <div
        style={{
          position: 'absolute',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 130px)',
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
            color: '#FBF6E8',
            opacity: 0.48,
            fontWeight: 500,
          }}
        >
          {rhythm.desc}
        </span>
      </div>

      {/* Bouton "Je vais mieux" */}
      <button
        type="button"
        onClick={handleClose}
        data-press
        aria-label="Je vais mieux, fermer"
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 60px)',
          appearance: 'none',
          padding: '14px 32px',
          minHeight: 48,
          background: 'rgba(251, 246, 232, 0.12)',
          color: '#FBF6E8',
          border: '0.5px solid rgba(251, 246, 232, 0.36)',
          borderRadius: 999,
          fontFamily: 'var(--font-ui)',
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: '0.222em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          WebkitTapHighlightColor: 'transparent',
          zIndex: 3,
        }}
      >
        Je vais mieux
      </button>

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
    </div>
  );
}
