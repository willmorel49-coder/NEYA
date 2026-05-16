/* ============================================================
   NÉYA V5 — Cocon plein écran painterly personnalisable
   ============================================================
   Sanctuaire perso : image au choix, ambiance au choix,
   musique au choix. Texte blanc en surimpression.
   Vision inspirée du MVP NÉYA original.
   ============================================================ */

import { useState, useEffect, useMemo, useRef } from 'react';
import { WORLDS } from '../worlds';
import { getProfile, patchProfile, haptic } from '../state';
import BreathingPause from './BreathingPause';
import CoconAmbiance from './CoconAmbiance';
import Musique from './Musique';
import useStandardOverlay from '../hooks/useStandardOverlay';

const TOTEMS = [
  { key: 'lion',    label: 'Lion blanc',    world: 'foret' },
  { key: 'ours',    label: 'Ours polaire',  world: 'temple' },
  { key: 'aigle',   label: 'Aigle céleste', world: 'oasis' },
  { key: 'daim',    label: 'Daim lunaire',  world: 'lac' },
  { key: 'baleine', label: 'Baleine sage',  world: 'montagne' },
  { key: 'renard',  label: 'Renard',        world: 'communaute' },
];

const COCON_IMAGES = [
  { key: 'foret',      label: 'Forêt de Clarté',   src: '/img/world-foret.png' },
  { key: 'temple',     label: 'Temple intérieur',  src: '/img/world-temple.png' },
  { key: 'oasis',      label: 'Oasis du Souffle',  src: '/img/world-oasis.png' },
  { key: 'lac',        label: 'Lac des Émotions',  src: '/img/world-lac.png' },
  { key: 'montagne',   label: 'Montagne de Vision', src: '/img/world-montagne.png' },
  { key: 'communaute', label: 'Refuge partagé',    src: '/img/world-communaute.png' },
];

const AMBIANCES = [
  { key: 'fireflies', label: 'Lucioles',  hint: 'Petites lumières flottantes' },
  { key: 'rain',      label: 'Pluie',     hint: 'Pluie douce qui tombe' },
  { key: 'snow',      label: 'Neige',     hint: 'Flocons qui descendent' },
  { key: 'stars',     label: 'Étoiles',   hint: 'Scintillements doux' },
  { key: 'none',      label: 'Silence',   hint: 'Aucune particule' },
];

const TRACKS = [
  { key: 'silencieuse',                title: 'Silencieuse' },
  { key: 'mon-cœur',                   title: 'Mon cœur' },
  { key: 'souffle-court',              title: 'Souffle court' },
  { key: 'À débordement',              title: 'À débordement' },
  { key: 'entre-tension-et-douceur',   title: 'Entre tension et douceur' },
  { key: 'ce-qui-reste 2',             title: 'Ce qui reste' },
  { key: 'sur-ma-planète',             title: 'Sur ma planète' },
  { key: 'Masque',                     title: 'Masque' },
  { key: 'burn-out',                   title: 'Burn-out' },
  { key: 'stress-post-traumatique',    title: 'Stress post-traumatique' },
  { key: 'ça-va',                      title: 'Ça va' },
];

/* ─── Helpers ─── */

function getHourPhrase() {
  const h = new Date().getHours();
  if (h >= 5 && h < 8)   return { whisper: 'L\'aube est douce. Pose-toi.',                tint: 'rgba(245, 212, 156, 0.18)' };
  if (h >= 8 && h < 12)  return { whisper: 'Le jour est là. Respire.',                    tint: 'rgba(255, 252, 245, 0.10)' };
  if (h >= 12 && h < 17) return { whisper: 'Chaque souffle te recentre.',                 tint: 'rgba(255, 252, 245, 0.10)' };
  if (h >= 17 && h < 20) return { whisper: 'Le jour s\'apaise. Reviens à toi.',           tint: 'rgba(199, 103, 74, 0.22)' };
  if (h >= 20 && h < 23) return { whisper: 'La nuit veille. Repose-toi.',                 tint: 'rgba(30, 30, 60, 0.32)' };
  return                       { whisper: 'Chaque respiration te rapproche de toi-même.', tint: 'rgba(20, 24, 56, 0.42)' };
}

