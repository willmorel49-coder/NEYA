# NÉYA — Motion System

> Directeur motion design : système de langage du mouvement.
> Objectif : mouvement comme signature émotionnelle, pas comme effet visible.

---

## 1. Philosophie

> "Le mouvement doit sembler naturel et presque invisible. L'utilisateur doit ressentir la qualité sans remarquer l'animation consciemment."

NÉYA n'est pas une démo Dribbble. Chaque mouvement :
- **rassure** (continuité spatiale)
- **guide** (focus / direction du regard)
- **récompense** (chipPop sur XP gain, cardLiftDone sur routine done)
- **respire** (ambient sine pour le breath, presencePulse pour halo)

Interdit : effets gratuits, bouncing excessif, scale > 1.08 (sauf moments milestones), durations > 600ms sur interaction.

---

## 2. Système temporel (tokens)

### Easings — `src/motion.js`

| Token | Cubic-bezier | Usage |
|---|---|---|
| `standard` | `0.4, 0, 0.2, 1` | entrée/sortie générique (Material 3) |
| `emphasized` | `0.22, 1, 0.36, 1` | importance, easeOutQuint, accents |
| `decelerate` | `0, 0, 0.2, 1` | élément qui entre dans l'écran |
| `accelerate` | `0.4, 0, 1, 1` | élément qui sort de l'écran |
| `spring` | `0.34, 1.56, 0.64, 1` | press release, badge pop (overshoot 4%) |
| `soft` | `0.16, 1.36, 0.32, 1` | modal entry (overshoot 6%, plus large=plus doux) |
| `ambient` | `0.45, 0, 0.55, 1` | boucles infinies (sine naturel) |

### Durations

| Token | Valeur | Usage |
|---|---|---|
| `instant` | 80ms | haptic visuel, focus ring |
| `fast` | 160ms | hover, focus, color swap |
| `base` | 240ms | press release, toggle, tab change |
| `slow` | 360ms | modal enter, card lift, accordion |
| `slower` | 500ms | page transition, world reveal |
| `cinema` | 1400ms | texte séquentiel onboarding |
| `ambient` | 8000ms+ | breath, float, glow |

### Hiérarchie temporelle (règle d'or)
```
feedback (≤80ms) < interaction (≤240ms) < entrance (≤500ms) < cinematic (≤1400ms) < ambient (∞)
```

---

## 3. Vocabulaire keyframes — `App.jsx <style>` block

### Ambient (boucles infinies — un seul par node max)

| Keyframe | Cycle | Effet | Usage |
|---|---|---|---|
| `bgbreathe` | 26-32s | scale(1.04) bg | Backgrounds plein écran |
| `phrasebreathe` | 14-60s | opacity 0.86↔1 | Textes ambiants |
| `signaturePulse` | 14s | scale 1.012 + opacity | **Remplace cumul phrasebreathe+milestoneGlow** |
| `worldglow` | 4-30s | opacity 0.5↔1 | Glow archétype |
| `presencePulse` | 3-7s | scale 1.07 + opacity | Halos, orbes |
| `seedPulse` | 2.6-5s | scale 1.32 + opacity | Points, étoiles |
| `animalfloat` | 18-26s | translateY -7px | Spirit animals |
| `animalbreathe` | 22s | opacity 0.88↔1 | Spirit + cocon items |
| `splashmote` | 18-44s | translateY -28px | Particules motes |
| `milestoneGlow` | 3.5-8s | opacity 0.82↔1 | Accents importance |

### Interaction (one-shot, fill: both)

| Keyframe | Durée | Easing | Usage |
|---|---|---|---|
| **`chipPop`** | 480-520ms | spring | Badges XP, chips streak, mood values |
| **`cardLiftDone`** | 540ms | spring | Routine card juste cochée (celebrate) |
| **`haloOnce`** | 1400ms | decelerate | Ring expansion (WorldUnlock orb, milestones) |
| **`forcespring`** | 540ms | spring | Card entry (Result forces, Quest cards) |
| **`breathExpand`** | 620ms | emphasized | CTA appear (WorldUnlock "Explorer") |
| **`streakIgnite`** | 800ms | spring | Milestone reach (futur : 7/14/30j) |
| `modalEnter` | 440ms | soft | 3 modales (Breathing intro, Routine, Perso) |
| `modalExit` | 320ms | accelerate | (défini, à wirer P2) |
| `sheetExit` | 320ms | accelerate | Bottom sheets |
| `xpToastIn` | 2200ms | composite | Toast XP (entrée snap + hold + sortie) |
| `tabslideIn` | 320ms | spring | Tab content switch (overshoot léger) |
| `fadeIn` | 0.6-1.8s | ease | Texte séquentiel onboarding |
| `lightFlash` | 700ms | ease | Flash all-routines-done |
| `choiceripple` | 600ms | ease-out | Quiz answer ripple |
| `forestMote` | — | — | Particules forêt |

### Cinematic (long, one-shot)

| Keyframe | Durée | Usage |
|---|---|---|
| `patronusRing` | 1.8-4s | PatronusReveal rings expansion |
| `patronusAnimal` | 2.4s | PatronusReveal animal reveal |
| `patronusParticles` | — | Ambient particles during reveal |
| `lightFlash` | 700ms | Flash on completion |

---

## 4. Système press feedback (Apple iOS-grade)

`initPressFeedback()` dans `src/motion.js` — listener global pointerdown/up.

