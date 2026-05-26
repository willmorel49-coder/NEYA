/* ============================================================
   Migration V4 → V5 : récupère anciens mood/bilans et les
   transforme en étoiles rétroactives pour ne pas perdre l'historique.
   ============================================================ */

import { ls, getProfile, setProfile } from '../state';
import { pickCitation } from '../data/citations';
import { hashSeed, getUserId, dayIndex, toIsoDate } from './stars';

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
  if (ls.get(MIGRATED_FLAG, false)) return;

  const p = getProfile();
  const stars = p.stars || [];
  const moodHistory = ls.get('mood_history', []);
  const bilansV4 = ls.get('bilan_history', []);
  const newStars = [...stars];

  // Mood history → étoiles
  moodHistory.forEach((m, i) => {
    if (!m.date) return;
    const color = MOOD_TO_COLOR[m.mood] || MOOD_TO_COLOR.default;
    const seed = dayIndex(m.date) + hashSeed(getUserId());
    const tagMap = { bleu: 'calme', rose: 'tendre', violet: 'introspectif', peche: 'fatigue', orage: 'orage' };
    const tag = tagMap[color] || 'calme';
    const citation = pickCitation(tag, seed);
    newStars.push({
      id: `migrated-mood-${i}-${m.date}`,
      date: m.date,
      time: '12:00',
      color,
      note: m.note || null,
      citation,
      type: 'mood',
    });
  });

  // Bilans V4 → étoiles type 'write'
  bilansV4.forEach((b, i) => {
    if (!b.date) return;
    const seed = dayIndex(b.date) + hashSeed(getUserId());
    const citation = pickCitation('introspectif', seed);
    newStars.push({
      id: `migrated-bilan-${i}-${b.date}`,
      date: b.date,
      time: '22:00',
      color: 'violet',
      note: b.answers ? Object.values(b.answers).filter(Boolean).join(' · ').slice(0, 200) : null,
      citation,
      type: 'write',
    });
  });

  p.stars = newStars;
  setProfile(p);
  ls.set(MIGRATED_FLAG, true);
}
