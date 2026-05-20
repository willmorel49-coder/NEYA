/* ============================================================
   ÇA VA ? V3 — Aventure (palette bleu/rose · glassmorphism)
   ============================================================
   Hub d'accueil avec 3 piliers visuels :

     01 · L'AVENTURE      (bleu)   — 6 mondes émotionnels
     02 · LA CONNAISSANCE (rose)   — bibliothèque
     03 · LES 3 TEMPS DU SOI (violet) — passé / présent / futur

   + Séance du jour (CTA bleu)
   + Bilan du soir contextuel (glass card sans numéro)
   ============================================================ */

import { useState, useEffect, useMemo, useRef } from 'react';
import { WORLDS } from '../worlds';
import { getProfile, patchProfile, haptic } from '../state';
import { LECONS as LECONS_CONTENT } from '../data/lecons';
import { TEMPS_GROUPS as TEMPS_GROUPS_DATA, RITUELS as RITUELS_DATA, getRituelsForTemps } from '../data/rituels-temps';
import { MONDES as MONDES_DATA } from '../data/mondes';
import { AVENTURE_FORET } from '../data/aventure-foret';
import { AVENTURE_TEMPLE } from '../data/aventure-temple';
import { AVENTURE_OASIS } from '../data/aventure-oasis';

const AVENTURES_BY_MONDE = {
  foret: AVENTURE_FORET,
  temple: AVENTURE_TEMPLE,
  oasis: AVENTURE_OASIS,
};
import CoconAmbiance from './CoconAmbiance';
import Blobs from '../../components/Blobs';
import LeconReader from './LeconReader';
import RituelPlayer from './RituelPlayer';
import MondeReader from './MondeReader';
import AventurePlayer from './AventurePlayer';
import AventureOnboarding from './AventureOnboarding';
import useStandardOverlay from '../hooks/useStandardOverlay';
import {
  GlassCard,
  Eyebrow,
  HeroTitle,
  SectionTitle,
  Body,
  CTA,
  Icon,
  tokens,
} from '../../components/ui';

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

/* 6 mondes pour le pilier Aventure (sheet) */
const WORLDS_LIST = [
  { key: 'foret',      name: 'Forêt de Clarté',    totem: 'Lion',    emotion: 'Sortir du brouillard',         order: 1 },
  { key: 'temple',     name: 'Temple des Parts',   totem: 'Ours',    emotion: 'Accepter ses contradictions',  order: 2 },
  { key: 'oasis',      name: 'Oasis du Présent',   totem: 'Aigle',   emotion: 'Habiter l\'instant',           order: 3 },
  { key: 'lac',        name: 'Lac des Émotions',   totem: 'Daim',    emotion: 'Traverser ses ressentis',      order: 4 },
  { key: 'montagne',   name: 'Montagne de Vision', totem: 'Baleine', emotion: 'Clarifier sa direction',       order: 5 },
  { key: 'communaute', name: 'Refuge partagé',     totem: 'Renard',  emotion: 'Apprendre à recevoir',         order: 6 },
];

/* 8 leçons (pilier Connaissance) */
const LECONS = LECONS_CONTENT;
/* Les 3 temps du soi */
const TEMPS_SOI = TEMPS_GROUPS_DATA;

