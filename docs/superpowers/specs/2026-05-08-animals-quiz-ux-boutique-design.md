# NÉYA — Design Spec : Animaux-esprits · Quiz · UX · Boutique ÇA VA?

**Date :** 2026-05-08  
**Statut :** Approuvé par Will

---

## 1. Animaux-esprits par archétype

**Problème :** `cerf.svg` est affiché pour tous les archétypes, sans distinction.

**Solution :** Créer 4 composants SVG React inline — un par archétype — et remplacer toutes les références à `cerf.svg`.

| Archétype | Animal | Style SVG |
|---|---|---|
| resilience | Phoenix | Ailes déployées, corps en flammes abstraites, couleur gold |
| presence | Cerf | Version améliorée de cerf.svg, plus épuré et lumineux |
| sagesse | Loup | Silhouette géométrique, lignes fines, mystique, indigo |
| lumiere | Ours | Massif, rayonnant, bienveillant, magenta/rose |

**Composant :** `<SpiritAnimal archetype={key} size={n} style={...} />`  
**Utilisé dans :** `PatronusReveal`, `HomeScreen` (ring center), `TransitionScreen`

---

## 2. Quiz — feedback visuel par archétype

**Problème :** Sélectionner une réponse n'a pas d'impact visuel lié à l'archétype.

**Solution :** À la sélection d'un choix, un overlay coloré (tint) envahit doucement l'écran selon l'archétype du choix :
- resilience → gold `rgba(245,158,11,0.10)`
- presence → teal `rgba(20,184,166,0.10)`
- sagesse → indigo `rgba(99,102,241,0.10)`
- lumiere → rose `rgba(236,72,153,0.10)`

**Implémentation :** `QuizScreen` — ajouter un `div` overlay positionné `absolute inset-0` avec `opacity: 0 → 1` (transition 0.4s) quand `selected !== null`. Couleur = `ARCHETYPES[selected].color` à 10% opacité. Disparaît au changement de question.

---

## 3. UX app — lisibilité

**Problème :** Textes et quêtes difficiles à lire dans HomeScreen, Routines, Quêtes.

**Améliorations :**
- Cards HomeScreen : background opacity `0.05 → 0.09`, border plus visible
- Intention du jour : fontSize `15.5 → 17`, couleur `0.86 → 0.92`
- Cards Routines : titre `15 → 16`, description `13.5 → 14`, contraste amélioré
- Cards Quêtes : même traitement
- Section headers : letterSpacing réduit, fontSize légèrement augmenté
- Overlay global fond app : ajuster pour que le fond n'écrase pas les cards

---

## 4. Onglet Boutique ÇA VA?

**Structure :** 4ème tab dans `BottomNav` — icône sac/étoile, label "Boutique"

**Contenu :**
- Header éditorial avec logo ÇA VA? et tagline
- Section "Ta Collection" : la collection recommandée selon l'archétype de l'utilisateur est mise en avant
- Grille de collections (4 collections, une par archétype) :
  - "Collection Braise" → Porteurs de Feu (bg-feu.png)
  - "Collection Marée" → Ancreurs de Présence (bg-eau.png)
  - "Collection Brume" → Éveilleurs de Sens (bg-brume.png)
  - "Collection Forêt" → Créateurs de Lumière (bg-foret.png)
- Chaque card : image atmosphérique (bg existant), nom collection, description courte, CTA "Découvrir"
- CTA → `window.open('https://cava.fr', '_blank')` (URL placeholder, à mettre à jour)

**Design :** Même DA NÉYA — fond sombre, cards semi-transparentes, couleur archétype de l'utilisateur mise en avant sur la collection recommandée.

---

## Fichiers touchés

- `src/App.jsx` — tout (single-file discipline)
- Pas de nouveaux fichiers
