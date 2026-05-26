/* ============================================================
   Helpers — Stars / Constellation
   ============================================================
   Toute la logique d'ajout, lecture, hash placement.
   ============================================================ */

import { ls, getProfile, setProfile } from '../state';
import { pickCitation } from '../data/citations';

const STORAGE_KEY = 'cava_v5_uid';

/** UID unique stable par installation (généré au 1er appel) */
export function getUserId() {
  let uid = ls.get(STORAGE_KEY, null);
  if (!uid) {
    uid = `u-${Date.now()}-${Math.floor(Math.random() * 1e9).toString(36)}`;
    ls.set(STORAGE_KEY, uid);
  }
  return uid;
}

/** Hash déterministe simple (FNV-1a 32-bit) — pour positions étoiles */
export function hashSeed(input) {
  let h = 0x811c9dc5;
  const s = String(input);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Convertit Date → 'YYYY-MM-DD' */
export function toIsoDate(d = new Date()) {
  return d.toISOString().split('T')[0];
}

/** Index jour depuis 2026-01-01 (pour seeded random stable par jour) */
export function dayIndex(isoDate) {
  const ref = new Date('2026-01-01').getTime();
  const day = new Date(isoDate).getTime();
  return Math.floor((day - ref) / 86400000);
}

/** A-t-on déjà posé une étoile aujourd'hui ? */
export function hasStarToday() {
  const today = toIsoDate();
  const stars = getProfile().stars || [];
  return stars.some((s) => s.date === today);
}

/**
 * Ajoute une étoile au profil.
 * @param {object} args - { color, note?, type }
 *   color : 'bleu' | 'rose' | 'violet' | 'peche' | 'orage'
 *   note  : string optionnel
 *   type  : 'mood' | 'breath' | 'voice' | 'write' (default 'mood')
 */
export function addStar({ color, note = '', type = 'mood' }) {
  const tagMap = {
    bleu:   'calme',
    rose:   'tendre',
    violet: 'introspectif',
    peche:  'fatigue',
    orage:  'orage',
  };
  const tag = tagMap[color] || 'calme';
  const today = toIsoDate();
  const seed = dayIndex(today) + hashSeed(getUserId());
  const citation = pickCitation(tag, seed);

  const star = {
    id: `star-${today}-${Date.now().toString(36)}`,
    date: today,
    time: new Date().toTimeString().slice(0, 5),
    color,
    note: note?.trim() || null,
    citation,
    type,
  };

  const p = getProfile();
  p.stars = [...(p.stars || []), star];
  setProfile(p);
  return star;
}

/** Récupère étoiles dans une plage de dates (inclusive). */
export function getStarsRange(fromIso, toIso) {
  const stars = getProfile().stars || [];
  return stars.filter((s) => s.date >= fromIso && s.date <= toIso);
}

/** Toutes les étoiles, triées par date desc (plus récente first). */
export function getAllStars() {
  const stars = getProfile().stars || [];
  return [...stars].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** Étoile la plus récente, ou null. */
export function getLatestStar() {
  return getAllStars()[0] || null;
}

/** Couleur dominante des N derniers jours (string ou null si rien). */
export function getDominantColor(days = 7) {
  const today = new Date();
  const from = new Date(today.getTime() - days * 86400000);
  const stars = getStarsRange(toIsoDate(from), toIsoDate(today));
  if (stars.length === 0) return null;
  const counts = {};
  stars.forEach((s) => { counts[s.color] = (counts[s.color] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}
