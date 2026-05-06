# NÉYA V1 — Design Spec

**Date** : 2026-05-07
**North star** : "Cette app me comprend."
**Philosophie centrale** : "Tu n'as pas besoin d'être vu pour exister."
**Anti-pitch** : Ce n'est pas un outil. C'est un lieu numérique émotionnel.

---

## Périmètre V1

Trois séquences, une seule traversée :

1. **Onboarding** — 3 écrans narratifs
2. **Le rituel** — couleur → texture → son (15 secondes)
3. **Le monde révélé** — Brume (un seul monde, ultra travaillé)
4. **Espace Vrai** — flux anonyme silencieux

Hors scope V1 : les 5 autres mondes, boutique ÇA VA?, mode crise, habitudes, profil.

---

## Stack

- **Vite** + **React** (JSX)
- Tout le code dans `App.jsx` (single-file discipline)
- `useState` / `useEffect` uniquement — zéro state manager, zéro router externe
- **Tailwind CSS via CDN** — zéro dépendance npm supplémentaire
- Sons : fichiers audio locaux, Web Audio API

---

## Architecture

```
App.jsx
├── STATE GLOBAL (useState)
│   ├── screen: "onboarding" | "ritual" | "world" | "vrai"
│   ├── step: 0-2 (onboarding) | 0-2 (ritual)
│   ├── ritual: { color, texture, sound, completedAt }
│   ├── world: "brume"  ← V1 : fixe
│   └── history: []     ← V1.1 : évolution silencieuse (prévu, vide pour l'instant)
│
├── DONNÉES STATIQUES
│   └── WORLDS = { brume: { palette, animal, phrases[], animationSpeed } }
│
├── COMPOSANTS (sections dans App.jsx)
│   ├── <Onboarding step={0|1|2} onNext />
│   ├── <RitualFlow step={0|1|2} state={ritual} onChange onComplete />
│   ├── <WorldReveal ritual={ritual} world={WORLDS.brume} />
│   └── <EspaceVrai ritual={ritual} />
│
└── NAVIGATION
    └── switch(screen) — fonction pure, pas de router
```

---

## Onboarding — 3 écrans

Transitions : dissolve lent (800ms), pas de slide. L'expérience respire.

**Écran 0 — La question**
- Fond `#050810`
- Silhouette fille cheveux bleus, vue de dos, centrée, plein écran
- Silence. Puis en fondu lent, Sora : *"Et toi, ça va vraiment ?"*
- Tap n'importe où pour continuer. Pas de bouton visible.
- Intention : léger inconfort. Pas d'UI agressive. Un moment suspendu.

**Écran 1 — Ce que NÉYA n'est pas**
- Trois lignes apparaissent l'une après l'autre, corps Inter, centré :
  - *"Pas une appli de méditation."*
  - *"Pas un journal."*
  - *"Pas un thérapeute."*
- Puis, Sora, légèrement plus grande :
  - *"Un espace pour ce que tu ressens vraiment."*
- Doit être **ressenti**, pas lu.

**Écran 2 — L'invitation**
- Le fond prend une légère chaleur ambrée — pas encore le monde, juste une promesse
- *"T'as pas besoin d'aller bien pour commencer."*
- Bouton discret : **Entrer** — typographié, pas un CTA classique

Principe clé : l'onboarding ne présente pas l'app. Il parle directement à la personne.

---

## Le rituel — couleur → texture → son

Un seul espace qui évolue. Pas de pages séparées — effet "le monde réagit à ce que tu ressens."

Transition entre steps : 600ms, respiration douce.

**Step 0 — Couleur**
- 8 cercles disposés librement (pas en grille parfaite)
- Teintes : bleu nuit, violet, rouge brique, ambre, vert mousse, gris perle, noir profond, blanc cassé
- **Pas de labels** — les couleurs restent émotionnelles et ambiguës. Jamais "triste", "stressé".
- Teintes légèrement organiques, poussiéreuses, vivantes — pas des aplats digitaux néon
- Au tap : le cercle pulse doucement, le fond commence à se teinter de cette couleur en plan lointain (très subtil)

**Step 1 — Texture**
- 6 mots seuls, Sora, espacés dans l'espace : `lourd · léger · rugueux · doux · chaud · froid`
- Pas d'icônes. Juste les mots, posés.
- Au tap : le mot choisi reste seul à l'écran pendant 800ms avant la transition. **Laisser exister ce mot.**
- Intention : "comment ça se ressent à l'intérieur ?" — contourne les défenses mentales

**Step 2 — Son**
- 4 ambiances jouées en loop court au tap : `pluie · vent · feu · silence`
- "Silence" représenté par une vague plate (conceptuellement plus fort que les autres)
- Exigences audio : sons texturés et imparfaits, volume très bas, loops non mécaniques, beaucoup d'air dans les samples
- Le son sélectionné continue en fond très bas dans le monde révélé — il laisse une trace émotionnelle

**Objet résultant :**
```js
{
  color: "#4f46e5",   // hex de la teinte choisie
  texture: "lourd",   // l'un des 6 mots
  sound: "pluie",     // "pluie" | "vent" | "feu" | "silence"
  completedAt: Date
}
```

---

## Le monde révélé — Brume

