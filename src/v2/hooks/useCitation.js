import { useMemo } from 'react';
import { pickCitation } from '../data/citations';
import { getDominantColor, hashSeed, getUserId, dayIndex, toIsoDate } from '../helpers/stars';

const COLOR_TO_TAG = {
  bleu:   'calme',
  rose:   'tendre',
  violet: 'introspectif',
  peche:  'fatigue',
  orage:  'orage',
};

/**
 * Récupère la citation du jour, matchée sur la couleur dominante 7j.
 * Stable pour la journée entière (seed = userId + dayIndex).
 */
export default function useCitation() {
  return useMemo(() => {
    const dominant = getDominantColor(7) || 'bleu';
    const tag = COLOR_TO_TAG[dominant];
    const seed = hashSeed(getUserId()) + dayIndex(toIsoDate());
    return pickCitation(tag, seed);
  }, []);
}
