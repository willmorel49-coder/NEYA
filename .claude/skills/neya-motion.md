# NÉYA — Motion primitives (BlurFade + NumberTicker)

> Skill lazy-loaded. Invoquer pour les animations d'entrée et les nombres animés.

## Quand utiliser

- Faire apparaître une section/card avec une transition douce au scroll
- Animer un compteur de stats (jours, minutes, mondes, etc.)
- Apporter du "vivant" à une UI sans tomber dans le tape-à-l'œil

## Primitive 1 — BlurFade

Composant léger qui enveloppe ses enfants et les fait apparaître quand ils entrent dans le viewport.

### Fichiers
- `src/v2/hooks/useReveal.js` — détecte l'entrée via IntersectionObserver
- `src/components/BlurFade.jsx` — composant wrapper

### Usage

```jsx
import BlurFade from '../../components/BlurFade';

// Usage minimal
<BlurFade>
  <MaCard />
</BlurFade>

// Avec délai (utile pour stagger plusieurs éléments)
<BlurFade delay={120}>
  <MaSection />
</BlurFade>

// En remplacement d'un wrapper existant (garde les styles)
<BlurFade as="section" style={{ padding: 20, background: 'cream' }}>
  ...
</BlurFade>
```

### Props
- `delay` (default 0) — ms avant déclenchement
- `duration` (default 700) — durée de la transition
- `distance` (default 12) — déplacement Y en pixels
- `blur` (default 8) — intensité du flou de départ
- `as` (default 'div') — type d'élément HTML
- `style`, `className` — passthrough

### Anti-patterns
- ❌ Wrap chaque petit élément (sur-utilisation = saccadé)
- ❌ Délais > 600ms (l'utilisateur attend, frustration)
- ❌ Blur > 16px (trop flou, illisible)
- ❌ Sur les overlays/modales (déjà animées par useStandardOverlay)

### Quand l'utiliser
✓ Cards principales d'un écran (greeting, présence du jour, chemin poétique)
✓ Sections magazine (intermède photo, manifestes)
✓ Stats/chiffres d'un écran qui se charge

### Quand NE PAS l'utiliser
✗ Liste de boutons / nav / chips (trop de mouvements)
✗ Texte courant (illisible pendant l'anim)
✗ Photos full-bleed du hero (déjà cinématiques)

## Primitive 2 — useNumberTicker

Hook qui anime un nombre de 0 (ou valeur précédente) vers la cible avec easing easeOutQuart.

### Fichier
- `src/v2/hooks/useNumberTicker.js`

### Usage

```jsx
import useNumberTicker from '../hooks/useNumberTicker';

function StatJours({ value }) {
  const animated = useNumberTicker({ target: Number(value) || 0 });
  return <span>{animated}</span>;
}
```

### Options
- `target` — valeur finale
- `duration` (default 1200) — durée totale en ms
- `startOnMount` (default true) — démarre à 0 et anime vers target. Si false, set direct à target.
- `enabled` (default true) — désactive l'animation
- `decimals` (default 0) — nombre de décimales

### Comportements
- Réagit aux changements de `target` (relance l'anim vers la nouvelle valeur)
- Respecte `prefers-reduced-motion` (saut direct à la cible)
- Cleanup automatique de `requestAnimationFrame`

### Anti-patterns
- ❌ Animer toutes les valeurs numériques (sur-utilisation = bruit)
- ❌ Durée > 2000ms (l'utilisateur perd patience)
- ❌ Sur valeurs qui changent en temps réel rapide (clock, scroll, etc.)

### Quand l'utiliser
✓ Stats au mount d'un écran (jours connectés, minutes méditées)
✓ Compteur après une action importante (présence validée)
✓ Hero numérique premium (1€ reversé, 100% slow, etc.)

### Quand NE PAS l'utiliser
✗ Valeurs qui changent en input/saisie (Carnet char count)
✗ Valeurs temps-réel (horloge, scroll position)
✗ Valeurs négatives ou monétaires (utiliser format spécifique)

## DA — Cohérence avec NÉYA

Les 2 primitives respectent :
- `prefers-reduced-motion` (animations désactivées si demandé)
- Easing `cubic-bezier(0.16, 1, 0.3, 1)` (= ease-out iOS, doux et calme)
- Aucune dépendance externe (pas de framer-motion, pas de magicui)
- GPU-friendly (transform, opacity, filter uniquement)

## Référence pilote

- BlurFade : `src/v2/screens/Cocon.jsx` section "Ton chemin"
- useNumberTicker : `src/v2/screens/Cocon.jsx` composant MiniStat

Étendre progressivement sur les autres écrans selon les besoins, jamais en bloc.
