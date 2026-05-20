/* ============================================================
   ÇA VA ? — Design System V4 Unifié (barrel exports)
   ============================================================
   Composants atomiques partagés. Source de vérité pour tous les
   écrans de l'app. Toute incohérence visuelle doit passer par ici.
   ============================================================ */

export { default as Header } from './Header';
export { default as BackButton } from './BackButton';
export { default as GlassCard } from './GlassCard';
export { default as Eyebrow } from './Eyebrow';
export { default as HeroTitle } from './HeroTitle';
export { default as SectionTitle } from './SectionTitle';
export { default as Body } from './Body';
export { default as CTA } from './CTA';
export { default as Stat } from './Stat';
export { default as Overlay } from './Overlay';
export { default as Sheet } from './Sheet';
export { default as Modal } from './Modal';
export { default as Input } from './Input';
export { default as Textarea } from './Textarea';
export { default as FormField } from './FormField';
export { default as Toggle } from './Toggle';
export { default as Choice } from './Choice';
export { default as Toast } from './Toast';
export { ToastProvider, useToast } from './ToastProvider';

/* Phase 3 — primitives avancés */
export { default as Icon } from './Icon';
export { default as EmptyState } from './EmptyState';
export { default as Skeleton, SkeletonText, SkeletonCard } from './Skeleton';
export { default as Spinner } from './Spinner';
export { default as Badge } from './Badge';

export { tokens } from './tokens-ui';
