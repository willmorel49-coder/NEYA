/* ============================================================
   useReveal — détection d'entrée dans le viewport (IntersectionObserver)
   ============================================================
   Apporte le pattern "fade-in au scroll" sans lib externe.
   Retourne un ref à attacher à l'élément + un booléen `revealed`
   qui passe à true quand l'élément entre dans le viewport.

   Usage :
     const { ref, revealed } = useReveal({ threshold: 0.15 });
     <div ref={ref} className={revealed ? 'is-revealed' : 'pre-reveal'}>...

   Ou plus simple via le composant BlurFade :
     <BlurFade><MaCard /></BlurFade>

   Note : prefers-reduced-motion est honoré par les classes CSS,
   pas ici. Le hook reveal toujours, c'est l'anim CSS qui se
   désactive si l'utilisateur demande à réduire les animations.
   ============================================================ */

import { useEffect, useRef, useState } from 'react';

export default function useReveal({
  threshold = 0.15,
  rootMargin = '-5% 0px -10% 0px',
  once = true,
} = {}) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback : reveal immédiat (vieux Safari)
      setRevealed(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            if (once) obs.unobserve(entry.target);
          } else if (!once) {
            setRevealed(false);
          }
        });
      },
      { threshold, rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, revealed };
}
