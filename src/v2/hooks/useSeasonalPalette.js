import { useEffect, useState } from 'react';

/**
 * Détecte la saison actuelle (hémisphère nord) et applique
 * un data-season sur <html> pour activer les overrides CSS tokens.css.
 *
 * Met également à jour la meta[name="theme-color"] (status bar iOS / Android)
 * pour rester cohérente avec la teinte saisonnière.
 *
 * Retourne le nom de la saison : 'printemps' | 'ete' | 'automne' | 'hiver'
 */

// Teintes claires dérivées du fond #EEF3F8 — gardent le caractère pearl glass
// tout en signalant subtilement la saison dans la status bar mobile.
const SEASON_COLORS = {
  printemps: '#E8F1E8', // vert tendre pâle
  ete:       '#F5ECE0', // pêche/doré chaud
  automne:   '#F0E4DA', // terracotta pâle
  hiver:     '#E4EAF2', // bleu nuit léger
};

const DEFAULT_THEME_COLOR = '#EEF3F8';

export default function useSeasonalPalette() {
  const [season, setSeason] = useState(() => getSeason());

  useEffect(() => {
    document.documentElement.setAttribute('data-season', season);

    const meta = document.querySelector('meta[name="theme-color"]');
    let previous = null;
    if (meta) {
      previous = meta.getAttribute('content');
      const next = SEASON_COLORS[season] || DEFAULT_THEME_COLOR;
      meta.setAttribute('content', next);
    }

    return () => {
      // Restore previous theme-color when season changes / hook unmounts
      if (meta && previous !== null) {
        meta.setAttribute('content', previous);
      }
    };
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
