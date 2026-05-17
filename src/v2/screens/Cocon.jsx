/* ============================================================
   ÇA VA ? V6 — Cocon · refonte palette bleu/rose + glassmorphism
   ============================================================
   Sanctuaire éditorial : conteneur image délimité, halo teal sous
   personnage, hero text serif italic, CTA rose pleine largeur,
   3 actions glass (Musique / Mantra / Personnaliser).
   Vision Will / CLAUDE.md sections 4-9.
   ============================================================ */

import { useState, useEffect, useMemo, useRef } from 'react';
import { WORLDS } from '../worlds';
import { getProfile, patchProfile, haptic } from '../state';
import BreathingPause from './BreathingPause';
import CoconAmbiance from './CoconAmbiance';
import Musique, { getTrackCover } from './Musique';
import useStandardOverlay from '../hooks/useStandardOverlay';
import Blobs from '../../components/Blobs';

const TOTEMS = [
  { key: 'lion',    label: 'Lion blanc',    world: 'foret' },
  { key: 'ours',    label: 'Ours polaire',  world: 'temple' },
  { key: 'aigle',   label: 'Aigle céleste', world: 'oasis' },
  { key: 'daim',    label: 'Daim lunaire',  world: 'lac' },
  { key: 'baleine', label: 'Baleine sage',  world: 'montagne' },
  { key: 'renard',  label: 'Renard',        world: 'communaute' },
];

const COCON_IMAGES = [
  { key: 'foret',      label: 'Forêt de Clarté',    src: '/img/world-foret.png' },
  { key: 'temple',     label: 'Temple intérieur',   src: '/img/world-temple.png' },
  { key: 'oasis',      label: 'Oasis du Souffle',   src: '/img/world-oasis.png' },
  { key: 'lac',        label: 'Lac des Émotions',   src: '/img/world-lac.png' },
  { key: 'montagne',   label: 'Montagne de Vision', src: '/img/world-montagne.png' },
  { key: 'communaute', label: 'Refuge partagé',     src: '/img/world-communaute.png' },
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
  if (h >= 5 && h < 8)   return 'L\'aube est douce. Pose-toi.';
  if (h >= 8 && h < 12)  return 'Le jour est là. Respire.';
  if (h >= 12 && h < 17) return 'Chaque souffle te recentre.';
  if (h >= 17 && h < 20) return 'Le jour s\'apaise. Reviens à toi.';
  if (h >= 20 && h < 23) return 'La nuit veille. Repose-toi.';
  return 'Chaque respiration te rapproche de toi-même.';
}

function getGreeting(pseudo) {
  if (pseudo) return `Bonjour, ${pseudo}.`;
  return 'Pose-toi ici.';
}

