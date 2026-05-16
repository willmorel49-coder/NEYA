/* ============================================================
   useNumberTicker — animation d'un nombre vers une valeur cible
   ============================================================
   Anime un nombre depuis 0 (ou valeur précédente) vers la cible
   via requestAnimationFrame + easing easeOutQuart.
   Pas de dépendance. Retourne la valeur courante à afficher.

   Usage :
     const days = useNumberTicker({ target: profile.joursConnectes });
     <span>{days}</span>

   Options :
     target           — valeur finale (number)
     duration         — durée totale en ms (default 1200)
     startOnMount     — démarre l'anim au mount (default true)
     enabled          — déclenche l'anim seulement si true (default true)
     decimals         — nombre de décimales (default 0)

   Respecte prefers-reduced-motion : si l'utilisateur préfère
   moins de mouvement, on saute directement à la valeur cible.
   ============================================================ */

import { useEffect, useRef, useState } from 'react';

function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function useNumberTicker({
  target = 0,
  duration = 1200,
  startOnMount = true,
  enabled = true,
  decimals = 0,
} = {}) {
  const [value, setValue] = useState(() => (startOnMount ? 0 : target));
  const rafRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }

    // Premier tick : démarre seulement si startOnMount, sinon set direct.
    if (!startedRef.current && !startOnMount) {
      setValue(target);
      startedRef.current = true;
      return;
    }
    startedRef.current = true;

    // Anim depuis la valeur courante vers la cible (utilise un closure-safe lecture).
    const from = value;
    if (from === target) return;
    const start = performance.now();
    const factor = Math.pow(10, Math.max(0, decimals));

    const tick = (now) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutQuart(t);
      const current = from + (target - from) * eased;
      const rounded = Math.round(current * factor) / factor;
      setValue(rounded);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, enabled]);

  return value;
}
