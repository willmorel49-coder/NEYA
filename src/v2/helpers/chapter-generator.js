/* ============================================================
   Chapter Generator — produit la liste de chapitres à afficher
   sur le scroll du Ciel, à partir des étoiles + état app.
   ============================================================
   Types de chapitres : 'hier', 'semaine', 'mois', 'saison',
   'memoire', 'piece', 'voix'
   ============================================================ */

import { CITATIONS } from '../data/citations';
import { MARQUE_IMAGES } from '../data/marque-manifest';
import { getStarsRange, toIsoDate, getDominantColor, getAllStars, hashSeed, getUserId, dayIndex } from './stars';

/** Set des paths d'images marque valides — pour vérif rapide O(1) */
const MARQUE_IMAGES_SET = new Set(MARQUE_IMAGES);

const COLOR_LABELS = {
  bleu:   'calme',
  rose:   'tendresse',
  violet: 'introspection',
  peche:  'fatigue',
  orage:  'orage',
};

const MOIS_FR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

// Map id citation → image selection (les 12 citations marque les plus iconiques)
const CITATION_TO_IMAGE = {
  1:  '/cava/selection/sel-02-sensibilite.jpeg',
  2:  '/cava/selection/anx-01-super-pouvoir.jpeg',
  3:  '/cava/selection/anx-09-cicatrice.jpeg',
  4:  '/cava/selection/sel-01-pas.jpeg',
  5:  '/cava/selection/anx-10-combats.jpeg',
  6:  '/cava/selection/anx-08-courage.jpeg',
  7:  '/cava/selection/anx-06-soleil.jpeg',
  8:  '/cava/selection/anx-07-fatigue.jpeg',
  9:  '/cava/selection/anx-11-sourire.jpeg',
  10: '/cava/selection/fruit-01-banane.jpeg',
  11: '/cava/selection/fruit-02-peche.jpeg',
  12: '/cava/selection/anx-03-train.jpeg',
  19: '/cava/selection/anx-02-camus.jpeg',
  20: '/cava/selection/anx-04-matt-haig.jpeg',
  21: '/cava/selection/anx-05-prevert-bis.jpeg',
  22: '/cava/selection/anx-12-mandela.jpeg',
};

/**
 * Retourne un tableau de chapitres à afficher dans le Ciel scroll.
 * Ordre : du plus récent au plus ancien.
 */
export function generateChapters() {
  const chapters = [];
  const stars = getAllStars();
  if (stars.length === 0) return chapters;

  const today = new Date();
  const yesterday = new Date(today.getTime() - 86400000);

  // ── Chapitre "Hier" ──
  const yesterdayStars = stars.filter((s) => s.date === toIsoDate(yesterday));
  if (yesterdayStars.length > 0) {
    const last = yesterdayStars[yesterdayStars.length - 1];
    chapters.push({
      type: 'hier',
      eyebrow: `Hier · ${formatDate(yesterday)}`,
      accent: 'rose',
      text: last.note
        ? `« ${last.note} »`
        : `Tu as déposé une étoile ${COLOR_LABELS[last.color] || ''}.`,
    });
  }

  // ── Chapitre "Cette semaine" ──
  const weekFrom = new Date(today.getTime() - 7 * 86400000);
  const weekStars = getStarsRange(toIsoDate(weekFrom), toIsoDate(today));
  if (weekStars.length >= 3) {
    const dominant = getDominantColor(7);
    chapters.push({
      type: 'semaine',
      eyebrow: 'Cette semaine',
      accent: 'rose',
      text: `${weekStars.length} étoiles posées. Tendance : ${COLOR_LABELS[dominant] || 'présence'}.`,
    });
  }

  // ── Chapitre "Ce mois" (visible 1-7 du mois) ──
  if (today.getDate() <= 7) {
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    const monthStars = getStarsRange(toIsoDate(lastMonth), toIsoDate(lastMonthEnd));
    if (monthStars.length > 0) {
      const counts = {};
      monthStars.forEach((s) => { counts[s.color] = (counts[s.color] || 0) + 1; });
      const dominantMonth = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      chapters.push({
        type: 'mois',
        eyebrow: MOIS_FR[lastMonth.getMonth()],
        accent: 'violet',
        text: `${monthStars.length} étoiles. Couleur dominante : ${COLOR_LABELS[dominantMonth] || 'présence'}.`,
      });
    }
  }

  // ── M4 : Mémoire qui ressurgit (étoile 30/90/365 jours) ──
  const memoryOffsets = [30, 90, 365];
  for (const days of memoryOffsets) {
    const target = new Date(today.getTime() - days * 86400000);
    const targetIso = toIsoDate(target);
    const memoryStar = stars.find((s) => s.date === targetIso && s.note);
    if (memoryStar) {
      chapters.push({
        type: 'memoire',
        eyebrow: days === 365 ? 'Il y a un an' : `Il y a ${days} jours`,
        accent: 'blue',
        text: `Tu écrivais : « ${memoryStar.note} »`,
      });
      break; // une seule mémoire à la fois
    }
  }

  // ── M6 : Pièce de la marque qui résonne ──
  const dominantNow = getDominantColor(3);
  if (dominantNow) {
    const tagMap = { bleu: 'calme', rose: 'tendre', violet: 'introspectif', peche: 'fatigue', orage: 'orage' };
    const tag = tagMap[dominantNow];
    const matched = CITATIONS.filter((c) => c.tags.includes(tag) && c.author == null);
    if (matched.length > 0) {
      // Index déterministe : même citation tant que userId + jour identiques (pas de re-render flicker)
      const seed = hashSeed(getUserId() + ':' + dayIndex(toIsoDate(today)));
      const c = matched[seed % matched.length];
      // Map citation id → image marque iconique ; sinon vérifier que le path existe dans MARQUE_IMAGES
      const curated = CITATION_TO_IMAGE[c.id];
      const fallback = `/cava/marque/marque-${String((c.id * 7) % 122 + 1).padStart(3, '0')}.jpeg`;
      let media = null;
      if (curated) {
        media = { type: 'image', src: curated };
      } else if (MARQUE_IMAGES_SET.has(fallback)) {
        media = { type: 'image', src: fallback };
      }
      chapters.push({
        type: 'piece',
        eyebrow: 'Une pièce qui te ressemble',
        accent: 'rose',
        text: `« ${c.text} »`,
        ...(media ? { media } : {}),
      });
    }
  }

  return chapters;
}

function formatDate(d) {
  return `${d.getDate()} ${MOIS_FR[d.getMonth()]}`;
}
