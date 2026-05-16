/* ============================================================
   ÇA VA ? V2 — Musique
   ============================================================
   Page playlist style Apple Music — ÇA VA ? comme interprète.
   Hero featured + grille 2 colonnes de pochettes générées.
   Pochettes : gradient tonal + grand symbole + titre Fraunces.
   Mini-player flottant en bas. Modal Now Playing plein écran.
   ============================================================ */

import { useState, useEffect, useRef, useMemo } from 'react';
import { getProfile, setProfile, haptic } from '../state';
import useStandardOverlay from '../hooks/useStandardOverlay';

/* ─── Catalogue ÇA VA ? · 11 morceaux ─── */
const COVER_BASE = '/musique/pochettes';
const TRACKS = [
  { key: 'ça-va',                     title: 'Ça va',                     cover: `${COVER_BASE}/ca-va.jpg`,                   tint: '#1F4F45', deep: '#0E2520', mood: 'l\'aveu silencieux' },
  { key: 'silencieuse',               title: 'Silencieuse',               cover: `${COVER_BASE}/silencieuse.jpg`,             tint: '#2A3548', deep: '#0F1422', mood: 'le vide qui parle' },
  { key: 'mon-cœur',                  title: 'Mon cœur',                  cover: `${COVER_BASE}/mon-coeur.jpg`,               tint: '#7C3A30', deep: '#3A1A14', mood: 'la tendresse exposée' },
  { key: 'souffle-court',             title: 'Souffle court',             cover: `${COVER_BASE}/souffle-court.jpg`,           tint: '#5B7693', deep: '#26384B', mood: 'l\'apnée' },
  { key: 'À débordement',             title: 'À débordement',             cover: `${COVER_BASE}/a-debordement.jpg`,           tint: '#7A5430', deep: '#3A2614', mood: 'le trop-plein' },
  { key: 'entre-tension-et-douceur',  title: 'Entre tension et douceur',  cover: `${COVER_BASE}/entre-tension-et-douceur.jpg`, tint: '#5C4D7A', deep: '#2C2348', mood: 'l\'entre-deux' },
  { key: 'ce-qui-reste 2',            title: 'Ce qui reste',              cover: `${COVER_BASE}/ce-qui-reste.jpg`,            tint: '#2C3340', deep: '#0F131C', mood: 'l\'après' },
  { key: 'sur-ma-planète',            title: 'Sur ma planète',            cover: `${COVER_BASE}/sur-ma-planete.jpg`,          tint: '#6B5A92', deep: '#2F2452', mood: 'l\'orbite intérieure' },
  { key: 'Masque',                    title: 'Masque',                    cover: `${COVER_BASE}/masque.jpg`,                  tint: '#1F2434', deep: '#06080F', mood: 'ce que tu caches' },
  { key: 'burn-out',                  title: 'Burn-out',                  cover: `${COVER_BASE}/burn-out.jpg`,                tint: '#94553F', deep: '#3D1F14', mood: 'la cendre' },
  { key: 'stress-post-traumatique',   title: 'Stress post-traumatique',   cover: `${COVER_BASE}/stress-post-traumatique.jpg`, tint: '#3D3848', deep: '#15131C', mood: 'la mémoire qui revient' },
];

/* Helper export : permet à Cocon (mini-player) de retrouver la pochette d'une piste */
export function getTrackCover(key) {
  const t = TRACKS.find((x) => x.key === key);
  return t ? t.cover : null;
}

const FEATURED_KEY = 'ça-va';

function trackSrc(key) {
  return `/musique/${encodeURIComponent(key)}.mp3`;
}

function findTrack(key) {
  return TRACKS.find((t) => t.key === key) || null;
}