/* ─── Palette piliers V3 ─── */
const PILIERS = {
  aventure:     { accent: '#1A5A7F', gradient: 'linear-gradient(135deg, #1A5A7F, #4A8AAF)' },
  connaissance: { accent: '#C87090', gradient: 'linear-gradient(135deg, #C87090, #E090B0)' },
  temps:        { accent: '#7F5A8A', gradient: 'linear-gradient(135deg, #7F5A8A, #AF80BA)' },
};

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
  const [openedMonde, setOpenedMonde] = useState(null);
  const [openedAventure, setOpenedAventure] = useState(null);
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
  const currentImage = useMemo(() => resolveImage(profile), [profile]);
  const currentTrack = useMemo(() => TRACKS.find((t) => t.key === av.music) || null, [av.music]);
  const hourPhrase = useMemo(() => getHourPhrase(), []);

  // Mount animation pour illustration card + hero
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

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

  // Quête du jour : alterne entre rituels / leçons / méditation / espace.
  const questOfDay = useMemo(() => {
    const day = new Date().getDate();
    const leconsLues = av.leconsLues || [];
    const rituelsFaits = av.rituelsFaits || {};

    const pool = [];

    const rituelsPasse  = RITUELS_DATA.filter((r) => r.temps === 'passe'   && !rituelsFaits[r.key]);
    const rituelsPresent = RITUELS_DATA.filter((r) => r.temps === 'present' && !rituelsFaits[r.key]);
    const rituelsFutur  = RITUELS_DATA.filter((r) => r.temps === 'futur'   && !rituelsFaits[r.key]);

    const addRituel = (r) => pool.push({
      type: 'rituel',
      eyebrow: 'Rituel · ' + (r.temps === 'passe' ? 'Soi du passé' : r.temps === 'present' ? 'Soi présent' : 'Soi du futur'),
      title: r.title,
      desc: r.subtitle + ' · ' + r.duration + ' min',
      cta: 'Commencer',
      onAction: () => setOpenedRituel(r),
    });

    if (rituelsPasse[0])   addRituel(rituelsPasse[0]);
    if (rituelsPresent[0]) addRituel(rituelsPresent[0]);
    if (rituelsFutur[0])   addRituel(rituelsFutur[0]);

    const leconsRestantes = LECONS_CONTENT.filter((l) => !leconsLues.includes(l.key));
    if (leconsRestantes[0]) {
      pool.push({
        type: 'lecon',
        eyebrow: 'Leçon',
        title: leconsRestantes[0].title,
        desc: leconsRestantes[0].subtitle + ' · ' + leconsRestantes[0].duration + ' min',
        cta: 'Lire',
        onAction: () => setOpenedLecon(leconsRestantes[0]),
      });
    }

    pool.push({
      type: 'meditation',
      eyebrow: 'Pratique',
      title: 'Méditation guidée',
      desc: 'Une pause de 5 minutes',
      cta: 'Commencer',
      onAction: onOpenMeditation,
    });

    pool.push({
      type: 'espace-vrai',
      eyebrow: 'Pratique',
      title: 'Espace de présence',
      desc: 'Te poser et te ressentir',
      cta: 'Entrer',
      onAction: onOpenEspaceVrai,
    });

    pool.push({
      type: 'habitudes',
      eyebrow: 'Quotidien',
      title: 'Mes habitudes du jour',
      desc: 'Les rituels qui te portent',
      cta: 'Y aller',
      onAction: onOpenHabitudes,
    });

    return pool[day % pool.length];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    onOpenMeditation,
    onOpenHabitudes,
    onOpenEspaceVrai,
    av.leconsLues,
    av.rituelsFaits,
  ]);

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
        background: 'var(--bg)',
      }}
      data-world={currentTotem.world}
    >
      <style>{`
        @media (hover: hover) {
          .pilier-card:hover,
          .bilan-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 36px rgba(10, 36, 56, 0.12);
          }
          .seance-card:hover {
            transform: scale(1.005);
            box-shadow: 0 8px 32px rgba(10, 36, 56, 0.10);
          }
          .seance-cta:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 28px rgba(26, 90, 127, 0.40);
          }
        }
        .pilier-card:active,
        .bilan-card:active {
          transform: scale(0.985);
          transition: transform 120ms ease-out;
        }
        .seance-cta:active {
          transform: scale(0.97);
          transition: transform 120ms ease-out;
        }
      `}</style>

      <Blobs variant="rose-blue" />

      {/* Blob violet additionnel pour profondeur (milieu droit) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '38%',
          right: -100,
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(127,90,138,0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* TOPBAR — sticky glass premium */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'calc(env(safe-area-inset-top, 0px) + 16px) 22px 12px',
          background: 'rgba(238, 243, 248, 0.72)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '0.5px solid rgba(194, 216, 232, 0.30)',
        }}
      >
        <span style={{ width: 44, height: 44, flexShrink: 0 }} aria-hidden />
        <div
          style={{
            fontFamily: 'Cormorant Garamond, var(--font-display), serif',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 22,
            color: 'var(--blue-900)',
            letterSpacing: '0.01em',
            lineHeight: 1,
          }}
        >
          ÇA VA ?
        </div>
        <button
          type="button"
          onClick={() => { haptic(2); setPersonalizeOpen(true); }}
          data-press
          aria-label="Personnaliser mon aventure"
          style={{
            appearance: 'none',
            width: 44,
            height: 44,
            background: 'rgba(255, 255, 255, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.85)',
            borderRadius: '50%',
            color: 'var(--blue-900)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            WebkitTapHighlightColor: 'transparent',
            fontSize: 18,
            padding: 0,
            boxShadow: '0 4px 24px rgba(10, 36, 56, 0.07)',
            flexShrink: 0,
          }}
        >
          ⋯
        </button>
      </div>

      {/* ILLUSTRATION CARD 343×220 — premium polish */}
      <div
        style={{
          position: 'relative',
          margin: '14px 16px 0',
          borderRadius: 28,
          overflow: 'hidden',
          height: 220,
          flexShrink: 0,
          boxShadow: '0 8px 32px rgba(10, 36, 56, 0.10)',
          zIndex: 1,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 480ms cubic-bezier(0.22, 0.61, 0.36, 1), transform 480ms cubic-bezier(0.22, 0.61, 0.36, 1)',
        }}
      >
        <img
          src={currentImage.src}
          alt=""
          width={343}
          height={220}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {/* Overlay subtle pour contraste */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(10, 36, 56, 0.10) 0%, transparent 35%, rgba(10, 36, 56, 0.55) 100%)',
          }}
        />
        <CoconAmbiance type={av.ambiance || 'fireflies'} accent="#C2D8E8" />
      </div>

      {/* BODY */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '24px 16px calc(env(safe-area-inset-bottom, 0px) + 130px)',
        }}
      >
        {/* HERO TEXT — premium */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 14,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 480ms cubic-bezier(0.22, 0.61, 0.36, 1) 80ms, transform 480ms cubic-bezier(0.22, 0.61, 0.36, 1) 80ms',
          }}
        >
          <Eyebrow color="rose">Mon aventure</Eyebrow>
          <span aria-hidden style={{ color: 'var(--rose-500)', fontSize: 9, opacity: 0.6, lineHeight: 1 }}>✻</span>
          <Eyebrow color="muted" style={{ fontWeight: 500 }}>Aujourd’hui</Eyebrow>
        </div>
        <div
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 520ms cubic-bezier(0.22, 0.61, 0.36, 1) 140ms, transform 520ms cubic-bezier(0.22, 0.61, 0.36, 1) 140ms',
          }}
        >
          <HeroTitle size="lg">{getGreeting(profile.pseudo)}</HeroTitle>
        </div>
        <div
          style={{
            marginTop: 14,
            maxWidth: '28ch',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 520ms cubic-bezier(0.22, 0.61, 0.36, 1) 220ms, transform 520ms cubic-bezier(0.22, 0.61, 0.36, 1) 220ms',
          }}
        >
          <Body>{hourPhrase}</Body>
        </div>

        {/* GLASS CARD — SÉANCE DU JOUR premium */}
        <div
          style={{
            marginTop: 28,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 520ms cubic-bezier(0.22, 0.61, 0.36, 1) 300ms, transform 520ms cubic-bezier(0.22, 0.61, 0.36, 1) 300ms',
          }}
        >
          <GlassCard radius="xl" elevation="soft" padding="20px 24px" hoverable>
            <Eyebrow color="rose" style={{ marginBottom: 10 }}>
              Séance du jour · {questOfDay.eyebrow || ''}
            </Eyebrow>
            <SectionTitle style={{ fontSize: 24, marginBottom: 10 }}>
              {questOfDay.title}
            </SectionTitle>
            <Body style={{ fontSize: 14, marginBottom: 20 }}>
              {questOfDay.desc}
            </Body>
            <CTA
              variant="primary"
              size="md"
              full
              onClick={() => { haptic(6); questOfDay.onAction?.(); }}
            >
              {questOfDay.cta}
            </CTA>
          </GlassCard>
        </div>

        {/* SECTION HEADER — Tes piliers */}
        <div style={{ marginTop: 48, marginBottom: 24 }}>
          <Eyebrow color="rose" style={{ marginBottom: 6 }}>Tes piliers</Eyebrow>
          <SectionTitle style={{ fontSize: 28 }}>Trois portes pour avancer</SectionTitle>
        </div>

        {/* 3 PILIERS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <PilierCard
            mark="01"
            label="L'Aventure"
            desc="Traverse six mondes émotionnels"
            pilier={PILIERS.aventure}
            onClick={() => { haptic(4); setPilierSheet('aventure'); }}
          />
          <PilierCard
            mark="02"
            label="La Connaissance"
            desc="Comprendre ce qui se passe en toi"
            pilier={PILIERS.connaissance}
            onClick={() => { haptic(4); setPilierSheet('connaissance'); }}
          />
          <PilierCard
            mark="03"
            label="Les 3 Temps du Soi"
            desc="Passé · Présent · Futur"
            pilier={PILIERS.temps}
            onClick={() => { haptic(4); setPilierSheet('temps'); }}
          />
        </div>

        {/* BILAN — glass card sans numéro (BUG-06) */}
        {(isEvening || isSundayEvening) && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isEvening && !isSundayEvening && (
              <BilanCard
                glyph="☾"
                label="Bilan du soir"
                onClick={() => { haptic(4); onOpenBilan?.(); }}
              />
            )}
            {isSundayEvening && (
              <BilanCard
                glyph="☾"
                label="Bilan de la semaine"
                onClick={() => { haptic(4); onOpenBilanSemaine?.(); }}
              />
            )}
          </div>
        )}

        {/* Mini player musique */}
        {currentTrack && (
          <div style={{ marginTop: 24 }}>
            <GlassCard radius={999} elevation="soft" padding="8px" style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 56 }}>
              <button
                type="button"
                onClick={togglePlay}
                data-press
                aria-label={musicPlaying ? 'Pause' : 'Lancer'}
                style={{
                  appearance: 'none',
                  width: 44,
                  height: 44,
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
                  fontSize: 13,
                  boxShadow: tokens.shadow.blue,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {musicPlaying ? '❚❚' : '▶'}
              </button>
              <span
                style={{
                  flex: 1,
                  paddingRight: 14,
                  fontFamily: tokens.fonts.display,
                  fontStyle: 'italic',
                  fontWeight: 300,
                  fontSize: 14,
                  color: tokens.textPrimary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {currentTrack.title}
              </span>
            </GlassCard>
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
          mondes={MONDES_DATA}
          mondesProgress={av.mondesProgress || {}}
          currentTotem={currentTotem.world}
          onPickMonde={(monde) => {
            setPilierSheet(null);
            const aventure = AVENTURES_BY_MONDE[monde.key];
            if (aventure) {
              setOpenedAventure(aventure);
            } else {
              setOpenedMonde(monde);
            }
          }}
          onClose={() => setPilierSheet(null)}
        />
      )}
      {openedMonde && (
        <MondeReader
          monde={openedMonde}
          onClose={() => { setOpenedMonde(null); setLocalProfile(getProfile()); setPilierSheet('aventure'); }}
        />
      )}
      {openedAventure && (
        <AventurePlayer
          aventure={openedAventure}
          onClose={() => { setOpenedAventure(null); setLocalProfile(getProfile()); setPilierSheet('aventure'); }}
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
    </div>
  );
}

/* ─── PilierCard glass + barre accent gauche ─── */

function PilierCard({ mark, label, desc, pilier, onClick }) {
  return (
    <button
      type="button"
      data-press
      onClick={onClick}
      className="pilier-card"
      style={{
        appearance: 'none',
        width: '100%',
        padding: '18px 20px 18px 24px',
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.85)',
        borderRadius: 24,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
        boxShadow: '0 4px 24px rgba(10, 36, 56, 0.07)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        transition: 'transform 240ms cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 240ms cubic-bezier(0.22, 0.61, 0.36, 1)',
      }}
    >
      {/* Barre accent gauche 4px */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: pilier.gradient,
          borderRadius: '0 2px 2px 0',
        }}
      />

      {/* Numéro pilier 48×48 */}
      <span
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: pilier.gradient,
          color: '#FFFFFF',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"Inter", sans-serif',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.04em',
          fontVariantNumeric: 'tabular-nums',
          flexShrink: 0,
          boxShadow: `0 4px 14px ${pilier.accent}40`,
        }}
      >
        {mark}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <SectionTitle style={{ fontSize: 22, letterSpacing: 0 }}>{label}</SectionTitle>
        <div style={{ marginTop: 5 }}>
          <Body variant="body-sm">{desc}</Body>
        </div>
      </div>

      <span
        aria-hidden
        style={{
          color: 'var(--blue-300)',
          flexShrink: 0,
          display: 'inline-flex',
        }}
      >
        <Icon name="chevron-right" size={20} />
      </span>
    </button>
  );
}

