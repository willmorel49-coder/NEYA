# NÉYA — Direction Artistique

> Skill lazy-loaded. Invoquer pour toute décision visuelle, palette, typographie, animation.

## Identité visuelle centrale

**NÉYA** est un espace émotionnel numérique, prolongement de la marque ÇA VA?.
North star : *"Cet endroit laisse exister ce que je ressens."*

---

## La fille de dos — personnage ancrage

**Le personnage** : Femme aux cheveux bleus électriques (bob court, teal/cobalt), vue de dos, tenue crème/blanc fluide.
Issue de l'identité ÇA VA? (modèle récurrent dans toutes les collections).

**Usage dans NÉYA** :
- Toujours de dos — jamais son visage
- Elle représente l'utilisateur·ice — pas un avatar, mais un miroir
- Posture calme, contemplative, rarement debout/active
- Présente sur l'écran 0 de l'onboarding, en arrière-plan du monde

**Fichiers de référence** (dans `NÉYA/image fond app/`) :
- `bg-onboarding.png` — fille meditant sur rocher, grotte avec eau et mandalas bleus *(sélectionné pour onboarding-0)*
- `bg-brume.png` — fille face au loup-esprit lumineux dans une grotte *(sélectionné pour monde Brume)*
- `bg-vrai.png` — fille debout dans l'eau avec orbes lumineux *(sélectionné pour Espace Vrai)*
- `2D6KeuIim-tSKHyM9Y_Hv.png` — fille au portail circulaire, forêt nocturne
- `JX30pc2e27rSsRUqw_ssG.png` — pont de pierre lavande avec lanternes
- `ZR4Kl5vvJgf1CR90O8tMw.png` — salle sombre avec livres flottants et lumière bleue
- `IroVYJ4E5Lq7K80e2m0yg.png` — corridor arrondi avec le mot "brume" flottant (NÉYA concept)
- `-4zvjzPXD7BSHUJWHfxp0.png` — fille de profil avec énergie cosmique

---

## Logo NÉYA

**Version officielle** (référence `PuIGbNuFqr3WSV9Rv8nFo.png`) :
- Fille de dos, enveloppée dans une cape violette, auréole lumineuse derrière elle
- "NÉYA" en Sora, blanc, sous la silhouette
- Usage : icône app, splash screen

**Version in-app** (mockups `09C20B0F-...PNG`) :
- Astérisque/étoile dorée au-dessus du wordmark "NÉYA"
- Blanc, minimal, centré en haut

**Logo arbre** (`logo neya arbre.png`) :
- Arbre-cerveau bleu/teal sur fond blanc
- Version branding alternatif — pas utilisé dans l'app V1

---

## Design system

### Palette Brume (V1)
```
Fond global :     #050810  (noir cosmique profond)
Indigo :          #6366f1
Magenta :         #ec4899
Teal :            #14b8a6
Gold :            #f59e0b

Brume palette :   #0d1b2a · #1b2d4f · #2e4a7a
Brume accent :    touches ambrées selon ritual.color
```

### Typographie
- **Display / titres** : Sora (font-light pour les phrases, aucune graisse excessive)
- **Body / labels** : Inter
- **Letter-spacing** : `tracking-[0.15em]` à `tracking-[0.3em]` — beaucoup d'air
- **Tailles** : Sobres. text-sm pour les CTAs, text-xl pour les phrases

### Couleurs rituelles
8 couleurs intentionnellement "poussiéreuses", pas des aplats néon :
```
nuit :   #1e1b4b   violet : #5b21b6   brique : #7f1d1d
ambre :  #92400e   mousse : #14532d   perle :  #374151
noir :   #0c0c0c   crème :  #ece8df
```
Appliqué avec `filter: saturate(0.7) brightness(0.85)` pour effet organique.

---

## Les animaux-esprits

**Principe absolu** : L'animal était déjà là. Il n'apparaît pas — il existait avant l'utilisateur.

**V1** : Cerf (douceur, présence ancienne, non-menaçante)
**Direction artistique** :
- Sculpturale, éditoriale — penser galerie contemporaine
- Minimaliste, presque immobile
- Lumineux mais sans effets "magic" kitsch
- Interdit : yeux lumineux clichés, aura visible, particules excessives

**Autres animaux potentiels** (futurs mondes) :
- Loup blanc lumineux (vu dans `bg-brume.png` — référence parfaite)
- Renard, corbeau, aigle
- Chacun reflète un état émotionnel, pas une personnalité

---

## Règles d'animation

- **Dissolve lent** : 800ms, jamais de slide
- **Respiration** : `breathe` keyframe — brightness 1 → 1.08 → 1, dur. 15-25s
- **Drift organique** : translations lentes (8-15px), jamais de rotation
- **Apparition texte** : lettre par lettre, 40ms/caractère
- **Mot isolé** (texture) : 800ms seul à l'écran avant transition
- **Principe** : aucune animation ne doit chercher à impressionner

**Interdit** :
- Animations > 25s sauf fond de monde
- Particles explosives
- Effets "wow" visibles
- Piano émotionnel / sound design méditation cliché

---

## Grain texture

Appliquer un filtre SVG grain sur l'ensemble pour l'effet "matière picturale" :
```jsx
<svg style={{display:'none'}}>
  <filter id="grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
    <feBlend in="SourceGraphic" mode="overlay"/>
  </filter>
</svg>
// Appliqué via style={{ filter: 'url(#grain)' }} sur les fonds à traiter
```

---

## Interdits absolus

- Ton clinique, médical, startup générique
- Classement, comparaison, validation publique
- Palette type Dribbble saturée
- CTA agressifs, boutons colorés standards
- Piano de méditation, sons new-age
- Spinner de chargement (silence = noir, pas d'attente visible)
- Notifications de rappel agressives, streaks culpabilisants
- Phrases Instagram-thérapie qui peuvent être repostées
