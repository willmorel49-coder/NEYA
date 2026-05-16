/* ============================================================
   NÉYA V4 — Mon Sanctuaire (LIGHT MODE, sanctuaire vivant)
   ============================================================
   Hero painterly habité · items SVG sur-mesure qui s'allument
   DANS la scène · timeline des traces · sections personnalisées.
   ============================================================ */

import { useState, useEffect, useMemo, useRef } from 'react';
import { WORLDS } from '../worlds';
import { getProfile, setProfile, patchProfile, haptic, ls } from '../state';
import Button from '../../components/Button';
import ActionSheet from '../../components/ActionSheet';
import BlurFade from '../../components/BlurFade';
import useNumberTicker from '../hooks/useNumberTicker';
import Carnet from './Carnet';
import MoodTracker from './MoodTracker';
import Souvenirs from './Souvenirs';

/* ─── Données ─── */

const TERRACOTTA = '#c7674a';
const TILLEUL = '#d4e08c';

const TOTEMS = [
  { key: 'lion',    label: 'Lion blanc',    world: 'foret' },
  { key: 'ours',    label: 'Ours polaire',  world: 'temple' },
  { key: 'aigle',   label: 'Aigle céleste', world: 'oasis' },
  { key: 'daim',    label: 'Daim lunaire',  world: 'lac' },
  { key: 'baleine', label: 'Baleine sage',  world: 'montagne' },
  { key: 'renard',  label: 'Renard',        world: 'communaute' },
];

const SPIRIT_PHOTO = {
  lion:    '/img/spirit-lion.png',
  ours:    '/img/spirit-ours.png',
  aigle:   '/img/spirit-aigle.png',
  daim:    '/img/spirit-daim.png',
  baleine: '/img/spirit-baleine.png',
  renard:  '/img/spirit-renard.png',
};

const ITEMS = [
  { key: 'bougie',  label: 'Bougie',  whisper: 'Lumière douce' },
  { key: 'cristal', label: 'Cristal', whisper: 'Présence claire' },
  { key: 'plante',  label: 'Plante',  whisper: 'Souffle vivant' },
  { key: 'totem',   label: 'Totem',   whisper: 'Animal proche' },
  { key: 'portail', label: 'Portail', whisper: 'Ailleurs' },
];

const Q1_PILLS = [
  { value: 'pas-terrible',     label: 'Pas terrible' },
  { value: 'ca-va-je-gere',    label: 'Ça va, je gère' },
  { value: 'plutot-bien',      label: 'Plutôt bien' },
  { value: 'je-sais-pas-trop', label: 'Je sais pas trop' },
];
const Q2_PILLS = [
  { value: 'stress',   label: 'Le stress' },
  { value: 'sommeil',  label: 'Le sommeil' },
  { value: 'emotions', label: 'Les émotions' },
  { value: 'curieux',  label: 'Curieux·se' },
];
const Q3_PILLS = [
  { value: 5,      label: '5 min' },
  { value: 10,     label: '10 min' },
  { value: 15,     label: '15 min' },
  { value: 'plus', label: 'Plus si je peux' },
];
const Q4_PILLS = [
  { value: 'matin',        label: 'Le matin' },
  { value: 'midi',         label: 'À midi' },
  { value: 'soir',         label: 'Le soir' },
  { value: 'avant-dormir', label: 'Avant de dormir' },
];

const QUESTIONS = [
  { field: 'q1_etat',    label: 'Comment je vais',    pills: Q1_PILLS },
  { field: 'q2_motif',   label: "Ce qui m'amène",     pills: Q2_PILLS },
  { field: 'q3_minutes', label: 'Mon temps par jour', pills: Q3_PILLS },
  { field: 'q4_rythme',  label: 'Mon rythme',         pills: Q4_PILLS },
];

const MOODS_MAP = {
  lourd:  { glyph: '●', color: '#7B6FA8', label: 'Lourd' },
  agite:  { glyph: '◆', color: '#c7674a', label: 'Agité' },
  neutre: { glyph: '◇', color: '#a89e8d', label: 'Neutre' },
  calme:  { glyph: '○', color: '#7397bc', label: 'Calme' },
  leger:  { glyph: '✦', color: '#a4b56e', label: 'Léger' },
};

/* ─── Helpers ─── */

function getHourPhase() {
  const h = new Date().getHours();
  if (h >= 5 && h < 8)   return { key: 'aube',       overlay: 'rgba(245, 212, 156, 0.14)', whisper: 'L\'aube se pose.' };
  if (h >= 8 && h < 17)  return { key: 'jour',       overlay: 'rgba(255, 252, 245, 0.08)', whisper: 'Le jour est là.' };
  if (h >= 17 && h < 20) return { key: 'crepuscule', overlay: 'rgba(199, 103, 74, 0.16)',  whisper: 'Le crépuscule s\'allume.' };
  return { key: 'nuit', overlay: 'rgba(30, 30, 60, 0.22)', whisper: 'La nuit veille.' };
}

