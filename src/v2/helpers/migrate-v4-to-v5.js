/* ============================================================
   Migration V4 → V5 : récupère anciens mood/bilans et les
   transforme en étoiles rétroactives pour ne pas perdre l'historique.
   ============================================================ */

import { ls, getProfile, mutateProfile } from '../state';
import { pickCitation } from '../data/citations';
import { hashSeed, getUserId, dayIndex, backfillStarPositions } from './stars';
import { positionForStar } from '../data/star-positions';

const MIGRATED_FLAG = 'cava_v5_migrated';

const MOOD_TO_COLOR = {
  calme:    'bleu',
  joyeux:   'rose',
  triste:   'violet',
  fatigue:  'peche',
  anxieux:  'orage',
  default:  'bleu',
};

export function migrateV4ToV5() {
  if (!ls.get(MIGRATED_FLAG, false)) {
    const p = getProfile();
    const existingStars = p.stars || [];
    const existingIds = new Set(existingStars.map((s) => s.id));
    const moodHistory = ls.get('mood_history', []);
    const bilansV4 = ls.get('bilan_history', []);
    const uid = getUserId();
    const candidates = [];

    // Mood history → étoiles
    moodHistory.forEach((m, i) => {
      if (!m.date) return;
      const color = MOOD_TO_COLOR[m.mood] || MOOD_TO_COLOR.default;
      const seed = dayIndex(m.date) + hashSeed(uid);
      const tagMap = { bleu: 'calme', rose: 'tendre', violet: 'introspectif', peche: 'fatigue', orage: 'orage' };
      const tag = tagMap[color] || 'calme';
      const citation = pickCitation(tag, seed);
      const id = `migrated-mood-${i}-${m.date}-${Math.random().toString(36).slice(2, 7)}`;
      const { x, y } = positionForStar(id, uid);
      candidates.push({
        id,
        date: m.date,
        time: '12:00',
        color,
        note: m.note || null,
        citation,
        type: 'mood',
        x,
        y,
      });
    });

    // Bilans V4 → étoiles type 'write'
    bilansV4.forEach((b, i) => {
      if (!b.date) return;
      const seed = dayIndex(b.date) + hashSeed(uid);
      const citation = pickCitation('introspectif', seed);
      const id = `migrated-bilan-${i}-${b.date}-${Math.random().toString(36).slice(2, 7)}`;
      const { x, y } = positionForStar(id, uid);
      candidates.push({
        id,
        date: b.date,
        time: '22:00',
        color: 'violet',
        note: b.answers ? Object.values(b.answers).filter(Boolean).join(' · ').slice(0, 200) : null,
        citation,
        type: 'write',
        x,
        y,
      });
    });

    // Dedup : n'ajoute que les IDs absents
    const fresh = candidates.filter((c) => !existingIds.has(c.id));
    if (fresh.length > 0) {
      mutateProfile((prof) => ({ ...prof, stars: [...(prof.stars || []), ...fresh] }));
    }
    ls.set(MIGRATED_FLAG, true);
  }

  // Backfill x/y sur étoiles antérieures à V5.1 (idempotent, no-op si déjà fait).
  backfillStarPositions();
}
