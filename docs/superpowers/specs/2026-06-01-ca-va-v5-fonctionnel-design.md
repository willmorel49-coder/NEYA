# ÇA VA? V5 — Polish fonctionnel (post-audit cavalerie)

**Date** : 2026-06-01
**Branche cible** : `fix/v5-fonctionnel`
**Statut** : Spec validé, prêt pour writing-plans

---

## 1. Objectif

Après la livraison V5 Constellation (38 commits, prod live), un audit fonctionnel mené en cavalerie (6 sub-agents Opus en parallèle, 6 angles non-chevauchants : onboarding · ciel · refuge · voix+marque · navigation+data · PWA+iOS) a remonté **35 findings** dont **7 CRITICAL** (plantes / data corrompue) et **16 HIGH** (fonctionnel cassé).

Ce cycle livre **les 23 fixes CRITICAL + HIGH** (Phase 1+2) sur une seule branche pour rendre l'app « ultra fonctionnelle » bout en bout. Les 12 MEDIUM/LOW sont volontairement reportés à un cycle ultérieur (notés en section 8).

---

## 2. Cœur produit (rappel)

> « ÇA VA? est l'application faite pour ceux qui disent ça va quand ça ne va pas. »

Métaphore : chaque moment posé = une étoile. L'expérience repose sur une **fiabilité totale du flow** (pose étoile, navigation, persistance) — un crash, une étoile perdue, ou un tap raté brise la magie. C'est le sujet de ce cycle.

---

## 3. Architecture / découpage en 6 groupes

Le découpage privilégie le **domaine** (file ownership exclusif) plutôt que la sévérité, pour permettre une cavalerie d'implémentation parallélisable sans conflit de merge. Chaque groupe ≈ 4 fixes, 1 branche commune, 1 commit atomique par fix.

| Groupe | Domaine | Fixes | Effort |
|---|---|---|---|
| **A** | Onboarding | 4 | S |
| **B** | Ciel + StarField + Touch | 5 | S |
| **C** | Refuge (Méditation, Cocon, Carnet, Breathing) | 5 | M |
| **D** | CaVa (Marque) | 3 | S |
| **E** | Data integrity (state, stars, migration) | 4 | M |
| **F** | Navigation globale + iOS | 2 | XS |

**Total** : 23 fixes, ~8h d'implémentation estimées.

---

## 4. Détail par groupe

### Groupe A — Onboarding (4 fixes)

**Fichiers** : `src/components/onboarding/OnboardingFlow.jsx`, `OnboardingScreen.jsx`, `onboardingContent.js`, `onboarding.module.css`, `src/components/ui/PoseEtoileModal.jsx`

#### A1 [CRITICAL — C7] Étape 8 : tap-droite désactivé sans feedback si modal fermée sans pose
- **Symptôme** : user ferme la modal PoseEtoile sans poser → `handleRightTap` return tôt (`OnboardingScreen.jsx:57`) → l'utilisateur est bloqué, seul le bouton "Passer" reste, qui termine TOUT l'onboarding sans poser d'étoile.
- **Fix** : sur écran type `pose-star`, si modal fermée sans pose, afficher un CTA visible « Pose ta première étoile » qui ré-ouvre la modal. Tap-droite reste désactivé mais accompagné d'un hint « Pose ton étoile pour continuer ».

#### A2 [HIGH — H9] Double-tap pendant transition saute 2 étapes
- **Symptôme** : `OnboardingFlow.jsx:42-58` — `goNext` capte `active` via closure, scroll smooth + listener scroll debounce 60ms → 2 taps rapides envoient des index incohérents.
- **Fix** : guard `isScrolling` (useRef) à `true` au début de `scrollToIndex`, `false` au scroll end (event listener avec timeout 350ms). `handleRightTap` early-return si `isScrolling.current`.