function formatTime(s) {
  if (!Number.isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, '0')}`;
}

/* ─── Composant pochette (image réelle) ─── */
function AlbumCover({ track, variant = 'grid' }) {
  const [errored, setErrored] = useState(false);
  if (!track) return null;
  const isPlayer = variant === 'player';
  const isHero = variant === 'hero';
  const isMini = variant === 'mini';

  const radius = isPlayer ? 18 : isHero ? 14 : isMini ? 6 : 10;
  const shadow = isPlayer
    ? '0 24px 60px rgba(0,0,0,0.42), 0 8px 20px rgba(0,0,0,0.28)'
    : isHero
    ? '0 10px 30px rgba(0,0,0,0.28)'
    : isMini
    ? '0 2px 6px rgba(0,0,0,0.32)'
    : '0 4px 14px rgba(0,0,0,0.22)';

  const fallbackBg = `
    radial-gradient(at 75% 25%, ${track.tint}CC, transparent 65%),
    radial-gradient(at 15% 85%, ${track.deep}AA, transparent 70%),
    linear-gradient(155deg, ${track.tint} 0%, ${track.deep} 100%)
  `;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        borderRadius: radius,
        overflow: 'hidden',
        boxShadow: shadow,
        background: errored ? fallbackBg : (track.deep || '#1A1A2F'),
      }}
    >
      {!errored && (
        <img
          src={track.cover}
          alt={`Pochette · ${track.title}`}
          loading="lazy"
          draggable={false}
          onError={() => setErrored(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            userSelect: 'none',
          }}
        />
      )}
      {errored && (
        <div
          style={{
            position: 'absolute',
            left: isMini ? 6 : 12,
            right: isMini ? 6 : 12,
            bottom: isMini ? 6 : 12,
            color: '#FBF6E8',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            fontSize: isPlayer ? 26 : isHero ? 20 : isMini ? 10 : 13,
            lineHeight: 1.1,
            textShadow: '0 1px 8px rgba(0,0,0,0.4)',
          }}
        >
          {track.title}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Écran principal
   ============================================================ */
export default function Musique({ onClose }) {
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profile, setLocalProfile] = useState(() => getProfile());
  const [playing, setPlaying] = useState(false);
  const [currentKey, setCurrentKey] = useState(() => (getProfile().cocon || {}).music || null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false);
  const audioRef = useRef(null);

  const cocon = profile.cocon || { music: null, musicVolume: 0.45 };
  const volume = typeof cocon.musicVolume === 'number' ? cocon.musicVolume : 0.45;
  const currentTrack = useMemo(() => findTrack(currentKey), [currentKey]);
  const featured = useMemo(() => findTrack(FEATURED_KEY) || TRACKS[0], []);

  /* ─── Mount : signaler overlay fullscreen pour cacher BottomNav ─── */
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    haptic(4);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('neya:fullscreen-overlay', { detail: { open: true } }));
    }
    return () => {
      cancelAnimationFrame(raf);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('neya:fullscreen-overlay', { detail: { open: false } }));
      }
    };
  }, []);

  /* ─── Audio : sync state ─── */
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
  }, [volume]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setProgress(a.currentTime || 0);
    const onMeta = () => setDuration(a.duration || 0);
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
    };
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('ended', onEnd);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('ended', onEnd);
    };
  }, []);

  /* ─── Charger / jouer un track ─── */
  const playTrack = (key) => {
    const a = audioRef.current;
    if (!a) return;
    haptic(4);
    const src = trackSrc(key);

    // Persister la sélection dans le profil (partage avec mini-player Cocon)
    const p = getProfile();
    const next = { ...p, cocon: { ...(p.cocon || {}), music: key } };
    setProfile(next);
    setLocalProfile(next);
    setCurrentKey(key);

    if (a.src && a.src.endsWith(src.replace(/^\//, ''))) {
      // Même piste → toggle play/pause
      if (a.paused) a.play().then(() => setPlaying(true)).catch(() => {});
      else { a.pause(); setPlaying(false); }
      return;
    }
    a.src = src;
    a.currentTime = 0;
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a || !currentKey) return;
    haptic(2);
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => {});
    else { a.pause(); setPlaying(false); }
  };

  const nextTrack = () => {
    if (!currentKey) return;
    const idx = TRACKS.findIndex((t) => t.key === currentKey);
    const next = TRACKS[(idx + 1) % TRACKS.length];
    playTrack(next.key);
  };

  const prevTrack = () => {
    if (!currentKey) return;
    const idx = TRACKS.findIndex((t) => t.key === currentKey);
    const prev = TRACKS[(idx - 1 + TRACKS.length) % TRACKS.length];
    playTrack(prev.key);
  };

  const seekTo = (pct) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    a.currentTime = pct * duration;
    setProgress(a.currentTime);
  };

  /* ─── Close ─── */
  const handleClose = () => {
    haptic(2);
    // Pause audio à la fermeture (l'utilisateur relancera via mini-player Cocon si désiré)
    const a = audioRef.current;
    if (a && !a.paused) { a.pause(); }
    setPlaying(false);
    setClosing(true);
    setTimeout(() => onClose?.(), 320);
  };

  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closing,
    onClose: handleClose,
    labelText: 'Musique ÇA VA ?',
  });

  return (
    <>
      {/* Audio invisible */}
      <audio ref={audioRef} preload="metadata" loop={false} />

      {/* Backdrop */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 220,
          background: 'var(--cream)',
          opacity: closing ? 0 : mounted ? 1 : 0,
          transition: 'opacity 320ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      <div
        ref={containerRef}
        {...dialogProps}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 221,
          background: 'var(--cream)',
          color: 'var(--ink)',
          transform: closing ? 'translateY(2.5%)' : mounted ? 'translateY(0)' : 'translateY(2.5%)',
          opacity: closing ? 0 : mounted ? 1 : 0,
          transition: 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 320ms cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header sticky */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'calc(env(safe-area-inset-top, 0px) + 12px) 18px 14px',
            background: 'var(--cream)',
            borderBottom: '0.5px solid rgba(26, 26, 47, 0.08)',
            flexShrink: 0,
            zIndex: 2,
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            data-press
            aria-label="Fermer"
            style={{
              appearance: 'none',
              width: 44,
              height: 44,
              borderRadius: 22,
              border: 'none',
              background: 'transparent',
              color: 'var(--ink)',
              cursor: 'pointer',
              fontSize: 22,
              fontFamily: 'var(--font-ui)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            ✕
          </button>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              fontSize: 18,
              color: 'var(--ink)',
            }}
          >
            Musique
          </div>
          <div style={{ width: 44 }} aria-hidden />
        </div>

        {/* Scroll content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: currentTrack
              ? 'calc(env(safe-area-inset-bottom, 0px) + 110px)'
              : 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
          }}
        >
          {/* ─── Hero featured ─── */}
          <div style={{ padding: '24px 18px 8px' }}>
            <div
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 10,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: 'var(--content-secondary)',
                fontWeight: 600,
                marginBottom: 14,
              }}
            >
              À l'écoute
            </div>
            <button
              type="button"
              data-press
              onClick={() => {
                playTrack(featured.key);
                setNowPlayingOpen(true);
              }}
              aria-label={`Écouter ${featured.title}`}
              style={{
                appearance: 'none',
                width: '100%',
                border: 'none',
                background: 'transparent',
                padding: 0,
                cursor: 'pointer',
                textAlign: 'left',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div style={{ width: '100%', maxWidth: 520, margin: '0 auto' }}>
                <AlbumCover track={featured} variant="hero" />
              </div>
              <div style={{ marginTop: 14, textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontVariationSettings: 'var(--fraunces-italic-soft)',
                    fontSize: 22,
                    color: 'var(--ink)',
                    lineHeight: 1.1,
                  }}
                >
                  {featured.title}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 12,
                    color: 'var(--content-secondary)',
                    marginTop: 4,
                    letterSpacing: '0.04em',
                  }}
                >
                  ÇA VA ? · {featured.mood}
                </div>
              </div>
            </button>
          </div>

          {/* ─── Section grille ─── */}
          <div style={{ padding: '28px 18px 18px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontVariationSettings: 'var(--fraunces-italic-soft)',
                  fontSize: 20,
                  color: 'var(--ink)',
                }}
              >
                Tous les morceaux
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 11,
                  color: 'var(--content-secondary)',
                  letterSpacing: '0.06em',
                }}
              >
                {TRACKS.length} titres
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 14,
              }}
            >
              {TRACKS.map((t, i) => {
                const isActive = t.key === currentKey;
                return (
                  <button
                    key={t.key}
                    type="button"
                    data-press
                    onClick={() => {
                      playTrack(t.key);
                      setNowPlayingOpen(true);
                    }}
                    aria-label={`Écouter ${t.title}`}
                    aria-pressed={isActive}
                    style={{
                      appearance: 'none',
                      border: 'none',
                      background: 'transparent',
                      padding: 0,
                      cursor: 'pointer',
                      textAlign: 'left',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <AlbumCover track={t} variant="grid" index={i} />
                      {isActive && playing && (
                        <div
                          aria-hidden
                          style={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            background: 'rgba(251,246,232,0.94)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: t.deep,
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
                          ▶
                        </div>
                      )}
                    </div>
                    <div style={{ paddingTop: 8 }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontStyle: 'italic',
                          fontVariationSettings: 'var(--fraunces-italic-soft)',
                          fontSize: 14,
                          color: 'var(--ink)',
                          lineHeight: 1.2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {t.title}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-ui)',
                          fontSize: 11,
                          color: 'var(--content-secondary)',
                          marginTop: 2,
                          letterSpacing: '0.04em',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        ÇA VA ?
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer murmure */}
          <div
            style={{
              padding: '20px 28px 8px',
              textAlign: 'center',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              fontSize: 13,
              color: 'var(--content-secondary)',
              lineHeight: 1.5,
            }}
          >
            Onze morceaux pour onze états.
            <br />
            Choisis celui qui ressemble à maintenant.
          </div>
        </div>

        {/* ─── Mini-player flottant ─── */}
        {currentTrack && (
          <button
            type="button"
            data-press
            onClick={() => { haptic(2); setNowPlayingOpen(true); }}
            aria-label="Ouvrir le lecteur"
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              minHeight: 60,
              background: 'rgba(26, 26, 47, 0.94)',
              borderRadius: 14,
              border: '0.5px solid rgba(251, 246, 232, 0.08)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.28)',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              appearance: 'none',
              textAlign: 'left',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              zIndex: 5,
            }}
          >
            <div style={{ width: 44, height: 44, flexShrink: 0 }}>
              <AlbumCover track={currentTrack} variant="mini" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontVariationSettings: 'var(--fraunces-italic-soft)',
                  fontSize: 14,
                  color: '#FBF6E8',
                  lineHeight: 1.15,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {currentTrack.title}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 10,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'rgba(251,246,232,0.66)',
                  marginTop: 2,
                  fontWeight: 600,
                }}
              >
                ÇA VA ?
              </div>
            </div>
            <button
              type="button"
              data-press
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              aria-label={playing ? 'Pause' : 'Lecture'}
              style={{
                appearance: 'none',
                width: 40,
                height: 40,
                borderRadius: 20,
                background: 'rgba(251,246,232,0.96)',
                color: 'var(--ink)',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                flexShrink: 0,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {playing ? '❚❚' : '▶'}
            </button>
          </button>
        )}
      </div>

      {/* ─── Modal Now Playing plein écran ─── */}
      {nowPlayingOpen && currentTrack && (
        <NowPlaying
          track={currentTrack}
          playing={playing}
          progress={progress}
          duration={duration}
          onTogglePlay={togglePlay}
          onNext={nextTrack}
          onPrev={prevTrack}
          onSeek={seekTo}
          onClose={() => { haptic(2); setNowPlayingOpen(false); }}
        />
      )}
    </>
  );
}

/* ============================================================
   Modal Now Playing (plein écran, slide-up)
   ============================================================ */
function NowPlaying({ track, playing, progress, duration, onTogglePlay, onNext, onPrev, onSeek, onClose }) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => onClose?.(), 320);
  };

  const pct = duration > 0 ? Math.min(1, Math.max(0, progress / duration)) : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Lecteur · ${track.title}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 230,
        background: `
          radial-gradient(at 50% 0%, ${track.tint}55, transparent 60%),
          linear-gradient(180deg, ${track.deep} 0%, #0A0C18 100%)
        `,
        color: '#FBF6E8',
        display: 'flex',
        flexDirection: 'column',
        transform: closing ? 'translateY(100%)' : mounted ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 22px 8px',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={handleClose}
          data-press
          aria-label="Réduire"
          style={{
            appearance: 'none',
            width: 44,
            height: 44,
            borderRadius: 22,
            border: 'none',
            background: 'rgba(251,246,232,0.08)',
            color: '#FBF6E8',
            cursor: 'pointer',
            fontSize: 16,
            fontFamily: 'var(--font-ui)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          ⌄
        </button>
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            opacity: 0.7,
            fontWeight: 600,
          }}
        >
          À l'écoute
        </div>
        <div style={{ width: 44 }} aria-hidden />
      </div>

      {/* Pochette grande */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 36px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 380,
            transform: playing ? 'scale(1)' : 'scale(0.94)',
            transition: 'transform 480ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <AlbumCover track={track} variant="player" />
        </div>
      </div>

      {/* Infos titre */}
      <div style={{ padding: '8px 28px 18px', textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            fontSize: 26,
            color: '#FBF6E8',
            lineHeight: 1.1,
            letterSpacing: '-0.005em',
          }}
        >
          {track.title}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 12,
            color: 'rgba(251,246,232,0.72)',
            marginTop: 6,
            letterSpacing: '0.04em',
          }}
        >
          ÇA VA ? · {track.mood}
        </div>
      </div>

      {/* Barre progression */}
      <div style={{ padding: '0 28px 8px' }}>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct * 100)}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const p = (e.clientX - r.left) / r.width;
            onSeek?.(Math.max(0, Math.min(1, p)));
          }}
          style={{
            position: 'relative',
            height: 4,
            borderRadius: 2,
            background: 'rgba(251,246,232,0.18)',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${pct * 100}%`,
              background: 'rgba(251,246,232,0.92)',
              borderRadius: 2,
              transition: 'width 120ms linear',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 6,
            fontFamily: 'var(--font-ui)',
            fontSize: 10,
            color: 'rgba(251,246,232,0.6)',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '0.04em',
          }}
        >
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Contrôles */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 36,
          padding: '14px 28px calc(env(safe-area-inset-bottom, 0px) + 36px)',
        }}
      >
        <button
          type="button"
          data-press
          onClick={onPrev}
          aria-label="Précédent"
          style={{
            appearance: 'none',
            width: 56,
            height: 56,
            borderRadius: 28,
            border: 'none',
            background: 'transparent',
            color: '#FBF6E8',
            cursor: 'pointer',
            fontSize: 22,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          ⏮
        </button>
        <button
          type="button"
          data-press
          onClick={onTogglePlay}
          aria-label={playing ? 'Pause' : 'Lecture'}
          style={{
            appearance: 'none',
            width: 76,
            height: 76,
            borderRadius: 38,
            border: 'none',
            background: '#FBF6E8',
            color: 'var(--ink)',
            cursor: 'pointer',
            fontSize: 22,
            WebkitTapHighlightColor: 'transparent',
            boxShadow: '0 8px 22px rgba(0,0,0,0.32)',
          }}
        >
          {playing ? '❚❚' : '▶'}
        </button>
        <button
          type="button"
          data-press
          onClick={onNext}
          aria-label="Suivant"
          style={{
            appearance: 'none',
            width: 56,
            height: 56,
            borderRadius: 28,
            border: 'none',
            background: 'transparent',
            color: '#FBF6E8',
            cursor: 'pointer',
            fontSize: 22,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          ⏭
        </button>
      </div>
    </div>
  );
}
