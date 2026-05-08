# NÉYA — Design Spec : Animations & Transitions

**Date :** 2026-05-08  
**Statut :** Approuvé par Will

---

## Groupe 1 — Animaux : float organique

**Problème :** `cerfdrift` = translateY(-6px) seul, sans âme.

**Solution :**
- Nouveau keyframe `animalfloat` : combine `translateY(-7px)` + `scale(1.028)` + `translateX(3px)` sur 18s ease-in-out infinite. Organique, pas mécanique.
- Nouveau keyframe `animalbreathe` : brightness 1 → 1.10 → 1 sur 22s.
- Remplacer `animation: 'cerfdrift ...'` par les deux nouveaux sur tous les `SpiritAnimal` usages (TransitionScreen, PatronusReveal, HomeScreen).

---

## Groupe 2 — Transitions écran/tabs

**Blackout coloré :**
- Dans `go()`, quand `archetype` est connu, le blackout overlay reçoit `background: arch.color` à 10% d'opacité en plus du `#050810`. Subtil mais émotionnel.
- Implémentation : changer le style du div blackout pour inclure `background: archetype ? \`linear-gradient(rgba(5,8,16,1), rgba(5,8,16,1))\`` ... en fait plus simple : ajouter un second div overlay de couleur qui pulse pendant le blackout.

**Tab transitions :**
- Nouveau keyframe `tabslideIn` : `translateX(10px) opacity:0 → translateX(0) opacity:1`, 220ms ease-out.
- Appliquer sur le wrapper de contenu dans `MainApp` (le div `flex:1` avec `opacity: tabVis`). Ajouter `animation: tabVis ? 'tabslideIn 0.22s ease-out' : 'none'`.

**ResultScreen phases :**
- Ajouter `transform: phaseVis ? 'scale(1)' : 'scale(0.97)'` au wrapper de contenu de chaque phase, en plus de l'opacité existante. Transition `transform 0.32s ease`.

---

## Groupe 3 — Feedback interactif

**Quiz ripple :**
- Nouveau keyframe `choiceripple` : cercle SVG ou div qui s'étend de scale(0) à scale(2.5) et disparaît en opacity 0, 600ms.
- Dans `QuizScreen`, au moment de la sélection (`onClick`), afficher temporairement un div overlay centré sur le bouton avec cette animation.
- Plus simple : ajouter sur le bouton lui-même un `::after` — mais pas de CSS modules. Alternative : state `rippleIdx` qui active une animation sur le choix sélectionné.

**Forces cards spring :**
- Nouveau keyframe `forcespring` : `translateY(20px) opacity:0 → translateY(-4px) opacity:0.8 → translateY(0) opacity:1` (0%→70%→100%).
- Remplacer `transition: 'opacity 0.44s ease, transform 0.44s ease'` des forces cards par `animation: forcesShown > i ? \`forcespring 0.5s ease forwards\` : 'none'` avec delay `i * 120ms`.

**Boutique stagger :**
- Sur `BoutiqueScreen`, les cards `otherCollections` s'animent avec `animation: tabslideIn` + delay `i * 80ms` à l'entrée.

---

## Groupe 4 — Ambiance monde (main app)

**World glow pulse :**
- Dans `MainApp`, ajouter un div overlay `position:absolute inset:0 pointerEvents:none` avec `background: radial-gradient(ellipse at center, arch.color + '0f' 0%, transparent 65%)`.
- Nouveau keyframe `worldglow` : opacity 0.5 → 1 → 0.5.
- Période par monde : `{ brume: 30, feu: 8, foret: 18, eau: 24, cosmos: 42, vide: 60 }` → utiliser `arch.bg` pour déduire le monde.

**Presence ring shimmer :**
- Nouveau keyframe `ringshimmer` : un div positionné sur le ring qui effectue une rotation complète (360deg) sur 8s, avec un gradient conique `transparent 60% → white 78% → transparent 84%` à opacité 0.15. Effet de glint discret.
- Ajouté dans `HomeScreen` par-dessus le `PresenceRing`.

---

## Contraintes DA (non-négociables)
- Aucune animation > 25s sauf fonds (autorisé)
- Pas de rotation sur les animaux
- Pas d'effets "wow" visibles — tout doit sembler naturel
- Transitions entre écrans : dissolve, jamais de slide agressif
