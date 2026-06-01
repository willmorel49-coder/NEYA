/* ============================================================
   Migration V5 -> V6 : stars -> checkins
   ============================================================
   Idempotent via flag cava_v6_migrated.
   Conserve profile.stars intact pour rollback.
   ============================================================ */

import { ls, getProfile, mutateProfile } from '../state';
import { pickEchoCitation } from './checkins';

const MIGRATED_FLAG = 'cava_v6_migrated';

const STAR_COLOR_TO_MOOD = {
  bleu:   'ca-va',
  rose:   'ca-va',
  violet: 'ca-va-pas-trop',
  peche:  'ca-va-pas-trop',
  orage:  'pas-terrible',
};

function starTypeToAction(star) {
  const doneAt = `${star.date}T${star.time || '12:00'}:00.000Z`;
  switch (star.type) {
    case 'mood':
      return null;
    case 'breath':
      return { type: 'breath', legacy: true, doneAt };
    case 'voice':
      return { type: 'voice-legacy', doneAt };
    case 'write':
      return { type: 'write', text: star.note || null, doneAt };
    default:
      return null;
  }
}

export function migrateV5ToV6() {
  if (ls.get(MIGRATED_FLAG, false)) return;

  const p = getProfile();
  const stars = p.stars || [];
  const existingCheckins = p.checkins || [];
  const existingDates = new Set(existingCheckins.map((c) => c.date));

  if (stars.length === 0) {
    ls.set(MIGRATED_FLAG, true);
    return;
  }

  // Groupe les stars par date. Première star du jour = mood. Toutes les actions cumulées.
  const starsByDate = {};
  stars.forEach((s) => {
    if (!s.date) return;
    if (!starsByDate[s.date]) starsByDate[s.date] = [];
    starsByDate[s.date].push(s);
  });

  const newCheckins = [];
  Object.entries(starsByDate).forEach(([date, dayStars]) => {
    if (existingDates.has(date)) return; // dedup: ne pas migrer si checkin déjà présent

    const sorted = [...dayStars].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    const first = sorted[0];
    const mood = STAR_COLOR_TO_MOOD[first.color] || 'ca-va-pas-trop';

    const actions = sorted
      .map((s) => starTypeToAction(s))
      .filter(Boolean);

    const citation = first.citation && first.citation.text
      ? first.citation
      : pickEchoCitation(mood);

    newCheckins.push({
      id: `migrated-${date}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      date,
      time: first.time || '12:00',
      mood,
      citation,
      actions,
    });
  });

  if (newCheckins.length > 0) {
    mutateProfile((prof) => ({
      ...prof,
      checkins: [...(prof.checkins || []), ...newCheckins],
    }));
  }

  ls.set(MIGRATED_FLAG, true);
}
