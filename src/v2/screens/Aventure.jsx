/* ============================================================
   NÉYA V5 — Aventure (hub gamifié painterly)
   ============================================================
   Salle de gym mentale + voyage initiatique.
   Structure : hub d'accueil avec 3 piliers visuels.

     🌍 L'AVENTURE     — 6 mondes émotionnels, quêtes
     📚 LA CONNAISSANCE — bibliothèque santé mentale
     🪞 LES 3 TEMPS DU SOI — passé / présent / futur

   + Séance du jour (CTA principal)
   + Personnalisable (image / ambiance / musique) comme Cocon
   ============================================================ */

import { useState, useEffect, useMemo, useRef } from 'react';
import { WORLDS } from '../worlds';
import { getProfile, patchProfile, haptic } from '../state';
import { LECONS as LECONS_CONTENT } from '../data/lecons';
import { TEMPS_GROUPS as TEMPS_GROUPS_DATA, getRituelsForTemps } from '../data/rituels-temps';
import CoconAmbiance from './CoconAmbiance';
import LeconReader from './LeconReader';
import RituelPlayer from './RituelPlayer';
import AventureOnboarding from './AventureOnboarding';
import useStandardOverlay from '../hooks/useStandardOverlay';

/* ─── Données ─── */

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
  { key: 'fireflies', label: 'Lucioles', hint: 'Petites lumières flottantes' },
  { key: 'rain',      label: 'Pluie',    hint: 'Pluie douce qui tombe' },
  { key: 'snow',      label: 'Neige',    hint: 'Flocons qui descendent' },
  { key: 'stars',     label: 'Étoiles',  hint: 'Scintillements doux' },
  { key: 'none',      label: 'Silence',  hint: 'Aucune particule' },
];

const TRACKS = [
  { key: 'silencieuse',              title: 'Silencieuse' },
  { key: 'mon-cœur',                 title: 'Mon cœur' },
  { key: 'souffle-court',            title: 'Souffle court' },
  { key: 'À débordement',            title: 'À débordement' },
  { key: 'entre-tension-et-douceur', title: 'Entre tension et douceur' },
  { key: 'ce-qui-reste 2',           title: 'Ce qui reste' },
  { key: 'sur-ma-planète',           title: 'Sur ma planète' },
  { key: 'Masque',                   title: 'Masque' },
];

/* 6 mondes pour le pilier Aventure */
const WORLDS_LIST = [
  { key: 'foret',      name: 'Forêt de Clarté',    totem: 'Lion',    emotion: 'Sortir du brouillard',         order: 1 },
  { key: 'temple',     name: 'Temple des Parts',   totem: 'Ours',    emotion: 'Accepter ses contradictions',  order: 2 },
  { key: 'oasis',      name: 'Oasis du Présent',   totem: 'Aigle',   emotion: 'Habiter l\'instant',           order: 3 },
  { key: 'lac',        name: 'Lac des Émotions',   totem: 'Daim',    emotion: 'Traverser ses ressentis',      order: 4 },
  { key: 'montagne',   name: 'Montagne de Vision', totem: 'Baleine', emotion: 'Clarifier sa direction',       order: 5 },
  { key: 'communaute', name: 'Refuge partagé',     totem: 'Renard',  emotion: 'Apprendre à recevoir',         order: 6 },
];

/* 8 leçons (pilier Connaissance) — contenu complet dans data/lecons.js */
const LECONS = LECONS_CONTENT;

/* Les 3 temps du soi — depuis data */
const TEMPS_SOI = TEMPS_GROUPS_DATA;

/* ─── Helpers ─── */

function getHourPhrase() {
  const h = new Date().getHours();
  if (h >= 5 && h < 8)   return 'L\'aube est douce. Pars du bon pied.';
  if (h >= 8 && h < 12)  return 'Le jour est là. Avance.';
  if (h >= 12 && h < 17) return 'Continue à prendre soin de toi.';
  if (h >= 17 && h < 20) return 'Le jour s\'apaise. Pose un dernier pas.';
  if (h >= 20 && h < 23) return 'La nuit veille. Prends ce moment.';
  return 'Le silence te porte.';
}