#### A3 [HIGH — H10] Préférences 5/6/7 non modifiables après visite
- **Symptôme** : `OnboardingScreen.jsx:39-47,56` — pas de `aria-pressed`/style sélectionné, pas de skip si déjà choisi. User qui revient ne voit pas son choix et est obligé de re-cliquer.
- **Fix** :
  - Sur chaque `choice`, calculer `isSelected = profile.preferences[preferenceKey] === choice.value` (normalisé).
  - Style sélectionné (border accent + background tint + ✓).
  - `aria-pressed={isSelected}`.
  - `handleRightTap` sur `preference` : si déjà sélectionné, passer à l'étape suivante au lieu de return tôt.

#### A4 [HIGH — H11] Bouton "Passer" global perd toute progression sans warning
- **Symptôme** : `OnboardingFlow.jsx:30-40,103-113` — `Passer` termine tout sans confirmation. User qui a fait 4 étapes perd l'étoile à poser.
- **Fix** :
  - Renommer bouton selon contexte : sur écrans narratifs (1-4) → label `Passer l'introduction` ; sur écrans préférence (5-7) → label `Passer cette étape` (avance d'1 cran, ne `finish()` pas) ; sur écran 8 → bouton masqué (user doit poser).
  - Si label = `Passer l'introduction` et user a déjà fait des choix preferences, afficher confirm natif `confirm('Tu vas passer l'introduction. Tes choix sont gardés. OK ?')`.

---

### Groupe B — Ciel + StarField + Touch (5 fixes)

**Fichiers** : `src/v2/screens/Ciel.jsx`, `src/components/ui/StarField.jsx`, `src/components/ui/Star.jsx`, `src/components/ui/PoseEtoileModal.jsx`, `src/v2/helpers/chapter-generator.js`, `src/v2/helpers/stars.js`

#### B1 [CRITICAL — C1] Touch targets étoiles 4-12px (vs 44 min iOS HIG)
- **Symptôme** : `Star.jsx:39-54` rend `<button>` avec `width:size, height:size` direct. Pour size 4 ou 9, tap rate de l'ordre de ⅓ — étoile aujourd'hui inatteignable au pouce.
- **Fix** :
  - Quand `Star` est `interactive` (a `onTap`), wrapper le `<button>` dans un container `display:inline-flex` avec `padding` minimum pour atteindre 44×44 zone tactile, mais visuel reste size.
  - Alternative simple : `position:relative` + pseudo `::before` avec `inset:-${(44-size)/2}px` pour étendre la hit-zone sans changer le rendu.
  - Implémentation retenue : étendre via padding sur le `<button>` lui-même, le visuel SVG/dot reste centré au milieu de la zone.

#### B2 [CRITICAL — C2] Crash écran blanc si étoile sans `citation`
- **Symptôme** : `PoseEtoileModal.jsx:315-329` (StepBorn) accède `star.citation.text` et `star.citation.author` direct. Si étoile corrompue (migration partielle, données pré-V5), TypeError → écran blanc modal.
- **Fix** : guard `star?.citation?.text` + fallback inline « ✦ » si absent. Pareil pour `author`. Ajouter `try/catch` autour du render StepBorn par défense.

#### B3 [HIGH — H1] FAB inversé + `addStar` non idempotent
- **Symptôme** : `Ciel.jsx:205` — FAB visible UNIQUEMENT si `posed=true` (intuition inversée : on s'attend à voir un + pour poser, pas pour re-poser). Pire : taper le FAB rouvre la modal et pose une 2e étoile pour le même jour → `getDominantColor` et `chapter-generator` faussés.
- **Fix** :
  - `addStar` (dans `stars.js`) devient idempotent par jour : si `hasStarToday()` true, refuser ou mettre à jour l'étoile existante (au choix : refuser, plus simple).
  - FAB visible TOUT LE TEMPS (un seul + pour poser ou voir l'étoile du jour). Si `posed`, son label devient « Voir mon étoile » et son tap ouvre la modal en mode lecture (montre l'étoile + citation, pas de pose).
  - PoseEtoileModal accepte une prop `mode='pose' | 'view'`. En `view`, on saute step 1+2 et on va direct à StepBorn avec l'étoile du jour.

#### B4 [HIGH — H2] `onTapStar` no-op rend étoiles passées comme `<button>` non-actionnable
- **Symptôme** : `Ciel.jsx:137-139` passe `onTapStar={() => {}}` — TRUTHY → Star rend `<button>` focusable mais sans action. UX morte + a11y dégradée.
- **Fix** : ne PAS passer `onTapStar` du tout pour l'instant. Star rend `<span>` quand pas de `onTap` (vérifier que `Star.jsx` gère ce cas — sinon le faire).

#### B5 [HIGH — H3] Chapitre "Pièce" : `Math.random()` non seedé + image 404 possible
- **Symptôme** : `chapter-generator.js:123-125` — `Math.random()` choisit la citation, et le path fallback `marque-${(c.id*7)%122+1}` peut tomber sur 025/026 qui n'existent pas dans `marque-manifest.js`.
- **Fix** :
  - Remplacer `Math.random()` par un index déterministe : `hashSeed(userId + dayIndex()) % citations.length`.
  - Avant de retourner `media`, vérifier que le path existe dans `MARQUE_IMAGES` (sinon `media = null`, le chapitre s'affiche sans image plutôt qu'avec une image cassée).

---

### Groupe C — Refuge (5 fixes)

**Fichiers** : `src/v2/screens/Refuge.jsx`, `Meditation.jsx`, `BreathingPause.jsx`, `Carnet.jsx`, `Cocon.jsx`

#### C1 [CRITICAL — C3] `worldKey="violet"` inexistant → souvenirs erronés « Forêt »
- **Symptôme** : `Refuge.jsx:24` passe `<Meditation worldKey="violet" />`, mais `WORLDS["violet"]` n'existe pas (clés réelles : foret/temple/oasis/lac/montagne/communaute). `Meditation.jsx:38` fallback silencieusement sur Forêt → souvenir « Découverte de Forêt » faux, `completeMeditation` débloque le mauvais monde.
- **Fix** :
  - Option retenue : ajouter un **mode neutre** à `Meditation`. Quand `worldKey` est absent ou inconnu, fonctionner en mode « méditation libre » : pas de world unlock, pas de souvenir attribué à un monde précis (souvenir générique « Tu t'es posé·e X minutes » ou pas de souvenir du tout pour éviter de polluer).
  - Refuge passe `<Meditation mode="free" />` (pas de worldKey).
  - `Meditation.jsx` traite `mode === 'free'` comme cas dédié : pas de `completeMeditation(world, ...)`, pas de `addSouvenir` lié à un monde.

#### C2 [HIGH — H6] Carnet auto-close 700ms cache le toast + double-save possible
- **Symptôme** : `Carnet.jsx:174-177` — `safeTimeout(onClose, 700)` ferme avant que toast soit lu. Si user re-tape « Garder » dans le délai, double-save.
- **Fix** :
  - Guard local `saved=true` au début de `handleSave`, return early si déjà true.
  - Augmenter le délai close à 1400ms (le temps que le toast soit visible).
  - Ou alternative plus simple : pas d'auto-close, le toast reste visible et l'utilisateur ferme manuellement quand il veut (mais ça change l'UX — on garde l'auto-close mais à 1400ms).

#### C3 [HIGH — H7] BreathingPause monté à 2 endroits avec props inconsistantes
- **Symptôme** : `Refuge.jsx:25` `<BreathingPause />` sans accent, `Cocon.jsx:464` `<BreathingPause accent={...} />`. Visuel divergent selon le chemin d'ouverture.
- **Fix** : `BreathingPause` reçoit toujours un `accent` (default `'rose'` si absent). `Refuge.jsx:25` passe `accent="rose"` explicite pour cohérence.

#### C4 [HIGH — H8] Bouton retour Cocon overlay risque de chevaucher « Personnaliser » ⋯
- **Symptôme** : `Refuge.jsx:30-61` superpose un bouton retour `position:absolute top:8 left:12` au-dessus de la TopBar Cocon qui contient « ⋯ » à droite. Hit-zone du retour est proche de la zone « Personnaliser » → risque de tap erroné.
- **Fix** :
  - Bouton retour reçoit un background opaque glass (rgba 0.9) avec border léger pour le distinguer visuellement de la TopBar Cocon.
  - Augmenter `padding` du bouton pour bien marquer sa zone tactile sans déborder à droite de « ÇA VA? » titre.
  - Vérifier visuellement que la zone du bouton retour ne dépasse pas 60px de largeur depuis la gauche.

#### C5 [HIGH — H16] Carnet sans `WebkitOverflowScrolling: 'touch'` → scroll sans momentum iOS
- **Symptôme** : `Carnet.jsx:279` — seul écran V5 sans la propriété. Confirmé par grep.
- **Fix** : ajouter `WebkitOverflowScrolling: 'touch'` au container scrollable du Carnet.

---

### Groupe D — CaVa (Marque) (3 fixes)

**Fichiers** : `src/v2/screens/CaVa.jsx`, `src/v2/data/marque-manifest.js`

#### D1 [CRITICAL — C4] MarqueImageViewer swipe au-delà des 30 photos chargées
- **Symptôme** : `CaVa.jsx:189` `useState(30)` pour `marqueVisible`, `:290-296` passe `MARQUE_IMAGES` complet au viewer. Compteur affiche `n/122` même si seules 30 sont chargées dans la mosaïque.
- **Fix** : passer `images={MARQUE_IMAGES.slice(0, marqueVisible)}` au viewer. Quand viewer ferme sur index N > marqueVisible, ne rien faire de spécial (le viewer ne montrera plus que ce qui était chargé). Optionnel : auto-déclencher `loadMoreMarque()` quand l'index approche de `marqueVisible - 3` pendant qu'on est dans le viewer.

#### D2 [HIGH — H4] Bouton Retour fixed `zIndex:80` recouvre TopBar « ÇA VA? »
- **Symptôme** : `CaVa.jsx:223-255` (bouton retour) et `:305-333` (TopBar avec label) se superposent en haut à gauche.
- **Fix** : supprimer le bouton retour standalone et l'intégrer comme `leftSlot` de la TopBar (ou réutiliser le composant `Header` du DS). Le label « ÇA VA? » reste, le bouton retour devient « ← » à sa gauche dans la même ligne. Plus aucun conflit z-index.

#### D3 [HIGH — H5] Mini-nav 5 anchors annoncée commentaire mais jamais codée
- **Symptôme** : `CaVa.jsx:9` commentaire `Mini-nav templates sticky (5 anchors)` mais aucun composant existant. Les `id="chap-anxiete|fruits|essentiels|univers|voix"` existent dans le DOM mais ne sont jamais ciblés.
- **Fix** :
  - Ajouter une nav sticky sous la TopBar : 5 pills horizontales scrollables (`anxiété | fruits | essentiels | univers | voix`).
  - Chaque pill = `<a href="#chap-XXX">` avec `scrollIntoView({ behavior: 'smooth' })` au clic.
  - Highlight de la pill active selon `IntersectionObserver` sur les sections.

---

### Groupe E — Data integrity (4 fixes)

**Fichiers** : `src/v2/state.js`, `src/v2/helpers/stars.js`, `src/v2/helpers/migrate-v4-to-v5.js`

#### E1 [CRITICAL — C5] `setProfile` race condition last-write-wins
- **Symptôme** : `state.js:121-128` + `stars.js:82-85` — `getProfile()` lit snapshot A, écrit `next` sans relecture. Si autre handler écrit entre-temps (event sync `cava:profile-changed`), perte.
- **Fix** :
  - Introduire une fonction `mutateProfile(updater)` dans `state.js` qui : (1) lit le profile fresh, (2) applique l'updater, (3) écrit. Atomique.
  - `addStar`, `patchProfile`, `addSouvenir`, etc. utilisent `mutateProfile`.
  - `setProfile` brut reste exporté pour usage en lecture/écriture totale, mais est marqué `@deprecated for mutation, use mutateProfile`.

#### E2 [CRITICAL — C6] `getUserId()` régénérable → constellation visuellement change + plus de re-migration
- **Symptôme** : `stars.js:13-20` génère UID à la volée et le persiste dans `cava_v5_uid`. Si user clear cette clé seule (debug/incident), nouveau UID → toutes les positions étoiles recalculées (constellation visuellement différente).
- **Fix** :
  - **Persister `x, y` directement sur chaque étoile** au moment de la pose (calculer une fois via `positionForStar(starId, userId)` puis stocker dans `star.x, star.y`).
  - `StarField` priorise `star.x, star.y` s'ils existent, sinon fallback sur le calcul à la volée (rétrocompat pour étoiles antérieures).
  - Migration douce au boot : si `star.x` absent, calculer une fois et muter.

#### E3 [HIGH — H12] Migration V4→V5 doublons possibles
- **Symptôme** : `migrate-v4-to-v5.js:21-68` — `newStars = [...stars, ...migrated]` sans dédup.
- **Fix** : avant le `push`, `const existingIds = new Set(stars.map(s => s.id))`, filtrer `migrated.filter(m => !existingIds.has(m.id))`.

#### E4 [HIGH — H13] `addStar` collisions id si writes < 1ms
- **Symptôme** : `stars.js:73` — `Date.now().toString(36)` peut coïncider.
- **Fix** : id = `star-${date}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}` (composant random comme `addSouvenir`).

---

### Groupe F — Navigation globale + iOS (2 fixes)

**Fichiers** : `src/v2/App.jsx`, `src/v2/screens/Espaces.jsx`, `src/v2/hooks/useSeasonalPalette.js`, `index.html`

#### F1 [HIGH — H14] Back Android ferme l'app + pas de deeplink sub-route
- **Symptôme** : `App.jsx:113` + `Espaces.jsx:22-26` — aucun listener `popstate`. Back navigateur ferme tout au lieu de remonter d'un cran.
- **Fix** :
  - Au boot, `history.replaceState({ tab: 'ciel' }, '', '#ciel')`.
  - À chaque changement de tab ou sub-route : `history.pushState({ tab, subroute }, '', '#tab[/subroute]')`.
  - Listener `popstate` lit le state et reapplique `setActiveTab` + `setActive` en conséquence.
  - Deeplink URL `#refuge` au boot : parse hash → set active = refuge automatiquement.

#### F2 [HIGH — H15] `theme-color` figé ignore `data-season`
- **Symptôme** : `index.html:9` — `meta[name="theme-color"]` constant. `useSeasonalPalette.js` change `data-season` sur `<html>` mais ne touche pas la meta.
- **Fix** : étendre `useSeasonalPalette` pour aussi muter `document.querySelector('meta[name="theme-color"]').setAttribute('content', SEASON_COLORS[season])`. Définir 4 couleurs cohérentes avec les saisons (hiver/printemps/été/automne).

---

## 5. Acceptance criteria (par groupe)

**Groupe A — Onboarding**
- [ ] User peut faire onboarding A→Z sans jamais être bloqué
- [ ] User peut revenir en arrière et voir son choix précédent (preferences 5/6/7)
- [ ] Bouton « Passer » est explicite sur ce qu'il fait à chaque étape
- [ ] Double-tap rapide n'avance que d'1 étape

**Groupe B — Ciel + Touch**
- [ ] Toutes les étoiles ont une hit-zone ≥ 44×44 px
- [ ] Pas de crash si étoile sans citation (fallback gracieux)
- [ ] Pose d'étoile : 1 seule par jour (idempotent) ; FAB toujours visible
- [ ] Étoiles passées : pas de `<button>` mort
- [ ] Chapitre « Pièce » : image qui existe toujours (ou pas d'image), citation stable

**Groupe C — Refuge**
- [ ] Méditation depuis Refuge : mode libre, pas de souvenir « Forêt »
- [ ] Carnet : sauvegarde unique, toast visible 1.4s, scroll fluide momentum iOS
- [ ] BreathingPause : accent cohérent quel que soit le chemin
- [ ] Bouton retour Cocon : visuel distinct, pas de chevauchement « ⋯ »

**Groupe D — CaVa**
- [ ] Mosaïque + viewer cohérents : si 30 chargées, viewer ne montre que 30
- [ ] Bouton retour intégré à TopBar, plus de superposition
- [ ] Mini-nav 5 anchors visible et fonctionnelle (scroll au chapitre + highlight)

**Groupe E — Data**
- [ ] Race condition `setProfile` éliminée (`mutateProfile` atomique)
- [ ] Étoiles ont `x, y` persistés (constellation stable même si UID change)
- [ ] Migration V4→V5 : pas de doublon possible
- [ ] `addStar` IDs uniques garantis

**Groupe F — Nav + iOS**
- [ ] Back Android remonte d'un cran (sub-route → Espaces → Ciel → ferme)
- [ ] URL `#refuge` au boot ouvre Espaces > Refuge directement
- [ ] Status bar iOS change de couleur selon saison

---

## 6. Mode autonome (deploy)

Conformément à `feedback_autonomous_mode` (CLAUDE.md) :
- Branche `fix/v5-fonctionnel` créée localement
- 23 commits atomiques (1 par fix, ordre groupe A→F)
- Build clean `npm run build` validé avant chaque push de groupe
- À la fin : `git push origin fix/v5-fonctionnel` → merge sur `main` → `vercel --prod --yes` → vérif `curl -sI https://neya-kappa.vercel.app | head -1` retourne 200
- Récap à Will avec lien clickable + résumé

---

## 7. Plan d'implémentation (séquencement)

Implémentation séquentielle des groupes (pas parallèle) pour éviter conflits de merge sur fichiers partagés (notamment `state.js` touché par E1+E2+E4 et lu par tout le reste) :

1. **Groupe E (Data integrity)** en premier — fondation. Tous les autres groupes en dépendent.
2. **Groupe A (Onboarding)** — indépendant après E.
3. **Groupe B (Ciel)** — dépend de E pour `addStar` idempotent et `mutateProfile`.
4. **Groupe C (Refuge)** — indépendant après E.
5. **Groupe D (CaVa)** — indépendant.
6. **Groupe F (Nav + iOS)** — dernier, touche `App.jsx` (racine).

Chaque groupe peut être délégué à un sub-agent implémenteur foreground, avec spec compliance review + code quality review (skill `superpowers:subagent-driven-development`).

---

## 8. Hors scope (cycle ultérieur V5.2)

Les 12 findings MEDIUM/LOW de l'audit ne sont pas traités dans ce cycle :

- `AmbianceAudio` leak audio context si toggle off mid-session
- `useDailyStarStatus` deps stale
- Cocon items togglePlaced (régression V6 — à confirmer avec Will : feature retirée volontairement ou bug ?)
- Méditation pollue Souvenirs « Forêt » (sera partiellement résolu par C1)
- Voix `useMemo([composerOpen])` deps invalides
- Voix `daysAgo` négatif si horloge recule
- Onboarding `aria-current` + tab order
- Refresh page perd nav onboarding (`localStorage.set('onboarding_step', i)`)
- BottomNav haptic spam tap rapide
- `profile.stars` sans cap → quota localStorage (ajouter `STARS_MAX = 500`)
- Prompt installer PWA `beforeinstallprompt`
- Script purge SW au boot reload chaque rebrand
- `user-scalable=no` nuit a11y
- Manifest marque saute 025/026

---

## 9. Risques connus

- **State mutation race** (E1) : refacto profond de `state.js`, peut casser des handlers existants. Mitigation : `mutateProfile` est ajouté à côté de `setProfile`, migration progressive groupe par groupe, `setProfile` reste fonctionnel pour rétrocompat.
- **Constellation visuelle change** pour utilisateurs existants si on backfill `x, y` (E2) : actuellement la constellation est recalculée à chaque render, donc backfill ne devrait rien changer pour eux ; mais à valider en preview avant prod.
- **Migration onboarding step persistance** : si on persiste l'étape (LOW, hors scope), risque que les utilisateurs ayant abandonné soient gates re-pris au milieu — comportement souhaité mais à valider.

---

## 10. Documents liés

- **Audit consolidé** : ce document, sections 3-5
- **Spec V5 originale** : `docs/superpowers/specs/2026-05-25-ca-va-v5-constellation-design.md`
- **Plan V5 originale** : `docs/superpowers/plans/2026-05-25-ca-va-v5-constellation-plan.md` (33 tasks, 100% done)
- **SAVEPOINT** : `SAVEPOINT.md` (V5 prod live)
- **ROBOT.md** : Definition of Done + mode autonome + anti-patterns
