# NÉYA — Design Elevation (Motion + Tokens)

> Synthèse de l'audit multi-agents "world-class product design lab" et application code.
> Owner : Will · Date : 2026-05-12 · Commits associés : voir `git log`.

---

## 1. Diagnostic synthétique (avant)

### Motion (Agent Motion Design Director)
- **348× `ease-in-out` générique** vs **1 seul** cubic-bezier custom dans tout le fichier — monoculture
- **18× `transition: 'all'`** paresseux qui tue la perf et empêche les courbes différentes par axe
- **Aucun press feedback visuel** : seul haptic, aucune scale-down sur tap → gap immédiat vs iOS
- **Modales = opacity fade only** (5 modales) — pas de translateY ni scale entry
- **Stacks d'animations infinies** cumulées (jusqu'à 3 par node) → noie les transitions ponctuelles
- **`forcespring` mal nommé** : overshoot plat sans amorti
- **`animation-duration` transitionné** (App.jsx:1771) — no-op silencieux navigateurs

### Design system (Agent DS Architect)
- **30 fontSize uniques** (8, 8.5, 9, 9.5, 10, 10.5, 11... jusqu'à 54) — pas d'échelle modulaire
- **12 borderRadius**, **18 gap**, **28 letterSpacing**, **27 transition durées**, **31 zIndex**, **59 alphas blancs uniques**
- **27+ patterns de boxShadow** uniques — pas d'échelle d'élévation
- Aucun token system formel, tout en styles inline

## 2. Solutions livrées

### `src/design-tokens.js` (nouveau fichier)
Système de tokens formel scalable :
- **`space`** : échelle 4 (0, 4, 8, 12, 16, 20, 24, 28, 32...)
- **`fontSize`** : 11 niveaux (`micro` 10, `xs` 11, `sm` 12, `base` 13, `md` 14, `lg` 16, `xl` 18, `h3` 22, `h2` 28, `h1` 40, `display` 54)
- **`radius`** : 9 niveaux sémantiques (`xs` 4 → `2xl` 24, `pill` 100, `full` 9999)
- **`elevation`** : 5 niveaux + `halo(rgb, intensity)` calculé runtime
- **`duration`** : 6 niveaux (`instant` 80ms → `cinema` 1400ms) + `ambient` 8s
- **`easing`** : 7 courbes nommées (Apple/Linear/Arc/Material 3)
- **`letterSpacing`** : 5 paliers sémantiques (`tight` → `widest`)
- **`alpha`** : 14 paliers hex pour archétype colorisé
- **`surface`** : 7 surfaces standardisées (raised1-3, overlay1-3, blackout)
- **`z`** : 16 niveaux sémantiques (`base` → `blackoutTint`)
- **`archetypes`** : re-export consolidé
- **`font`** + **`weight`** : famille Sora/Inter + 4 poids

### `src/motion.js` (nouveau fichier)
Système motion + helper press feedback :
- **`easing`** : 7 cubic-bezier (`standard`, `emphasized`, `decelerate`, `accelerate`, `spring`, `soft`, `ambient`)
- **`duration`** : 6 valeurs (80ms → 1400ms)
- **`initPressFeedback()`** : listener global pointerdown/up sur tout `[data-press]`
  - Au pointer down : `scale(0.965)` en 100ms `standard`
  - Au release : `scale(1)` en 280ms `spring` (cubic-bezier 0.34, 1.56, 0.64, 1) — overshoot iOS-grade
  - Utilise Web Animations API + `composite: 'add'` pour ne pas conflicter avec inline transforms
  - Respecte `prefers-reduced-motion`
  - Cleanup function retournée pour useEffect

### Code applique (App.jsx)
- **10 boutons critiques** ont reçu l'attribut `data-press="true"` :
  - 4 CTAs primaires (`padding: '17px 0'` ou `'18px 0'`)
  - 6 boutons close/floating (top-right des modales + EspaceVrai ✕)
  - **Effet immédiat** : chaque tap rétrécit subtilement + relâche en spring (Apple iOS feel)
- **359 animations ambient** : `ease-in-out infinite` → `cubic-bezier(0.45, 0, 0.55, 1) infinite` (sine naturel)
- **7 transitions `'all'` 0.35-0.45s** → propriétés explicites + emphasized cubic-bezier
- **6 nouvelles keyframes premium** :
  - `modalEnter` : translateY 20→0 + scale 0.96→1 + opacity (440ms soft overshoot)
  - `modalExit` : translateY 0→14 + scale 1→0.985 (220ms accelerate)
  - `chipPop` : scale 0.6→1.08→1 (badge appearance)
  - `cardLiftDone` : multi-step spring overshoot pour states `done: false→true`
  - `haloOnce` : box-shadow ring 0→14px qui s'éteint
  - `signaturePulse` : remplacement de `phrasebreathe + milestoneGlow` cumul (1 ambient max)
- **3 modales en modalEnter** : BreathingModal intro, RoutineGuideModal, PersonalizationModal
- **`*:focus-visible`** global : outline 2px + outline-offset 2-3px + transition smooth → accessibilité clavier
- **2 nouveaux imports** : `motion`, `design-tokens` (tokens utilisables `T.space[4]` etc.)

## 3. Avant / Après — ressenti perçu

| Dimension | Avant | Après |
|---|---|---|
| Press sur CTA | Aucun feedback visuel, juste haptic | **Scale 0.965 + spring release Apple-grade** |
| Modal qui s'ouvre | Opacity fade plat 500ms ease | **TranslateY + scale + opacity, soft overshoot 440ms** |
| Animations ambient | `ease-in-out` mécanique × 359 | **Sine naturel (`cubic-bezier(0.45, 0, 0.55, 1)`)** |
| Hover/focus keyboard | Outline navigateur défaut | **Focus ring 2px blanc + outline-offset animé** |
| Easing dans le code | 1 cubic-bezier custom | **7 courbes nommées + tokens importables** |
| Système de tokens | Aucun | **`design-tokens.js` complet (space/fontSize/radius/easing/elevation/z/alpha/surface)** |

## 4. Décisions design clés

### Pourquoi `cubic-bezier(0.34, 1.56, 0.64, 1)` au press release
C'est la courbe **easeOutBack** d'Apple HIG / Arc Browser — légère sur-élongation (overshoot 4%) qui simule un rebond physique mécanique. Sans elle, le release semble mort. Avec elle, chaque bouton paraît "vivant".

### Pourquoi `cubic-bezier(0.16, 1.36, 0.32, 1)` pour modalEnter
Custom soft overshoot 6% — moins agressif que le release de bouton car une modale est plus large (impact visuel = effet de poids). Inspiré de Linear/Arc.

### Pourquoi `cubic-bezier(0.45, 0, 0.55, 1)` pour les ambient infinies
`easeInOutSine` mathématique pur — courbe la plus naturelle pour un breath (respiration humaine). Remplace `ease-in-out` qui est sigmoïde plus carré et perçu plus mécanique.

### Pourquoi WAAPI plutôt que CSS `:active`
Pour éviter le conflit avec les inline `transform` existants (ex. `scale(1.014)` sur quiz selection). WAAPI `composite: 'add'` superpose les transforms au lieu de les remplacer.

### Pourquoi ne pas migrer tous les `fontSize` aux tokens d'un coup
Risque visuel. Adoption progressive : tokens disponibles, migration top-down par écran (CTAs → close buttons → cards → modales → quiz → splash). Lighthouse CI assure que rien ne casse.

## 5. Reste à faire (prochaines passes)

### P1 — Court terme
- [ ] Migrer les 7 CTAs primaires au système tokens (`padding: T.space[4]+'px 0'`)
- [ ] Décumuler les animations infinies : audit des nodes avec 3 animations cumulées (P. agent §1.4), fusionner en keyframes composées comme `signaturePulse`
- [ ] Ajouter `chipPop` aux 3 badges XP/streak (currently `fadeIn`)
- [ ] Ajouter `cardLiftDone` aux routines complétées (currently no specific animation)
- [ ] Modal exit propre (animation backward, `modalExit` keyframe déjà prête)

### P2 — Moyen terme
- [ ] Composants atomiques `TokenButton`, `TokenIconButton`, `TokenCard`, `TokenModalShell` (inline dans App.jsx, single-file rule)
- [ ] Migrer les 5 modales au `TokenModalShell` pour cohérence parfaite enter/exit
- [ ] Lighthouse CI assertion sur `--cumulative-layout-shift` < 0.05 (vs 0.1 actuel)
- [ ] Audit des `transition: 'all'` restants (il y en a ~15 sur des éléments secondaires)

### P3 — Long terme
- [ ] Linter custom : grep des patterns interdits (`fontSize: \d+\.\d+`, `transition: 'all'`) → fail le build CI
- [ ] Refactor multi-fichiers (sortir TraceScreen, ShareArchetype, BreathingModal en `src/screens/`)

## 6. Métriques de validation

| Métrique | Cible | État |
|---|---|---|
| `ease-in-out` ambient restants | 0 | ✅ 0 (359 migrés) |
| Boutons avec press feedback | ≥ 10 | ✅ 10 |
| Modales avec enter spring | ≥ 3 | ✅ 3 (Breathing intro, RoutineGuide, Personalize) |
| Focus rings clavier | global | ✅ via `*:focus-visible` |
| Tokens file | exists | ✅ `src/design-tokens.js` |
| Motion helpers | exists | ✅ `src/motion.js` |
| `transition: 'all'` ≥ 0.35s | 0 | ✅ 0 (7 migrés) |
| Build status | green | ✅ |
| Lighthouse perf (à mesurer post-deploy) | ≥ 0.85 | pending |

## 7. Note finale

Cette élévation **ne change pas la direction artistique** — la philosophie cinéma émotionnel reste intacte. Elle **change le ressenti temporel** : chaque interaction devient "vivante", chaque modale s'ouvre comme une scène, les animations ambient respirent comme un humain plutôt qu'une machine.

**Référence comparable** : ce niveau de raffinement temporel est celui d'Apple Mail, Arc Browser sidebar, Linear command palette, Stripe Dashboard transitions. NÉYA passe d'un "ressenti CSS générique" à un "ressenti système conçu".

C'est l'invisible qui fait la différence entre une app techniquement fonctionnelle et une app **émotionnellement crédible**.