function resolveImage(profile) {
  const cocon = profile.cocon || {};
  const explicit = COCON_IMAGES.find((i) => i.key === cocon.image);
  if (explicit) return explicit;
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
  const currentImage = useMemo(() => resolveImage(profile), [profile]);
  const hourWhisper = useMemo(() => getHourPhrase(), []);
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

  // Audio : appliquer volume
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = typeof cocon.musicVolume === 'number' ? cocon.musicVolume : 0.45;
  }, [cocon.musicVolume]);

  // Track change → stop
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
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
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        background: 'var(--bg)',
      }}
      data-world={currentTotem.world}
    >
      <Blobs variant="rose-violet" />

      {/* Top bar — brand ÇA VA? + bouton ⋯ */}
      <div
        style={{
          position: 'relative',
          padding: 'calc(env(safe-area-inset-top, 0px) + 18px) 22px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 3,
        }}
      >
        <span style={{ width: 44, height: 44 }} />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 22,
            color: 'var(--blue-900)',
            letterSpacing: '-0.01em',
          }}
        >
          ÇA VA ?
        </span>
        <button
          type="button"
          onClick={() => { haptic(2); setPersonalizeOpen(true); }}
          data-press
          aria-label="Personnaliser mon cocon"
          style={{
            appearance: 'none',
            width: 44,
            height: 44,
            background: 'rgba(255, 255, 255, 0.65)',
            border: '0.5px solid rgba(26, 90, 127, 0.30)',
            borderRadius: '50%',
            color: 'var(--blue-900)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            WebkitTapHighlightColor: 'transparent',
            fontSize: 18,
            padding: 0,
            boxShadow: '0 4px 14px rgba(10, 36, 56, 0.06)',
          }}
        >
          ⋯
        </button>
      </div>

      {/* Conteneur image illustrative — 343×220 max, jamais plein écran */}
      <div
        style={{
          position: 'relative',
          margin: '8px 16px 0',
          height: 220,
          borderRadius: 24,
          overflow: 'hidden',
          flexShrink: 0,
          boxShadow: '0 8px 28px rgba(10, 36, 56, 0.10)',
          zIndex: 2,
        }}
      >
        <img
          src={currentImage.src}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '78%',
            objectFit: 'cover',
            objectPosition: 'center 30%',
            userSelect: 'none',
            display: 'block',
          }}
        />
        {/* Overlay gradient sombre pour lisibilité */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, transparent 30%, rgba(10, 36, 56, 0.65) 100%)',
            pointerEvents: 'none',
          }}
        />
        {/* Halo teal sous personnage */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: -10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 80,
            height: 40,
            background: 'radial-gradient(ellipse, rgba(18, 196, 176, 0.30) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'cocon-halo-pulse 4s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        {/* Ambiance dynamique cantonnée dans la carte */}
        <CoconAmbiance type={cocon.ambiance || 'fireflies'} accent={accent} />
      </div>

      {/* Hero text */}
      <div
        style={{
          position: 'relative',
          margin: '28px 22px 0',
          textAlign: 'center',
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--rose-700)',
            marginBottom: 14,
          }}
        >
          Ton cocon
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(36px, 9vw, 52px)',
            lineHeight: 1.05,
            letterSpacing: 0,
            color: 'var(--blue-900)',
          }}
        >
          {getGreeting(profile.pseudo)}
        </h1>
        <p
          style={{
            margin: '16px auto 0',
            fontFamily: 'var(--font-body)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 15,
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            maxWidth: 320,
          }}
        >
          {hourWhisper}
        </p>

        {/* Mantra optionnel */}
        {profile.mantra && (
          <button
            type="button"
            onClick={() => { haptic(2); setPersonalizeOpen(true); }}
            aria-label="Modifier ton mantra"
            style={{
              marginTop: 16,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: 20,
                lineHeight: 1.4,
                color: 'var(--violet)',
                animation: 'cocon-mantra-breathe 8s ease-in-out infinite',
                display: 'inline-block',
                maxWidth: 320,
              }}
            >
              « {profile.mantra} »
            </span>
          </button>
        )}
      </div>

      {/* CTA rose principal — pleine largeur */}
      <div style={{ position: 'relative', margin: '26px 16px 0', zIndex: 2 }}>
        <button
          type="button"
          onClick={() => { haptic(6); setBreathingOpen(true); }}
          data-press
          style={{
            appearance: 'none',
            width: '100%',
            height: 50,
            background: 'var(--gradient-rose)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 50,
            fontFamily: 'var(--font-ui)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            boxShadow: '0 8px 24px rgba(200, 112, 144, 0.30)',
          }}
        >
          Me poser 2 minutes
        </button>
      </div>

      {/* Liste 3 ActionCards glass : Musique · Mantra · Personnaliser */}
      <div
        style={{
          position: 'relative',
          margin: '20px 16px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 130px)',
          zIndex: 2,
        }}
      >
        <ActionCard
          onClick={() => { haptic(4); setMusiqueOpen(true); }}
          icon={<IconMusic />}
          label={currentTrack ? currentTrack.title : 'Musique'}
          subtitle={currentTrack ? (musicPlaying ? 'En lecture…' : 'Touche pour ouvrir') : 'Choisis ta piste'}
          cover={currentTrack ? getTrackCover(currentTrack.key) : null}
          onPlayToggle={currentTrack ? togglePlay : null}
          isPlaying={musicPlaying}
        />
        <ActionCard
          onClick={() => { haptic(2); setPersonalizeOpen(true); }}
          icon={<IconMantra />}
          label={profile.mantra ? 'Modifier ton mantra' : 'Poser un mantra'}
          subtitle={profile.mantra ? 'Une phrase pour toi' : 'Quelques mots qui te recentrent'}
        />
        <ActionCard
          onClick={() => { haptic(2); setPersonalizeOpen(true); }}
          icon={<IconSettings />}
          label="Personnaliser"
          subtitle="Image, ambiance, identité"
        />
      </div>

      {/* Audio element */}
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
        @keyframes cocon-halo-pulse {
          0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
          50%      { opacity: 1;   transform: translateX(-50%) scale(1.15); }
        }
        @keyframes cocon-mantra-breathe {
          0%, 100% { opacity: 0.86; }
          50%      { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   ActionCard — pill glass blur 24 + icône bleue + label serif italic
   ============================================================ */

function ActionCard({ onClick, icon, label, subtitle, cover, onPlayToggle, isPlaying }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-press
      style={{
        appearance: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        width: '100%',
        padding: '14px 16px',
        minHeight: 64,
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.85)',
        borderRadius: 20,
        cursor: 'pointer',
        textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
        boxShadow: '0 4px 24px rgba(10, 36, 56, 0.07)',
      }}
    >
      {/* Icône / cover */}
      {cover ? (
        <div
          aria-hidden
          style={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: 10,
            overflow: 'hidden',
            boxShadow: '0 2px 6px rgba(10, 36, 56, 0.18)',
            background: 'var(--blue-100)',
          }}
        >
          <img
            src={cover}
            alt=""
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', userSelect: 'none' }}
          />
        </div>
      ) : (
        <div
          aria-hidden
          style={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: 10,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(26, 90, 127, 0.08)',
            color: 'var(--blue-700)',
          }}
        >
          {icon}
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 18,
            color: 'var(--blue-900)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.2,
          }}
        >
          {label}
        </div>
        <div
          style={{
            marginTop: 4,
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            fontWeight: 400,
            lineHeight: 1.5,
            color: 'var(--text-secondary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {subtitle}
        </div>
      </div>

      {onPlayToggle && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onPlayToggle(); }}
          data-press
          aria-label={isPlaying ? 'Mettre en pause' : 'Lancer'}
          style={{
            appearance: 'none',
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--gradient-blue)',
            color: '#FFFFFF',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            padding: 0,
            fontSize: 11,
            WebkitTapHighlightColor: 'transparent',
            boxShadow: '0 4px 12px rgba(26, 90, 127, 0.30)',
          }}
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>
      )}

      <span
        aria-hidden
        style={{
          color: 'var(--blue-500)',
          fontSize: 18,
          flexShrink: 0,
          padding: '0 2px',
        }}
      >
        ›
      </span>
    </button>
  );
}

