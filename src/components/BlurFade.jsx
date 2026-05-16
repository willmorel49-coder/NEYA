/* ============================================================
   BlurFade — apparition douce avec dissipation de flou
   ============================================================
   Composant léger qui enveloppe ses enfants et les fait
   apparaître avec un fade + blur + translation Y dès qu'ils
   entrent dans le viewport.

   Inspiration : magicui BlurFade (reproduit en CSS pur, sans lib).
   Compatible prefers-reduced-motion : l'animation est désactivée
   automatiquement par tokens.css si l'utilisateur le demande.

   Usage :
     <BlurFade>
       <MaSection />
     </BlurFade>

     <BlurFade delay={120}>
       <MonAutreSection />
     </BlurFade>

     <BlurFade as="section" delay={240} style={{...}}>
       ...
     </BlurFade>
   ============================================================ */

import useReveal from '../v2/hooks/useReveal';

export default function BlurFade({
  children,
  delay = 0,
  duration = 700,
  distance = 12,
  blur = 8,
  as: Tag = 'div',
  style,
  className,
  ...rest
}) {
  const { ref, revealed } = useReveal();

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: revealed ? 1 : 0,
        filter: revealed ? 'blur(0)' : `blur(${blur}px)`,
        transform: revealed ? 'translate3d(0, 0, 0)' : `translate3d(0, ${distance}px, 0)`,
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, filter ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: revealed ? 'auto' : 'opacity, filter, transform',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
