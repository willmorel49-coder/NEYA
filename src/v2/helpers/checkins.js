/* ============================================================
   Helpers — Checkins V6
   ============================================================
   Data layer pour le check-in quotidien.
   Toutes les mutations passent par mutateProfile (atomique).
   ============================================================ */

import { getProfile, mutateProfile } from '../state';
import { pickCitation } from '../data/citations';

/** Convertit Date → 'YYYY-MM-DD' */
export function toIsoDate(d = new Date()) {
  return d.toISOString().split('T')[0];
}

/** Hash déterministe simple (FNV-1a 32-bit) — pour seeds citation */
export function hashSeed(input) {
  let h = 0x811c9dc5;
  const s = String(input);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Index jour depuis 2026-01-01 (pour seeded stable par jour) */
export function dayIndex(isoDate = toIsoDate()) {
  const ref = new Date('2026-01-01').getTime();
  const day = new Date(isoDate).getTime();
  return Math.floor((day - ref) / 86400000);
}

const MOOD_TAGS = {
  'pas-terrible':    ['fardeau', 'peur', 'manque'],
  'ca-va-pas-trop':  ['présence', 'tendresse'],
  'ca-va':           ['gratitude', 'joie'],
};

/** Pour un mood, choisit une citation déterministe par jour + mood. */
export function pickEchoCitation(mood) {
  const tags = MOOD_TAGS[mood] || ['présence'];
  const seed = dayIndex() + hashSeed(mood);
  const tag = tags[seed % tags.length];
  return pickCitation(tag, seed);
}

/** A-t-on déjà un check-in pour aujourd'hui ? */
export function hasCheckinToday() {
  const today = toIsoDate();
  const list = getProfile().checkins || [];
  return list.some((c) => c.date === today);
}

/** Le check-in d'aujourd'hui ou null. */
export function getTodayCheckin() {
  const today = toIsoDate();
  const list = getProfile().checkins || [];
  return list.find((c) => c.date === today) || null;
}

/**
 * Crée le check-in du jour (idempotent : si existe déjà, retourne l'existant).
 * @param {object} args - { mood }
 *   mood : 'ca-va' | 'ca-va-pas-trop' | 'pas-terrible'
 */
export function addCheckin({ mood }) {
  const existing = getTodayCheckin();
  if (existing) return existing;

  const today = toIsoDate();
  const citation = pickEchoCitation(mood);

  const checkin = {
    id: `checkin-${today}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    date: today,
    time: new Date().toTimeString().slice(0, 5),
    mood,
    citation,
    actions: [],
  };

  mutateProfile((p) => ({ ...p, checkins: [...(p.checkins || []), checkin] }));
  return checkin;
}

/**
 * Ajoute une action au check-in du jour (multi-actions permises).
 * @param {object} action - { type: 'breath'|'write'|'bouee'|'citation', ...args }
 */
export function appendActionToTodayCheckin(action) {
  const today = toIsoDate();
  const withTs = { ...action, doneAt: new Date().toISOString() };
  mutateProfile((p) => ({
    ...p,
    checkins: (p.checkins || []).map((c) =>
      c.date === today ? { ...c, actions: [...(c.actions || []), withTs] } : c
    ),
  }));
}

/** Récupère check-ins dans une plage de dates (inclusive). */
export function getCheckinsRange(fromIso, toIso) {
  const list = getProfile().checkins || [];
  return list.filter((c) => c.date >= fromIso && c.date <= toIso);
}

/** Tous les check-ins, triés par date desc (plus récent first). Max 90 jours. */
export function getAllCheckins() {
  const list = getProfile().checkins || [];
  const today = new Date();
  const cutoff = toIsoDate(new Date(today.getTime() - 90 * 86400000));
  return [...list]
    .filter((c) => c.date >= cutoff)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** Check-in le plus récent ou null. */
export function getLatestCheckin() {
  return getAllCheckins()[0] || null;
}

/** Mood dominant des N derniers jours (string ou null). */
export function getDominantMood(days = 7) {
  const today = new Date();
  const from = new Date(today.getTime() - days * 86400000);
  const list = getCheckinsRange(toIsoDate(from), toIsoDate(today));
  if (list.length === 0) return null;
  const counts = {};
  list.forEach((c) => { counts[c.mood] = (counts[c.mood] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

/** Couleur visuelle pour un mood (utilisée par Timeline + dot). */
export const MOOD_COLORS = {
  'ca-va':           '#7dc8a0',
  'ca-va-pas-trop':  '#e8a0b8',
  'pas-terrible':    '#aac6dd',
};

/** Label humain pour un mood. */
export const MOOD_LABELS = {
  'ca-va':           'Ça va',
  'ca-va-pas-trop':  'Ça va pas trop',
  'pas-terrible':    'Pas terrible',
};