function getLast7Traces() {
  const moods = ls.get('mood_history', []) || [];
  const carnet = ls.get('carnet_entries', []) || [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = today.getTime() - i * 86400000;
    const dayEnd = dayStart + 86400000;
    const dayMood = moods.filter((m) => m.ts >= dayStart && m.ts < dayEnd).pop() || null;
    const dayCarnet = carnet.find((c) => {
      const ts = c.date ? new Date(c.date).getTime() : 0;
      return ts >= dayStart && ts < dayEnd;
    }) || null;
    const d = new Date(dayStart);
    result.push({
      ts: dayStart,
      isToday: i === 0,
      dateLabel: i === 0 ? 'Aujourd\'hui' : d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
      mood: dayMood?.mood || null,
      carnetSnippet: dayCarnet?.body ? truncate(dayCarnet.body, 32) : null,
    });
  }
  return result;
}

function truncate(s, max) {
  if (!s) return '';
  if (s.length <= max) return s;
  return s.slice(0, max).trimEnd() + '…';
}

function poeticChemin(p) {
  const jours = p.progress?.joursConnectes || 1;
  const minutes = p.progress?.minutesTotales || 0;
  const mondes = p.progress?.worldsExplored?.length || 1;
  if (jours >= 30) return `${jours} jours de présence. Ton sanctuaire connaît ton souffle.`;
  if (jours >= 14) return `${jours} jours, ${minutes} minutes posées. Le rythme s'installe.`;
  if (jours >= 7)  return `Tu es revenu·e ${jours} jours. C'est ce qui compte.`;
  if (jours >= 3)  return `Trois jours, puis quatre, puis ${jours}. Une habitude commence.`;
  return 'Ton sanctuaire est là. Tu peux y revenir quand tu veux.';
}

/* ─── SVG items sur-mesure ─── */

function ItemBougie({ size = 50, accent }) {
  return (
    <svg viewBox="0 0 60 90" width={size} height={size * 1.5} aria-hidden>
      <defs>
        <radialGradient id="flame-glow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#ffd28a" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#f0a560" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#f0a560" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="30" cy="32" rx="22" ry="22" fill="url(#flame-glow)" opacity="0.85" style={{ transformOrigin: '30px 32px', animation: 'cocon-flame-glow 2.4s ease-in-out infinite' }} />
      <path
        d="M 30 14 C 24 22, 24 32, 30 38 C 36 32, 36 22, 30 14 Z"
        fill="#fff2c4"
        opacity="0.95"
        style={{ transformOrigin: '30px 32px', animation: 'cocon-flame-flicker 1.4s ease-in-out infinite' }}
      />
      <path d="M 30 38 L 30 46" stroke="#1a1a2f" strokeWidth="0.8" opacity="0.6" />
      <rect x="22" y="46" width="16" height="34" rx="2" fill="#fffcf5" opacity="0.92" stroke="#1a1a2f" strokeWidth="0.5" strokeOpacity="0.18" />
      <ellipse cx="30" cy="46" rx="8" ry="2" fill={accent} opacity="0.25" />
    </svg>
  );
}

function ItemCristal({ size = 44, accent }) {
  return (
    <svg viewBox="0 0 60 80" width={size} height={size * 1.33} aria-hidden>
      <defs>
        <linearGradient id="crystal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fffcf5" stopOpacity="0.95" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <g style={{ transformOrigin: '30px 40px', animation: 'cocon-crystal-spin 9s linear infinite' }}>
        <path d="M 30 6 L 50 30 L 38 64 L 22 64 L 10 30 Z" fill="url(#crystal-grad)" stroke="#1a1a2f" strokeWidth="0.5" strokeOpacity="0.3" />
        <path d="M 30 6 L 38 64 L 30 30 Z" fill="#fffcf5" opacity="0.5" />
        <path d="M 10 30 L 50 30" stroke="#1a1a2f" strokeWidth="0.5" strokeOpacity="0.2" />
      </g>
      <circle cx="44" cy="14" r="1.5" fill="#fff" opacity="0.9" style={{ animation: 'cocon-sparkle 3.2s ease-in-out infinite' }} />
      <circle cx="14" cy="58" r="1" fill="#fff" opacity="0.7" style={{ animation: 'cocon-sparkle 4.2s ease-in-out 0.8s infinite' }} />
    </svg>
  );
}

function ItemPlante({ size = 56, accent }) {
  return (
    <svg viewBox="0 0 80 90" width={size} height={size * 1.13} aria-hidden>
      <path d="M 40 80 L 40 50" stroke="#5a7546" strokeWidth="1.4" opacity="0.85" />
      <g style={{ transformOrigin: '40px 60px', animation: 'cocon-plant-breathe 4.6s ease-in-out infinite' }}>
        <path d="M 40 60 C 30 56, 22 48, 20 36 C 28 38, 36 46, 40 60 Z" fill={accent} opacity="0.78" />
        <path d="M 40 60 C 30 56, 22 48, 20 36 C 28 38, 36 46, 40 60 Z" fill="none" stroke="#1a1a2f" strokeWidth="0.4" strokeOpacity="0.3" />
      </g>
      <g style={{ transformOrigin: '40px 60px', animation: 'cocon-plant-breathe 4.6s ease-in-out 0.6s infinite' }}>
        <path d="M 40 54 C 50 50, 58 42, 60 30 C 52 32, 44 40, 40 54 Z" fill={accent} opacity="0.85" />
        <path d="M 40 54 C 50 50, 58 42, 60 30 C 52 32, 44 40, 40 54 Z" fill="none" stroke="#1a1a2f" strokeWidth="0.4" strokeOpacity="0.3" />
      </g>
      <ellipse cx="40" cy="82" rx="14" ry="3" fill="#3a2a1c" opacity="0.55" />
    </svg>
  );
}