**La bascule**
Fondu au noir complet : 800ms. Pas de spinner. Pas de loading. Juste le noir — micro coupure mentale, respiration avant l'entrée dans l'espace intérieur.

**Le monde**
- Fond immersif plein écran — gradient pictural, matière quasi-liquide
- Palette Brume : `#0d1b2a`, `#1b2d4f`, `#2e4a7a` + variations selon ritual.color
- Le triplet module le rendu :
  - `texture: lourd` → animations lentes, fond plus dense
  - `texture: léger` → fond aérien, particules fines et rares
  - `sound: silence` → zéro son ambiant, seulement la respiration visuelle du fond

**L'animal — principes absolus**

L'animal était **déjà là**. Il n'apparaît pas. Il existait avant l'utilisateur. Le monde est vivant indépendamment de lui.

V1 : **cerf** (présence douce, ancienne, non-menaçante).

Direction artistique non-négociable :
- Sculpturale, éditoriale — penser galerie contemporaine, campagne photo, hoodie ÇA VA? dos
- Posture = expression émotionnelle. Un animal anxieux n'a pas "l'air stressé" — il a une posture tendue imperceptible, des mouvements retenus, une présence vigilante.
- Minimaliste. Presque immobile. Inoubliable plutôt qu'impressionnant.
- **Interdit** : effets magiques visibles, yeux lumineux clichés, aura énergétique, particules excessives, design jeu vidéo mobile, kitsch wellness

**La phrase**
- Apparaît 2 secondes après l'entrée dans le monde, lettre par lettre, Sora, blanc cassé
- Choisie selon le triplet parmi un pool de phrases
- Règles d'écriture :
  - Observe, ne diagnostique pas
  - Laisse de l'espace — ne nomme pas totalement l'utilisateur à lui-même
  - Aucune formulation "développement personnel" ou "Instagram thérapie"
  - Si une phrase semble conçue pour être repostée → la supprimer
  - Le monde comprend **partiellement**. Pas de scanner émotionnel parfait.

Exemples validés :
- *"Quelque chose en toi cherche le calme."*
- *"Tu portes quelque chose de lourd aujourd'hui. C'est réel."*

En bas, très discret : lien **Espace Vrai** — pas un bouton.

---

## Espace Vrai

**Ce qu'on voit**
Le fond du monde reste, atténué. L'Espace Vrai se pose dessus comme un calque.
Des formes colorées — petits cercles — qui dérivent lentement. Chaque cercle = la couleur choisie par quelqu'un d'autre aujourd'hui dans son rituel.

La couleur de l'user apparaît et rejoint le flux. **Pas d'animation "success". Pas de centrage. Pas de spotlight.** Elle dérive et devient une présence parmi les autres.

**Mouvement — exigences**

Chaque présence doit être organique, presque humaine :
- Certaines plus immobiles
- Certaines hésitantes
- Certaines proches, certaines isolées
- Des croisements lents, parfois des regroupements, parfois du vide
- **Pas de pattern mathématique.** Le flux ressemble à une météo émotionnelle collective.

Couleurs : grain, profondeur, opacité imparfaite, respiration lumineuse, diffusion douce. Pas des teintes Dribbble saturées.

**Ce qu'on ne voit pas**
Likes. Commentaires. Profils. Noms. Compteurs. Trending. Rien.

**Message implicite** : *"Tu n'es pas seul.e — et personne ne te regarde."*
**Message plus profond** : *"Tu n'as pas besoin d'être vu pour exister."*

V1 : le flux est **simulé localement** (quelques entrées fictives) — pas de backend.

---

## Données statiques

```js
const WORLDS = {
  brume: {
    palette: ["#0d1b2a", "#1b2d4f", "#2e4a7a"],
    animal: "cerf",
    animationSpeed: "slow",
    phrases: [
      "Quelque chose en toi cherche le calme.",
      "Tu portes quelque chose de lourd aujourd'hui. C'est réel.",
      "Il n'y a rien à résoudre pour l'instant.",
      "Tu peux rester ici un moment.",
      // ...
    ]
  }
}
```

---

## V1.1 — Évolution silencieuse (prévu, non bloquant)

Risque identifié : "magnifique la première semaine, passif ensuite."

La réponse **ne doit pas** être du gamification. Elle doit être :
- Le monde qui reconnaît doucement la présence au fil des jours
- Des variations rares et subtiles
- Des phrases qui réapparaissent différemment
- L'animal qui devient plus familier
- Des états émotionnels plus complexes selon l'historique
- Une mémoire silencieuse

Architecture prévue : `history: []` dans le state global — vide en V1, alimenté en V1.1.
Le rituel quotidien devient l'ouverture d'une fenêtre intérieure, pas la découverte de nouveau contenu.

---

## Principes de design transverses

- **Retenue absolue** : un élément générique détruit l'illusion. Une mauvaise animation, une phrase cliché, une texture "mobile app" — tout s'effondre.
- **Rythme volontaire** : on perd des utilisateurs impatients. C'est acceptable. On ne détruit pas l'identité émotionnelle pour optimiser la rétention.
- **Traversée continue** : pas des pages, une expérience. Le fond évolue, l'espace respire.
- **Ambiguïté préservée** : jamais de labels émotionnels explicites. La projection personnelle dépend de l'espace laissé.