function getGreeting(pseudo) {
  if (pseudo) return `Bonjour, ${pseudo}.`;
  return 'Aventure-toi ici.';
}

function resolveImage(profile) {
  const av = profile.aventure || {};
  const explicit = COCON_IMAGES.find((i) => i.key === av.image);
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

export default function Aventure({ onOpenMeditation, onOpenWorld, onOpenHabitudes, onOpenEspaceVrai, onOpenBilan, onOpenBilanSemaine }) {
  const [profile, setLocalProfile] = useState(() => getProfile());
  const [personalizeOpen, setPersonalizeOpen] = useState(false);
  const [pilierSheet, setPilierSheet] = useState(null);
  const [openedLecon, setOpenedLecon] = useState(null);
  const [openedRituel, setOpenedRituel] = useState(null);
  const [onboardingOpen, setOnboardingOpen] = useState(() => {
    const p = getProfile();
    return !p.aventure?.onboardingSeen;
  });
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [, forceTick] = useState(0);
  const audioRef = useRef(null);

  const av = profile.aventure || { image: null, ambiance: 'fireflies', music: null, musicVolume: 0.4 };
  const totemKey = profile.totem || 'lion';
  const currentTotem = TOTEMS.find((t) => t.key === totemKey) || TOTEMS[0];
  const totemWorld = WORLDS[currentTotem.world] || WORLDS.foret;
  const accent = totemWorld.accent;
  const accentRgb = totemWorld.accentRgb;
  const currentImage = useMemo(() => resolveImage(profile), [profile]);
  const currentTrack = useMemo(() => TRACKS.find((t) => t.key === av.music) || null, [av.music]);
  const hourPhrase = useMemo(() => getHourPhrase(), []);

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
    a.volume = typeof av.musicVolume === 'number' ? av.musicVolume : 0.4;
  }, [av.musicVolume]);

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
  const updateAventure = (avPatch) => {
    const nextAv = { ...(profile.aventure || {}), ...avPatch };
    updateProfile({ aventure: nextAv });
  };

  // Quête du jour : alterne sur cycle de 3 selon date
  const questOfDay = useMemo(() => {
    const day = new Date().getDate();
    const options = [
      { title: 'Méditation guidée', desc: 'Une pause de 5 minutes', cta: 'Commencer', onAction: onOpenMeditation },
      { title: 'Mes habitudes du jour', desc: 'Les rituels qui te portent', cta: 'Y aller', onAction: onOpenHabitudes },
      { title: 'Espace de présence', desc: 'Te poser et te ressentir', cta: 'Entrer', onAction: onOpenEspaceVrai },
    ];
    return options[day % options.length];
  }, [onOpenMeditation, onOpenHabitudes, onOpenEspaceVrai]);

  const now = new Date();
  const isEvening = now.getHours() >= 18;
  const isSundayEvening = now.getDay() === 0 && isEvening;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        background: '#0a0c14',
      }}
      data-world={currentTotem.world}
    >
      {/* HERO painterly */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '52vh',
          minHeight: 360,
          maxHeight: 520,
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${currentImage.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            animation: 'aventure-bg-ken-burns 32s ease-in-out infinite alternate',
            willChange: 'transform',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.12) 45%, rgba(10, 12, 20, 0.85) 100%)',
            pointerEvents: 'none',
          }}
        />
        <CoconAmbiance type={av.ambiance || 'fireflies'} accent={accent} />

        {/* Top bar */}
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
          <div aria-hidden style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <svg width="22" height="14" viewBox="0 0 44 28" fill="none" aria-hidden>
              <path d="M22 26 C 8 18, 4 8, 22 2 C 40 8, 36 18, 22 26 Z" stroke="#FBF6E8" strokeWidth="0.8" fill="none" opacity="0.92" />
              <path d="M22 26 C 12 22, 10 14, 22 8" stroke="#FBF6E8" strokeWidth="0.6" fill="none" opacity="0.7" />
              <path d="M22 26 C 32 22, 34 14, 22 8" stroke="#FBF6E8" strokeWidth="0.6" fill="none" opacity="0.7" />
            </svg>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 9, letterSpacing: '0.42em', fontWeight: 500, color: '#FBF6E8', opacity: 0.78 }}>
              NÉYA
            </span>
          </div>
          <button
            type="button"
            onClick={() => { haptic(2); setPersonalizeOpen(true); }}
            data-press
            aria-label="Personnaliser mon aventure"
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

        <div
          style={{
            position: 'absolute',
            left: 22,
            right: 22,
            bottom: 32,
            color: '#FBF6E8',
            zIndex: 2,
          }}
        >
          <div className="neya-mark" style={{ color: '#FBF6E8', opacity: 0.72, marginBottom: 12, fontSize: 9 }}>
            MON AVENTURE
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 9vw, 44px)',
              fontWeight: 300,
              lineHeight: 1.05,
              letterSpacing: '-0.022em',
              fontVariationSettings: '"opsz" 144, "SOFT" 50',
              color: '#FBF6E8',
              textShadow: '0 2px 18px rgba(0, 0, 0, 0.42)',
            }}
          >
            {getGreeting(profile.pseudo)}
          </h1>
          <p
            style={{
              margin: '14px 0 0',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 16,
              lineHeight: 1.4,
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              color: '#FBF6E8',
              opacity: 0.92,
              maxWidth: 320,
              textShadow: '0 1px 8px rgba(0, 0, 0, 0.32)',
            }}
          >
            {hourPhrase}
          </p>
        </div>
      </div>

      {/* Body ink */}
      <div
        style={{
          background: 'linear-gradient(180deg, #0a0c14 0%, #0e1018 12%, #0e1018 100%)',
          padding: '8px 22px calc(env(safe-area-inset-bottom, 0px) + 130px)',
          color: '#FBF6E8',
        }}
      >
        {/* QUÊTE DU JOUR */}
        <section
          style={{
            marginTop: 24,
            padding: '20px 22px',
            background: `linear-gradient(135deg, ${accentRgb}, 0.18), rgba(251, 246, 232, 0.04))`,
            border: `0.5px solid ${accent}`,
            borderRadius: 20,
            boxShadow: `0 8px 32px ${accentRgb}, 0.20)`,
          }}
        >
          <div className="neya-mark" style={{ color: accent, marginBottom: 8, fontSize: 9 }}>
            Ta séance du jour
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 22,
              lineHeight: 1.25,
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              color: '#FBF6E8',
              marginBottom: 4,
            }}
          >
            {questOfDay.title}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              lineHeight: 1.5,
              color: 'rgba(251, 246, 232, 0.72)',
              marginBottom: 16,
            }}
          >
            {questOfDay.desc}
          </div>
          <button
            type="button"
            data-press
            onClick={() => { haptic(6); questOfDay.onAction?.(); }}
            style={{
              appearance: 'none',
              width: '100%',
              padding: '14px 18px',
              minHeight: 48,
              background: accent,
              color: '#FBF6E8',
              border: 'none',
              borderRadius: 999,
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {questOfDay.cta}
          </button>
        </section>

        {/* 3 PILIERS */}
        <div className="neya-mark" style={{ color: 'rgba(251, 246, 232, 0.55)', marginTop: 32, marginBottom: 14 }}>
          Tes piliers
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PilierCard
            label="L'Aventure"
            subtitle={`${currentTotem.label} · ${(WORLDS_LIST.find((w) => w.key === currentTotem.world) || WORLDS_LIST[0]).emotion}`}
            mark="01"
            accent={accent}
            bgImage="/img/world-foret.png"
            onClick={() => { haptic(4); setPilierSheet('aventure'); }}
          />
          <PilierCard
            label="La Connaissance"
            subtitle={`${LECONS.length} leçons · comprendre`}
            mark="02"
            accent="var(--mist-blue)"
            bgImage="/img/world-temple.png"
            onClick={() => { haptic(4); setPilierSheet('connaissance'); }}
          />
          <PilierCard
            label="Les 3 Temps du Soi"
            subtitle="Passé · Présent · Futur"
            mark="03"
            accent="var(--emerald)"
            bgImage="/img/world-lac.png"
            onClick={() => { haptic(4); setPilierSheet('temps'); }}
          />
        </div>

        {/* Bilans contextuels */}
        {(isEvening || isSundayEvening) && (
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {isEvening && !isSundayEvening && (
              <button
                type="button"
                data-press
                onClick={() => { haptic(4); onOpenBilan?.(); }}
                style={subActionStyle}
              >
                <span style={{ flex: 1, textAlign: 'left' }}>Bilan du soir</span>
                <span style={{ color: 'rgba(251, 246, 232, 0.42)', fontSize: 14 }}>›</span>
              </button>
            )}
            {isSundayEvening && (
              <button
                type="button"
                data-press
                onClick={() => { haptic(4); onOpenBilanSemaine?.(); }}
                style={subActionStyle}
              >
                <span style={{ flex: 1, textAlign: 'left' }}>Bilan de la semaine</span>
                <span style={{ color: 'rgba(251, 246, 232, 0.42)', fontSize: 14 }}>›</span>
              </button>
            )}
          </div>
        )}

        {/* Mini player musique */}
        {currentTrack && (
          <div
            style={{
              marginTop: 28,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              minHeight: 44,
              background: 'rgba(251, 246, 232, 0.06)',
              border: '0.5px solid rgba(251, 246, 232, 0.12)',
              borderRadius: 999,
            }}
          >
            <button
              type="button"
              onClick={togglePlay}
              data-press
              aria-label={musicPlaying ? 'Pause' : 'Lancer'}
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
                fontSize: 11,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {musicPlaying ? '❚❚' : '▶'}
            </button>
            <span
              style={{
                flex: 1,
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontVariationSettings: 'var(--fraunces-italic-soft)',
                fontSize: 13,
                color: '#FBF6E8',
                opacity: 0.88,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {currentTrack.title}
            </span>
          </div>
        )}
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

      {personalizeOpen && (
        <AventurePersonalizeSheet
          profile={profile}
          onUpdate={updateProfile}
          onUpdateAventure={updateAventure}
          onClose={() => setPersonalizeOpen(false)}
        />
      )}

      {pilierSheet === 'aventure' && (
        <AventureWorldsSheet
          worlds={WORLDS_LIST}
          currentTotem={currentTotem.world}
          onPick={(worldKey) => { setPilierSheet(null); onOpenWorld?.(worldKey); }}
          onClose={() => setPilierSheet(null)}
        />
      )}
      {pilierSheet === 'connaissance' && (
        <ConnaissanceSheet
          lecons={LECONS}
          leconsLues={av.leconsLues || []}
          onPick={(lecon) => { setPilierSheet(null); setOpenedLecon(lecon); }}
          onClose={() => setPilierSheet(null)}
        />
      )}
      {openedLecon && (
        <LeconReader
          lecon={openedLecon}
          onClose={() => { setOpenedLecon(null); setLocalProfile(getProfile()); setPilierSheet('connaissance'); }}
        />
      )}
      {pilierSheet === 'temps' && (
        <TempsSoiSheet
          temps={TEMPS_SOI}
          rituelsFaits={av.rituelsFaits || {}}
          onPickRituel={(rituel) => { setPilierSheet(null); setOpenedRituel(rituel); }}
          onClose={() => setPilierSheet(null)}
        />
      )}
      {openedRituel && (
        <RituelPlayer
          rituel={openedRituel}
          onClose={() => { setOpenedRituel(null); setLocalProfile(getProfile()); setPilierSheet('temps'); }}
        />
      )}

      {onboardingOpen && (
        <AventureOnboarding
          onClose={() => { setOnboardingOpen(false); setLocalProfile(getProfile()); }}
        />
      )}

      <style>{`
        @keyframes aventure-bg-ken-burns {
          0%   { transform: scale(1)    translate3d(0, 0, 0); }
          100% { transform: scale(1.08) translate3d(0, -1.5%, 0); }
        }
      `}</style>
    </div>
  );
}

const subActionStyle = {
  appearance: 'none',
  width: '100%',
  padding: '14px 18px',
  minHeight: 48,
  background: 'rgba(251, 246, 232, 0.06)',
  border: '0.5px solid rgba(251, 246, 232, 0.12)',
  borderRadius: 14,
  color: '#FBF6E8',
  fontFamily: 'var(--font-ui)',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  WebkitTapHighlightColor: 'transparent',
};

/* ─── PilierCard ─── */

function PilierCard({ label, subtitle, mark, accent, bgImage, onClick }) {
  return (
    <button
      type="button"
      data-press
      onClick={onClick}
      style={{
        appearance: 'none',
        width: '100%',
        padding: 0,
        background: '#0e1018',
        border: '0.5px solid rgba(251, 246, 232, 0.10)',
        borderRadius: 18,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
        minHeight: 96,
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.32,
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(90deg, rgba(14, 16, 24, 0.92) 0%, rgba(14, 16, 24, 0.60) 100%)`,
        }}
      />
      <div
        style={{
          position: 'relative',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            border: `1px solid ${accent}`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accent,
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.04em',
            fontVariantNumeric: 'tabular-nums',
            flexShrink: 0,
          }}
        >
          {mark}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              fontSize: 18,
              color: '#FBF6E8',
              lineHeight: 1.25,
            }}
          >
            {label}
          </div>
          <div
            style={{
              marginTop: 4,
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              color: 'rgba(251, 246, 232, 0.62)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {subtitle}
          </div>
        </div>
        <span aria-hidden style={{ color: 'rgba(251, 246, 232, 0.42)', fontSize: 16, flexShrink: 0 }}>›</span>
      </div>
    </button>
  );
}

/* ─── SheetWrap commun ─── */

function SheetWrap({ title, subtitle, labelText, onClose, children }) {
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const aliveRef = useRef(true);
  const timersRef = useRef([]);

  const safeTimeout = (fn, ms) => {
    const id = setTimeout(() => { if (aliveRef.current) fn(); }, ms);
    timersRef.current.push(id);
    return id;
  };

  const handleClose = () => {
    if (closing) return;
    haptic(3);
    setClosing(true);
    safeTimeout(() => onClose?.(), 320);
  };

  const { dialogProps, containerRef } = useStandardOverlay({
    open: !closing,
    onClose: handleClose,
    labelText: labelText || title,
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
        <div aria-hidden style={{ width: 36, height: 5, borderRadius: 999, background: 'rgba(26, 26, 47, 0.18)', margin: '0 auto 14px', flexShrink: 0 }} />
        <div style={{ padding: '0 22px', textAlign: 'center', marginBottom: 18, flexShrink: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              fontSize: 22,
              color: 'var(--ink)',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                marginTop: 8,
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                lineHeight: 1.5,
                color: 'var(--content-tertiary)',
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
        <div
          style={{
            padding: '0 22px 8px',
            overflowY: 'auto',
            flex: 1,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </div>
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
      </div>
    </>
  );
}

/* ─── 3 sheets piliers ─── */

function AventureWorldsSheet({ worlds, currentTotem, onPick, onClose }) {
  return (
    <SheetWrap title="L'Aventure" subtitle="Six mondes émotionnels à traverser." onClose={onClose} labelText="Mondes">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {worlds.map((w) => {
          const isCurrent = w.key === currentTotem;
          return (
            <button
              key={w.key}
              type="button"
              data-press
              onClick={() => onPick?.(w.key)}
              style={{
                appearance: 'none',
                width: '100%',
                padding: '16px 16px',
                minHeight: 72,
                background: isCurrent ? 'rgba(26, 26, 47, 0.06)' : 'transparent',
                border: isCurrent ? '0.5px solid var(--ink)' : '0.5px solid rgba(26, 26, 47, 0.10)',
                borderRadius: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                textAlign: 'left',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(26, 26, 47, 0.06)',
                  color: 'var(--ink-soft)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 11,
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  flexShrink: 0,
                }}
              >
                {String(w.order).padStart(2, '0')}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontVariationSettings: 'var(--fraunces-italic-soft)',
                    fontSize: 15,
                    color: 'var(--ink)',
                    lineHeight: 1.25,
                  }}
                >
                  {w.name}
                </div>
                <div
                  style={{
                    marginTop: 3,
                    fontFamily: 'var(--font-body)',
                    fontSize: 12,
                    color: 'var(--content-tertiary)',
                  }}
                >
                  {w.totem} · {w.emotion}
                </div>
              </div>
              {isCurrent && (
                <span
                  className="neya-mark"
                  style={{ color: 'var(--content-tertiary)', flexShrink: 0, fontSize: 9 }}
                >
                  Actuel
                </span>
              )}
            </button>
          );
        })}
      </div>
    </SheetWrap>
  );
}

function ConnaissanceSheet({ lecons, leconsLues, onPick, onClose }) {
  const luesCount = (leconsLues || []).length;
  return (
    <SheetWrap
      title="La Connaissance"
      subtitle={`${luesCount} / ${lecons.length} lues · 4-5 min par leçon`}
      onClose={onClose}
      labelText="Bibliothèque"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {lecons.map((l, i) => {
          const lue = (leconsLues || []).includes(l.key);
          return (
            <button
              key={l.key}
              type="button"
              data-press
              onClick={() => { haptic(4); onPick?.(l); }}
              style={{
                appearance: 'none',
                width: '100%',
                padding: '16px 18px',
                minHeight: 76,
                background: lue ? 'rgba(26, 26, 47, 0.06)' : 'rgba(26, 26, 47, 0.03)',
                border: `0.5px solid ${lue ? l.accent : 'rgba(26, 26, 47, 0.08)'}`,
                borderRadius: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                textAlign: 'left',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: lue ? l.accent : 'rgba(26, 26, 47, 0.06)',
                  color: lue ? '#FBF6E8' : 'var(--ink-soft)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 12,
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  flexShrink: 0,
                  transition: 'all 280ms ease-out',
                }}
              >
                {lue ? '✓' : String(i + 1).padStart(2, '0')}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontVariationSettings: 'var(--fraunces-italic-soft)',
                    fontSize: 16,
                    color: 'var(--ink)',
                    lineHeight: 1.25,
                  }}
                >
                  {l.title}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontFamily: 'var(--font-body)',
                    fontSize: 12,
                    color: 'var(--content-tertiary)',
                  }}
                >
                  {l.subtitle} · {l.duration} min
                </div>
              </div>
              <span aria-hidden style={{ color: 'var(--content-tertiary)', fontSize: 14, flexShrink: 0 }}>
                ›
              </span>
            </button>
          );
        })}
      </div>
    </SheetWrap>
  );
}

function TempsSoiSheet({ temps, rituelsFaits, onPickRituel, onClose }) {
  const [activeTab, setActiveTab] = useState('passe');
  const tempsCurrent = temps.find((t) => t.key === activeTab) || temps[0];
  const rituels = getRituelsForTemps(activeTab);
  const doneCount = rituels.filter((r) => rituelsFaits && rituelsFaits[r.key]).length;

  return (
    <SheetWrap
      title="Les 3 Temps du Soi"
      subtitle="Réconcilier hier · habiter maintenant · construire demain."
      onClose={onClose}
      labelText="Trois temps"
    >
      {/* Onglets */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          padding: '0 2px 16px',
          flexShrink: 0,
        }}
      >
        {temps.map((t) => {
          const active = t.key === activeTab;
          return (
            <button
              key={t.key}
              type="button"
              data-press
              onClick={() => { haptic(2); setActiveTab(t.key); }}
              style={{
                appearance: 'none',
                flex: 1,
                padding: '10px 8px',
                minHeight: 44,
                background: active ? t.accent : 'transparent',
                color: active ? 'var(--cream)' : 'var(--content-secondary)',
                border: active ? 'none' : `0.5px solid rgba(26, 26, 47, 0.14)`,
                borderRadius: 999,
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                transition: 'all 280ms cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <span style={{ fontSize: 12 }}>{t.glyph}</span>
              <span style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {t.label.replace('Soi ', '').replace('Soi du ', '').replace('présent', 'Présent').replace('passé', 'Passé').replace('futur', 'Futur')}
              </span>
            </button>
          );
        })}
      </div>

      {/* En-tête du temps actif */}
      <div
        style={{
          padding: '16px 18px',
          background: 'rgba(26, 26, 47, 0.04)',
          borderLeft: `3px solid ${tempsCurrent.accent}`,
          borderRadius: 14,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              fontSize: 18,
              color: 'var(--ink)',
            }}
          >
            {tempsCurrent.label}
          </div>
          <div
            className="neya-mark"
            style={{ color: tempsCurrent.accent, fontVariantNumeric: 'tabular-nums' }}
          >
            {doneCount}/{rituels.length}
          </div>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            lineHeight: 1.5,
            color: 'var(--content-secondary)',
          }}
        >
          {tempsCurrent.intro}
        </div>
      </div>

      {/* Rituels du temps actif */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rituels.map((r) => {
          const done = !!(rituelsFaits && rituelsFaits[r.key]);
          return (
            <button
              key={r.key}
              type="button"
              data-press
              onClick={() => { haptic(4); onPickRituel?.(r); }}
              style={{
                appearance: 'none',
                width: '100%',
                padding: '14px 16px',
                minHeight: 70,
                background: done ? 'rgba(26, 26, 47, 0.06)' : 'transparent',
                border: `0.5px solid ${done ? tempsCurrent.accent : 'rgba(26, 26, 47, 0.10)'}`,
                borderRadius: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                textAlign: 'left',
                WebkitTapHighlightColor: 'transparent',
                transition: 'all 280ms ease-out',
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: done ? tempsCurrent.accent : 'rgba(26, 26, 47, 0.06)',
                  color: done ? '#FBF6E8' : 'var(--ink-soft)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 600,
                  flexShrink: 0,
                  transition: 'all 280ms ease-out',
                }}
              >
                {done ? '✓' : '·'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontVariationSettings: 'var(--fraunces-italic-soft)',
                    fontSize: 15.5,
                    color: 'var(--ink)',
                    lineHeight: 1.25,
                  }}
                >
                  {r.title}
                </div>
                <div
                  style={{
                    marginTop: 3,
                    fontFamily: 'var(--font-body)',
                    fontSize: 12,
                    color: 'var(--content-tertiary)',
                  }}
                >
                  {r.subtitle} · {r.duration} min
                </div>
              </div>
              <span aria-hidden style={{ color: 'var(--content-tertiary)', fontSize: 14, flexShrink: 0 }}>
                ›
              </span>
            </button>
          );
        })}
      </div>
    </SheetWrap>
  );
}

/* ─── PersonalizeSheet 4 tabs ─── */

function AventurePersonalizeSheet({ profile, onUpdate, onUpdateAventure, onClose }) {
  const [tab, setTab] = useState('image');
  const [tempPseudo, setTempPseudo] = useState(profile.pseudo || '');
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const aliveRef = useRef(true);
  const timersRef = useRef([]);

  const av = profile.aventure || {};
  const currentImage = resolveImage(profile);
  const currentAmbiance = av.ambiance || 'fireflies';
  const currentMusic = av.music || null;
  const currentTotem = profile.totem || 'lion';

  const safeTimeout = (fn, ms) => {
    const id = setTimeout(() => { if (aliveRef.current) fn(); }, ms);
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
    if (pseudoTrim !== (profile.pseudo || '')) patch.pseudo = pseudoTrim || null;
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
    labelText: 'Personnaliser mon aventure',
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
        <div aria-hidden style={{ width: 36, height: 5, borderRadius: 999, background: 'rgba(26, 26, 47, 0.18)', margin: '0 auto 18px', flexShrink: 0 }} />
        <div style={{ padding: '0 22px', textAlign: 'center', marginBottom: 18, flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontVariationSettings: 'var(--fraunces-italic-soft)', fontSize: 22, color: 'var(--ink)' }}>
            Mon aventure
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, padding: '0 22px 16px', overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0 }}>
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

        <div style={{ padding: '4px 22px 8px', overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}>
          {tab === 'image' && (
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--content-secondary)', marginBottom: 14 }}>
                Le décor de ton aventure.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {COCON_IMAGES.map((img) => {
                  const active = currentImage.key === img.key;
                  return (
                    <button
                      key={img.key}
                      type="button"
                      data-press
                      onClick={() => { haptic(4); onUpdateAventure({ image: img.key }); }}
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
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--content-secondary)', marginBottom: 14 }}>
                La petite vie qui danse dans le décor.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {AMBIANCES.map((a) => {
                  const active = a.key === currentAmbiance;
                  return (
                    <button
                      key={a.key}
                      type="button"
                      data-press
                      onClick={() => { haptic(2); onUpdateAventure({ ambiance: a.key }); }}
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
                        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{a.label}</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--content-tertiary)', marginTop: 2 }}>{a.hint}</div>
                      </div>
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          border: active ? '5px solid var(--ink)' : '1px solid rgba(26, 26, 47, 0.20)',
                          flexShrink: 0,
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
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--content-secondary)', marginBottom: 14 }}>
                La musique qui t'accompagne dans ton voyage.
              </div>
              <button
                type="button"
                data-press
                onClick={() => { haptic(2); onUpdateAventure({ music: null }); }}
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
              >
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)' }}>Silence</span>
                <span style={{ width: 14, height: 14, borderRadius: '50%', border: !currentMusic ? '4px solid var(--ink)' : '1px solid rgba(26, 26, 47, 0.20)', flexShrink: 0 }} />
              </button>

              <div style={{ padding: '12px 16px', background: 'rgba(26, 26, 47, 0.04)', borderRadius: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13 }} aria-hidden>🔉</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={Math.round((av.musicVolume || 0.4) * 100)}
                  onChange={(e) => onUpdateAventure({ musicVolume: Number(e.target.value) / 100 })}
                  aria-label="Volume"
                  style={{ flex: 1, accentColor: 'var(--ink)' }}
                />
                <span style={{ minWidth: 30, textAlign: 'right', fontFamily: 'var(--font-ui)', fontSize: 11, fontVariantNumeric: 'tabular-nums', color: 'var(--content-tertiary)' }}>
                  {Math.round((av.musicVolume || 0.4) * 100)}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {TRACKS.map((t) => {
                  const active = t.key === currentMusic;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      data-press
                      onClick={() => { haptic(2); onUpdateAventure({ music: t.key }); }}
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
                    >
                      <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontVariationSettings: 'var(--fraunces-italic-soft)', fontSize: 14, color: 'var(--ink)' }}>
                        {t.title}
                      </span>
                      {active && (
                        <span aria-hidden style={{ fontFamily: 'var(--font-ui)', fontSize: 9, letterSpacing: '0.222em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--content-tertiary)' }}>en cours</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'identite' && (
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--content-secondary)', marginBottom: 18 }}>
                Qui tu es dans cette aventure.
              </div>

              <div style={{ marginBottom: 18 }}>
                <label className="neya-mark" style={{ color: 'var(--content-tertiary)', display: 'block', marginBottom: 8 }}>
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

              <div style={{ marginBottom: 18 }}>
                <label className="neya-mark" style={{ color: 'var(--content-tertiary)', display: 'block', marginBottom: 8 }}>
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
