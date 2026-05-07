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

**Assets actifs dans `public/`** :
| Fichier | Usage actuel | Description |
|---|---|---|
| `bg-onboarding.png` | Onboarding écran 0 | Fille de dos méditant, grotte + mandalas bleus |
| `bg-brume.png` | Monde Brume (V1) | Fille face au loup-esprit lumineux dans une grotte |
| `bg-vrai.png` | Espace Vrai | Fille debout dans l'eau avec orbes lumineux |
| `bg-foret.png` | Monde Forêt (futur) | Arche végétale dorée, lierre, lucioles au lever du soleil |
| `bg-cosmos.png` | Monde Cosmos (futur) | Fille sur falaise surplombant vallée épique ("NÉYA" watermark) |
| `bg-feu.png` | Monde Feu/Lumière (futur) | Fille sur falaise avec anneau solaire doré, nuages |
| `bg-eau.png` | Monde Eau/Sérénité (futur) | Fille méditant face à piscine circulaire, lanternes, étoiles |
| `bg-vide.png` | Monde Vide/Blanc (futur) | Fille dans chambre minimaliste crème, lumière solaire |
| `bg-cosmos-alt.png` | Alternative Cosmos | Fille sur montagne avec orbes géométriques flottants (bleu, rouge, or) |

**Autres images notables dans `NÉYA/image fond app/`** :
- `IroVYJ4E5Lq7K80e2m0yg.png` — corridor arrondi avec "brume" flottant (concept NÉYA spécifique)
- `JX30pc2e27rSsRUqw_ssG.png` — pont de pierre lavande avec lanternes violettes
- `aY7isf7xUuqfEdr8ubbvI.png` — fille face à un arbre géant lumineux bleu (logo arbre-cerveau vivant)
- `ZR4Kl5vvJgf1CR90O8tMw.png` — salle sombre avec livres flottants, lumière bleue
- `ACevtnBtvNSsVXC-tNRcC.png` — mur de pierre avec centaines de fenêtres jaune-or (Feu/Lumière alt)
- `0m5ZgslVw6biW1oH4vrTC.png` — bibliothèque circulaire géante avec dôme étoilé (rituel texture)
- `AmIsEsacWY-u8477PzYZL.png` — salle avec faces-masques luminescentes neon (Espace Vrai alt)
- `GGv5YU89k5uKhO3cIBcq2.png` — fille devant anneau géant lumineux blanc (Vide alt)

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