function getGreeting(pseudo) {
  if (pseudo) return `Bonjour, ${pseudo}.`;
  return 'Pose-toi ici.';
}

function resolveImage(profile) {
  const cocon = profile.cocon || {};
  const explicit = COCON_IMAGES.find((i) => i.key === cocon.image);
  if (explicit) return explicit;
  // Fallback : suit le totem
  const totemKey = profile.totem || 'lion';
  const totem = TOTEMS.find((t) => t.key === totemKey) || TOTEMS[0];
  return COCON_IMAGES.find((i) => i.key === totem.world) || COCON_IMAGES[0];
}

function trackSrc(key) {
  if (!key) return null;
  return `/musique/${encodeURIComponent(key)}.mp3`;
}

/* ============================================================
   Main
   ============================================================ */

export default function Cocon() {
  const [profile, setLocalProfile] = useState(() => getProfile());
  const [breathingOpen, setBreathingOpen] = useState(false);
  const [personalizeOpen, setPersonalizeOpen] = useState(false);
  const [musiqueOpen, setMusiqueOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [, forceTick] = useState(0);
  const audioRef = useRef(null);

  const cocon = profile.cocon || { image: null, ambiance: 'fireflies', music: null, musicVolume: 0.45 };
  const totemKey = profile.totem || 'lion';
  const currentTotem = TOTEMS.find((t) => t.key === totemKey) || TOTEMS[0];
  const totemWorld = WORLDS[currentTotem.world] || WORLDS.foret;
  const accent = totemWorld.accent;
  const accentRgb = totemWorld.accentRgb;
  const currentImage = useMemo(() => resolveImage(profile), [profile]);
  const hourPhase = useMemo(() => getHourPhrase(), []);
  const currentTrack = useMemo(() => TRACKS.find((t) => t.key === cocon.music) || null, [cocon.music]);

  // Re-évalue l'heure
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => (n + 1) % 1000), 60_000);
    return () => clearInterval(id);
  }, []);

  // Refresh profil depuis localStorage
  useEffect(() => {
    const refresh = () => setLocalProfile(getProfile());
    window.addEventListener('neya:profile-changed', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('neya:profile-changed', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  // Audio : appliquer volume + reset si track change
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = typeof cocon.musicVolume === 'number' ? cocon.musicVolume : 0.45;
  }, [cocon.musicVolume]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (!currentTrack) {
      a.pause();
      setMusicPlaying(false);
      return;
    }
    // Si la track change, on stop l'ancienne (le src change via React)
    a.pause();
    setMusicPlaying(false);
  }, [currentTrack?.key]);

  // Auto-pause à l'unmount
  useEffect(() => {
    return () => {
      const a = audioRef.current;
      if (a) { try { a.pause(); } catch (_) {} }
    };
  }, []);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a || !currentTrack) return;
    haptic(3);
    if (musicPlaying) {
      a.pause();
      setMusicPlaying(false);
    } else {
      a.play().then(() => setMusicPlaying(true)).catch(() => setMusicPlaying(false));
    }
  };

  const updateProfile = (patch) => {
    const next = patchProfile(patch);
    setLocalProfile(next);
  };

  const updateCocon = (coconPatch) => {
    const nextCocon = { ...(profile.cocon || {}), ...coconPatch };
    updateProfile({ cocon: nextCocon });
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: '#0a0c14',
      }}
      data-world={currentTotem.world}
    >
      {/* Painterly bg plein écran */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${currentImage.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: 'cocon-bg-ken-burns 28s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      />

      {/* Voile sombre */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.34) 0%, rgba(0,0,0,0.28) 35%, rgba(0,0,0,0.55) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Voile horaire */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: hourPhase.tint,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }}
      />

      {/* Ambiance dynamique */}
      <CoconAmbiance type={cocon.ambiance || 'fireflies'} accent={accent} />

      {/* Top bar — logo + icône perso */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 22px)',
          left: 22,
          right: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 3,
        }}
      >
        <span style={{ width: 32, height: 32 }} />
        <div
          aria-hidden
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <svg width="22" height="14" viewBox="0 0 44 28" fill="none" aria-hidden>
            <path d="M22 26 C 8 18, 4 8, 22 2 C 40 8, 36 18, 22 26 Z" stroke="#FBF6E8" strokeWidth="0.8" fill="none" opacity="0.92" />
            <path d="M22 26 C 12 22, 10 14, 22 8" stroke="#FBF6E8" strokeWidth="0.6" fill="none" opacity="0.7" />
            <path d="M22 26 C 32 22, 34 14, 22 8" stroke="#FBF6E8" strokeWidth="0.6" fill="none" opacity="0.7" />
          </svg>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 9,
              letterSpacing: '0.42em',
              fontWeight: 600,
              color: '#FBF6E8',
              opacity: 0.92,
              textShadow: '0 1px 6px rgba(0, 0, 0, 0.42)',
            }}
          >
            NÉYA
          </span>
        </div>
        <button
          type="button"
          onClick={() => { haptic(2); setPersonalizeOpen(true); }}
          data-press
          aria-label="Personnaliser mon cocon"
          style={{
            appearance: 'none',
            width: 32,
            height: 32,
            background: 'rgba(251, 246, 232, 0.08)',
            border: '0.5px solid rgba(251, 246, 232, 0.22)',
            borderRadius: '50%',
            color: '#FBF6E8',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            WebkitTapHighlightColor: 'transparent',
            fontSize: 14,
            padding: 0,
          }}
        >
          ⋯
        </button>
      </div>

      {/* Greeting + whisper */}
      <div
        style={{
          position: 'absolute',
          top: '24%',
          left: 22,
          right: 22,
          textAlign: 'center',
          zIndex: 2,
          color: '#FBF6E8',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 8vw, 42px)',
            fontWeight: 300,
            lineHeight: 1.15,
            letterSpacing: '-0.018em',
            fontVariationSettings: '"opsz" 144, "SOFT" 50',
            color: '#FBF6E8',
            textShadow: '0 2px 18px rgba(0, 0, 0, 0.38)',
          }}
        >
          {getGreeting(profile.pseudo)}
        </h1>
        <p
          style={{
            margin: '18px auto 0',
            fontFamily: 'var(--font-body)',
            fontSize: 15,
            lineHeight: 1.6,
            color: '#FBF6E8',
            opacity: 0.88,
            maxWidth: 280,
            textShadow: '0 1px 8px rgba(0, 0, 0, 0.32)',
          }}
        >
          {hourPhase.whisper}
        </p>
      </div>

      {/* Mantra filigrane */}
      {profile.mantra ? (
        <button
          type="button"
          onClick={() => { haptic(2); setPersonalizeOpen(true); }}
          aria-label="Modifier ton mantra"
          style={{
            position: 'absolute',
            left: 22,
            right: 22,
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 310px)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'center',
            color: '#FBF6E8',
            WebkitTapHighlightColor: 'transparent',
            zIndex: 2,
            padding: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 17,
              lineHeight: 1.45,
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              color: '#FBF6E8',
              opacity: 0.94,
              textShadow: '0 1px 10px rgba(0, 0, 0, 0.5)',
              animation: 'cocon-mantra-breathe 8s ease-in-out infinite',
              display: 'inline-block',
              maxWidth: '88%',
            }}
          >
            « {profile.mantra} »
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => { haptic(2); setPersonalizeOpen(true); }}
          data-press
          aria-label="Poser un mantra"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 314px)',
            appearance: 'none',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#FBF6E8',
            opacity: 0.82,
            fontFamily: 'var(--font-ui)',
            fontSize: 10,
            letterSpacing: '0.222em',
            textTransform: 'uppercase',
            fontWeight: 600,
            padding: '10px 18px',
            minHeight: 44,
            textShadow: '0 1px 8px rgba(0, 0, 0, 0.5)',
            WebkitTapHighlightColor: 'transparent',
            zIndex: 2,
          }}
        >
          + Poser un mantra
        </button>
      )}

      {/* Mini player musique (si track sélectionnée) — tap = ouvre la page Musique */}
      {currentTrack && (
        <button
          type="button"
          onClick={() => { haptic(4); setMusiqueOpen(true); }}
          aria-label="Ouvrir la musique"
          style={{
            position: 'absolute',
            left: 22,
            right: 22,
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 250px)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            minHeight: 44,
            background: 'rgba(8, 10, 24, 0.42)',
            border: '0.5px solid rgba(251, 246, 232, 0.16)',
            borderRadius: 999,
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            zIndex: 3,
            cursor: 'pointer',
            appearance: 'none',
            textAlign: 'left',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            data-press
            aria-label={musicPlaying ? 'Mettre en pause' : 'Lancer la musique'}
            style={{
              appearance: 'none',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: accent,
              color: '#FBF6E8',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              padding: 0,
              fontSize: 12,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {musicPlaying ? '❚❚' : '▶'}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontVariationSettings: 'var(--fraunces-italic-soft)',
                fontSize: 14,
                color: '#FBF6E8',
                opacity: 0.94,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.15,
              }}
            >
              {currentTrack.title}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 9,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'rgba(251,246,232,0.62)',
                fontWeight: 600,
                marginTop: 2,
              }}
            >
              NÉYA
            </div>
          </div>
          <span
            aria-hidden
            style={{
              color: '#FBF6E8',
              opacity: 0.7,
              fontSize: 14,
              flexShrink: 0,
              padding: '0 4px',
            }}
          >
            ›
          </span>
        </button>
      )}

      {/* Bouton "Musique" discret si aucune piste sélectionnée */}
      {!currentTrack && (
        <button
          type="button"
          onClick={() => { haptic(4); setMusiqueOpen(true); }}
          data-press
          aria-label="Ouvrir la musique de NÉYA"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 250px)',
            appearance: 'none',
            padding: '10px 18px',
            minHeight: 40,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(8, 10, 24, 0.42)',
            border: '0.5px solid rgba(251, 246, 232, 0.22)',
            borderRadius: 999,
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            color: '#FBF6E8',
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            fontWeight: 600,
            WebkitTapHighlightColor: 'transparent',
            zIndex: 3,
          }}
        >
          <span aria-hidden style={{ fontSize: 13, opacity: 0.85 }}>♫</span>
          Musique
        </button>
      )}

      {/* CTA principal */}
      <button
        type="button"
        onClick={() => { haptic(6); setBreathingOpen(true); }}
        data-press
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 138px)',
          appearance: 'none',
          padding: '16px 38px',
          minHeight: 52,
          background: accent,
          color: '#FBF6E8',
          border: 'none',
          borderRadius: 999,
          fontFamily: 'var(--font-ui)',
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          boxShadow: `0 8px 28px ${accentRgb}, 0.42), 0 2px 6px rgba(0, 0, 0, 0.18)`,
          zIndex: 3,
        }}
      >
        Me poser 2 minutes
      </button>

      {/* Bouton Personnaliser texte (au-dessus du CTA, hors zone BottomNav) */}
      <button
        type="button"
        onClick={() => { haptic(2); setPersonalizeOpen(true); }}
        data-press
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 200px)',
          appearance: 'none',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#FBF6E8',
          opacity: 0.9,
          fontFamily: 'var(--font-ui)',
          fontSize: 10,
          letterSpacing: '0.222em',
          textTransform: 'uppercase',
          fontWeight: 600,
          padding: '12px 18px',
          minHeight: 44,
          textShadow: '0 1px 8px rgba(0, 0, 0, 0.5)',
          WebkitTapHighlightColor: 'transparent',
          zIndex: 3,
        }}
      >
        Personnaliser mon cocon
      </button>

      {/* Audio element (caché) */}
      {currentTrack && (
        <audio
          ref={audioRef}
          src={trackSrc(currentTrack.key)}
          loop
          preload="metadata"
          onEnded={() => setMusicPlaying(false)}
          onPause={() => setMusicPlaying(false)}
          onPlay={() => setMusicPlaying(true)}
        />
      )}

      {/* Overlays */}
      {breathingOpen && (
        <BreathingPause
          accent={accent}
          onClose={() => setBreathingOpen(false)}
        />
      )}
      {personalizeOpen && (
        <PersonalizeSheet
          profile={profile}
          onUpdate={updateProfile}
          onUpdateCocon={updateCocon}
          onClose={() => setPersonalizeOpen(false)}
        />
      )}
      {musiqueOpen && (
        <Musique onClose={() => setMusiqueOpen(false)} />
      )}

      {/* Keyframes locales */}
      <style>{`
        @keyframes cocon-bg-ken-burns {
          0%   { transform: scale(1)    translate3d(0, 0, 0); }
          100% { transform: scale(1.08) translate3d(0, -1.5%, 0); }
        }
        @keyframes cocon-firefly {
          0%, 100% { opacity: 0; transform: translateY(0) scale(0.6); }
          15%      { opacity: 0.45; transform: translateY(-6px) scale(1); }
          50%      { opacity: 0.9;  transform: translateY(-14px) scale(1.1); }
          85%      { opacity: 0.4;  transform: translateY(-22px) scale(0.9); }
        }
        @keyframes cocon-mantra-breathe {
          0%, 100% { opacity: 0.86; }
          50%      { opacity: 1; }
        }
        @keyframes cocon-rain-fall {
          0%   { transform: translateY(0); }
          100% { transform: translateY(110vh); }
        }
        @keyframes cocon-snow-fall {
          0%   { transform: translate3d(0, 0, 0); opacity: 0; }
          10%  { opacity: 0.75; }
          90%  { opacity: 0.6; }
          100% { transform: translate3d(var(--drift, 0), 110vh, 0); opacity: 0; }
        }
        @keyframes cocon-star-twinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.8); }
          50%      { opacity: 0.95; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   PersonalizeSheet — 4 sections : image / ambiance / musique / identité
   ============================================================ */

function PersonalizeSheet({ profile, onUpdate, onUpdateCocon, onClose }) {
  const [tab, setTab] = useState('image'); // image | ambiance | musique | identite
  const [tempPseudo, setTempPseudo] = useState(profile.pseudo || '');
  const [tempMantra, setTempMantra] = useState(profile.mantra || '');
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const aliveRef = useRef(true);
  const timersRef = useRef([]);

  const cocon = profile.cocon || {};
  const currentImage = resolveImage(profile);
  const currentAmbiance = cocon.ambiance || 'fireflies';
  const currentMusic = cocon.music || null;
  const currentTotem = profile.totem || 'lion';

  const safeTimeout = (fn, ms) => {
    const id = setTimeout(() => {
      if (aliveRef.current) fn();
    }, ms);
    timersRef.current.push(id);
    return id;
  };

  const handleClose = () => {
    if (closing) return;
    haptic(3);
    setClosing(true);
    safeTimeout(() => onClose?.(), 320);
  };

  const handleSaveIdentite = () => {
    const patch = {};
    const pseudoTrim = (tempPseudo || '').trim();
    const mantraTrim = (tempMantra || '').trim();
    if (pseudoTrim !== (profile.pseudo || '')) patch.pseudo = pseudoTrim || null;
    if (mantraTrim !== (profile.mantra || '')) patch.mantra = mantraTrim || null;
    if (Object.keys(patch).length > 0) {
      onUpdate(patch);
      haptic(6);
    } else {
      haptic(2);
    }
  };

  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closing,
    onClose: handleClose,
    labelText: 'Personnaliser mon cocon',
  });

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => {
      cancelAnimationFrame(raf);
      aliveRef.current = false;
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  const TABS = [
    { key: 'image',    label: 'Image' },
    { key: 'ambiance', label: 'Ambiance' },
    { key: 'musique',  label: 'Musique' },
    { key: 'identite', label: 'Identité' },
  ];

  return (
    <>
      <div
        aria-hidden
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 150,
          background: 'rgba(8, 10, 24, 0.62)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          opacity: closing ? 0 : mounted ? 1 : 0,
          transition: 'opacity 320ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
      <div
        ref={containerRef}
        {...dialogProps}
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 151,
          background: 'var(--cream)',
          color: 'var(--ink)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: '12px 0 calc(env(safe-area-inset-bottom, 0px) + 24px)',
          transform: closing ? 'translateY(100%)' : mounted ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.18)',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Drag handle */}
        <div
          aria-hidden
          style={{
            width: 36,
            height: 5,
            borderRadius: 999,
            background: 'rgba(26, 26, 47, 0.18)',
            margin: '0 auto 18px',
            flexShrink: 0,
          }}
        />

        {/* Title */}
        <div
          style={{
            padding: '0 22px',
            textAlign: 'center',
            marginBottom: 18,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              fontSize: 22,
              color: 'var(--ink)',
            }}
          >
            Mon cocon
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            padding: '0 22px 16px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            flexShrink: 0,
          }}
        >
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => { haptic(2); setTab(t.key); }}
                data-press
                style={{
                  appearance: 'none',
                  padding: '8px 14px',
                  minHeight: 36,
                  background: active ? 'var(--ink)' : 'transparent',
                  color: active ? 'var(--cream)' : 'var(--content-secondary)',
                  border: active ? 'none' : '0.5px solid rgba(26, 26, 47, 0.14)',
                  borderRadius: 999,
                  fontFamily: 'var(--font-ui)',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  WebkitTapHighlightColor: 'transparent',
                  flexShrink: 0,
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab content (scrollable) */}
        <div
          style={{
            padding: '4px 22px 8px',
            overflowY: 'auto',
            flex: 1,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {tab === 'image' && (
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: 'var(--content-secondary)',
                  marginBottom: 14,
                }}
              >
                Le décor de ton sanctuaire.
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                }}
              >
                {COCON_IMAGES.map((img) => {
                  const active = currentImage.key === img.key;
                  return (
                    <button
                      key={img.key}
                      type="button"
                      data-press
                      onClick={() => { haptic(4); onUpdateCocon({ image: img.key }); }}
                      style={{
                        appearance: 'none',
                        padding: 0,
                        border: active ? '2px solid var(--ink)' : '0.5px solid rgba(26, 26, 47, 0.10)',
                        borderRadius: 12,
                        cursor: 'pointer',
                        overflow: 'hidden',
                        position: 'relative',
                        aspectRatio: '4 / 5',
                        background: `#0a0c14 url(${img.src}) center / cover no-repeat`,
                        WebkitTapHighlightColor: 'transparent',
                        boxShadow: active ? '0 4px 14px rgba(0,0,0,0.18)' : 'none',
                      }}
                      aria-pressed={active}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          bottom: 0,
                          padding: '24px 10px 10px',
                          background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
                          color: '#FBF6E8',
                          fontFamily: 'var(--font-display)',
                          fontStyle: 'italic',
                          fontVariationSettings: 'var(--fraunces-italic-soft)',
                          fontSize: 12,
                          textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                        }}
                      >
                        {img.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'ambiance' && (
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: 'var(--content-secondary)',
                  marginBottom: 14,
                }}
              >
                La petite vie qui danse sur ton cocon.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {AMBIANCES.map((a) => {
                  const active = a.key === currentAmbiance;
                  return (
                    <button
                      key={a.key}
                      type="button"
                      data-press
                      onClick={() => { haptic(2); onUpdateCocon({ ambiance: a.key }); }}
                      style={{
                        appearance: 'none',
                        padding: '14px 16px',
                        minHeight: 56,
                        background: active ? 'rgba(26, 26, 47, 0.06)' : 'transparent',
                        border: active ? '0.5px solid var(--ink)' : '0.5px solid rgba(26, 26, 47, 0.10)',
                        borderRadius: 14,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 14,
                        textAlign: 'left',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                      aria-pressed={active}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: 14,
                            fontWeight: 500,
                            color: 'var(--ink)',
                          }}
                        >
                          {a.label}
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 12,
                            color: 'var(--content-secondary)',
                            marginTop: 2,
                          }}
                        >
                          {a.hint}
                        </div>
                      </div>
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          border: active ? '5px solid var(--ink)' : '1px solid rgba(26, 26, 47, 0.20)',
                          background: 'transparent',
                          flexShrink: 0,
                          transition: 'all 200ms ease-out',
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'musique' && (
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: 'var(--content-secondary)',
                  marginBottom: 14,
                }}
              >
                La musique qui accompagne ton retour à toi.
              </div>

              {/* Aucune musique */}
              <button
                type="button"
                data-press
                onClick={() => { haptic(2); onUpdateCocon({ music: null }); }}
                style={{
                  appearance: 'none',
                  width: '100%',
                  padding: '12px 16px',
                  minHeight: 48,
                  background: !currentMusic ? 'rgba(26, 26, 47, 0.06)' : 'transparent',
                  border: !currentMusic ? '0.5px solid var(--ink)' : '0.5px solid rgba(26, 26, 47, 0.10)',
                  borderRadius: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  WebkitTapHighlightColor: 'transparent',
                }}
                aria-pressed={!currentMusic}
              >
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)' }}>
                  Silence
                </span>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    border: !currentMusic ? '4px solid var(--ink)' : '1px solid rgba(26, 26, 47, 0.20)',
                    flexShrink: 0,
                  }}
                />
              </button>

              {/* Volume slider */}
              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(26, 26, 47, 0.04)',
                  borderRadius: 12,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 13 }} aria-hidden>🔉</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={Math.round((cocon.musicVolume || 0.45) * 100)}
                  onChange={(e) => onUpdateCocon({ musicVolume: Number(e.target.value) / 100 })}
                  aria-label="Volume"
                  style={{
                    flex: 1,
                    accentColor: 'var(--ink)',
                  }}
                />
                <span
                  style={{
                    minWidth: 30,
                    textAlign: 'right',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 11,
                    fontVariantNumeric: 'tabular-nums',
                    color: 'var(--content-tertiary)',
                  }}
                >
                  {Math.round((cocon.musicVolume || 0.45) * 100)}
                </span>
              </div>

              {/* Tracks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {TRACKS.map((t) => {
                  const active = t.key === currentMusic;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      data-press
                      onClick={() => { haptic(2); onUpdateCocon({ music: t.key }); }}
                      style={{
                        appearance: 'none',
                        padding: '12px 14px',
                        minHeight: 44,
                        background: active ? 'rgba(26, 26, 47, 0.06)' : 'transparent',
                        border: active ? '0.5px solid var(--ink)' : '0.5px solid rgba(26, 26, 47, 0.08)',
                        borderRadius: 10,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                      aria-pressed={active}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontStyle: 'italic',
                          fontVariationSettings: 'var(--fraunces-italic-soft)',
                          fontSize: 14,
                          color: 'var(--ink)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginRight: 8,
                        }}
                      >
                        {t.title}
                      </span>
                      {active && (
                        <span
                          aria-hidden
                          style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: 9,
                            letterSpacing: '0.222em',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            color: 'var(--content-secondary)',
                            flexShrink: 0,
                          }}
                        >
                          en cours
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'identite' && (
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: 'var(--content-secondary)',
                  marginBottom: 18,
                }}
              >
                Qui tu es dans cet espace.
              </div>

              {/* Prénom */}
              <div style={{ marginBottom: 18 }}>
                <label
                  className="neya-mark"
                  style={{ color: 'var(--content-tertiary)', display: 'block', marginBottom: 8 }}
                >
                  Prénom
                </label>
                <input
                  type="text"
                  value={tempPseudo}
                  onChange={(e) => setTempPseudo(e.target.value)}
                  placeholder="Ton prénom"
                  maxLength={30}
                  aria-label="Ton prénom"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    minHeight: 48,
                    background: 'rgba(26, 26, 47, 0.04)',
                    border: '0.5px solid rgba(26, 26, 47, 0.10)',
                    borderRadius: 12,
                    fontFamily: 'var(--font-body)',
                    fontSize: 15,
                    color: 'var(--ink)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Mantra */}
              <div style={{ marginBottom: 18 }}>
                <label
                  className="neya-mark"
                  style={{ color: 'var(--content-tertiary)', display: 'block', marginBottom: 8 }}
                >
                  Mantra du moment
                </label>
                <textarea
                  value={tempMantra}
                  onChange={(e) => setTempMantra(e.target.value)}
                  placeholder="Une phrase pour toi…"
                  rows={2}
                  maxLength={140}
                  aria-label="Mantra"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    minHeight: 64,
                    background: 'rgba(26, 26, 47, 0.04)',
                    border: '0.5px solid rgba(26, 26, 47, 0.10)',
                    borderRadius: 12,
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontVariationSettings: 'var(--fraunces-italic-soft)',
                    fontSize: 16,
                    lineHeight: 1.4,
                    color: 'var(--ink)',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <div
                  style={{
                    marginTop: 4,
                    textAlign: 'right',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 10,
                    fontVariantNumeric: 'tabular-nums',
                    color: tempMantra.length >= 130 ? 'var(--crisis)' : 'var(--content-tertiary)',
                  }}
                >
                  {140 - tempMantra.length}
                </div>
              </div>

              {/* Totem */}
              <div style={{ marginBottom: 18 }}>
                <label
                  className="neya-mark"
                  style={{ color: 'var(--content-tertiary)', display: 'block', marginBottom: 8 }}
                >
                  Mon totem
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {TOTEMS.map((t) => {
                    const active = t.key === currentTotem;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        data-press
                        onClick={() => { haptic(2); onUpdate({ totem: t.key }); }}
                        style={{
                          appearance: 'none',
                          padding: '12px 14px',
                          minHeight: 48,
                          background: active ? 'rgba(26, 26, 47, 0.06)' : 'transparent',
                          border: active ? '0.5px solid var(--ink)' : '0.5px solid rgba(26, 26, 47, 0.10)',
                          borderRadius: 10,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-ui)',
                          fontSize: 13,
                          fontWeight: active ? 600 : 500,
                          color: 'var(--ink)',
                          textAlign: 'left',
                          WebkitTapHighlightColor: 'transparent',
                        }}
                        aria-pressed={active}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                data-press
                onClick={handleSaveIdentite}
                style={{
                  appearance: 'none',
                  width: '100%',
                  padding: '14px 16px',
                  minHeight: 48,
                  background: 'var(--ink)',
                  color: 'var(--cream)',
                  border: 'none',
                  borderRadius: 999,
                  fontFamily: 'var(--font-ui)',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                Garder
              </button>
            </div>
          )}
        </div>

        {/* Footer close (sauf tab identite qui a son propre Garder) */}
        {tab !== 'identite' && (
          <div style={{ padding: '12px 22px 0', flexShrink: 0 }}>
            <button
              type="button"
              data-press
              onClick={handleClose}
              style={{
                appearance: 'none',
                width: '100%',
                padding: '12px 16px',
                minHeight: 44,
                background: 'transparent',
                border: '0.5px solid rgba(26, 26, 47, 0.16)',
                borderRadius: 999,
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--ink)',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </>
  );
}
