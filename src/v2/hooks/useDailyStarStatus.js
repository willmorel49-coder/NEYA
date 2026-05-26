import { useState, useEffect } from 'react';
import { hasStarToday } from '../helpers/stars';

/** Renvoie {posed, refresh} — recalcule à chaque mount + au profile-changed event */
export default function useDailyStarStatus() {
  const [posed, setPosed] = useState(() => hasStarToday());

  const refresh = () => setPosed(hasStarToday());

  useEffect(() => {
    const onChange = () => refresh();
    window.addEventListener('cava:profile-changed', onChange);
    window.addEventListener('focus', onChange);
    return () => {
      window.removeEventListener('cava:profile-changed', onChange);
      window.removeEventListener('focus', onChange);
    };
  }, []);

  return { posed, refresh };
}
