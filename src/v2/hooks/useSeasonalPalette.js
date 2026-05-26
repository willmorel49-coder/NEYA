import { useEffect, useState } from 'react';

/**
 * Détecte la saison actuelle (hémisphère nord) et applique
 * un data-season sur <html> pour activer les overrides CSS tokens.css.
 *
 * Retourne le nom de la saison : 'printemps' | 'ete' | 'automne' | 'hiver'
 */
export default function useSeasonalPalette() {
  const [season, setSeason] = useState(() => getSeason());

  useEffect(() => {
    document.documentElement.setAttribute('data-season', season);
  }, [season]);

  // Re-check à chaque focus (changement de jour possible si user revient le lendemain)
  useEffect(() => {
    const onFocus = () => {
      const s = getSeason();
      setSeason(s);
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  return season;
}

function getSeason(d = new Date()) {
  const m = d.getMonth(); // 0-11
  if (m >= 2 && m <= 4) return 'printemps';   // mars-mai
  if (m >= 5 && m <= 7) return 'ete';         // juin-août
  if (m >= 8 && m <= 10) return 'automne';    // sept-nov
  return 'hiver';                              // déc-fév
}
