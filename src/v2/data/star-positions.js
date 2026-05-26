/* ============================================================
   Algo placement déterministe des étoiles dans la constellation
   ============================================================
   Pour chaque (userId, dayIndex), calcule position (x, y) en
   pourcentage du viewport [0-100]. Évite les bordures (margin 10%).
   ============================================================ */

import { hashSeed } from '../helpers/stars';

/**
 * Position (x%, y%) déterministe pour une étoile donnée.
 * @param {string} starId - star.id (date + timestamp)
 * @param {string} userId - getUserId()
 * @returns {{x: number, y: number}}
 */
export function positionForStar(starId, userId) {
  const seedX = hashSeed(`${userId}-${starId}-x`);
  const seedY = hashSeed(`${userId}-${starId}-y`);
  // Margin 10-90% pour éviter bords (header + chapters scroll)
  const x = 10 + (seedX % 80);
  const y = 10 + (seedY % 60);  // limite Y à 70% pour laisser place aux chapitres
  return { x, y };
}

/**
 * Génère les paires de connexions (fils SVG) entre étoiles de la même semaine.
 * @param {Array} stars - étoiles avec {id, date}
 * @returns {Array<{from: position, to: position}>}
 */
export function generateConnections(stars, userId) {
  if (stars.length < 2) return [];

  // Groupe par semaine ISO (YYYY-W)
  const byWeek = {};
  stars.forEach((s) => {
    const wk = isoWeek(s.date);
    if (!byWeek[wk]) byWeek[wk] = [];
    byWeek[wk].push(s);
  });

  const connections = [];
  Object.values(byWeek).forEach((weekStars) => {
    // Trie par date, relie chronologiquement
    const sorted = [...weekStars].sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 0; i < sorted.length - 1; i++) {
      connections.push({
        from: positionForStar(sorted[i].id, userId),
        to:   positionForStar(sorted[i + 1].id, userId),
      });
    }
  });
  return connections;
}

function isoWeek(iso) {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getFullYear()}-W${weekNo}`;
}