function ItemTotemHalo({ size = 200, accent }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <defs>
        <radialGradient id="totem-halo-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.45" />
          <stop offset="40%" stopColor={accent} stopOpacity="0.18" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill="url(#totem-halo-grad)" style={{ transformOrigin: '100px 100px', animation: 'cocon-halo-pulse 5.4s ease-in-out infinite' }} />
    </svg>
  );
}

function ItemPortail({ size = 170, accent }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <circle cx="100" cy="100" r="80" fill="none" stroke={accent} strokeWidth="0.8" strokeOpacity="0.45" style={{ transformOrigin: '100px 100px', animation: 'cocon-portal-ring 6.8s ease-in-out infinite' }} />
      <circle cx="100" cy="100" r="60" fill="none" stroke={accent} strokeWidth="0.6" strokeOpacity="0.55" style={{ transformOrigin: '100px 100px', animation: 'cocon-portal-ring 6.8s ease-in-out 1.4s infinite' }} />
      <circle cx="100" cy="100" r="40" fill="none" stroke={accent} strokeWidth="0.5" strokeOpacity="0.7" style={{ transformOrigin: '100px 100px', animation: 'cocon-portal-ring 6.8s ease-in-out 2.8s infinite' }} />
    </svg>
  );
}

const ITEM_GLYPH = {
  bougie:  '✺',
  cristal: '◇',
  plante:  '❦',
  totem:   '◈',
  portail: '○',
};

/* ─── Main ─── */

