/* ============================================================
   ÇA VA ? V6 — Cocon · refonte premium Apple Health / Calm
   ============================================================
   Migration Design System V4 — Eyebrow / HeroTitle / Body / CTA
   / GlassCard / tokens. Cas spéciaux préservés : topbar brand
   custom + image card (halo teal animé, BUG-05).
   ============================================================ */

import { useState, useEffect, useMemo, useRef } from 'react';
import { WORLDS } from '../worlds';
import { getProfile, patchProfile, haptic } from '../state';
import BreathingPause from './BreathingPause';
import CoconAmbiance from './CoconAmbiance';
import Musique, { getTrackCover } from './Musique';
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
  if (h >= 5 && h < 8)   return 'L’aube est douce. Pose-toi.';
  if (h >= 8 && h < 12)  return 'Le jour est là. Respire.';
  if (h >= 12 && h < 17) return 'Chaque souffle te recentre.';
  if (h >= 17 && h < 20) return 'Le jour s’apaise. Reviens à toi.';
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

/* ─── Icône-gradient pour ActionCard ─── */
function ActionIcon({ gradient, children }) {
  return (
    <div
      aria-hidden
      style={{
        width: 32,
        height: 32,
        flexShrink: 0,
        borderRadius: '50%',
        background: gradient,
        color: '#FFFFFF',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 10px rgba(10, 36, 56, 0.18)',
      }}
    >
      {children}
    </div>
  );
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

  useEffect(() => {
    const id = setInterval(() => forceTick((n) => (n + 1) % 1000), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const refresh = () => setLocalProfile(getProfile());
    window.addEventListener('neya:profile-changed', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('neya:profile-changed', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = typeof cocon.musicVolume === 'number' ? cocon.musicVolume : 0.45;
  }, [cocon.musicVolume]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    setMusicPlaying(false);
  }, [currentTrack?.key]);

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
        background: tokens.bg,
      }}
      data-world={currentTotem.world}
    >
      {/* Painterly blobs atténués */}
      <div style={{ opacity: 0.55, pointerEvents: 'none' }}>
        <Blobs variant="rose-violet" />
      </div>

      {/* ── Topbar sticky brand glass (cas spécial — pas de Header standard) */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          paddingTop: 'env(safe-area-inset-top, 0px)',
          background: 'rgba(238, 243, 248, 0.72)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '0.5px solid rgba(255, 255, 255, 0.85)',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 56,
          }}
        >
          <span style={{ width: 44, height: 44 }} />
          <span
            style={{
              fontFamily: tokens.fonts.display,
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 22,
              color: tokens.blue900,
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
              background: tokens.glass.bg,
              border: tokens.glass.border,
              borderRadius: '50%',
              color: tokens.blue900,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: tokens.glass.blur,
              WebkitBackdropFilter: tokens.glass.blur,
              WebkitTapHighlightColor: 'transparent',
              fontSize: 18,
              padding: 0,
              boxShadow: '0 4px 14px rgba(10, 36, 56, 0.08)',
            }}
          >
            ⋯
          </button>
        </div>
      </div>

      {/* ── Image personnage card — 343×260 (BUG-05 préservé — cas spécial) */}
      <div
        style={{
          position: 'relative',
          margin: '24px 16px 0',
          height: 260,
          borderRadius: 28,
          overflow: 'hidden',
          flexShrink: 0,
          boxShadow: tokens.glass.shadowDeep,
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
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, transparent 40%, rgba(10, 36, 56, 0.55) 100%)',
            pointerEvents: 'none',
          }}
        />
        {/* Halo teal animé premium */}
        <div
          aria-hidden
          className="cocon-halo"
          style={{
            position: 'absolute',
            bottom: -8,
            left: '50%',
            width: 100,
            height: 50,
            background: 'radial-gradient(ellipse, rgba(18, 196, 176, 0.35) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
        <CoconAmbiance type={cocon.ambiance || 'fireflies'} accent={accent} />
      </div>

      {/* ── Hero text — Eyebrow + HeroTitle + Body whisper ─── */}
      <div
        style={{
          position: 'relative',
          margin: '32px 24px 0',
          textAlign: 'center',
          zIndex: 2,
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <Eyebrow color="rose">Ton cocon</Eyebrow>
        </div>
        <HeroTitle size="lg">{getGreeting(profile.pseudo)}</HeroTitle>
        <div style={{ margin: '16px auto 0', maxWidth: 320 }}>
          <Body variant="whisper" italic style={{ fontSize: 16, lineHeight: 1.5 }}>
            {hourWhisper}
          </Body>
        </div>

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
                fontFamily: tokens.fonts.display,
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: 20,
                lineHeight: 1.4,
                color: tokens.violet,
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

      {/* ── CTA gradient-rose premium ── */}
      <div style={{ position: 'relative', margin: '40px 16px 0', zIndex: 2 }}>
        <CTA
          variant="rose"
          size="lg"
          full
          haptic={false}
          onClick={() => { haptic(6); setBreathingOpen(true); }}
        >
          Me poser 2 minutes
        </CTA>
      </div>

      {/* ── ActionCards grid ── */}
      <div
        style={{
          position: 'relative',
          margin: '40px 16px 0',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 12,
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 130px)',
          zIndex: 2,
        }}
      >
        <ActionCard
          onClick={() => { haptic(4); setMusiqueOpen(true); }}
          icon={(
            <ActionIcon gradient={tokens.gradientBlue}>
              <IconMusic />
            </ActionIcon>
          )}
          label={currentTrack ? currentTrack.title : 'Musique'}
          subtitle={currentTrack ? (musicPlaying ? 'En lecture…' : 'Touche pour ouvrir') : 'Choisis ta piste'}
          cover={currentTrack ? getTrackCover(currentTrack.key) : null}
          onPlayToggle={currentTrack ? togglePlay : null}
          isPlaying={musicPlaying}
        />
        <ActionCard
          onClick={() => { haptic(2); setPersonalizeOpen(true); }}
          icon={(
            <ActionIcon gradient={tokens.gradientRose}>
              <IconMantra />
            </ActionIcon>
          )}
          label={profile.mantra ? 'Modifier ton mantra' : 'Poser un mantra'}
          subtitle={profile.mantra ? 'Une phrase pour toi' : 'Quelques mots qui te recentrent'}
        />
        <ActionCard
          onClick={() => { haptic(2); setPersonalizeOpen(true); }}
          icon={(
            <ActionIcon gradient={tokens.gradientViolet}>
              <IconSettings />
            </ActionIcon>
          )}
          label="Personnaliser"
          subtitle="Image, ambiance, identité"
        />
      </div>

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

      {/* ── Keyframes locales + interactions ── */}
      <style>{`
        .cocon-halo {
          transform: translateX(-50%);
          animation: cocon-halo-pulse 4.2s ease-in-out infinite;
        }
        @keyframes cocon-halo-pulse {
          0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
          50%      { opacity: 1;   transform: translateX(-50%) scale(1.18); }
        }
        @keyframes cocon-mantra-breathe {
          0%, 100% { opacity: 0.86; }
          50%      { opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .cocon-halo { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   ActionCard — GlassCard hoverable + icône/cover + texte serif
   ============================================================ */

function ActionCard({ onClick, icon, label, subtitle, cover, onPlayToggle, isPlaying }) {
  return (
    <GlassCard
      hoverable
      radius="lg"
      elevation="soft"
      padding="16px 18px"
      onClick={onClick}
      style={{ minHeight: 76 }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          width: '100%',
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
              background: tokens.blueLight,
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
          icon
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: tokens.fonts.display,
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 17,
              color: tokens.blue900,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.2,
            }}
          >
            {label}
          </div>
          <div style={{ marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <Body variant="caption">{subtitle}</Body>
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
              background: tokens.gradientBlue,
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
            color: tokens.blue300,
            fontSize: 18,
            flexShrink: 0,
            padding: '0 2px',
          }}
        >
          ›
        </span>
      </div>
    </GlassCard>
  );
}

/* ─── Icônes SVG inline (18px, white) ─── */

function IconMusic() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconMantra() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.94a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1.03-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9c.21.51.74.86 1.55 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1.03Z" stroke="currentColor" strokeWidth="1.6" />
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
          background: tokens.bg,
          color: tokens.blue900,
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
            margin: '0 auto 16px',
            flexShrink: 0,
          }}
        />

        {/* Header standard V4 */}
        <div style={{ flexShrink: 0 }}>
          <Header title="Mon cocon" onBack={handleClose} />
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            padding: '16px 22px 16px',
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
                  padding: '8px 16px',
                  minHeight: 36,
                  background: active ? tokens.gradientBlue : 'transparent',
                  color: active ? '#FFFFFF' : tokens.textSecondary,
                  border: active ? 'none' : `1px solid ${tokens.blue300}`,
                  borderRadius: 999,
                  fontFamily: tokens.fonts.ui,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  WebkitTapHighlightColor: 'transparent',
                  flexShrink: 0,
                  boxShadow: active ? '0 4px 14px rgba(26, 90, 127, 0.25)' : 'none',
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
              <div style={{ marginBottom: 16 }}>
                <Body variant="body-sm">Le décor de ton sanctuaire.</Body>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
                        border: active ? `2px solid ${tokens.blue700}` : tokens.glass.border,
                        borderRadius: 16,
                        cursor: 'pointer',
                        overflow: 'hidden',
                        position: 'relative',
                        aspectRatio: '4 / 5',
                        background: `${tokens.bg} url(${img.src}) center / cover no-repeat`,
                        WebkitTapHighlightColor: 'transparent',
                        boxShadow: active ? '0 8px 24px rgba(26, 90, 127, 0.25)' : '0 4px 14px rgba(10, 36, 56, 0.08)',
                      }}
                      aria-pressed={active}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          bottom: 0,
                          padding: '24px 12px 12px',
                          background: 'linear-gradient(0deg, rgba(10, 36, 56, 0.80) 0%, transparent 100%)',
                          color: '#FFFFFF',
                          fontFamily: tokens.fonts.display,
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
              <div style={{ marginBottom: 16 }}>
                <Body variant="body-sm">La petite vie qui danse sur ton cocon.</Body>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {AMBIANCES.map((a) => {
                  const active = a.key === currentAmbiance;
                  return (
                    <GlassCard
                      key={a.key}
                      radius="md"
                      elevation="soft"
                      padding="14px 16px"
                      hoverable
                      onClick={() => { haptic(2); onUpdateCocon({ ambiance: a.key }); }}
                      aria-pressed={active}
                      style={{
                        minHeight: 60,
                        background: active ? 'rgba(26, 90, 127, 0.08)' : tokens.glass.bg,
                        border: active ? `1px solid ${tokens.blue700}` : tokens.glass.border,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 14,
                          width: '100%',
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontFamily: tokens.fonts.display,
                              fontStyle: 'italic',
                              fontWeight: 300,
                              fontSize: 17,
                              lineHeight: 1.3,
                              letterSpacing: '-0.01em',
                              color: tokens.blue900,
                            }}
                          >
                            {a.label}
                          </div>
                          <div style={{ marginTop: 4 }}>
                            <Body variant="caption">{a.hint}</Body>
                          </div>
                        </div>
                        <span
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            border: active ? `5px solid ${tokens.blue700}` : `1px solid ${tokens.blue300}`,
                            background: 'transparent',
                            flexShrink: 0,
                            transition: 'all 200ms ease-out',
                          }}
                        />
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'musique' && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <Body variant="body-sm">La musique qui accompagne ton retour à toi.</Body>
              </div>

              <GlassCard
                radius="sm"
                elevation="soft"
                padding="12px 16px"
                hoverable
                onClick={() => { haptic(2); onUpdateCocon({ music: null }); }}
                aria-pressed={!currentMusic}
                style={{
                  minHeight: 48,
                  marginBottom: 12,
                  background: !currentMusic ? 'rgba(26, 90, 127, 0.08)' : tokens.glass.bg,
                  border: !currentMusic ? `1px solid ${tokens.blue700}` : tokens.glass.border,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <span style={{ fontFamily: tokens.fonts.body, fontSize: 15, fontWeight: 500, color: tokens.blue900 }}>
                    Silence
                  </span>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      border: !currentMusic ? `4px solid ${tokens.blue700}` : `1px solid ${tokens.blue300}`,
                      flexShrink: 0,
                    }}
                  />
                </div>
              </GlassCard>

              <GlassCard radius="sm" elevation="soft" padding="12px 16px" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
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
                      accentColor: tokens.blue700,
                    }}
                  />
                  <span
                    style={{
                      minWidth: 30,
                      textAlign: 'right',
                      fontFamily: tokens.fonts.ui,
                      fontSize: 12,
                      fontWeight: 500,
                      fontVariantNumeric: 'tabular-nums',
                      color: tokens.textSecondary,
                    }}
                  >
                    {Math.round((cocon.musicVolume || 0.45) * 100)}
                  </span>
                </div>
              </GlassCard>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {TRACKS.map((t) => {
                  const active = t.key === currentMusic;
                  return (
                    <GlassCard
                      key={t.key}
                      radius="sm"
                      elevation="soft"
                      padding="12px 14px"
                      hoverable
                      onClick={() => { haptic(2); onUpdateCocon({ music: t.key }); }}
                      aria-pressed={active}
                      style={{
                        minHeight: 48,
                        background: active ? 'rgba(26, 90, 127, 0.08)' : tokens.glass.bg,
                        border: active ? `1px solid ${tokens.blue700}` : tokens.glass.border,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: tokens.fonts.display,
                            fontStyle: 'italic',
                            fontWeight: 300,
                            fontSize: 17,
                            lineHeight: 1.3,
                            color: tokens.blue900,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginRight: 8,
                          }}
                        >
                          {t.title}
                        </span>
                        {active && (
                          <span aria-hidden style={{ flexShrink: 0 }}>
                            <Eyebrow color="blue" style={{ fontSize: 10 }}>en cours</Eyebrow>
                          </span>
                        )}
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'identite' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <Body variant="body-sm">Qui tu es dans cet espace.</Body>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 12 }}>
                  <Eyebrow color="secondary">Prénom</Eyebrow>
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
                    background: tokens.glass.bg,
                    border: tokens.glass.border,
                    borderRadius: 14,
                    fontFamily: tokens.fonts.body,
                    fontSize: 15,
                    color: tokens.blue900,
                    outline: 'none',
                    boxSizing: 'border-box',
                    backdropFilter: tokens.glass.blur,
                    WebkitBackdropFilter: tokens.glass.blur,
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 12 }}>
                  <Eyebrow color="secondary">Mantra du moment</Eyebrow>
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
                    background: tokens.glass.bg,
                    border: tokens.glass.border,
                    borderRadius: 14,
                    fontFamily: tokens.fonts.display,
                    fontStyle: 'italic',
                    fontWeight: 300,
                    fontSize: 18,
                    lineHeight: 1.4,
                    color: tokens.blue900,
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                    backdropFilter: tokens.glass.blur,
                    WebkitBackdropFilter: tokens.glass.blur,
                  }}
                />
                <div
                  style={{
                    marginTop: 6,
                    textAlign: 'right',
                    fontFamily: tokens.fonts.ui,
                    fontSize: 11,
                    fontWeight: 500,
                    fontVariantNumeric: 'tabular-nums',
                    color: tempMantra.length >= 130 ? tokens.rose700 : tokens.textSecondary,
                  }}
                >
                  {140 - tempMantra.length}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 12 }}>
                  <Eyebrow color="secondary">Mon totem</Eyebrow>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {TOTEMS.map((t) => {
                    const active = t.key === currentTotem;
                    return (
                      <GlassCard
                        key={t.key}
                        radius="sm"
                        elevation="soft"
                        padding="12px 14px"
                        hoverable
                        onClick={() => { haptic(2); onUpdate({ totem: t.key }); }}
                        aria-pressed={active}
                        style={{
                          minHeight: 48,
                          background: active ? 'rgba(26, 90, 127, 0.08)' : tokens.glass.bg,
                          border: active ? `1px solid ${tokens.blue700}` : tokens.glass.border,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: tokens.fonts.ui,
                            fontSize: 14,
                            fontWeight: active ? 600 : 500,
                            lineHeight: 1.3,
                            color: tokens.blue900,
                          }}
                        >
                          {t.label}
                        </span>
                      </GlassCard>
                    );
                  })}
                </div>
              </div>

              <CTA
                variant="primary"
                size="lg"
                full
                haptic={false}
                onClick={handleSaveIdentite}
              >
                Garder
              </CTA>
            </div>
          )}
        </div>

        {/* Footer close */}
        {tab !== 'identite' && (
          <div style={{ padding: '12px 22px 0', flexShrink: 0 }}>
            <CTA
              variant="outline"
              size="md"
              full
              haptic={false}
              onClick={handleClose}
            >
              Fermer
            </CTA>
          </div>
        )}
      </div>
    </>
  );
}