**Élément avec `data-press="true"`** :
- Au `pointerdown` : `scale(0.965)` en 100ms `standard` cubic-bezier(0.4, 0, 0.2, 1)
- Au `pointerup` ou `pointercancel` : `scale(1)` en 280ms `spring` cubic-bezier(0.34, 1.56, 0.64, 1) — overshoot 4%
- WAAPI `composite: 'add'` → aucun conflit avec transforms inline existants
- Respecte `prefers-reduced-motion`

**Éléments câblés (10)** :
- 4 CTAs primaires (padding 17/18px 0)
- 6 close/floating buttons (top-right modales + EspaceVrai ✕ + WorldUnlock CTA + …)

---

## 5. Moments émotionnels — câblage motion

| Moment | Animation déclenchée | Pourquoi |
|---|---|---|
| Tap CTA | `data-press` scale 0.965 + spring release | Feedback tactile iOS |
| Hover/focus clavier | `*:focus-visible` outline 2px white + offset animé | Accessibilité WCAG |
| Toggle routine done | `cardLiftDone` 540ms spring | Récompense présence |
| XP gagné (toast) | `xpToastIn` 2.2s composite (snap-in + hold + accelerate-out) | Notification iOS-native |
| XP badge (Breathing outro) | `chipPop` 520ms spring | Apparition satisfaisante |
| Streak chip (EspaceVrai) | `chipPop` 480ms + ambient | Validation douce |
| World unlock orb | `haloOnce` 1400ms decelerate ring + presencePulse | Moment cérémoniel |
| World unlock CTA | `breathExpand` 620ms emphasized | Apparition après reveal |
| Routines all-done card | `forcespring` 540ms spring + ambient | Célébration jour complet |
| Modal ouverture (3) | `modalEnter` 440ms soft overshoot | Scène cinéma |
| Tab change | `tabslideIn` 320ms spring | Continuité spatiale |
| Quiz answer select | `choiceripple` 600ms + scale(1.014) | Engagement |
| EspaceVrai entry | Multi-stage typing + fade + halo | Sanctuaire |

---

## 6. Anti-patterns appliqués (déjà nettoyés)

- ❌ `ease-in-out` ambient → ✅ `cubic-bezier(0.45, 0, 0.55, 1)` (359 animations)
- ❌ `transition: 'all'` → ✅ propriétés explicites + cubic-bezier par axe
- ❌ Cumul `phrasebreathe + milestoneGlow + seedPulse` → ✅ `signaturePulse` unifié (3 nodes critiques migrés, ~30 restants P2)
- ❌ `forcespring` flat overshoot → ✅ 5-step physical spring amorti
- ❌ Press sans feedback visuel → ✅ `initPressFeedback` global WAAPI

---

## 7. Recommandations futures (P2/P3)

### P2 — Décumuler les ~30 nodes restants
Audit : 30+ nodes en `App.jsx` cumulent encore 2-3 animations infinies. Migrer en `signaturePulse` ou keyframe composée dédiée.

### P2 — Modal exit propre
`modalExit` + `sheetExit` keyframes définies. À wirer : intercepter `onClose`, set state `closing: true`, render avec `animation: 'modalExit 320ms accelerate'`, puis `onClose()` après animation. Permet exit propre vs cut.

### P3 — Scroll behaviors
- `scroll-behavior: smooth` sur les conteneurs scrollables
- IntersectionObserver pour stagger des cards entrant dans la viewport (RoutinesScreen, GrandVoyage)
- Parallax léger sur bg-image quand scroll

### P3 — Gesture animations
- Long-press visual feedback (ring expansion sous le doigt)
- Swipe-to-dismiss sur modales

### P3 — Streak milestones (J7/J14/J30)
Déclencher `streakIgnite` 800ms + particules + haptic [40, 80, 40, 80, 40] sur first-time milestone reach. Détecter via `localStorage` flag `neya_streak_milestones_reached`.

### P3 — Loading micro-experiences
- `ShareArchetype` "Composition…" : texte breathing + dots animés stagger
- `BreathingModal` orb pre-roll : pulse ramp-up 2s avant cycle 1

---

## 8. Métriques motion-quality

| Critère | Cible | État |
|---|---|---|
| `ease-in-out` ambient | 0 | ✅ 0 |
| `transition: 'all'` ≥ 0.3s | 0 | ✅ 0 |
| Boutons avec press feedback | ≥ 10 | ✅ 10 |
| Modales avec enter spring | ≥ 3 | ✅ 3 |
| Modales avec exit anim | ≥ 3 | ⏳ 0 (keyframe prête) |
| Keyframes premium câblées | 6 | ✅ chipPop, cardLiftDone, haloOnce, breathExpand, forcespring fix, signaturePulse |
| Focus rings | global | ✅ `*:focus-visible` |
| Press composite : 'add' | oui | ✅ |
| `prefers-reduced-motion` respect | global | ✅ |
| Tap target ≥ 44px | tous interactifs | ✅ post-cavalerie |

---

## 9. Hooks à venir (DX)

```jsx
// usage envisagé en P2 :
import { useAnimate, useStagger } from './motion'

const animate = useAnimate()
animate.in('modalEnter', ref)       // applique modalEnter au ref
animate.out('modalExit', ref).then(onClose)
useStagger(refs, 80)                // delay décalé entre items

// MotionContext pour respecter reduced-motion programmatiquement
const { reducedMotion, durations } = useMotion()
```

---

## 10. Référence visuelle

Niveau atteint : **Apple Mail / Arc Browser sidebar / Linear command palette / Stripe Dashboard**.

Le mouvement de NÉYA ne se voit pas. Il se ressent. Chaque tap répond, chaque modale s'ouvre comme une scène, chaque ambient respire à un rythme humain. **C'est devenu la signature émotionnelle du produit.**