/* ─── BilanCard — glass sans numéro (BUG-06) ─── */

function BilanCard({ glyph, label, onClick }) {
  return (
    <button
      type="button"
      data-press
      onClick={onClick}
      className="bilan-card"
      style={{
        appearance: 'none',
        width: '100%',
        padding: '18px 20px',
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.85)',
        borderRadius: 24,
        cursor: 'pointer',
        textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
        boxShadow: '0 4px 24px rgba(10, 36, 56, 0.07)',
        opacity: 0.92,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        transition: 'transform 240ms cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 240ms cubic-bezier(0.22, 0.61, 0.36, 1)',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: 'rgba(127, 90, 138, 0.10)',
          color: 'var(--violet)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name="moon" size={24} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <SectionTitle style={{ fontSize: 22 }}>{label}</SectionTitle>
      </div>
      <span
        aria-hidden
        style={{
          color: 'var(--blue-300)',
          flexShrink: 0,
          display: 'inline-flex',
        }}
      >
        <Icon name="chevron-right" size={20} />
      </span>
    </button>
  );
}

/* ─── SheetWrap commun (palette V3) ─── */

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
          background: 'rgba(238, 243, 248, 0.96)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
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
        <div aria-hidden style={{ width: 36, height: 5, borderRadius: 999, background: 'rgba(10, 36, 56, 0.18)', margin: '0 auto 14px', flexShrink: 0 }} />
        <div style={{ padding: '0 22px', textAlign: 'center', marginBottom: 18, flexShrink: 0 }}>
          <SectionTitle style={{ fontSize: 'clamp(26px, 6.5vw, 30px)', lineHeight: 1.15 }}>
            {title}
          </SectionTitle>
          {subtitle && (
            <div style={{ marginTop: 10 }}>
              <Body style={{ fontSize: 14, lineHeight: 1.55 }}>{subtitle}</Body>
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
          <CTA variant="outline" size="md" full onClick={handleClose}>
            Fermer
          </CTA>
        </div>
      </div>
    </>
  );
}

/* ─── Pilier 01 · Mondes ─── */

function AventureWorldsSheet({ mondes, mondesProgress, currentTotem, onPickMonde, onClose }) {
  const totalCompletes = mondes.filter((m) => m.available && (mondesProgress[m.key] || 0) >= m.etapes.length).length;
  const totalDispo = mondes.filter((m) => m.available).length;
  const accent = PILIERS.aventure.accent;

  return (
    <SheetWrap
      title="L'Aventure"
      subtitle={`${totalCompletes} / ${totalDispo} mondes traversés · 6 mondes émotionnels`}
      onClose={onClose}
      labelText="Mondes"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {mondes.map((m) => {
          const isCurrent = m.key === currentTotem;
          const progress = mondesProgress[m.key] || 0;
          const completed = m.available && progress >= m.etapes.length;
          const totalEtapes = m.etapes.length;
          const progressPct = totalEtapes > 0 ? Math.min(100, (progress / totalEtapes) * 100) : 0;

          return (
            <button
              key={m.key}
              type="button"
              data-press={m.available ? true : undefined}
              onClick={() => { if (m.available) onPickMonde?.(m); else haptic(2); }}
              disabled={!m.available}
              style={{
                appearance: 'none',
                width: '100%',
                padding: '16px 18px',
                background: 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: `1px solid ${completed ? accent : 'rgba(255, 255, 255, 0.85)'}`,
                borderRadius: 18,
                cursor: m.available ? 'pointer' : 'not-allowed',
                textAlign: 'left',
                WebkitTapHighlightColor: 'transparent',
                opacity: m.available ? 1 : 0.58,
                boxShadow: '0 4px 24px rgba(10, 36, 56, 0.07)',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                minHeight: 88,
              }}
            >
              <span
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  border: `1.5px solid ${completed ? accent : m.available ? 'var(--blue-300)' : 'rgba(138, 170, 187, 0.40)'}`,
                  background: completed ? accent : 'transparent',
                  color: completed ? '#FFFFFF' : m.available ? 'var(--blue-700)' : 'var(--text-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  flexShrink: 0,
                  transition: 'all 280ms ease-out',
                }}
              >
                {completed ? '✓' : String(m.order).padStart(2, '0')}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                  <SectionTitle style={{ fontSize: 20 }}>{m.name}</SectionTitle>
                  {isCurrent && m.available && (
                    <Eyebrow color={accent} style={{ flexShrink: 0 }}>Ton totem</Eyebrow>
                  )}
                </div>
                <Body variant="body-sm">{m.totem} · {m.emotion}</Body>

                {m.available && progress > 0 && (
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        background: 'var(--blue-100)',
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${progressPct}%`,
                          height: '100%',
                          background: accent,
                          transition: 'width 600ms cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      />
                    </div>
                    <Eyebrow color="secondary" style={{ fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                      {progress}/{totalEtapes}
                    </Eyebrow>
                  </div>
                )}

                {m.available && progress === 0 && (
                  <div style={{ marginTop: 10 }}>
                    <Eyebrow color={accent}>Commencer le voyage</Eyebrow>
                  </div>
                )}
                {!m.available && (
                  <div style={{ marginTop: 10 }}>
                    <Eyebrow color="muted">Bientôt</Eyebrow>
                  </div>
                )}
              </div>

              {m.available && (
                <span aria-hidden style={{ color: 'var(--blue-500)', flexShrink: 0, display: 'inline-flex' }}><Icon name="chevron-right" size={18} /></span>
              )}
            </button>
          );
        })}
      </div>
    </SheetWrap>
  );
}

/* ─── Pilier 02 · Connaissance ─── */

function ConnaissanceSheet({ lecons, leconsLues, onPick, onClose }) {
  const luesCount = (leconsLues || []).length;
  const accent = PILIERS.connaissance.accent;
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
                background: 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: `1px solid ${lue ? accent : 'rgba(255, 255, 255, 0.85)'}`,
                borderRadius: 16,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                textAlign: 'left',
                WebkitTapHighlightColor: 'transparent',
                boxShadow: '0 4px 24px rgba(10, 36, 56, 0.07)',
              }}
            >
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: lue ? accent : 'var(--rose-100)',
                  color: lue ? '#FFFFFF' : 'var(--rose-700)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: '"Inter", sans-serif',
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
                <SectionTitle style={{ fontSize: 20 }}>{l.title}</SectionTitle>
                <div style={{ marginTop: 5 }}>
                  <Body variant="body-sm">{l.subtitle} · {l.duration} min</Body>
                </div>
              </div>
              <span aria-hidden style={{ color: 'var(--blue-500)', fontSize: 14, flexShrink: 0 }}>›</span>
            </button>
          );
        })}
      </div>
    </SheetWrap>
  );
}

/* ─── Pilier 03 · 3 Temps du Soi ─── */

function TempsSoiSheet({ temps, rituelsFaits, onPickRituel, onClose }) {
  const [activeTab, setActiveTab] = useState('passe');
  const tempsCurrent = temps.find((t) => t.key === activeTab) || temps[0];
  const rituels = getRituelsForTemps(activeTab);
  const doneCount = rituels.filter((r) => rituelsFaits && rituelsFaits[r.key]).length;
  const accent = PILIERS.temps.accent;

  return (
    <SheetWrap
      title="Les 3 Temps du Soi"
      subtitle="Réconcilier hier · habiter maintenant · construire demain."
      onClose={onClose}
      labelText="Trois temps"
    >
      {/* Onglets */}
      <div style={{ display: 'flex', gap: 6, padding: '0 2px 16px', flexShrink: 0 }}>
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
                background: active ? PILIERS.temps.gradient : 'transparent',
                color: active ? '#FFFFFF' : 'var(--text-secondary)',
                border: active ? 'none' : '1.5px solid var(--blue-300)',
                borderRadius: 50,
                fontFamily: '"Inter", sans-serif',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                transition: 'all 280ms cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: active ? '0 4px 12px rgba(127, 90, 138, 0.30)' : 'none',
              }}
            >
              <span style={{ fontSize: 12 }}>{t.glyph}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.label.replace('Soi ', '').replace('Soi du ', '').replace('présent', 'Présent').replace('passé', 'Passé').replace('futur', 'Futur')}
              </span>
            </button>
          );
        })}
      </div>

      {/* En-tête */}
      <div
        style={{
          padding: '16px 18px',
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.85)',
          borderLeft: `3px solid ${accent}`,
          borderRadius: 16,
          marginBottom: 18,
          boxShadow: '0 4px 24px rgba(10, 36, 56, 0.07)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <SectionTitle style={{ fontSize: 22 }}>{tempsCurrent.label}</SectionTitle>
          <Eyebrow color={accent} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {doneCount}/{rituels.length}
          </Eyebrow>
        </div>
        <Body>{tempsCurrent.intro}</Body>
      </div>

      {/* Rituels */}
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
                background: 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: `1px solid ${done ? accent : 'rgba(255, 255, 255, 0.85)'}`,
                borderRadius: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                textAlign: 'left',
                WebkitTapHighlightColor: 'transparent',
                transition: 'all 280ms ease-out',
                boxShadow: '0 4px 24px rgba(10, 36, 56, 0.07)',
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: done ? accent : 'rgba(127, 90, 138, 0.10)',
                  color: done ? '#FFFFFF' : accent,
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
                <SectionTitle style={{ fontSize: 19, lineHeight: 1.25 }}>{r.title}</SectionTitle>
                <div style={{ marginTop: 5 }}>
                  <Body variant="body-sm">{r.subtitle} · {r.duration} min</Body>
                </div>
              </div>
              <span aria-hidden style={{ color: 'var(--blue-500)', fontSize: 14, flexShrink: 0 }}>›</span>
            </button>
          );
        })}
      </div>
    </SheetWrap>
  );
}

/* ─── PersonalizeSheet 4 tabs (palette V3) ─── */

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

  const tabBg = 'linear-gradient(135deg, #1A5A7F, #2A8ABF)';

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
          background: 'rgba(238, 243, 248, 0.96)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
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
        <div aria-hidden style={{ width: 36, height: 5, borderRadius: 999, background: 'rgba(10, 36, 56, 0.18)', margin: '0 auto 18px', flexShrink: 0 }} />
        <div style={{ padding: '0 22px', textAlign: 'center', marginBottom: 18, flexShrink: 0 }}>
          <SectionTitle style={{ fontSize: 'clamp(26px, 6.5vw, 30px)', lineHeight: 1.15 }}>
            Mon aventure
          </SectionTitle>
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
                  background: active ? tabBg : 'transparent',
                  color: active ? '#FFFFFF' : 'var(--text-secondary)',
                  border: active ? 'none' : '1.5px solid var(--blue-300)',
                  borderRadius: 50,
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  WebkitTapHighlightColor: 'transparent',
                  flexShrink: 0,
                  boxShadow: active ? '0 4px 12px rgba(26, 90, 127, 0.25)' : 'none',
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
              <div style={{ marginBottom: 16 }}>
                <Body>Le décor de ton aventure.</Body>
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
                        border: active ? '2px solid var(--blue-700)' : '1px solid rgba(255, 255, 255, 0.85)',
                        borderRadius: 14,
                        cursor: 'pointer',
                        overflow: 'hidden',
                        position: 'relative',
                        aspectRatio: '4 / 5',
                        background: `var(--bg) url(${img.src}) center / cover no-repeat`,
                        WebkitTapHighlightColor: 'transparent',
                        boxShadow: active ? '0 4px 12px rgba(26, 90, 127, 0.30)' : '0 2px 8px rgba(10, 36, 56, 0.05)',
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
                          background: 'linear-gradient(0deg, rgba(10, 36, 56, 0.75) 0%, transparent 100%)',
                          color: '#FFFFFF',
                          fontFamily: 'Cormorant Garamond, var(--font-display), serif',
                          fontStyle: 'italic',
                          fontWeight: 300,
                          fontSize: 13,
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
                <Body>La petite vie qui danse dans le décor.</Body>
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
                        background: 'rgba(255, 255, 255, 0.65)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: active ? '1px solid var(--blue-700)' : '1px solid rgba(255, 255, 255, 0.85)',
                        borderRadius: 14,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 14,
                        textAlign: 'left',
                        WebkitTapHighlightColor: 'transparent',
                        boxShadow: '0 4px 24px rgba(10, 36, 56, 0.07)',
                      }}
                      aria-pressed={active}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 15, fontWeight: 600, lineHeight: 1.3, color: 'var(--blue-900)', letterSpacing: '-0.01em' }}>{a.label}</div>
                        <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 400, lineHeight: 1.5, color: 'var(--text-secondary)', marginTop: 4 }}>{a.hint}</div>
                      </div>
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          border: active ? '5px solid var(--blue-700)' : '1px solid var(--blue-300)',
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
              <div style={{ marginBottom: 16 }}>
                <Body>La musique qui t’accompagne dans ton voyage.</Body>
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
                  background: 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: !currentMusic ? '1px solid var(--blue-700)' : '1px solid rgba(255, 255, 255, 0.85)',
                  borderRadius: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 15, fontWeight: 500, color: 'var(--blue-900)' }}>Silence</span>
                <span style={{ width: 14, height: 14, borderRadius: '50%', border: !currentMusic ? '4px solid var(--blue-700)' : '1px solid var(--blue-300)', flexShrink: 0 }} />
              </button>

              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.85)',
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
                  value={Math.round((av.musicVolume || 0.4) * 100)}
                  onChange={(e) => onUpdateAventure({ musicVolume: Number(e.target.value) / 100 })}
                  aria-label="Volume"
                  style={{ flex: 1, accentColor: 'var(--blue-700)' }}
                />
                <span style={{ minWidth: 30, textAlign: 'right', fontFamily: '"Inter", sans-serif', fontSize: 12, fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)' }}>
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
                        background: 'rgba(255, 255, 255, 0.65)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: active ? '1px solid var(--blue-700)' : '1px solid rgba(255, 255, 255, 0.85)',
                        borderRadius: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'Cormorant Garamond, var(--font-display), serif',
                          fontStyle: 'italic',
                          fontWeight: 300,
                          fontSize: 17,
                          color: 'var(--blue-900)',
                          lineHeight: 1.3,
                        }}
                      >
                        {t.title}
                      </span>
                      {active && (
                        <span
                          aria-hidden
                          style={{
                            fontFamily: '"Inter", sans-serif',
                            fontSize: 10,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            color: 'var(--blue-700)',
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
              <div style={{ marginBottom: 18 }}>
                <Body variant="body-sm">Qui tu es dans cette aventure.</Body>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', marginBottom: 10 }}>
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
                    background: 'rgba(255, 255, 255, 0.65)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.85)',
                    borderRadius: 12,
                    fontFamily: '"Inter", sans-serif',
                    fontSize: 15,
                    fontWeight: 300,
                    color: 'var(--blue-900)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', marginBottom: 10 }}>
                  <Eyebrow color="secondary">Mon totem</Eyebrow>
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
                          background: 'rgba(255, 255, 255, 0.65)',
                          backdropFilter: 'blur(24px)',
                          WebkitBackdropFilter: 'blur(24px)',
                          border: active ? '1px solid var(--blue-700)' : '1px solid rgba(255, 255, 255, 0.85)',
                          borderRadius: 12,
                          cursor: 'pointer',
                          fontFamily: '"Inter", sans-serif',
                          fontSize: 14,
                          fontWeight: active ? 600 : 500,
                          lineHeight: 1.3,
                          color: 'var(--blue-900)',
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

              <CTA variant="primary" size="md" full onClick={handleSaveIdentite}>
                Garder
              </CTA>
            </div>
          )}
        </div>

        {tab !== 'identite' && (
          <div style={{ padding: '12px 22px 0', flexShrink: 0 }}>
            <CTA variant="outline" size="md" full onClick={handleClose}>
              Fermer
            </CTA>
          </div>
        )}
      </div>
    </>
  );
}
