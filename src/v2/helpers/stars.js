/* ============================================================
   Helpers — Stars / Constellation
   ============================================================
   Toute la logique d'ajout, lecture, hash placement.
   ============================================================ */

import { ls, getProfile, mutateProfile } from '../state';
import { pickCitation } from '../data/citations';
import { positionForStar } from '../data/star-positions';

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

/** Étoile d'aujourd'hui (ou null si pas encore posée). */
export function getTodayStar() {
  const today = toIsoDate();
  const stars = getProfile().stars || [];
  return stars.find((s) => s.date === today) || null;
}

/**
 * Ajoute une étoile au profil.
 * Idempotent par jour : si une étoile existe déjà pour aujourd'hui, retourne l'existante sans rien écrire.
 * @param {object} args - { color, note?, type }
 *   color : 'bleu' | 'rose' | 'violet' | 'peche' | 'orage'
 *   note  : string optionnel
 *   type  : 'mood' | 'breath' | 'voice' | 'write' (default 'mood')
 * @returns {object} l'étoile (existante ou nouvellement créée).
 */
export function addStar({ color, note = '', type = 'mood' }) {
  const existing = getTodayStar();
  if (existing) return existing;

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

  const id = `star-${today}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const { x, y } = positionForStar(id, getUserId());

  const star = {
    id,
    date: today,
    time: new Date().toTimeString().slice(0, 5),
    color,
    note: note?.trim() || null,
    citation,
    type,
    x,
    y,
  };

  mutateProfile((p) => ({ ...p, stars: [...(p.stars || []), star] }));
  return star;
}

/**
 * Backfill x/y sur les étoiles existantes (migration douce).
 * Idempotent : ne touche que les étoiles sans x/y.
 * À appeler une fois au boot.
 */
export function backfillStarPositions() {
  const stars = getProfile().stars || [];
  const needsBackfill = stars.some((s) => s.x == null || s.y == null);
  if (!needsBackfill) return;
  const uid = getUserId();
  mutateProfile((p) => ({
    ...p,
    stars: (p.stars || []).map((s) => {
      if (s.x != null && s.y != null) return s;
      const { x, y } = positionForStar(s.id, uid);
      return { ...s, x, y };
    }),
  }));
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