/* ─── Icônes SVG inline (24px, blue-700) ─── */

function IconMusic() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconMantra() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.94a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1.03-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9c.21.51.74.86 1.55 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1.03Z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/* ============================================================
   PersonalizeSheet — 4 sections : image / ambiance / musique / identité
   ============================================================ */

function PersonalizeSheet({ profile, onUpdate, onUpdateCocon, onClose }) {
  const [tab, setTab] = useState('image');
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
          background: 'rgba(10, 36, 56, 0.55)',
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
          background: 'var(--bg)',
          color: 'var(--blue-900)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: '12px 0 calc(env(safe-area-inset-bottom, 0px) + 24px)',
          transform: closing ? 'translateY(100%)' : mounted ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 -8px 32px rgba(10, 36, 56, 0.18)',
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
            background: 'rgba(10, 36, 56, 0.18)',
            margin: '0 auto 18px',
            flexShrink: 0,
          }}
        />

        {/* Title */}
        <div style={{ padding: '0 22px', textAlign: 'center', marginBottom: 18, flexShrink: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 'clamp(26px, 6.5vw, 30px)',
              lineHeight: 1.15,
              color: 'var(--blue-900)',
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
                  background: active ? 'var(--blue-700)' : 'transparent',
                  color: active ? '#FFFFFF' : 'var(--text-secondary)',
                  border: active ? 'none' : '1px solid var(--blue-300)',
                  borderRadius: 999,
                  fontFamily: 'var(--font-ui)',
                  fontSize: 12,
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

        {/* Tab content */}
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
                  fontSize: 15,
                  fontWeight: 400,
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                  marginBottom: 16,
                }}
              >
                Le décor de ton sanctuaire.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
                        border: active ? '2px solid var(--blue-700)' : '1px solid var(--blue-300)',
                        borderRadius: 14,
                        cursor: 'pointer',
                        overflow: 'hidden',
                        position: 'relative',
                        aspectRatio: '4 / 5',
                        background: `var(--bg) url(${img.src}) center / cover no-repeat`,
                        WebkitTapHighlightColor: 'transparent',
                        boxShadow: active ? '0 4px 14px rgba(10, 36, 56, 0.18)' : 'none',
                      }}
                      aria-pressed={active}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          bottom: 0,
                          padding: '24px 10px 12px',
                          background: 'linear-gradient(0deg, rgba(10, 36, 56, 0.80) 0%, transparent 100%)',
                          color: '#FFFFFF',
                          fontFamily: 'var(--font-display)',
                          fontStyle: 'italic',
                          fontWeight: 300,
                          fontSize: 16,
                          lineHeight: 1.2,
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
                  fontSize: 15,
                  fontWeight: 400,
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                  marginBottom: 16,
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
                        background: active ? 'rgba(26, 90, 127, 0.08)' : 'rgba(255, 255, 255, 0.55)',
                        border: active ? '1px solid var(--blue-700)' : '1px solid var(--blue-300)',
                        borderRadius: 14,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 14,
                        textAlign: 'left',
                        WebkitTapHighlightColor: 'transparent',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                      }}
                      aria-pressed={active}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: 15,
                            fontWeight: 600,
                            lineHeight: 1.3,
                            letterSpacing: '-0.01em',
                            color: 'var(--blue-900)',
                          }}
                        >
                          {a.label}
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 13,
                            fontWeight: 400,
                            lineHeight: 1.5,
                            color: 'var(--text-secondary)',
                            marginTop: 4,
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
                          border: active ? '5px solid var(--blue-700)' : '1px solid var(--blue-300)',
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
                  fontSize: 15,
                  fontWeight: 400,
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                  marginBottom: 16,
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
                  background: !currentMusic ? 'rgba(26, 90, 127, 0.08)' : 'rgba(255, 255, 255, 0.55)',
                  border: !currentMusic ? '1px solid var(--blue-700)' : '1px solid var(--blue-300)',
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
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, color: 'var(--blue-900)' }}>
                  Silence
                </span>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    border: !currentMusic ? '4px solid var(--blue-700)' : '1px solid var(--blue-300)',
                    flexShrink: 0,
                  }}
                />
              </button>

              {/* Volume slider */}
              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(26, 90, 127, 0.05)',
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
                    accentColor: 'var(--blue-700)',
                  }}
                />
                <span
                  style={{
                    minWidth: 30,
                    textAlign: 'right',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 12,
                    fontWeight: 500,
                    fontVariantNumeric: 'tabular-nums',
                    color: 'var(--text-secondary)',
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
                        background: active ? 'rgba(26, 90, 127, 0.08)' : 'transparent',
                        border: active ? '1px solid var(--blue-700)' : '1px solid var(--blue-300)',
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
                          fontWeight: 300,
                          fontSize: 17,
                          lineHeight: 1.3,
                          color: 'var(--blue-900)',
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
                            fontSize: 10,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            color: 'var(--blue-700)',
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
                  fontSize: 15,
                  fontWeight: 400,
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                  marginBottom: 20,
                }}
              >
                Qui tu es dans cet espace.
              </div>

              {/* Prénom */}
              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 10,
                    fontFamily: 'var(--font-ui)',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary)',
                  }}
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
                    background: 'rgba(255, 255, 255, 0.65)',
                    border: '1px solid var(--blue-300)',
                    borderRadius: 12,
                    fontFamily: 'var(--font-body)',
                    fontSize: 15,
                    color: 'var(--blue-900)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Mantra */}
              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 10,
                    fontFamily: 'var(--font-ui)',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary)',
                  }}
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
                    background: 'rgba(255, 255, 255, 0.65)',
                    border: '1px solid var(--blue-300)',
                    borderRadius: 12,
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    fontSize: 18,
                    lineHeight: 1.4,
                    color: 'var(--blue-900)',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <div
                  style={{
                    marginTop: 6,
                    textAlign: 'right',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 11,
                    fontWeight: 500,
                    fontVariantNumeric: 'tabular-nums',
                    color: tempMantra.length >= 130 ? 'var(--rose-700)' : 'var(--text-secondary)',
                  }}
                >
                  {140 - tempMantra.length}
                </div>
              </div>

              {/* Totem */}
              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 10,
                    fontFamily: 'var(--font-ui)',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary)',
                  }}
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
                          background: active ? 'rgba(26, 90, 127, 0.08)' : 'rgba(255, 255, 255, 0.55)',
                          border: active ? '1px solid var(--blue-700)' : '1px solid var(--blue-300)',
                          borderRadius: 10,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-ui)',
                          fontSize: 14,
                          fontWeight: active ? 600 : 500,
                          lineHeight: 1.3,
                          color: 'var(--blue-900)',
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
                  minHeight: 50,
                  background: 'var(--gradient-blue)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 999,
                  fontFamily: 'var(--font-ui)',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  boxShadow: '0 8px 24px rgba(26, 90, 127, 0.30)',
                }}
              >
                Garder
              </button>
            </div>
          )}
        </div>

        {/* Footer close */}
        {tab !== 'identite' && (
          <div style={{ padding: '12px 22px 0', flexShrink: 0 }}>
            <button
              type="button"
              data-press
              onClick={handleClose}
              style={{
                appearance: 'none',
                width: '100%',
                padding: '13px 24px',
                minHeight: 44,
                background: 'transparent',
                border: '1.5px solid var(--blue-300)',
                borderRadius: 50,
                fontFamily: 'var(--font-ui)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--blue-700)',
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