export default function Cocon() {
  const [profile, setLocalProfile] = useState(() => getProfile());
  const [editingPseudo, setEditingPseudo] = useState(false);
  const [tempPseudo, setTempPseudo] = useState(profile.pseudo || '');
  const [editingMantra, setEditingMantra] = useState(false);
  const [tempMantra, setTempMantra] = useState(profile.mantra || '');
  const [editingAnswer, setEditingAnswer] = useState(null);
  const [actionSheet, setActionSheet] = useState(null);
  const [carnetOpen, setCarnetOpen] = useState(false);
  const [moodOpen, setMoodOpen] = useState(false);
  const [souvenirsOpen, setSouvenirsOpen] = useState(false);
  const [reglagesOpen, setReglagesOpen] = useState(false);
  const [, forceTick] = useState(0); // tick every minute for hour phase

  const placed = profile.coconPlaced || {};
  const totemKey = profile.totem || 'lion';
  const currentTotem = TOTEMS.find((t) => t.key === totemKey) || TOTEMS[0];
  const totemWorld = WORLDS[currentTotem.world] || WORLDS.foret;
  const accent = totemWorld.accent;
  const placedCount = Object.values(placed).filter(Boolean).length;
  const allPlaced = placedCount >= ITEMS.length;
  const hourPhase = useMemo(() => getHourPhase(), []);

  // Re-evaluate hourPhase every minute
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => (n + 1) % 1000), 60_000);
    return () => clearInterval(id);
  }, []);

  // Sync temp inputs on external profile change
  useEffect(() => { if (!editingPseudo) setTempPseudo(profile.pseudo || ''); }, [profile.pseudo, editingPseudo]);
  useEffect(() => { if (!editingMantra) setTempMantra(profile.mantra || ''); }, [profile.mantra, editingMantra]);

  // Listen for profile changes from other screens
  useEffect(() => {
    const refresh = () => setLocalProfile(getProfile());
    window.addEventListener('neya:profile-changed', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('neya:profile-changed', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const traces = useMemo(() => getLast7Traces(), [carnetOpen, moodOpen, profile]);

  const save = (patch) => {
    const next = { ...profile, ...patch };
    setLocalProfile(next);
    setProfile(next);
  };
  const savePseudo = () => { save({ pseudo: tempPseudo.trim() || null }); setEditingPseudo(false); haptic(4); };
  const saveMantra = () => { save({ mantra: tempMantra.trim() || null }); setEditingMantra(false); haptic(4); };
  const pickTotem = (key) => { save({ totem: key }); haptic(6); };
  const togglePlaced = (key) => save({ coconPlaced: { ...placed, [key]: !placed[key] } });
  const pickAnswer = (field, value) => {
    const nextOb = { ...(profile.onboarding || {}), [field]: value };
    const next = patchProfile({ onboarding: nextOb });
    setLocalProfile(next);
    setEditingAnswer(null);
    haptic(4);
  };
  const doReset = () => { haptic(8); ls.clear(); window.location.reload(); };

  return (
    <div style={{ position: 'absolute', inset: 0, color: 'var(--ink)', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 110px)' }}>
        {/* ═══ HERO SANCTUAIRE ═══ */}
        <SanctuaryHero
          pseudo={profile.pseudo}
          mantra={profile.mantra}
          spirit={SPIRIT_PHOTO[totemKey]}
          totemLabel={currentTotem.label}
          worldBg={totemWorld.bg}
          accent={accent}
          placed={placed}
          hourPhase={hourPhase}
          onEditMantra={() => { setTempMantra(profile.mantra || ''); setEditingMantra(true); }}
        />

        <div style={{ padding: '0 22px' }}>

          {/* ═══ PRÉSENCE DU JOUR ═══ */}
          <SectionTitle accent={accent}>Présence du jour</SectionTitle>
          <PresenceCard
            profile={profile}
            accent={accent}
            hourPhase={hourPhase}
            onMood={() => { haptic(4); setMoodOpen(true); }}
            onCarnet={() => { haptic(4); setCarnetOpen(true); }}
            editingMantra={editingMantra}
            tempMantra={tempMantra}
            setTempMantra={setTempMantra}
            saveMantra={saveMantra}
            cancelMantra={() => { setTempMantra(profile.mantra || ''); setEditingMantra(false); }}
            onEditMantra={() => { setTempMantra(profile.mantra || ''); setEditingMantra(true); }}
          />

          {/* ═══ ITEMS DU SANCTUAIRE ═══ */}
          <SectionTitle
            accent={accent}
            style={{ marginTop: 36 }}
            trailing={
              <span className="neya-mark" style={{ color: allPlaced ? TILLEUL : 'var(--content-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
                {placedCount}/5
              </span>
            }
          >
            Compose ton sanctuaire
          </SectionTitle>
          <div className="neya-body-sm" style={{ color: 'var(--content-tertiary)', marginBottom: 14 }}>
            Touche pour allumer ou éteindre. Ce que tu poses apparaît dans la scène au-dessus.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
            {ITEMS.map((item, i) => {
              const isPlaced = !!placed[item.key];
              return (
                <button
                  key={item.key}
                  data-press
                  onClick={() => togglePlaced(item.key)}
                  aria-pressed={isPlaced}
                  aria-label={`${item.label} · ${isPlaced ? 'allumé' : 'à allumer'}`}
                  style={{
                    gridColumn: i === 4 ? '1 / -1' : 'auto',
                    appearance: 'none',
                    padding: '18px 14px',
                    minHeight: 110,
                    background: isPlaced ? `${totemWorld.accentRgb}, 0.16)` : 'rgba(255, 252, 245, 0.7)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: `0.5px solid ${isPlaced ? accent : 'rgba(26, 26, 47, 0.10)'}`,
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--ink)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    WebkitTapHighlightColor: 'transparent',
                    transition: 'all 280ms var(--ease-out)',
                    boxShadow: isPlaced ? `0 4px 22px ${totemWorld.accentRgb}, 0.18)` : '0 1px 6px rgba(26, 26, 47, 0.04)',
                  }}
                >
                  <ItemMiniPreview itemKey={item.key} accent={accent} isPlaced={isPlaced} />
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500, lineHeight: 1 }}>
                    {item.label}
                  </span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, color: isPlaced ? accent : 'var(--content-tertiary)', fontStyle: 'italic', lineHeight: 1.2 }}>
                    {isPlaced ? 'allumé' : item.whisper}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ═══ TON TOTEM (carousel horizontal) ═══ */}
          <SectionTitle accent={accent} style={{ marginTop: 36 }}>Ton totem</SectionTitle>
          <div
            style={{
              display: 'flex',
              gap: 10,
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: '4px 0 14px',
              marginLeft: -22,
              marginRight: -22,
              paddingLeft: 22,
              paddingRight: 22,
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
            }}
          >
            {TOTEMS.map((t) => {
              const w = WORLDS[t.world];
              const isActive = t.key === totemKey;
              return (
                <button
                  key={t.key}
                  data-press
                  onClick={() => pickTotem(t.key)}
                  aria-pressed={isActive}
                  style={{
                    appearance: 'none',
                    flex: '0 0 124px',
                    padding: 12,
                    background: isActive ? `${w.accentRgb}, 0.18)` : 'rgba(255, 252, 245, 0.62)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: `0.5px solid ${isActive ? w.accent : 'rgba(26, 26, 47, 0.08)'}`,
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--ink)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    scrollSnapAlign: 'center',
                    WebkitTapHighlightColor: 'transparent',
                    transition: 'all 240ms var(--ease-out)',
                    boxShadow: isActive ? `0 4px 18px ${w.accentRgb}, 0.16)` : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: `0.5px solid ${isActive ? w.accent : 'rgba(26, 26, 47, 0.10)'}`,
                      background: 'var(--cream-light, #fffcf5)',
                    }}
                  >
                    <img src={SPIRIT_PHOTO[t.key]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 500, textAlign: 'center', lineHeight: 1.2, color: isActive ? 'var(--ink)' : 'var(--content-secondary)' }}>
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ═══ TES TRACES (7 derniers jours) ═══ */}
          <SectionTitle
            accent={accent}
            style={{ marginTop: 36 }}
            trailing={
              <button
                data-press
                onClick={() => { haptic(2); setSouvenirsOpen(true); }}
                className="neya-mark"
                style={{ background: 'transparent', border: 'none', color: 'var(--content-secondary)', cursor: 'pointer', padding: '8px 4px' }}
              >
                Voir tout ›
              </button>
            }
          >
            Tes 7 derniers jours
          </SectionTitle>
          <div
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: '4px 0 14px',
              marginLeft: -22,
              marginRight: -22,
              paddingLeft: 22,
              paddingRight: 22,
              scrollbarWidth: 'none',
            }}
          >
            {traces.map((d) => {
              const mood = d.mood ? MOODS_MAP[d.mood] : null;
              return (
                <div
                  key={d.ts}
                  style={{
                    flex: '0 0 96px',
                    padding: '12px 10px',
                    background: d.isToday ? `${totemWorld.accentRgb}, 0.10)` : 'rgba(255, 252, 245, 0.6)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: `0.5px solid ${d.isToday ? accent : 'rgba(26, 26, 47, 0.06)'}`,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    minHeight: 110,
                  }}
                >
                  <span
                    className="neya-mark"
                    style={{ color: d.isToday ? accent : 'var(--content-tertiary)', fontSize: 9, textAlign: 'center' }}
                  >
                    {d.dateLabel}
                  </span>
                  {mood ? (
                    <span style={{ fontSize: 22, color: mood.color, lineHeight: 1 }}>{mood.glyph}</span>
                  ) : (
                    <span style={{ fontSize: 22, color: 'var(--content-tertiary)', opacity: 0.35, lineHeight: 1 }}>·</span>
                  )}
                  {d.carnetSnippet ? (
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 10,
                        fontStyle: 'italic',
                        color: 'var(--content-secondary)',
                        textAlign: 'center',
                        lineHeight: 1.3,
                      }}
                    >
                      « {d.carnetSnippet} »
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* ═══ TON CHEMIN ═══ */}
          <SectionTitle accent={accent} style={{ marginTop: 36 }}>Ton chemin</SectionTitle>
          <BlurFade
            style={{
              background: 'rgba(255, 252, 245, 0.74)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '0.5px solid rgba(26, 26, 47, 0.08)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px 20px',
              boxShadow: '0 2px 14px rgba(26, 26, 47, 0.04)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontVariationSettings: 'var(--fraunces-italic-soft)',
                fontSize: 17,
                lineHeight: 1.45,
                color: 'var(--ink)',
                margin: 0,
              }}
            >
              {poeticChemin(profile)}
            </p>
            <div style={{ display: 'flex', gap: 18, marginTop: 14 }}>
              <MiniStat label="jours" value={profile.progress?.joursConnectes || 1} accent={accent} />
              <MiniStat label="minutes" value={profile.progress?.minutesTotales || 0} accent={accent} />
              <MiniStat label="mondes" value={profile.progress?.worldsExplored?.length || 1} accent={accent} />
            </div>
          </BlurFade>

          {/* ═══ RÉGLAGES (accordion) ═══ */}
          <button
            data-press
            onClick={() => { haptic(2); setReglagesOpen((v) => !v); }}
            className="neya-mark"
            style={{
              appearance: 'none',
              width: '100%',
              background: 'transparent',
              border: 'none',
              padding: '24px 4px 12px',
              marginTop: 14,
              color: 'var(--content-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              WebkitTapHighlightColor: 'transparent',
              minHeight: 44,
            }}
          >
            <span>Réglages</span>
            <span style={{ fontSize: 16, transform: reglagesOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 220ms var(--ease-out-ios)' }}>›</span>
          </button>

          {reglagesOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 6 }}>
              {/* Prénom */}
              <PearlCard>
                <FieldLabel>Prénom</FieldLabel>
                {editingPseudo ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <input
                      autoFocus
                      value={tempPseudo}
                      onChange={(e) => setTempPseudo(e.target.value)}
                      onBlur={() => {
                        if ((tempPseudo || '').trim() !== (profile.pseudo || '')) savePseudo();
                        else setEditingPseudo(false);
                      }}
                      placeholder="Ton prénom"
                      maxLength={30}
                      aria-label="Ton prénom"
                      style={inputStyle}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); savePseudo(); }
                        if (e.key === 'Escape') { setTempPseudo(profile.pseudo || ''); setEditingPseudo(false); }
                      }}
                    />
                    <Button size="sm" variant="ghost" onClick={() => { setTempPseudo(profile.pseudo || ''); setEditingPseudo(false); }}>Annuler</Button>
                    <Button size="sm" variant="primary" style={primaryDarkBtn} onClick={savePseudo}>OK</Button>
                  </div>
                ) : (
                  <ValueButton onClick={() => { setTempPseudo(profile.pseudo || ''); setEditingPseudo(true); }}>
                    {profile.pseudo || <span style={{ color: 'var(--content-tertiary)' }}>Toucher pour poser ton prénom</span>}
                  </ValueButton>
                )}
              </PearlCard>

              {/* Réponses */}
              <PearlCard style={{ padding: '4px 0' }}>
                {QUESTIONS.map((q, idx) => {
                  const value = profile.onboarding?.[q.field];
                  const currentLabel = q.pills.find((p) => p.value === value)?.label;
                  const isEditing = editingAnswer === q.field;
                  return (
                    <div key={q.field} style={{ borderTop: idx === 0 ? 'none' : '0.5px solid rgba(26, 26, 47, 0.06)' }}>
                      <button
                        data-press
                        onClick={() => { haptic(2); setEditingAnswer(isEditing ? null : q.field); }}
                        style={{
                          appearance: 'none', width: '100%', background: 'transparent', border: 'none',
                          padding: '16px 18px', minHeight: 52, display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between', gap: 14, cursor: 'pointer',
                          WebkitTapHighlightColor: 'transparent', textAlign: 'left',
                        }}
                      >
                        <span className="neya-mark" style={{ color: 'var(--content-tertiary)' }}>{q.label}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500, color: currentLabel ? 'var(--ink)' : 'var(--content-tertiary)' }}>
                            {currentLabel || '—'}
                          </span>
                          <span style={{ fontSize: 14, color: 'var(--content-tertiary)', transform: isEditing ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 220ms var(--ease-out-ios)' }}>›</span>
                        </span>
                      </button>
                      {isEditing && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 18px 14px' }}>
                          {q.pills.map((p) => {
                            const isActive = p.value === value;
                            return (
                              <button
                                key={String(p.value)}
                                data-press
                                onClick={() => pickAnswer(q.field, p.value)}
                                style={{
                                  appearance: 'none', width: '100%', padding: '12px 14px', minHeight: 44,
                                  background: isActive ? `${totemWorld.accentRgb}, 0.14)` : 'rgba(255, 252, 245, 0.7)',
                                  border: `0.5px solid ${isActive ? accent : 'rgba(26, 26, 47, 0.08)'}`,
                                  borderRadius: 'var(--radius-md)', color: 'var(--ink)',
                                  fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: isActive ? 600 : 500,
                                  textAlign: 'left', cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                                  transition: 'all 200ms var(--ease-out)',
                                }}
                              >
                                {p.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </PearlCard>

              {/* Reset */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8, marginBottom: 8 }}>
                <button
                  data-press
                  onClick={() => { haptic(4); setActionSheet({ type: 'reset' }); }}
                  className="neya-mark"
                  style={{
                    appearance: 'none', background: 'transparent', border: 'none', color: TERRACOTTA,
                    cursor: 'pointer', padding: '12px 22px', minHeight: 44,
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  Réinitialiser mon NÉYA
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlays */}
      {actionSheet?.type === 'reset' && (
        <ActionSheet
          title="Es-tu sûr·e ?"
          description="Toutes tes données NÉYA vont disparaître (pseudo, mantra, totem, mondes, habitudes, panier ÇA VA?). Cette action est irréversible."
          actions={[{ label: 'Tout effacer', role: 'destructive', icon: '⌫', onTap: () => doReset() }]}
          onClose={() => setActionSheet(null)}
        />
      )}
      {moodOpen && <MoodTracker onClose={() => setMoodOpen(false)} />}
      {carnetOpen && <Carnet onClose={() => setCarnetOpen(false)} />}
      {souvenirsOpen && <Souvenirs onClose={() => setSouvenirsOpen(false)} />}

      {/* Keyframes locales */}
      <style>{`
        @keyframes cocon-flame-flicker {
          0%, 100% { transform: scale(1, 1); opacity: 0.95; }
          50%      { transform: scale(0.92, 1.08); opacity: 0.85; }
        }
        @keyframes cocon-flame-glow {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50%      { transform: scale(1.18); opacity: 1; }
        }
        @keyframes cocon-crystal-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes cocon-sparkle {
          0%, 100% { opacity: 0; transform: scale(0.6); }
          50%      { opacity: 1; transform: scale(1.4); }
        }
        @keyframes cocon-plant-breathe {
          0%, 100% { transform: scaleY(1) scaleX(1); }
          50%      { transform: scaleY(1.04) scaleX(0.98); }
        }
        @keyframes cocon-halo-pulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50%      { transform: scale(1.08); opacity: 1; }
        }
        @keyframes cocon-portal-ring {
          0%   { transform: scale(0.4); opacity: 0; }
          30%  { opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes cocon-mantra-breathe {
          0%, 100% { opacity: 0.55; }
          50%      { opacity: 0.78; }
        }
      `}</style>
    </div>
  );
}

/* ─── Hero sanctuaire ─── */

function SanctuaryHero({ pseudo, mantra, spirit, totemLabel, worldBg, accent, placed, hourPhase, onEditMantra }) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 'min(58vh, 460px)',
        minHeight: 380,
        overflow: 'hidden',
        background: 'var(--cream)',
      }}
    >
      {/* Painterly bg */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${worldBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.42,
        }}
      />
      {/* Cream gradient veil (lifts ink readability) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(255, 252, 245, 0.18) 0%, rgba(255, 252, 245, 0.42) 60%, rgba(255, 252, 245, 0.92) 100%)',
          pointerEvents: 'none',
        }}
      />
      {/* Hour-based tint */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: hourPhase.overlay,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }}
      />

      {/* Eyebrow + Title */}
      <div style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 20px)', left: 22, right: 22, zIndex: 4 }}>
        <div className="neya-mark" style={{ color: accent, fontSize: 9 }}>
          MON SANCTUAIRE · {totemLabel.toUpperCase()}
        </div>
        <h1
          style={{
            margin: '6px 0 0',
            fontFamily: 'var(--font-display)',
            fontSize: 30,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            fontWeight: 400,
          }}
        >
          {pseudo ? <>Bienvenue, <em className="neya-key" style={{ fontStyle: 'italic', fontVariationSettings: 'var(--fraunces-italic-soft)' }}>{pseudo}.</em></> : <>Pose-toi <em className="neya-key" style={{ fontStyle: 'italic', fontVariationSettings: 'var(--fraunces-italic-soft)' }}>ici.</em></>}
        </h1>
        <div
          className="neya-body-sm"
          style={{
            color: 'var(--content-secondary)',
            fontStyle: 'italic',
            fontFamily: 'var(--font-display)',
            fontVariationSettings: 'var(--fraunces-italic-soft)',
            marginTop: 4,
          }}
        >
          {hourPhase.whisper}
        </div>
      </div>

      {/* Spirit + portail + totem halo (centred composition) */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '54%',
          transform: 'translate(-50%, -50%)',
          width: 220,
          height: 220,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {placed.portail && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ItemPortail size={210} accent={accent} />
          </div>
        )}
        {placed.totem && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ItemTotemHalo size={210} accent={accent} />
          </div>
        )}
        {spirit && (
          <div
            style={{
              position: 'relative',
              width: 120,
              height: 120,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '0.5px solid var(--hairline-strong)',
              boxShadow: '0 4px 24px rgba(26, 26, 47, 0.14)',
              animation: 'totem-idle 4.4s var(--ease-in-out) infinite',
              background: 'var(--cream-light, #fffcf5)',
            }}
          >
            <img src={spirit} alt={totemLabel} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        )}
      </div>

      {/* Items posés dans la scène — positions absolues */}
      {placed.bougie && (
        <div style={{ position: 'absolute', bottom: '20%', left: '12%', zIndex: 3 }}>
          <ItemBougie size={48} accent={accent} />
        </div>
      )}
      {placed.cristal && (
        <div style={{ position: 'absolute', top: '18%', right: '12%', zIndex: 3 }}>
          <ItemCristal size={42} accent={accent} />
        </div>
      )}
      {placed.plante && (
        <div style={{ position: 'absolute', bottom: '18%', right: '10%', zIndex: 3 }}>
          <ItemPlante size={64} accent={accent} />
        </div>
      )}

      {/* Mantra filigrane */}
      <button
        data-press
        onClick={onEditMantra}
        aria-label={mantra ? 'Modifier ton mantra' : 'Poser un mantra'}
        style={{
          appearance: 'none',
          position: 'absolute',
          bottom: 18,
          left: 22,
          right: 22,
          minHeight: 44,
          background: 'transparent',
          border: 'none',
          color: 'var(--ink)',
          cursor: 'pointer',
          textAlign: 'center',
          WebkitTapHighlightColor: 'transparent',
          zIndex: 4,
        }}
      >
        {mantra ? (
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontVariationSettings: 'var(--fraunces-italic-soft)',
              fontSize: 16,
              lineHeight: 1.4,
              color: 'var(--ink)',
              opacity: 0.78,
              animation: 'cocon-mantra-breathe 7s ease-in-out infinite',
              display: 'inline-block',
              maxWidth: '88%',
            }}
          >
            « {mantra} »
          </span>
        ) : (
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: accent,
              opacity: 0.7,
            }}
          >
            + Poser un mantra
          </span>
        )}
      </button>
    </div>
  );
}

/* ─── Présence du jour (mood + carnet + mantra inline) ─── */

function PresenceCard({ profile, accent, hourPhase, onMood, onCarnet, editingMantra, tempMantra, setTempMantra, saveMantra, cancelMantra, onEditMantra }) {
  const todayMood = useMemo(() => {
    const moods = ls.get('mood_history', []) || [];
    const todayStart = (() => { const d = new Date(); d.setHours(0,0,0,0); return d.getTime(); })();
    return moods.filter((m) => m.ts >= todayStart).pop() || null;
  }, [profile]);
  const moodInfo = todayMood ? MOODS_MAP[todayMood.mood] : null;
  const greeting = profile.pseudo ? `Comment tu vas, ${profile.pseudo} ?` : 'Comment tu vas aujourd\'hui ?';

  return (
    <div
      style={{
        background: 'rgba(255, 252, 245, 0.82)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '0.5px solid rgba(26, 26, 47, 0.08)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 18px 14px',
        boxShadow: '0 4px 18px rgba(26, 26, 47, 0.06)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          lineHeight: 1.3,
          color: 'var(--ink)',
        }}
      >
        {greeting}
      </div>
      {moodInfo && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <span style={{ fontSize: 18, color: moodInfo.color, lineHeight: 1 }}>{moodInfo.glyph}</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--content-secondary)' }}>
            tu as posé <em style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontVariationSettings: 'var(--fraunces-italic-soft)', color: moodInfo.color }}>{moodInfo.label.toLowerCase()}</em> aujourd'hui
          </span>
        </div>
      )}

      {/* Inline mantra edit */}
      {editingMantra ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          <textarea
            autoFocus
            value={tempMantra}
            onChange={(e) => setTempMantra(e.target.value)}
            placeholder="Une phrase pour toi…"
            rows={2}
            maxLength={140}
            aria-label="Mantra du moment"
            onKeyDown={(e) => { if (e.key === 'Escape') cancelMantra(); }}
            style={{ ...inputStyle, resize: 'none', lineHeight: 1.5, borderBottom: 'none', background: 'rgba(26, 26, 47, 0.04)', borderRadius: 8, padding: 10 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button size="sm" variant="primary" style={primaryDarkBtn} onClick={saveMantra}>Garder</Button>
            <Button size="sm" variant="ghost" onClick={cancelMantra}>Annuler</Button>
            <span
              style={{
                marginLeft: 'auto',
                fontFamily: 'var(--font-ui)',
                fontSize: 10,
                color: tempMantra.length >= 130 ? 'var(--crisis)' : 'var(--content-tertiary)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {140 - tempMantra.length}
            </span>
          </div>
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button
          data-press
          onClick={onMood}
          style={{
            appearance: 'none',
            flex: 1,
            padding: '12px 14px',
            minHeight: 44,
            background: `${accent}`,
            color: 'var(--cream)',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.04em',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {todayMood ? 'Re-poser mon humeur' : 'Poser mon humeur'}
        </button>
        <button
          data-press
          onClick={onCarnet}
          style={{
            appearance: 'none',
            flex: 1,
            padding: '12px 14px',
            minHeight: 44,
            background: 'rgba(255, 252, 245, 0.7)',
            color: 'var(--ink)',
            border: `0.5px solid ${accent}`,
            borderRadius: 'var(--radius-pill)',
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.04em',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          Écrire au carnet
        </button>
      </div>

      {!editingMantra && (
        <button
          data-press
          onClick={onEditMantra}
          className="neya-mark"
          style={{
            appearance: 'none',
            width: '100%',
            background: 'transparent',
            border: 'none',
            padding: '12px 4px 4px',
            color: 'var(--content-tertiary)',
            cursor: 'pointer',
            textAlign: 'center',
            WebkitTapHighlightColor: 'transparent',
            minHeight: 44,
            fontSize: 9,
          }}
        >
          {profile.mantra ? 'Modifier mon mantra' : '+ Poser un mantra'}
        </button>
      )}
    </div>
  );
}

/* ─── Mini previews items (within picker cards) ─── */

function ItemMiniPreview({ itemKey, accent, isPlaced }) {
  const opacity = isPlaced ? 1 : 0.42;
  const size = 36;
  if (itemKey === 'bougie')  return <div style={{ opacity }}><ItemBougie size={size} accent={accent} /></div>;
  if (itemKey === 'cristal') return <div style={{ opacity }}><ItemCristal size={size} accent={accent} /></div>;
  if (itemKey === 'plante')  return <div style={{ opacity }}><ItemPlante size={size + 4} accent={accent} /></div>;
  if (itemKey === 'totem')   return (
    <div style={{ opacity, position: 'relative', width: size + 12, height: size + 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 60 60" width={size + 12} height={size + 12}>
        <defs>
          <radialGradient id={`mini-halo-${itemKey}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.65" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="30" cy="30" r="28" fill={`url(#mini-halo-${itemKey})`} />
        <circle cx="30" cy="30" r="9" fill={accent} opacity="0.85" />
      </svg>
    </div>
  );
  if (itemKey === 'portail') return (
    <div style={{ opacity, width: size + 12, height: size + 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 60 60" width={size + 12} height={size + 12}>
        <circle cx="30" cy="30" r="22" fill="none" stroke={accent} strokeWidth="0.8" strokeOpacity="0.5" />
        <circle cx="30" cy="30" r="14" fill="none" stroke={accent} strokeWidth="0.8" strokeOpacity="0.7" />
        <circle cx="30" cy="30" r="6"  fill="none" stroke={accent} strokeWidth="0.8" strokeOpacity="0.9" />
      </svg>
    </div>
  );
  return null;
}

/* ─── Petits composants ─── */

function PearlCard({ children, style }) {
  return (
    <div
      style={{
        background: 'rgba(255, 252, 245, 0.78)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '0.5px solid rgba(26, 26, 47, 0.08)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 18px',
        boxShadow: '0 2px 14px rgba(26, 26, 47, 0.04)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children, accent, style, trailing }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, ...style }}>
      <span style={{ width: 18, height: 1, background: accent, opacity: 0.8 }} />
      <span className="neya-mark" style={{ color: accent }}>{children}</span>
      {trailing ? (
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center' }}>{trailing}</span>
      ) : null}
    </div>
  );
}

function FieldLabel({ children }) {
  return <div className="neya-mark" style={{ color: 'var(--content-tertiary)' }}>{children}</div>;
}

function ValueButton({ onClick, children }) {
  return (
    <button
      data-press
      onClick={onClick}
      style={{
        appearance: 'none', width: '100%', background: 'transparent', border: 'none',
        padding: '12px 0 4px', minHeight: 44, textAlign: 'left', color: 'var(--ink)',
        fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.45, cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </button>
  );
}

function MiniStat({ label, value, accent }) {
  const animated = useNumberTicker({ target: Number(value) || 0, duration: 1100 });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: accent,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}
      >
        {animated}
      </span>
      <span className="neya-mark" style={{ color: 'var(--content-tertiary)', fontSize: 9 }}>{label}</span>
    </div>
  );
}

const inputStyle = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  borderBottom: '0.5px solid rgba(26, 26, 47, 0.18)',
  outline: 'none',
  padding: '6px 0',
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  color: 'var(--ink)',
};

const primaryDarkBtn = {
  background: 'var(--ink)',
  color: 'var(--cream)',
  minHeight: 44,
  paddingTop: 10,
  paddingBottom: 10,
  paddingLeft: 18,
  paddingRight: 18,
};
