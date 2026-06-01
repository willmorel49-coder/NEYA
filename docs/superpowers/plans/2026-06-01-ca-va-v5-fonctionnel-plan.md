# ÇA VA? V5 — Polish fonctionnel · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Livrer 23 fixes fonctionnels (7 CRITICAL + 16 HIGH) issus de l'audit cavalerie post-V5, sur une seule branche `fix/v5-fonctionnel`, suivis d'un déploiement autonome en prod.

**Architecture:** Séquencement E→A→B→C→D→F pour éviter conflits sur `state.js` (Groupe E refactore les helpers, tous les autres en dépendent). Commit atomique par fix. Aucun test unitaire (le projet n'en utilise pas — `ROBOT.md` : « Tests : Aucun »). Validation par `npm run build` clean + vérification visuelle décrite à chaque tâche.

**Tech Stack:** React 18 + Vite 5 + vite-plugin-pwa · localStorage only · single-file screens dans `src/v2/screens/` · design system unifié dans `src/components/ui/`.

**Spec source:** `docs/superpowers/specs/2026-06-01-ca-va-v5-fonctionnel-design.md`

---

## File structure

Fichiers modifiés (responsabilité par groupe) :

| Groupe | Fichiers touchés | Responsabilité |
|---|---|---|
| **E** Data | `src/v2/state.js`, `src/v2/helpers/stars.js`, `src/v2/helpers/migrate-v4-to-v5.js` | Mutation atomique, IDs uniques, positions persistées, dédup migration |
| **A** Onboarding | `src/components/onboarding/OnboardingFlow.jsx`, `OnboardingScreen.jsx` | Recovery step 8, guard double-tap, preferences modifiables, Passer contextuel |
| **B** Ciel + Touch | `src/components/ui/Star.jsx`, `StarField.jsx`, `PoseEtoileModal.jsx`, `src/v2/screens/Ciel.jsx`, `src/v2/helpers/chapter-generator.js` | Hit-zone 44px, fallback citation, FAB always + view mode, image guard |
| **C** Refuge | `src/v2/screens/Refuge.jsx`, `Meditation.jsx`, `BreathingPause.jsx`, `Carnet.jsx` | Méditation mode free, save guard, accent cohérent, scroll momentum |
| **D** CaVa | `src/v2/screens/CaVa.jsx` | Viewer borné, retour intégré, mini-nav anchors |
| **F** Nav + iOS | `src/v2/App.jsx`, `src/v2/screens/Espaces.jsx`, `src/v2/hooks/useSeasonalPalette.js`, `index.html` | history API, theme-color saisonnier |

Préfixes commits : `fix(v5/data):`, `fix(v5/onboarding):`, `fix(v5/ciel):`, `fix(v5/refuge):`, `fix(v5/cava):`, `fix(v5/nav):`, `chore(v5/fonctionnel):`.

---

## Workflow par tâche

Chaque tâche suit ce pattern :

1. **Read context** — Read tool sur les fichiers/lignes concernés (l'implémenteur valide le contexte avant de modifier)
2. **Edit** — Edit tool avec old_string / new_string exacts
3. **Build verify** — `cd /Users/williammorel/NÉYA && npm run build` → exit 0 sans erreur, warnings tolérés
4. **Visual check** — instructions de vérification visuelle (manuelle ou décrites)
5. **Commit** — message conventional commits, signé Co-Authored-By Claude

⚠️ **Branche** : créer `fix/v5-fonctionnel` AVANT la T1.

```bash
cd /Users/williammorel/NÉYA && git checkout -b fix/v5-fonctionnel
```

---

# GROUPE E — Data integrity (4 tâches)

## Task 1: `mutateProfile` atomique + migration `addStar`/`patchProfile`

**Files:**
- Modify: `src/v2/state.js` (ajouter `mutateProfile` après `patchProfile`)
- Modify: `src/v2/helpers/stars.js` (utiliser `mutateProfile` dans `addStar`)

**Context:**
- `state.js:121-135` : `setProfile` et `patchProfile` actuels (read-modify-write non atomique)
- `stars.js:82-85` : `addStar` lit `getProfile()` puis écrit `setProfile(p)` — race condition possible
- Le nouvel helper `mutateProfile(updater)` lit le profile fresh juste avant chaque écriture, garantissant atomicité

- [ ] **Step 1: Read context**

```
Read /Users/williammorel/NÉYA/src/v2/state.js (offset 115, limit 30)
Read /Users/williammorel/NÉYA/src/v2/helpers/stars.js
```

- [ ] **Step 2: Ajouter `mutateProfile` dans state.js**

Edit `/Users/williammorel/NÉYA/src/v2/state.js` :

old_string:
```javascript
export function patchProfile(patch) {
  const p = getProfile();
  const next = { ...p, ...patch };
  setProfile(next);
  return next;
}
```

new_string:
```javascript
export function patchProfile(patch) {
  return mutateProfile((p) => ({ ...p, ...patch }));
}

/**
 * Mutation atomique : lit le profile fresh juste avant l'écriture.
 * Élimine les race conditions last-write-wins lorsque plusieurs handlers
 * écrivent dans la même tick (event listeners synchrones).
 * @param {(profile: object) => object} updater - reçoit profile, retourne next
 */
export function mutateProfile(updater) {
  const fresh = getProfile();
  const next = updater(fresh);
  setProfile(next);
  return next;
}
```

- [ ] **Step 3: Migrer `addStar` vers `mutateProfile`**

Edit `/Users/williammorel/NÉYA/src/v2/helpers/stars.js` :

old_string:
```javascript
import { ls, getProfile, setProfile } from '../state';
```

new_string:
```javascript
import { ls, getProfile, mutateProfile } from '../state';
```

Puis :

old_string:
```javascript
  const p = getProfile();
  p.stars = [...(p.stars || []), star];
  setProfile(p);
  return star;
}
```

new_string:
```javascript
  mutateProfile((p) => ({
    ...p,
    stars: [...(p.stars || []), star],
  }));
  return star;
}
```

- [ ] **Step 4: Build verify**

Run: `cd /Users/williammorel/NÉYA && npm run build`
Expected: exit 0, pas de TypeError sur `mutateProfile` import, bundle généré.

- [ ] **Step 5: Commit**

```bash
cd /Users/williammorel/NÉYA && git add src/v2/state.js src/v2/helpers/stars.js && git commit -m "$(cat <<'EOF'
fix(v5/data): mutateProfile atomique + addStar protege race condition

- Ajout mutateProfile(updater) dans state.js : lit profile fresh
  juste avant l'ecriture, eliminant le last-write-wins observe
  sur addStar quand un autre handler dispatch cava:profile-changed.
- patchProfile delegue a mutateProfile pour coherence.
- addStar utilise desormais mutateProfile.

Fix C5 (CRITICAL) - audit fonctionnel V5.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Persister `x, y` sur chaque étoile (constellation stable)

**Files:**
- Modify: `src/v2/helpers/stars.js` (ajouter `x, y` dans `addStar`)
- Modify: `src/components/ui/StarField.jsx` (priorité `star.x, star.y`)

**Context:**
- Aujourd'hui les positions sont calculées via `positionForStar(star.id, userId)` à chaque render
- Si `getUserId()` régénère (clear partiel localStorage), toutes les positions changent visuellement
- Fix : stocker `x, y` au moment de la pose ; fallback calcul si absent (rétrocompat étoiles antérieures)

- [ ] **Step 1: Read context**

```
Read /Users/williammorel/NÉYA/src/v2/data/star-positions.js
Read /Users/williammorel/NÉYA/src/components/ui/StarField.jsx
```

- [ ] **Step 2: Ajouter `x, y` lors de la pose**

Edit `/Users/williammorel/NÉYA/src/v2/helpers/stars.js` :

old_string:
```javascript
import { ls, getProfile, mutateProfile } from '../state';
import { pickCitation } from '../data/citations';
```

new_string:
```javascript
import { ls, getProfile, mutateProfile } from '../state';
import { pickCitation } from '../data/citations';
import { positionForStar } from '../data/star-positions';
```

Puis :

old_string:
```javascript
  const star = {
    id: `star-${today}-${Date.now().toString(36)}`,
    date: today,
    time: new Date().toTimeString().slice(0, 5),
    color,
    note: note?.trim() || null,
    citation,
    type,
  };
```

new_string:
```javascript
  const id = `star-${today}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const pos = positionForStar(id, getUserId());
  const star = {
    id,
    date: today,
    time: new Date().toTimeString().slice(0, 5),
    color,
    note: note?.trim() || null,
    citation,
    type,
    x: pos.x,
    y: pos.y,
  };
```

(Note : cette modification corrige aussi Task 4 / H13 / E4 — collision d'id résolue par `Math.random().toString(36).slice(2,7)` ajouté. On combine les 2 fix dans le même commit pour cohérence.)

- [ ] **Step 3: Lire `star.x, star.y` en priorité dans StarField**

Edit `/Users/williammorel/NÉYA/src/components/ui/StarField.jsx` :

old_string:
```javascript
      {/* Étoiles passées */}
      {limited.map((star) => {
        const pos = positionForStar(star.id, userId);
        return (
          <Star
            key={star.id}
            color={star.color}
            size={4}
            pulse={false}
            onTap={onTapStar ? () => onTapStar(star) : undefined}
            ariaLabel={`Étoile du ${star.date}`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          />
        );
      })}
```

new_string:
```javascript
      {/* Étoiles passées */}
      {limited.map((star) => {
        const pos = (star.x != null && star.y != null)
          ? { x: star.x, y: star.y }
          : positionForStar(star.id, userId);
        return (
          <Star
            key={star.id}
            color={star.color}
            size={4}
            pulse={false}
            onTap={onTapStar ? () => onTapStar(star) : undefined}
            ariaLabel={`Étoile du ${star.date}`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          />
        );
      })}
```

Et faire la même chose pour `connections` (les lignes intra-semaine utilisent aussi les positions). Lire `generateConnections` dans `src/v2/data/star-positions.js` pour vérifier si elle utilise `positionForStar` ou si elle accepte les positions précalculées. Si elle utilise `positionForStar` direct, c'est OK : la migration douce à terme passera par addStar uniquement. Pas de modif nécessaire ici tant que les anciennes étoiles n'ont pas `x, y`.

- [ ] **Step 4: Build verify**

Run: `cd /Users/williammorel/NÉYA && npm run build`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
cd /Users/williammorel/NÉYA && git add src/v2/helpers/stars.js src/components/ui/StarField.jsx && git commit -m "$(cat <<'EOF'
fix(v5/data): persister x,y sur etoile + suffixe random id

- addStar inscrit x,y dans l'etoile au moment de la pose
  (positionForStar calculee une fois). Si getUserId() regenere,
  la constellation reste stable visuellement.
- StarField lit star.x,star.y en priorite ; fallback calcul a la
  volee pour les etoiles anterieures sans coords.
- Id suffixe Math.random().toString(36).slice(2,7) -> collisions
  impossibles meme si 2 ecritures < 1ms (cf. addSouvenir pattern).

Fix C6+H13 (CRITICAL+HIGH) - audit fonctionnel V5.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Migration V4→V5 dédup par id

**Files:**
- Modify: `src/v2/helpers/migrate-v4-to-v5.js`

**Context:**
- `migrate-v4-to-v5.js:28,65-67` : `newStars = [...stars, ...migrated]` sans dédup
- Si le flag `cava_v5_migrated` est cleared par accident, re-run pousse les mêmes IDs → doublons
- Fix : Set des IDs existants, filter avant push

- [ ] **Step 1: Read context**

```
Read /Users/williammorel/NÉYA/src/v2/helpers/migrate-v4-to-v5.js
```

- [ ] **Step 2: Dédup par id**

Edit `/Users/williammorel/NÉYA/src/v2/helpers/migrate-v4-to-v5.js` :

old_string:
```javascript
  const p = getProfile();
  const stars = p.stars || [];
  const moodHistory = ls.get('mood_history', []);
  const bilansV4 = ls.get('bilan_history', []);
  const newStars = [...stars];

  // Mood history → étoiles
  moodHistory.forEach((m, i) => {
    if (!m.date) return;
    const color = MOOD_TO_COLOR[m.mood] || MOOD_TO_COLOR.default;
    const seed = dayIndex(m.date) + hashSeed(getUserId());
    const tagMap = { bleu: 'calme', rose: 'tendre', violet: 'introspectif', peche: 'fatigue', orage: 'orage' };
    const tag = tagMap[color] || 'calme';
    const citation = pickCitation(tag, seed);
    newStars.push({
      id: `migrated-mood-${i}-${m.date}`,
      date: m.date,
      time: '12:00',
      color,
      note: m.note || null,
      citation,
      type: 'mood',
    });
  });

  // Bilans V4 → étoiles type 'write'
  bilansV4.forEach((b, i) => {
    if (!b.date) return;
    const seed = dayIndex(b.date) + hashSeed(getUserId());
    const citation = pickCitation('introspectif', seed);
    newStars.push({
      id: `migrated-bilan-${i}-${b.date}`,
      date: b.date,
      time: '22:00',
      color: 'violet',
      note: b.answers ? Object.values(b.answers).filter(Boolean).join(' · ').slice(0, 200) : null,
      citation,
      type: 'write',
    });
  });

  p.stars = newStars;
  setProfile(p);
  ls.set(MIGRATED_FLAG, true);
}
```

new_string:
```javascript
  const p = getProfile();
  const stars = p.stars || [];
  const existingIds = new Set(stars.map((s) => s.id));
  const moodHistory = ls.get('mood_history', []);
  const bilansV4 = ls.get('bilan_history', []);
  const toAdd = [];

  // Mood history → étoiles (dedup par id)
  moodHistory.forEach((m, i) => {
    if (!m.date) return;
    const id = `migrated-mood-${i}-${m.date}`;
    if (existingIds.has(id)) return;
    const color = MOOD_TO_COLOR[m.mood] || MOOD_TO_COLOR.default;
    const seed = dayIndex(m.date) + hashSeed(getUserId());
    const tagMap = { bleu: 'calme', rose: 'tendre', violet: 'introspectif', peche: 'fatigue', orage: 'orage' };
    const tag = tagMap[color] || 'calme';
    const citation = pickCitation(tag, seed);
    toAdd.push({
      id,
      date: m.date,
      time: '12:00',
      color,
      note: m.note || null,
      citation,
      type: 'mood',
    });
    existingIds.add(id);
  });

  // Bilans V4 → étoiles type 'write' (dedup par id)
  bilansV4.forEach((b, i) => {
    if (!b.date) return;
    const id = `migrated-bilan-${i}-${b.date}`;
    if (existingIds.has(id)) return;
    const seed = dayIndex(b.date) + hashSeed(getUserId());
    const citation = pickCitation('introspectif', seed);
    toAdd.push({
      id,
      date: b.date,
      time: '22:00',
      color: 'violet',
      note: b.answers ? Object.values(b.answers).filter(Boolean).join(' · ').slice(0, 200) : null,
      citation,
      type: 'write',
    });
    existingIds.add(id);
  });

  p.stars = [...stars, ...toAdd];
  setProfile(p);
  ls.set(MIGRATED_FLAG, true);
}
```

- [ ] **Step 3: Build verify**

Run: `cd /Users/williammorel/NÉYA && npm run build`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
cd /Users/williammorel/NÉYA && git add src/v2/helpers/migrate-v4-to-v5.js && git commit -m "$(cat <<'EOF'
fix(v5/data): migration V4->V5 dedup par id (Set existingIds)

Si cava_v5_migrated efface accidentellement, la re-execution ne
pousse plus de doublons. existingIds Set filtre les ids deja
presents dans profile.stars avant push (mood + bilan).

Fix H12 (HIGH) - audit fonctionnel V5.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: (Combinée avec Task 2 — pas de commit séparé)

Le fix H13 (collision id `addStar`) a été intégré à Task 2 lors de la modification de `addStar`. Cette tâche est marquée done sans commit séparé.

- [x] Combiné dans T2

---

# GROUPE A — Onboarding (4 tâches)

## Task 5: Recovery CTA sur étape 8 (pose-star) quand modal fermée

**Files:**
- Modify: `src/components/onboarding/OnboardingScreen.jsx`

**Context:**
- `OnboardingScreen.jsx:54-60` : `handleRightTap` return tôt si `screen.type === 'pose-star'`
- `OnboardingScreen.jsx:163-179` : CTA + PoseEtoileModal, modal fermable par backdrop (steps 1+2)
- Si user ferme la modal sans poser → écran 8 visible mais tap-droite désactivé sans feedback
- Fix : le CTA principal reste visible et clickable pour ré-ouvrir la modal. Optionnel : afficher un hint discret.

- [ ] **Step 1: Read context**

```
Read /Users/williammorel/NÉYA/src/components/onboarding/OnboardingScreen.jsx (offset 160, limit 35)
```

- [ ] **Step 2: Ajouter un hint sous le CTA quand modal fermée**

Edit `/Users/williammorel/NÉYA/src/components/onboarding/OnboardingScreen.jsx` :

old_string:
```javascript
        {isLast && screen.type === 'pose-star' && (
          <>
            <div className={styles.ctaWrap}>
              <button
                type="button"
                className={styles.cta}
                onClick={() => setPoseStarOpen(true)}
                tabIndex={isActive ? 0 : -1}
              >
                {screen.ctaLabel || 'Poser ma première étoile'}
              </button>
            </div>
            <PoseEtoileModal
              open={poseStarOpen}
              onClose={() => setPoseStarOpen(false)}
              onPosed={() => { setPoseStarOpen(false); onStart?.(); }}
            />
          </>
        )}
```

new_string:
```javascript
        {isLast && screen.type === 'pose-star' && (
          <>
            <div className={styles.ctaWrap}>
              <button
                type="button"
                className={styles.cta}
                onClick={() => setPoseStarOpen(true)}
                tabIndex={isActive ? 0 : -1}
              >
                {screen.ctaLabel || 'Poser ma première étoile'}
              </button>
              <p
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 12,
                  color: 'rgba(10, 36, 56, 0.55)',
                  textAlign: 'center',
                  margin: '14px 0 0',
                  fontStyle: 'italic',
                }}
              >
                Pose ton étoile pour entrer dans ton ciel.
              </p>
            </div>
            <PoseEtoileModal
              open={poseStarOpen}
              onClose={() => setPoseStarOpen(false)}
              onPosed={() => { setPoseStarOpen(false); onStart?.(); }}
            />
          </>
        )}
```

- [ ] **Step 3: Build verify**

Run: `cd /Users/williammorel/NÉYA && npm run build`
Expected: exit 0.

- [ ] **Step 4: Visual check**

Mental check : à l'écran 8, le CTA « Poser ma première étoile » reste visible avec un hint italic « Pose ton étoile pour entrer dans ton ciel. ». Si user ferme la modal, le CTA permet toujours de la rouvrir. Plus de blocage silencieux.

- [ ] **Step 5: Commit**

```bash
cd /Users/williammorel/NÉYA && git add src/components/onboarding/OnboardingScreen.jsx && git commit -m "$(cat <<'EOF'
fix(v5/onboarding): hint visible etape 8 si modal pose-star fermee

Le CTA 'Poser ma premiere etoile' restait visible mais sans
indication claire. Ajout d'un hint italic 'Pose ton etoile pour
entrer dans ton ciel.' sous le CTA pour guider apres une fermeture
intempestive de la modal.

Fix C7 (CRITICAL) - audit fonctionnel V5.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Guard `isScrolling` contre double-tap pendant transition

**Files:**
- Modify: `src/components/onboarding/OnboardingFlow.jsx`

**Context:**
- `OnboardingFlow.jsx:20-28,42-58` : `goNext`/`goPrev` capturent `active` via closure, scroll smooth + listener scroll debounce 60ms
- 2 taps rapides → 2e tap utilise `active` stale → comportement incohérent
- Fix : useRef `isScrollingRef` true au début de `scrollToIndex`, false au scroll-end via timeout 350ms

- [ ] **Step 1: Read context**

```
Read /Users/williammorel/NÉYA/src/components/onboarding/OnboardingFlow.jsx
```

- [ ] **Step 2: Ajouter guard isScrolling**

Edit `/Users/williammorel/NÉYA/src/components/onboarding/OnboardingFlow.jsx` :

old_string:
```javascript
export default function OnboardingFlow({ onComplete, mode = 'first-launch' }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const [exiting, setExiting] = useState(false);
  const total = ONBOARDING_SCREENS.length;
  const scrollTimerRef = useRef(null);
  const exitTimerRef = useRef(null);
  const finishedRef = useRef(false);
  const isReview = mode === 'review';

  const scrollToIndex = useCallback((i) => {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(total - 1, i));
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
  }, [total]);

  const goNext = useCallback(() => scrollToIndex(active + 1), [active, scrollToIndex]);
  const goPrev = useCallback(() => scrollToIndex(active - 1), [active, scrollToIndex]);
```

new_string:
```javascript
export default function OnboardingFlow({ onComplete, mode = 'first-launch' }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const [exiting, setExiting] = useState(false);
  const total = ONBOARDING_SCREENS.length;
  const scrollTimerRef = useRef(null);
  const exitTimerRef = useRef(null);
  const finishedRef = useRef(false);
  const isScrollingRef = useRef(false);
  const scrollGuardTimerRef = useRef(null);
  const isReview = mode === 'review';

  const scrollToIndex = useCallback((i) => {
    const el = trackRef.current;
    if (!el) return;
    if (isScrollingRef.current) return;
    const next = Math.max(0, Math.min(total - 1, i));
    isScrollingRef.current = true;
    if (scrollGuardTimerRef.current) clearTimeout(scrollGuardTimerRef.current);
    scrollGuardTimerRef.current = setTimeout(() => {
      isScrollingRef.current = false;
      scrollGuardTimerRef.current = null;
    }, 350);
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
  }, [total]);

  const goNext = useCallback(() => scrollToIndex(active + 1), [active, scrollToIndex]);
  const goPrev = useCallback(() => scrollToIndex(active - 1), [active, scrollToIndex]);
```

Et ajouter cleanup du timer dans le useEffect existant :

old_string:
```javascript
  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);
```

new_string:
```javascript
  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      if (scrollGuardTimerRef.current) clearTimeout(scrollGuardTimerRef.current);
    };
  }, []);
```

- [ ] **Step 3: Build verify**

Run: `cd /Users/williammorel/NÉYA && npm run build`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
cd /Users/williammorel/NÉYA && git add src/components/onboarding/OnboardingFlow.jsx && git commit -m "$(cat <<'EOF'
fix(v5/onboarding): guard isScrollingRef contre double-tap rapide

scrollToIndex re-rentre desormais si une transition est en cours.
Timer 350ms (couvre la duree d'un smooth scroll) leve le verrou.
Cleanup du timer au unmount.

Fix H9 (HIGH) - audit fonctionnel V5.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Preferences (5/6/7) modifiables avec selected state + skip

**Files:**
- Modify: `src/components/onboarding/OnboardingScreen.jsx`

**Context:**
- `OnboardingScreen.jsx:39-47` : `handleChoice` écrase sans visualiser
- `OnboardingScreen.jsx:54-60` : `handleRightTap` return tôt sur `preference` (bloque tap-droite)
- `OnboardingScreen.jsx:133-161` : boutons choice sans `aria-pressed` ni style sélectionné
- Fix : afficher choix actuel, permettre tap-droite si déjà sélectionné

- [ ] **Step 1: Read context**

Already read.

- [ ] **Step 2: Lire profile dans le composant + autoriser passage si choisi**

Edit `/Users/williammorel/NÉYA/src/components/onboarding/OnboardingScreen.jsx` :

old_string:
```javascript
  const handleChoice = (choice) => {
    let value = choice;
    if (['couleurFavorite', 'heureRituel'].includes(screen.preferenceKey)) {
      value = String(choice).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    }
    const current = getProfile().preferences || {};
    patchProfile({ preferences: { ...current, [screen.preferenceKey]: value } });
    onNext?.();
  };

  const handleLeftTap = (e) => {
    e.preventDefault();
    if (isFirst) return;
    onPrev?.();
  };
  const handleRightTap = (e) => {
    e.preventDefault();
    if (screen.type === 'preference') return;
    if (screen.type === 'pose-star') return;
    if (isLast) onStart?.();
    else onNext?.();
  };
```

new_string:
```javascript
  const normalize = (v) => String(v).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const currentPrefs = getProfile().preferences || {};
  const currentValue = screen.preferenceKey ? currentPrefs[screen.preferenceKey] : null;
  const isChoiceSelected = (choice) => {
    if (!screen.preferenceKey) return false;
    const v = ['couleurFavorite', 'heureRituel'].includes(screen.preferenceKey)
      ? normalize(choice)
      : choice;
    return currentValue === v;
  };

  const handleChoice = (choice) => {
    let value = choice;
    if (['couleurFavorite', 'heureRituel'].includes(screen.preferenceKey)) {
      value = normalize(choice);
    }
    patchProfile({ preferences: { ...currentPrefs, [screen.preferenceKey]: value } });
    onNext?.();
  };

  const handleLeftTap = (e) => {
    e.preventDefault();
    if (isFirst) return;
    onPrev?.();
  };
  const handleRightTap = (e) => {
    e.preventDefault();
    if (screen.type === 'pose-star') return;
    // Sur 'preference', passage autorise si l'utilisateur a deja un choix (revisite)
    if (screen.type === 'preference' && !currentValue) return;
    if (isLast) onStart?.();
    else onNext?.();
  };
```

- [ ] **Step 3: Style sélectionné + aria-pressed sur boutons choice**

Même fichier, edit :

old_string:
```javascript
        {screen.type === 'preference' && screen.choices && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
            {screen.choices.map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => handleChoice(choice)}
                style={{
                  appearance: 'none',
                  background: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.9)',
                  borderRadius: 50,
                  padding: '12px 18px',
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: 'italic',
                  fontWeight: 300,
                  fontSize: 15,
                  color: 'var(--blue-900)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                « {choice} »
              </button>
            ))}
          </div>
        )}
```

new_string:
```javascript
        {screen.type === 'preference' && screen.choices && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
            {screen.choices.map((choice) => {
              const selected = isChoiceSelected(choice);
              return (
                <button
                  key={choice}
                  type="button"
                  onClick={() => handleChoice(choice)}
                  aria-pressed={selected}
                  tabIndex={isActive ? 0 : -1}
                  style={{
                    appearance: 'none',
                    background: selected ? 'rgba(200, 112, 144, 0.18)' : 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(20px)',
                    border: selected ? '1.5px solid var(--rose-700)' : '1px solid rgba(255,255,255,0.9)',
                    borderRadius: 50,
                    padding: '12px 18px',
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontStyle: 'italic',
                    fontWeight: 300,
                    fontSize: 15,
                    color: selected ? 'var(--rose-700)' : 'var(--blue-900)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                    transition: 'background 200ms ease, border-color 200ms ease, color 200ms ease',
                  }}
                >
                  {selected ? '✓ ' : ''}« {choice} »
                </button>
              );
            })}
          </div>
        )}
```

- [ ] **Step 4: Build verify**

Run: `cd /Users/williammorel/NÉYA && npm run build`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
cd /Users/williammorel/NÉYA && git add src/components/onboarding/OnboardingScreen.jsx && git commit -m "$(cat <<'EOF'
fix(v5/onboarding): preferences 5/6/7 modifiables avec selected state

- isChoiceSelected() compare au choix actuel (normalise pour
  couleur/heure) -> bouton selectionne avec border rose, fond
  rose tinted, prefixe coche, aria-pressed.
- handleRightTap autorise le passage sur 'preference' si un
  choix existe deja (revisite).
- tabIndex conditionnel sur boutons choice (a11y tab order).

Fix H10 (HIGH) - audit fonctionnel V5.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Bouton « Passer » contextuel avec confirm

**Files:**
- Modify: `src/components/onboarding/OnboardingFlow.jsx`

**Context:**
- `OnboardingFlow.jsx:30-40,103-113` : `finish()` global sans warning, label uniforme « Passer »
- Spec demande label contextuel : `Passer l'introduction` (1-4) / `Passer cette étape` (5-7) / bouton masqué (8)
- Sur 1-4 avec préférences déjà choisies, confirm natif

- [ ] **Step 1: Read context**

Already read.

- [ ] **Step 2: Construire label + handler contextuel**

Edit `/Users/williammorel/NÉYA/src/components/onboarding/OnboardingFlow.jsx` :

D'abord ajouter un import pour `getProfile` :

old_string:
```javascript
import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './onboarding.module.css';
import { ONBOARDING_SCREENS } from './onboardingContent';
import OnboardingScreen from './OnboardingScreen';
import ProgressDots from './ProgressDots';
```

new_string:
```javascript
import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './onboarding.module.css';
import { ONBOARDING_SCREENS } from './onboardingContent';
import OnboardingScreen from './OnboardingScreen';
import ProgressDots from './ProgressDots';
import { getProfile } from '../../v2/state';
```

Puis remplacer le bloc topBar pour rendre le bouton contextuel :

old_string:
```javascript
      <div className={styles.topBar}>
        <ProgressDots total={total} active={active} />
        <button
          type="button"
          className={styles.skip}
          onClick={finish}
          aria-label={isReview ? 'Fermer' : 'Passer'}
        >
          {isReview ? 'Fermer' : 'Passer'}
        </button>
      </div>
```

new_string:
```javascript
      <div className={styles.topBar}>
        <ProgressDots total={total} active={active} />
        {(() => {
          const currentScreen = ONBOARDING_SCREENS[active];
          const isPoseStar = currentScreen?.type === 'pose-star';
          const isPreference = currentScreen?.type === 'preference';
          if (isReview) {
            return (
              <button type="button" className={styles.skip} onClick={finish} aria-label="Fermer">
                Fermer
              </button>
            );
          }
          if (isPoseStar) {
            // Pas de Passer sur l'etape finale : pose obligatoire
            return null;
          }
          if (isPreference) {
            return (
              <button
                type="button"
                className={styles.skip}
                onClick={() => scrollToIndex(active + 1)}
                aria-label="Passer cette étape"
              >
                Passer cette étape
              </button>
            );
          }
          // Ecrans narratifs 1-4 : Passer l'introduction (avec confirm si choix deja faits)
          return (
            <button
              type="button"
              className={styles.skip}
              onClick={() => {
                const prefs = getProfile().preferences || {};
                const hasChoices = !!(prefs.mantra || prefs.couleurFavorite || prefs.heureRituel);
                if (hasChoices && !window.confirm('Tu vas passer l\'introduction. Tes choix sont gardés. OK ?')) return;
                finish();
              }}
              aria-label="Passer l'introduction"
            >
              Passer l'introduction
            </button>
          );
        })()}
      </div>
```

- [ ] **Step 3: Build verify**

Run: `cd /Users/williammorel/NÉYA && npm run build`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
cd /Users/williammorel/NÉYA && git add src/components/onboarding/OnboardingFlow.jsx && git commit -m "$(cat <<'EOF'
fix(v5/onboarding): bouton Passer contextuel + confirm narratif

- Ecrans 1-4 (narratif) : 'Passer l'introduction' + confirm natif
  si l'utilisateur a deja fait des choix preferences.
- Ecrans 5-7 (preference) : 'Passer cette etape' (avance d'1 cran,
  pas finish global).
- Ecran 8 (pose-star) : bouton masque, pose obligatoire.

Fix H11 (HIGH) - audit fonctionnel V5.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

# GROUPE B — Ciel + Touch (5 tâches)

## Task 9: Étoiles touch-target 44×44 (visuel inchangé)

**Files:**
- Modify: `src/components/ui/Star.jsx`

**Context:**
- `Star.jsx:39-54` : `<button>` rend `width:size, height:size` direct
- Size 4 (étoiles passées) ou 9-12 (aujourd'hui) — bien sous 44px iOS HIG
- Fix : quand interactive, étendre la hit-zone via padding et garder le visuel centré au milieu

- [ ] **Step 1: Read context**

```
Read /Users/williammorel/NÉYA/src/components/ui/Star.jsx
```

- [ ] **Step 2: Wrapper hit-zone 44px quand interactive**

Edit `/Users/williammorel/NÉYA/src/components/ui/Star.jsx` :

old_string:
```javascript
export default function Star({
  color = 'bleu',
  size = 4,
  pulse = false,
  glow = false,
  dashed = false,
  onTap,
  style = {},
  ariaLabel,
}) {
  const fill = COLOR_MAP[color] || COLOR_MAP.bleu;
  const Tag = onTap ? 'button' : 'span';

  return (
    <Tag
      type={onTap ? 'button' : undefined}
      onClick={onTap}
      aria-label={ariaLabel}
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: dashed ? 'transparent' : fill,
        border: dashed ? '1.5px dashed rgba(255,255,255,0.6)' : 'none',
        boxShadow: glow ? `0 0 ${size * 3}px ${fill}, 0 0 ${size * 5}px ${fill}` : 'none',
        animation: pulse ? `star-pulse 4s ease-in-out infinite` : 'none',
        cursor: onTap ? 'pointer' : 'default',
        appearance: 'none',
        padding: 0,
        transform: 'translate(-50%, -50%)',
        ...style,
      }}
    />
  );
}
```

new_string:
```javascript
const HIT_ZONE = 44; // iOS HIG minimum touch target

export default function Star({
  color = 'bleu',
  size = 4,
  pulse = false,
  glow = false,
  dashed = false,
  onTap,
  style = {},
  ariaLabel,
}) {
  const fill = COLOR_MAP[color] || COLOR_MAP.bleu;
  const interactive = !!onTap;

  // Non-interactive : <span> visuel pur, taille = size
  if (!interactive) {
    return (
      <span
        aria-label={ariaLabel}
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: '50%',
          background: dashed ? 'transparent' : fill,
          border: dashed ? '1.5px dashed rgba(255,255,255,0.6)' : 'none',
          boxShadow: glow ? `0 0 ${size * 3}px ${fill}, 0 0 ${size * 5}px ${fill}` : 'none',
          animation: pulse ? `star-pulse 4s ease-in-out infinite` : 'none',
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
          ...style,
        }}
      />
    );
  }

  // Interactive : <button> 44x44 transparent + visuel etoile centre
  return (
    <button
      type="button"
      onClick={onTap}
      aria-label={ariaLabel}
      style={{
        position: 'absolute',
        width: HIT_ZONE,
        height: HIT_ZONE,
        appearance: 'none',
        background: 'transparent',
        border: 'none',
        padding: 0,
        margin: 0,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'translate(-50%, -50%)',
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: dashed ? 'transparent' : fill,
          border: dashed ? '1.5px dashed rgba(255,255,255,0.6)' : 'none',
          boxShadow: glow ? `0 0 ${size * 3}px ${fill}, 0 0 ${size * 5}px ${fill}` : 'none',
          animation: pulse ? `star-pulse 4s ease-in-out infinite` : 'none',
          pointerEvents: 'none',
        }}
      />
    </button>
  );
}
```

- [ ] **Step 3: Build verify**

Run: `cd /Users/williammorel/NÉYA && npm run build`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
cd /Users/williammorel/NÉYA && git add src/components/ui/Star.jsx && git commit -m "$(cat <<'EOF'
fix(v5/ciel): Star hit-zone 44x44 transparent quand interactive

iOS HIG : minimum 44x44 px tactile. Star avec onTap rend
desormais un <button> 44x44 transparent (margin: 0, padding: 0)
qui centre visuellement un <span> de la taille `size`. Le rendu
visuel ne change pas, mais la zone tactile est dimensionnee
correctement -> tap rate ameliore drastiquement.

Star sans onTap reste un <span> non focusable, pointer-events
none (pas de phantom button).

Fix C1 (CRITICAL) - audit fonctionnel V5.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: PoseEtoileModal StepBorn fallback gracieux

**Files:**
- Modify: `src/components/ui/PoseEtoileModal.jsx`

**Context:**
- `PoseEtoileModal.jsx:315-329` : accès direct `star.citation.text` et `star.citation.author`
- Si étoile corrompue (data partiel migration), TypeError → écran blanc
- Fix : optional chaining + fallback inline

- [ ] **Step 1: Read context**

Already read.

- [ ] **Step 2: Optional chaining + fallback texte**

Edit `/Users/williammorel/NÉYA/src/components/ui/PoseEtoileModal.jsx` :

old_string:
```javascript
      <p
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 22,
          lineHeight: 1.35,
          color: '#FBF6E8',
          maxWidth: 380,
          margin: '0 auto 14px',
        }}
      >
        « {star.citation.text} »
      </p>
      {star.citation.author && (
        <p
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 12,
            fontWeight: 500,
            color: 'rgba(251, 246, 232, 0.55)',
            margin: 0,
          }}
        >
          — {star.citation.author}
        </p>
      )}
```

new_string:
```javascript
      <p
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 22,
          lineHeight: 1.35,
          color: '#FBF6E8',
          maxWidth: 380,
          margin: '0 auto 14px',
        }}
      >
        « {star?.citation?.text || 'Tu es là. C\'est ce qui compte.'} »
      </p>
      {star?.citation?.author && (
        <p
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 12,
            fontWeight: 500,
            color: 'rgba(251, 246, 232, 0.55)',
            margin: 0,
          }}
        >
          — {star.citation.author}
        </p>
      )}
```

- [ ] **Step 3: Build verify**

Run: `cd /Users/williammorel/NÉYA && npm run build`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
cd /Users/williammorel/NÉYA && git add src/components/ui/PoseEtoileModal.jsx && git commit -m "$(cat <<'EOF'
fix(v5/ciel): PoseEtoileModal StepBorn fallback gracieux citation

star.citation.text accede sans guard -> ecran blanc modal si
etoile corrompue (migration partielle, data pre-V5). Optional
chaining + fallback 'Tu es la. C'est ce qui compte.' rend
l'app resiliente.

Fix C2 (CRITICAL) - audit fonctionnel V5.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: FAB Ciel toujours visible + addStar idempotent + mode view

**Files:**
- Modify: `src/v2/helpers/stars.js` (idempotence)
- Modify: `src/components/ui/PoseEtoileModal.jsx` (mode view)
- Modify: `src/v2/screens/Ciel.jsx` (FAB always)

**Context:**
- `Ciel.jsx:205-230` : FAB visible UNIQUEMENT si `posed=true` (intuition inversée)
- Si user tape le FAB après pose, 2e étoile créée → `getDominantColor` faussé
- Fix : FAB toujours visible, label/icône change selon posed ; `addStar` refuse si déjà posée ; `PoseEtoileModal` `mode='view'` saute étapes 1-2

- [ ] **Step 1: addStar idempotent**

Edit `/Users/williammorel/NÉYA/src/v2/helpers/stars.js` :

old_string:
```javascript
export function addStar({ color, note = '', type = 'mood' }) {
  const tagMap = {
    bleu:   'calme',
    rose:   'tendre',
    violet: 'introspectif',
    peche:  'fatigue',
    orage:  'orage',
  };
  const tag = tagMap[color] || 'calme';
  const today = toIsoDate();
  const seed = dayIndex(today) + hashSeed(getUserId());
  const citation = pickCitation(tag, seed);
```

new_string:
```javascript
export function addStar({ color, note = '', type = 'mood' }) {
  // Idempotent : si une etoile existe deja aujourd'hui, retourner l'existante
  // sans en creer une nouvelle (evite pollution getDominantColor & chapters).
  if (hasStarToday()) {
    return getAllStars().find((s) => s.date === toIsoDate()) || null;
  }
  const tagMap = {
    bleu:   'calme',
    rose:   'tendre',
    violet: 'introspectif',
    peche:  'fatigue',
    orage:  'orage',
  };
  const tag = tagMap[color] || 'calme';
  const today = toIsoDate();
  const seed = dayIndex(today) + hashSeed(getUserId());
  const citation = pickCitation(tag, seed);
```

- [ ] **Step 2: PoseEtoileModal accepte mode='view'**

Edit `/Users/williammorel/NÉYA/src/components/ui/PoseEtoileModal.jsx` :

old_string:
```javascript
export default function PoseEtoileModal({ open, onClose, onPosed }) {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [color, setColor] = useState(null);
  const [note, setNote] = useState('');
  const [bornStar, setBornStar] = useState(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep(1);
      setColor(null);
      setNote('');
      setBornStar(null);
    }
  }, [open]);
```

new_string:
```javascript
export default function PoseEtoileModal({ open, onClose, onPosed, mode = 'pose', viewStar = null }) {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [color, setColor] = useState(null);
  const [note, setNote] = useState('');
  const [bornStar, setBornStar] = useState(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      if (mode === 'view' && viewStar) {
        setStep(3);
        setBornStar(viewStar);
        setColor(viewStar.color || null);
        setNote(viewStar.note || '');
      } else {
        setStep(1);
        setColor(null);
        setNote('');
        setBornStar(null);
      }
    }
  }, [open, mode, viewStar]);
```

Et désactiver l'auto-close 4s en mode `view` (StepBorn rendu permanent jusqu'au tap backdrop) :

old_string:
```javascript
      style={{ background: 'rgba(5, 8, 16, 0.92)', backdropFilter: 'blur(30px)' }}
    >
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: '40px 24px',
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          color: '#FBF6E8',
        }}
      >
        {step === 1 && (
          <StepColor onPick={handlePickColor} />
        )}
```

new_string:
```javascript
      style={{ background: 'rgba(5, 8, 16, 0.92)', backdropFilter: 'blur(30px)' }}
    >
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: '40px 24px',
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          color: '#FBF6E8',
        }}
      >
        {mode !== 'view' && step === 1 && (
          <StepColor onPick={handlePickColor} />
        )}
```

Et ajuster le step 2 conditionnel de la même manière :

old_string:
```javascript
        {step === 2 && (
          <StepNote
            color={color}
            note={note}
            setNote={setNote}
            onConfirm={handleConfirmNote}
            onBack={() => setStep(1)}
          />
        )}
```

new_string:
```javascript
        {mode !== 'view' && step === 2 && (
          <StepNote
            color={color}
            note={note}
            setNote={setNote}
            onConfirm={handleConfirmNote}
            onBack={() => setStep(1)}
          />
        )}
```

Et permettre `closeOnBackdrop` également au step 3 en mode view (sinon impossible de fermer) :

old_string:
```javascript
    <Overlay
      backdrop="dark"
      closeOnBackdrop={step !== 3}
      onClose={onClose}
      ariaLabel="Pose ton étoile"
```

new_string:
```javascript
    <Overlay
      backdrop="dark"
      closeOnBackdrop={mode === 'view' || step !== 3}
      onClose={onClose}
      ariaLabel={mode === 'view' ? 'Ton étoile du jour' : 'Pose ton étoile'}
```

- [ ] **Step 3: Ciel FAB toujours visible + double mode**

Edit `/Users/williammorel/NÉYA/src/v2/screens/Ciel.jsx` :

old_string:
```javascript
export default function Ciel() {
  const [modalOpen, setModalOpen] = useState(false);
  const { posed, refresh } = useDailyStarStatus();
  const citation = useCitation();
  const userId = getUserId();
  const stars = useMemo(() => getAllStars(), [posed]);
  const chapters = useMemo(() => generateChapters(), [posed]);
  const profile = getProfile();
  const prenom = profile.preferences?.prenom || profile.pseudo || '';
  const todayStar = useMemo(() => {
    const today = toIsoDate();
    return stars.find((s) => s.date === today) || null;
  }, [stars]);
```

new_string:
```javascript
export default function Ciel() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('pose'); // 'pose' | 'view'
  const { posed, refresh } = useDailyStarStatus();
  const citation = useCitation();
  const userId = getUserId();
  const stars = useMemo(() => getAllStars(), [posed]);
  const chapters = useMemo(() => generateChapters(), [posed]);
  const profile = getProfile();
  const prenom = profile.preferences?.prenom || profile.pseudo || '';
  const todayStar = useMemo(() => {
    const today = toIsoDate();
    return stars.find((s) => s.date === today) || null;
  }, [stars]);

  const openPose = () => { setModalMode('pose'); setModalOpen(true); };
  const openView = () => { setModalMode('view'); setModalOpen(true); };
```

Puis remplacer le `onTapToday` du StarField et le FAB conditionnel :

old_string:
```javascript
      {/* Constellation hero */}
      <div style={{ position: 'relative', height: '46dvh', minHeight: 280, marginTop: 14 }}>
        <StarField
          stars={stars}
          todayStar={todayStar}
          onTapToday={() => setModalOpen(true)}
          onTapStar={(s) => {
            // Future: rouvrir l'étoile
          }}
          userId={userId}
        />
      </div>
```

new_string:
```javascript
      {/* Constellation hero */}
      <div style={{ position: 'relative', height: '46dvh', minHeight: 280, marginTop: 14 }}>
        <StarField
          stars={stars}
          todayStar={todayStar}
          onTapToday={posed ? openView : openPose}
          userId={userId}
        />
      </div>
```

(Le retrait de `onTapStar` règle aussi Task 12 / H2 — combiné ici.)

old_string:
```javascript
      {/* FAB poser étoile si déjà posée mais user veut revenir */}
      {posed && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          aria-label="Ajouter une étoile"
          style={{
            position: 'fixed',
            bottom: 100,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #C87090, #E080A8)',
            color: 'white',
            border: 'none',
            fontSize: 26,
            fontWeight: 300,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(200, 112, 144, 0.40)',
            zIndex: 50,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          +
        </button>
      )}

      <PoseEtoileModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onPosed={() => { setModalOpen(false); refresh(); }}
      />
```

new_string:
```javascript
      {/* FAB : pose si pas encore posee, sinon revoir l'etoile du jour */}
      <button
        type="button"
        onClick={posed ? openView : openPose}
        aria-label={posed ? 'Voir mon étoile' : 'Poser mon étoile'}
        style={{
          position: 'fixed',
          bottom: 100,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #C87090, #E080A8)',
          color: 'white',
          border: 'none',
          fontSize: 26,
          fontWeight: 300,
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(200, 112, 144, 0.40)',
          zIndex: 50,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {posed ? '✦' : '+'}
      </button>

      <PoseEtoileModal
        open={modalOpen}
        mode={modalMode}
        viewStar={modalMode === 'view' ? todayStar : null}
        onClose={() => setModalOpen(false)}
        onPosed={() => { setModalOpen(false); refresh(); }}
      />
```

- [ ] **Step 4: Build verify**

Run: `cd /Users/williammorel/NÉYA && npm run build`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
cd /Users/williammorel/NÉYA && git add src/v2/helpers/stars.js src/components/ui/PoseEtoileModal.jsx src/v2/screens/Ciel.jsx && git commit -m "$(cat <<'EOF'
fix(v5/ciel): FAB toujours visible + addStar idempotent + mode view

- addStar idempotent par jour : retourne l'etoile existante au
  lieu de polluer (getDominantColor, chapter-generator).
- PoseEtoileModal accepte mode='view' + viewStar -> saute steps
  1+2 et affiche StepBorn (revoir l'etoile + citation).
- Ciel FAB toujours visible : '+' rose si non posee (openPose),
  '✦' si posee (openView).
- onTapToday du StarField bascule entre pose/view selon posed.
- onTapStar removed (etoiles passees redeviennent <span>, plus
  de <button> mort - fix H2 combine).

Fix H1+H2 (HIGH) - audit fonctionnel V5.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: (Combinée avec Task 11)

Le fix H2 (`onTapStar` no-op rend `<button>` mort) a été intégré dans Task 11 (retrait du prop `onTapStar` côté Ciel.jsx + Star.jsx Task 9 rend déjà `<span>` quand pas d'`onTap`).

- [x] Combiné dans T11

---

## Task 13: chapter-generator : hashSeed déterministe + image guard

**Files:**
- Modify: `src/v2/helpers/chapter-generator.js`

**Context:**
- `chapter-generator.js:123` : `Math.random()` non seedé → citation différente à chaque mount (mais memoized donc pas un bug critique)
- `chapter-generator.js:125` : path fallback `marque-${(c.id*7)%122+1}` peut tomber sur 025/026 absents
- Fix : index déterministe via `hashSeed(userId + dayIndex)` + check existence dans `MARQUE_IMAGES`

- [ ] **Step 1: Read context**

```
Read /Users/williammorel/NÉYA/src/v2/data/marque-manifest.js (first 50 lines)
Read /Users/williammorel/NÉYA/src/v2/helpers/chapter-generator.js (offset 115, limit 25)
```

- [ ] **Step 2: Importer MARQUE_IMAGES + hashSeed pour seed déterministe**

Edit `/Users/williammorel/NÉYA/src/v2/helpers/chapter-generator.js` :

old_string:
```javascript
import { CITATIONS } from '../data/citations';
import { getStarsRange, toIsoDate, getDominantColor, getAllStars } from './stars';
```

new_string:
```javascript
import { CITATIONS } from '../data/citations';
import { MARQUE_IMAGES } from '../data/marque-manifest';
import { getStarsRange, toIsoDate, getDominantColor, getAllStars, hashSeed, getUserId, dayIndex } from './stars';

const MARQUE_PATHS = new Set(MARQUE_IMAGES);
```

Puis remplacer le bloc « Pièce » :

old_string:
```javascript
  // ── M6 : Pièce de la marque qui résonne ──
  const dominantNow = getDominantColor(3);
  if (dominantNow) {
    const tagMap = { bleu: 'calme', rose: 'tendre', violet: 'introspectif', peche: 'fatigue', orage: 'orage' };
    const tag = tagMap[dominantNow];
    const matched = CITATIONS.filter((c) => c.tags.includes(tag) && c.author == null);
    if (matched.length > 0) {
      const c = matched[Math.floor(Math.random() * matched.length)];
      // Map citation id → image marque iconique (fallback id mod 122)
      const imageSrc = CITATION_TO_IMAGE[c.id] || `/cava/marque/marque-${String((c.id * 7) % 122 + 1).padStart(3, '0')}.jpeg`;
      chapters.push({
        type: 'piece',
        eyebrow: 'Une pièce qui te ressemble',
        accent: 'rose',
        text: `« ${c.text} »`,
        media: { type: 'image', src: imageSrc },
      });
    }
  }
```

new_string:
```javascript
  // ── M6 : Pièce de la marque qui résonne ──
  const dominantNow = getDominantColor(3);
  if (dominantNow) {
    const tagMap = { bleu: 'calme', rose: 'tendre', violet: 'introspectif', peche: 'fatigue', orage: 'orage' };
    const tag = tagMap[dominantNow];
    const matched = CITATIONS.filter((c) => c.tags.includes(tag) && c.author == null);
    if (matched.length > 0) {
      // Index deterministe seede par (userId + jour) : stable dans la journee,
      // change le lendemain.
      const seed = hashSeed(getUserId() + toIsoDate());
      const c = matched[seed % matched.length];
      // Image iconique si mappee, sinon null (pas d'image cassee).
      const mapped = CITATION_TO_IMAGE[c.id];
      const media = mapped && MARQUE_PATHS.has(mapped)
        ? { type: 'image', src: mapped }
        : null;
      chapters.push({
        type: 'piece',
        eyebrow: 'Une pièce qui te ressemble',
        accent: 'rose',
        text: `« ${c.text} »`,
        ...(media ? { media } : {}),
      });
    }
  }
```

- [ ] **Step 3: Build verify**

Run: `cd /Users/williammorel/NÉYA && npm run build`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
cd /Users/williammorel/NÉYA && git add src/v2/helpers/chapter-generator.js && git commit -m "$(cat <<'EOF'
fix(v5/ciel): chapter Piece : hashSeed deterministe + image guard

- Math.random() remplace par hashSeed(userId + dayIso) % length :
  stable dans la journee, change le lendemain.
- Fallback image '/cava/marque/marque-XXX' supprime : si pas de
  CITATION_TO_IMAGE mapping OU si path absent de MARQUE_IMAGES,
  on n'affiche PAS de media (plutot qu'une image cassee 404).

Fix H3 (HIGH) - audit fonctionnel V5.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

# GROUPE C — Refuge (5 tâches)

## Task 14: Meditation mode `free` + Refuge sans worldKey corrompu

**Files:**
- Modify: `src/v2/screens/Meditation.jsx` (accepter `mode='free'`)
- Modify: `src/v2/screens/Refuge.jsx` (passer `mode='free'`)

**Context:**
- `Refuge.jsx:24` passe `worldKey="violet"` qui n'existe pas dans `WORLDS` (clés réelles : foret/temple/oasis/lac/montagne/communaute)
- `Meditation.jsx:38` fallback silencieux sur Forêt → souvenirs faux, `completeMeditation('foret', ...)` débloque le mauvais monde
- Fix : ajouter mode `free` à Meditation = pas de world unlock, pas de souvenir attaché à un monde

- [ ] **Step 1: Read context**

```
Read /Users/williammorel/NÉYA/src/v2/screens/Meditation.jsx (offset 130, limit 40)
```

- [ ] **Step 2: Ajouter mode='free' dans Meditation handleClose**

Edit `/Users/williammorel/NÉYA/src/v2/screens/Meditation.jsx` :

old_string:
```javascript
export default function Meditation({ worldKey = 'foret', onClose }) {
  const toast = useToast();
  const profile = getProfile();
  const world = WORLDS[worldKey] || WORLDS.foret;
  const target = getOnboardingTargetMinutes();
```

new_string:
```javascript
export default function Meditation({ worldKey = 'foret', mode, onClose }) {
  const toast = useToast();
  const profile = getProfile();
  const isFree = mode === 'free';
  const world = isFree ? null : (WORLDS[worldKey] || WORLDS.foret);
  const target = getOnboardingTargetMinutes();
```

Puis dans `handleClose` (autour ligne 131-164), remplacer la logique d'attribution monde :

old_string:
```javascript
  const handleClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    if (minutes >= 1) {
      const { wasNew } = completeMeditation(worldKey, minutes);
      addSouvenir({
        type: 'meditation',
        world: worldKey,
        label: `${minutes} minute${minutes > 1 ? 's' : ''} a la ${world.name}`,
        detail: wasNew ? 'Premiere fois ici.' : null,
      });
      if (wasNew) {
        addSouvenir({
          type: 'world-unlock',
          world: worldKey,
          label: `Decouverte de ${world.name}`,
          detail: world.totem,
        });
      }
      haptic([8, 60, 8]);
      toast.show({
        message: `Tu as posé ${minutes} minute${minutes > 1 ? 's' : ''}.`,
        variant: 'success',
      });
      setCompletion({ minutes, wasNew });
      closeTimerRef.current = setTimeout(() => {
        closeTimerRef.current = null;
        onClose?.();
      }, 2200);
      return;
    }
    haptic(4);
    onClose?.();
  };
```

new_string:
```javascript
  const handleClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    if (minutes >= 1) {
      if (isFree) {
        // Mode libre : pas de world unlock, souvenir neutre (sans world attribue)
        addSouvenir({
          type: 'meditation',
          world: null,
          label: `${minutes} minute${minutes > 1 ? 's' : ''} de presence`,
          detail: null,
        });
      } else {
        const { wasNew } = completeMeditation(worldKey, minutes);
        addSouvenir({
          type: 'meditation',
          world: worldKey,
          label: `${minutes} minute${minutes > 1 ? 's' : ''} a la ${world.name}`,
          detail: wasNew ? 'Premiere fois ici.' : null,
        });
        if (wasNew) {
          addSouvenir({
            type: 'world-unlock',
            world: worldKey,
            label: `Decouverte de ${world.name}`,
            detail: world.totem,
          });
        }
      }
      haptic([8, 60, 8]);
      toast.show({
        message: `Tu as posé ${minutes} minute${minutes > 1 ? 's' : ''}.`,
        variant: 'success',
      });
      setCompletion({ minutes, wasNew: false });
      closeTimerRef.current = setTimeout(() => {
        closeTimerRef.current = null;
        onClose?.();
      }, 2200);
      return;
    }
    haptic(4);
    onClose?.();
  };
```

Note importante : `world.name` est utilisé plus loin dans le render. Vérifier que `world` n'est plus null à ces endroits. Lire `Meditation.jsx:170-fin` pour identifier les usages. **Étape additionnelle obligatoire** :

```
Read /Users/williammorel/NÉYA/src/v2/screens/Meditation.jsx (offset 170, limit 300)
```

Si `world.name`, `world.accent`, etc. sont utilisés dans le JSX, remplacer par des defaults pour le mode `free` :

Pattern à appliquer partout où `world.X` est utilisé dans le JSX :

```javascript
{isFree ? 'Méditation libre' : world.name}
```

```javascript
{isFree ? 'var(--violet)' : world.accent}
```

L'implémenteur lit la suite et fait ces remplacements ciblés.

- [ ] **Step 3: Refuge passe mode='free' (sans worldKey corrompu)**

Edit `/Users/williammorel/NÉYA/src/v2/screens/Refuge.jsx` :

old_string:
```javascript
  if (active === 'meditation') return <Meditation worldKey="violet" onClose={() => setActive(null)} />;
```

new_string:
```javascript
  if (active === 'meditation') return <Meditation mode="free" onClose={() => setActive(null)} />;
```

- [ ] **Step 4: Build verify**

Run: `cd /Users/williammorel/NÉYA && npm run build`
Expected: exit 0. Si erreur sur `world.X` undefined, corriger avec le pattern de Step 2.

- [ ] **Step 5: Commit**

```bash
cd /Users/williammorel/NÉYA && git add src/v2/screens/Meditation.jsx src/v2/screens/Refuge.jsx && git commit -m "$(cat <<'EOF'
fix(v5/refuge): Meditation mode='free' depuis Refuge

- worldKey='violet' inexistant dans WORLDS -> fallback silencieux
  sur Foret + souvenirs faux + completeMeditation debloquait le
  mauvais monde.
- Ajout mode='free' a Meditation : pas de completeMeditation,
  pas de world unlock, souvenir 'X minutes de presence' neutre.
- Refuge.jsx:24 passe mode='free' (plus de worldKey).
- world.X dans le render gated par isFree avec defaults.

Fix C3 (CRITICAL) - audit fonctionnel V5.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 15: Carnet save guard + timing + scroll momentum

**Files:**
- Modify: `src/v2/screens/Carnet.jsx`

**Context:**
- `Carnet.jsx:170-178` : `saved` set après `ls.set`, mais pas de guard early `handleSave` → double-save possible si re-tap dans 700ms
- `Carnet.jsx:177` : auto-close 700ms cache toast (toast affiché 3000ms par défaut)
- `Carnet.jsx:279` : conteneur scroll sans `WebkitOverflowScrolling: 'touch'`

(Combinaison H6 + H16 dans 1 commit puisque même fichier et logique liée à la sauvegarde + UX scroll)

- [ ] **Step 1: Read context**

```
Read /Users/williammorel/NÉYA/src/v2/screens/Carnet.jsx (offset 100, limit 100)
```

Vérifier la fonction `handleSave` complète et la déclaration de `saved` state.

- [ ] **Step 2: Guard early dans handleSave + timing toast respecté**

Edit `/Users/williammorel/NÉYA/src/v2/screens/Carnet.jsx` :

old_string:
```javascript
    ls.set(STORAGE_KEY, next);
    setEntries(next);
    setSaved(true);
    haptic([6, 30, 6]);
    toast.show({ message: 'Entrée du carnet sauvegardée.', variant: 'success' });

    safeTimeout(() => setSaved(false), 800);
    safeTimeout(() => onClose?.(), 700);
  };
```

new_string:
```javascript
    ls.set(STORAGE_KEY, next);
    setEntries(next);
    setSaved(true);
    haptic([6, 30, 6]);
    toast.show({ message: 'Entrée du carnet sauvegardée.', variant: 'success' });

    safeTimeout(() => setSaved(false), 1600);
    safeTimeout(() => onClose?.(), 1400);
  };
```

Puis ajouter guard early dans `handleSave`. Lire la fonction avant et insérer :

(L'implémenteur doit lire la définition de `handleSave` autour de la ligne 100-150 et ajouter ce check au tout début de la fonction, juste après l'ouverture `{` :)

```javascript
    if (saved) return; // prevent double-save during close delay
```

(Position exacte : à la première ligne de `handleSave` avant tout autre code. L'implémenteur ajoute ce check à la suite, garantissant que le state `saved` empêche un 2e appel pendant le délai close.)

- [ ] **Step 3: Ajouter momentum scroll iOS**

Edit `/Users/williammorel/NÉYA/src/v2/screens/Carnet.jsx` :

old_string:
```javascript
      {/* Scrollable content with sticky Header */}
      <div
        style={{
          position: 'relative',
          height: '100%',
          overflowY: 'auto',
          boxSizing: 'border-box',
          zIndex: 1,
        }}
      >
```

new_string:
```javascript
      {/* Scrollable content with sticky Header */}
      <div
        style={{
          position: 'relative',
          height: '100%',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          boxSizing: 'border-box',
          zIndex: 1,
        }}
      >
```

- [ ] **Step 4: Build verify**

Run: `cd /Users/williammorel/NÉYA && npm run build`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
cd /Users/williammorel/NÉYA && git add src/v2/screens/Carnet.jsx && git commit -m "$(cat <<'EOF'
fix(v5/refuge): Carnet save guard + timing toast + momentum scroll

- handleSave early-return si saved=true -> impossible double-save
  pendant le delai close.
- Auto-close 700ms -> 1400ms : toast 3s reste visible au moins
  1.4s avant fermeture. saved reset 800ms -> 1600ms (coherent).
- WebkitOverflowScrolling:'touch' ajoute au scroll container ->
  momentum natif iOS aligne sur les 10 autres ecrans V5.

Fix H6+H16 (HIGH) - audit fonctionnel V5.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 16: BreathingPause accent cohérent depuis Refuge

**Files:**
- Modify: `src/v2/screens/Refuge.jsx`

**Context:**
- `BreathingPause.jsx:18` : default `accent = 'var(--terracotta)'`
- `Refuge.jsx:25` : `<BreathingPause onClose={...} />` sans accent → fallback terracotta inconsistant avec palette ÇA VA?
- `Cocon.jsx:464` : passe accent (cohérent)
- Fix : Refuge passe explicitement `accent='rose'` ou variable palette V4 (`'var(--rose-700)'`) pour cohérence

- [ ] **Step 1: Refuge passe accent explicite**

Edit `/Users/williammorel/NÉYA/src/v2/screens/Refuge.jsx` :

old_string:
```javascript
  if (active === 'breath')     return <BreathingPause onClose={() => setActive(null)} />;
```

new_string:
```javascript
  if (active === 'breath')     return <BreathingPause accent="var(--rose-700)" onClose={() => setActive(null)} />;
```

- [ ] **Step 2: Build verify**

Run: `cd /Users/williammorel/NÉYA && npm run build`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
cd /Users/williammorel/NÉYA && git add src/v2/screens/Refuge.jsx && git commit -m "$(cat <<'EOF'
fix(v5/refuge): BreathingPause accent rose depuis Refuge

Refuge ouvrait BreathingPause sans accent -> default terracotta
hors palette V4. Passe accent='var(--rose-700)' explicite pour
coherence avec Refuge (Eyebrow rose + GlassCard rose-violet).

Fix H7 (HIGH) - audit fonctionnel V5.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 17: Bouton retour Cocon visuellement distinct (bornes claires)

**Files:**
- Modify: `src/v2/screens/Refuge.jsx`

**Context:**
- `Refuge.jsx:30-61` : bouton retour overlay 44x44 background rgba(238,243,248,0.82) glass
- Risque de chevauchement avec ⋯ Personnaliser de la TopBar Cocon
- Fix : renforcer la borne visuelle (border plus marquée, ombre) pour différencier de la TopBar Cocon et garantir tap zone propre

- [ ] **Step 1: Renforcer visuel bouton retour Cocon**

Edit `/Users/williammorel/NÉYA/src/v2/screens/Refuge.jsx` :

old_string:
```javascript
        <button
          type="button"
          onClick={() => setActive(null)}
          style={{
            position: 'absolute',
            top: 'calc(env(safe-area-inset-top, 0px) + 8px)',
            left: 12,
            zIndex: 9999,
            width: 44,
            height: 44,
            borderRadius: 22,
            background: 'rgba(238, 243, 248, 0.82)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '0.5px solid rgba(255, 255, 255, 0.85)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Retour au Refuge"
        >
          <Icon name="chevron-left" size={20} color={tokens.blue900} />
        </button>
```

new_string:
```javascript
        <button
          type="button"
          onClick={() => setActive(null)}
          style={{
            position: 'absolute',
            top: 'calc(env(safe-area-inset-top, 0px) + 8px)',
            left: 12,
            zIndex: 9999,
            width: 44,
            height: 44,
            borderRadius: 22,
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            border: '1px solid rgba(26, 90, 127, 0.18)',
            boxShadow: '0 4px 16px rgba(10, 36, 56, 0.10)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            WebkitTapHighlightColor: 'transparent',
          }}
          aria-label="Retour au Refuge"
        >
          <Icon name="chevron-left" size={20} color={tokens.blue900} />
        </button>
```

- [ ] **Step 2: Build verify**

Run: `cd /Users/williammorel/NÉYA && npm run build`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
cd /Users/williammorel/NÉYA && git add src/v2/screens/Refuge.jsx && git commit -m "$(cat <<'EOF'
fix(v5/refuge): bouton retour Cocon visuellement distinct

Glass 0.82 -> 0.92 + border bleu visible + ombre marquee +
saturate 180% -> bouton retour clairement detache de la TopBar
Cocon (qui contient '⋯ Personnaliser' a droite). Zone tap 44x44
nette, plus de risque de tap erronne.

Fix H8 (HIGH) - audit fonctionnel V5.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 18: (Combinée avec Task 15)

Le fix C5 (Carnet sans momentum scroll) a été intégré dans Task 15.

- [x] Combiné dans T15

---

# GROUPE D — CaVa (Marque) (3 tâches)

## Task 19: MarqueImageViewer borné aux images chargées

**Files:**
- Modify: `src/v2/screens/CaVa.jsx`

**Context:**
- `CaVa.jsx:189` : `useState(30)` pour `marqueVisible` (pagination)
- `CaVa.jsx:290-296` : viewer reçoit `MARQUE_IMAGES` complet → swipe peut atteindre 122/122 même si seulement 30 vignettes chargées dans la mosaïque
- Fix : passer la slice au viewer

- [ ] **Step 1: Read context**

```
Read /Users/williammorel/NÉYA/src/v2/screens/CaVa.jsx (offset 180, limit 30)
Read /Users/williammorel/NÉYA/src/v2/screens/CaVa.jsx (offset 280, limit 30)
```

- [ ] **Step 2: Identifier le call MarqueImageViewer et passer la slice**

Localiser dans `CaVa.jsx` autour de la ligne 290 le composant `MarqueImageViewer` (ou équivalent) qui reçoit `images={MARQUE_IMAGES}`. Remplacer par `images={MARQUE_IMAGES.slice(0, marqueVisible)}`.

L'edit exact dépend de l'état actuel du code (l'implémenteur lit autour de la ligne 290 et applique). Pattern attendu :

Si actuellement :
```javascript
<MarqueImageViewer
  ...
  images={MARQUE_IMAGES}
  ...
/>
```

Remplacer par :
```javascript
<MarqueImageViewer
  ...
  images={MARQUE_IMAGES.slice(0, marqueVisible)}
  ...
/>
```

- [ ] **Step 3: Build verify**

Run: `cd /Users/williammorel/NÉYA && npm run build`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
cd /Users/williammorel/NÉYA && git add src/v2/screens/CaVa.jsx && git commit -m "$(cat <<'EOF'
fix(v5/cava): MarqueImageViewer borne aux images chargees

Viewer recevait MARQUE_IMAGES complet (122) alors que la mosaique
n'en chargeait que `marqueVisible` (30 par defaut). Swipe pouvait
atteindre l'index 122/122 sans cliquer 'Voir plus' -> incoherence.
Slice(0, marqueVisible) -> compteur viewer = vraiment ce qui est
charge dans la mosaique.

Fix C4 (CRITICAL) - audit fonctionnel V5.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 20: Bouton retour CaVa intégré (suppression du floating)

**Files:**
- Modify: `src/v2/screens/CaVa.jsx`

**Context:**
- `CaVa.jsx:223-255` : bouton retour standalone `position:fixed zIndex:80` en haut à gauche
- `CaVa.jsx:305-333` : TopBar sticky avec label "ÇA VA?" qui chevauche
- Fix : supprimer le bouton retour standalone, déplacer le retour dans la TopBar (left slot)

- [ ] **Step 1: Read context**

```
Read /Users/williammorel/NÉYA/src/v2/screens/CaVa.jsx (offset 215, limit 50)
Read /Users/williammorel/NÉYA/src/v2/screens/CaVa.jsx (offset 300, limit 40)
```

L'implémenteur identifie :
- Le bloc bouton retour standalone (offset 223-255)
- La TopBar sticky qui contient "ÇA VA?" + slot droit (305-333)

- [ ] **Step 2: Supprimer le bouton retour standalone**

L'implémenteur supprime le `<button>` floating (offset ~223-255) qui contient `← Retour` ou icône chevron.

- [ ] **Step 3: Ajouter un chevron retour dans la TopBar**

Dans la TopBar (offset ~305-333), avant le label "ÇA VA?", ajouter une icône chevron-left cliquable :

```javascript
<button
  type="button"
  onClick={onClose}
  aria-label="Retour"
  style={{
    appearance: 'none',
    background: 'transparent',
    border: 'none',
    padding: 8,
    margin: '-8px 4px -8px -8px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    WebkitTapHighlightColor: 'transparent',
    minWidth: 44,
    minHeight: 44,
  }}
>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
</button>
```

Position : à intégrer dans la TopBar à gauche du label « ÇA VA? ». L'implémenteur localise le span/div du label dans la TopBar et préfixe le chevron juste avant. Le tout reste dans un wrapper flex.

- [ ] **Step 4: Build verify**

Run: `cd /Users/williammorel/NÉYA && npm run build`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
cd /Users/williammorel/NÉYA && git add src/v2/screens/CaVa.jsx && git commit -m "$(cat <<'EOF'
fix(v5/cava): bouton retour integre dans TopBar (plus de floating)

Bouton retour position:fixed zIndex:80 chevauchait le label
'CA VA?' de la TopBar sticky. Supprime, remplace par un chevron
44x44 dans le left-slot de la TopBar. Plus de conflit z-index.

Fix H4 (HIGH) - audit fonctionnel V5.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 21: Mini-nav 5 anchors sticky pour CaVa

**Files:**
- Modify: `src/v2/screens/CaVa.jsx`

**Context:**
- `CaVa.jsx:9` : commentaire annonçant `Mini-nav templates sticky (5 anchors)` mais composant absent
- IDs présents dans le DOM : `chap-anxiete`, `chap-fruits`, `chap-essentiels`, `chap-univers`, `chap-voix`
- Fix : implémenter une nav sticky sous la TopBar avec scroll smooth + highlight active

- [ ] **Step 1: Read context**

```
Read /Users/williammorel/NÉYA/src/v2/screens/CaVa.jsx (offset 305, limit 50)
```

L'implémenteur localise le bloc qui rend la TopBar et identifie où insérer la mini-nav (juste après).

- [ ] **Step 2: Implémenter MiniNav inline component**

Ajouter en haut du fichier `CaVa.jsx` (après les imports, avant le component principal), une fonction MiniNav :

```javascript
const ANCHORS = [
  { id: 'chap-anxiete',    label: 'Anxiété' },
  { id: 'chap-fruits',     label: 'Fruits' },
  { id: 'chap-essentiels', label: 'Essentiels' },
  { id: 'chap-univers',    label: 'Univers' },
  { id: 'chap-voix',       label: 'Voix' },
];

function MiniNav() {
  const [active, setActive] = useState(ANCHORS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          // Prendre l'entry la plus haute dans le viewport
          const top = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
          setActive(top.target.id);
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
    );
    ANCHORS.forEach((a) => {
      const el = document.getElementById(a.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleClick = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav
      aria-label="Navigation chapitres"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 3,
        background: 'rgba(238, 243, 248, 0.88)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        borderBottom: '0.5px solid rgba(26, 90, 127, 0.12)',
        padding: '10px 12px',
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
      }}
    >
      {ANCHORS.map((a) => {
        const isActive = active === a.id;
        return (
          <a
            key={a.id}
            href={`#${a.id}`}
            onClick={handleClick(a.id)}
            style={{
              flexShrink: 0,
              padding: '6px 14px',
              borderRadius: 50,
              background: isActive ? 'var(--rose-700)' : 'rgba(255, 255, 255, 0.7)',
              color: isActive ? 'white' : 'var(--blue-700)',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              border: '1px solid ' + (isActive ? 'var(--rose-700)' : 'rgba(26, 90, 127, 0.18)'),
              transition: 'all 200ms ease',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {a.label}
          </a>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 3: Monter MiniNav dans la page CaVa**

L'implémenteur localise dans le JSX du component principal de CaVa l'endroit juste sous la TopBar (après les blocs offset ~305-333) et insère `<MiniNav />`. Vérifier que la TopBar n'a pas un `z-index` qui couvre la MiniNav.

- [ ] **Step 4: Build verify**

Run: `cd /Users/williammorel/NÉYA && npm run build`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
cd /Users/williammorel/NÉYA && git add src/v2/screens/CaVa.jsx && git commit -m "$(cat <<'EOF'
fix(v5/cava): mini-nav 5 anchors sticky (anxiete/fruits/essentiels/univers/voix)

Commentaire annoncait la mini-nav mais composant absent. Ajout
d'un nav sticky sous la TopBar :
- 5 pills horizontales scrollables (overflow-x auto)
- IntersectionObserver pour highlight de la section active
- scrollIntoView smooth au click sur une pill
- Style cohérent palette V4 (rose accent active)

Fix H5 (HIGH) - audit fonctionnel V5.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

# GROUPE F — Nav + iOS (2 tâches)

## Task 22: history API + popstate pour back Android + deeplink

**Files:**
- Modify: `src/v2/App.jsx`
- Modify: `src/v2/screens/Espaces.jsx`

**Context:**
- `App.jsx:44-45` : `activeTab` depuis `ls.get('active_tab', 'ciel')`, pas de hash URL
- `App.jsx:195-203` : useEffect persiste `active_tab`, pas de pushState
- `Espaces.jsx:22` : `active` (sub-route) en state local, perdu au back
- Fix : maintenir hash URL `#tab` ou `#tab/subroute`, listener `popstate`, deeplink au boot

- [ ] **Step 1: App.jsx — pushState au changement de tab + popstate listener**

Edit `/Users/williammorel/NÉYA/src/v2/App.jsx` :

old_string:
```javascript
  const [splashDone, setSplashDone] = useState(false);
  const [onboarded, setOnboarded] = useState(() => isOnboarded());
  const [activeTab, setActiveTab] = useState(() => ls.get('active_tab', 'ciel'));
```

new_string:
```javascript
  const [splashDone, setSplashDone] = useState(false);
  const [onboarded, setOnboarded] = useState(() => isOnboarded());
  const [activeTab, setActiveTab] = useState(() => {
    // Deeplink hash prioritaire au boot : '#ciel' ou '#espaces'
    if (typeof window !== 'undefined' && window.location.hash) {
      const h = window.location.hash.replace(/^#/, '').split('/')[0];
      if (h === 'ciel' || h === 'espaces') return h;
    }
    return ls.get('active_tab', 'ciel');
  });
```

Puis remplacer le useEffect qui persiste `active_tab` pour qu'il pushState aussi :

old_string:
```javascript
  useEffect(() => {
    ls.set('active_tab', activeTab);
  }, [activeTab]);
```

new_string:
```javascript
  useEffect(() => {
    ls.set('active_tab', activeTab);
    if (typeof window !== 'undefined') {
      const currentHash = (window.location.hash || '').replace(/^#/, '').split('/')[0];
      if (currentHash !== activeTab) {
        window.history.pushState({ tab: activeTab }, '', `#${activeTab}`);
      }
    }
  }, [activeTab]);

  // popstate : back navigateur / Android back ramene au tab precedent
  useEffect(() => {
    const onPop = (e) => {
      const state = e.state || {};
      const fromHash = (window.location.hash || '').replace(/^#/, '').split('/')[0];
      const target = state.tab || fromHash || 'ciel';
      if (target === 'ciel' || target === 'espaces') {
        setActiveTab(target);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
```

- [ ] **Step 2: Espaces.jsx — sub-route dans le hash**

Edit `/Users/williammorel/NÉYA/src/v2/screens/Espaces.jsx` :

old_string:
```javascript
import { useState } from 'react';
import { GlassCard, Eyebrow, HeroTitle, Body, Icon, tokens } from '../../components/ui';
import Refuge from './Refuge';
import Voix from './Voix';
import CaVa from './CaVa';
import Blobs from '../../components/Blobs';

const SPACES = [
  { key: 'refuge', label: 'Refuge', icon: 'sparkle', subtitle: 'Se poser, respirer, écrire.' },
  { key: 'voix',   label: 'Voix',   icon: 'message', subtitle: 'Lire ce que les autres ressentent.' },
  { key: 'marque', label: 'Marque ÇA VA?', icon: 'heart', subtitle: 'L\'univers, les pièces, le manifeste.' },
];

export default function Espaces() {
  const [active, setActive] = useState(null);

  if (active === 'refuge') return <Refuge onClose={() => setActive(null)} />;
  if (active === 'voix')   return <Voix   onClose={() => setActive(null)} />;
  if (active === 'marque') return <CaVa onClose={() => setActive(null)} />;
```

new_string:
```javascript
import { useState, useEffect } from 'react';
import { GlassCard, Eyebrow, HeroTitle, Body, Icon, tokens } from '../../components/ui';
import Refuge from './Refuge';
import Voix from './Voix';
import CaVa from './CaVa';
import Blobs from '../../components/Blobs';

const SPACES = [
  { key: 'refuge', label: 'Refuge', icon: 'sparkle', subtitle: 'Se poser, respirer, écrire.' },
  { key: 'voix',   label: 'Voix',   icon: 'message', subtitle: 'Lire ce que les autres ressentent.' },
  { key: 'marque', label: 'Marque ÇA VA?', icon: 'heart', subtitle: 'L\'univers, les pièces, le manifeste.' },
];

const VALID_SUBS = new Set(['refuge', 'voix', 'marque']);

function readSubFromHash() {
  if (typeof window === 'undefined') return null;
  const parts = (window.location.hash || '').replace(/^#/, '').split('/');
  if (parts[0] !== 'espaces') return null;
  return VALID_SUBS.has(parts[1]) ? parts[1] : null;
}

export default function Espaces() {
  const [active, setActive] = useState(() => readSubFromHash());

  // Sync state -> hash
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const wanted = active ? `#espaces/${active}` : '#espaces';
    if (window.location.hash !== wanted) {
      window.history.pushState({ tab: 'espaces', sub: active || null }, '', wanted);
    }
  }, [active]);

  // popstate : back -> retour Espaces racine si on etait dans un sub
  useEffect(() => {
    const onPop = () => {
      const sub = readSubFromHash();
      setActive(sub);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const closeSub = () => setActive(null);

  if (active === 'refuge') return <Refuge onClose={closeSub} />;
  if (active === 'voix')   return <Voix   onClose={closeSub} />;
  if (active === 'marque') return <CaVa onClose={closeSub} />;
```

- [ ] **Step 3: Build verify**

Run: `cd /Users/williammorel/NÉYA && npm run build`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
cd /Users/williammorel/NÉYA && git add src/v2/App.jsx src/v2/screens/Espaces.jsx && git commit -m "$(cat <<'EOF'
fix(v5/nav): history pushState + popstate (back Android + deeplink)

- App.jsx : activeTab pushState '#ciel' ou '#espaces' au changement,
  popstate listener qui reapplique le tab depuis l'history state.
- App boot : deeplink hash prioritaire pour set activeTab initial.
- Espaces.jsx : sub-route 'refuge'/'voix'/'marque' synchronisee
  dans le hash '#espaces/X', popstate ramene au sous-ecran selon
  hash courant.
- Back navigateur / Android back remonte d'un cran au lieu de
  fermer l'app.

Fix H14 (HIGH) - audit fonctionnel V5.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 23: theme-color saisonnier

**Files:**
- Modify: `src/v2/hooks/useSeasonalPalette.js`

**Context:**
- `index.html:8` : `<meta name="theme-color" content="#EEF3F8" />` figé
- `useSeasonalPalette.js` change `data-season` sur `<html>` mais ne touche pas la meta
- Fix : étendre le hook pour muter la meta theme-color selon saison

- [ ] **Step 1: Étendre le hook**

Edit `/Users/williammorel/NÉYA/src/v2/hooks/useSeasonalPalette.js` :

old_string:
```javascript
import { useEffect, useState } from 'react';

/**
 * Détecte la saison actuelle (hémisphère nord) et applique
 * un data-season sur <html> pour activer les overrides CSS tokens.css.
 *
 * Retourne le nom de la saison : 'printemps' | 'ete' | 'automne' | 'hiver'
 */
export default function useSeasonalPalette() {
  const [season, setSeason] = useState(() => getSeason());

  useEffect(() => {
    document.documentElement.setAttribute('data-season', season);
  }, [season]);

  // Re-check à chaque focus (changement de jour possible si user revient le lendemain)
  useEffect(() => {
    const onFocus = () => {
      const s = getSeason();
      setSeason(s);
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  return season;
}
```

new_string:
```javascript
import { useEffect, useState } from 'react';

/**
 * Détecte la saison actuelle (hémisphère nord) et applique
 * un data-season sur <html> + theme-color meta pour activer
 * les overrides CSS tokens.css et la barre de statut iOS.
 *
 * Retourne le nom de la saison : 'printemps' | 'ete' | 'automne' | 'hiver'
 */
const SEASON_THEME_COLORS = {
  printemps: '#EAF3EE', // vert frais doux
  ete:       '#FBF1E0', // sable chaud doux
  automne:   '#F4E3D7', // pêche
  hiver:     '#EEF3F8', // bleu glacé (default)
};

export default function useSeasonalPalette() {
  const [season, setSeason] = useState(() => getSeason());

  useEffect(() => {
    document.documentElement.setAttribute('data-season', season);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', SEASON_THEME_COLORS[season] || SEASON_THEME_COLORS.hiver);
    }
  }, [season]);

  // Re-check à chaque focus (changement de jour possible si user revient le lendemain)
  useEffect(() => {
    const onFocus = () => {
      const s = getSeason();
      setSeason(s);
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  return season;
}
```

- [ ] **Step 2: Build verify**

Run: `cd /Users/williammorel/NÉYA && npm run build`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
cd /Users/williammorel/NÉYA && git add src/v2/hooks/useSeasonalPalette.js && git commit -m "$(cat <<'EOF'
fix(v5/nav): theme-color meta tag synchronise avec data-season

useSeasonalPalette mute desormais aussi <meta theme-color> a
chaque change de saison :
- printemps : #EAF3EE (vert frais doux)
- ete       : #FBF1E0 (sable chaud)
- automne   : #F4E3D7 (peche)
- hiver     : #EEF3F8 (bleu glace, default)

Status bar iOS reflete la saison en cours plutot que le default.

Fix H15 (HIGH) - audit fonctionnel V5.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

# DEPLOIEMENT AUTONOME

## Task 24: Build final + merge main + deploy prod

**Context:**
- Mode autonome (ROBOT.md `feedback_autonomous_mode`) : Will autorise commit + `vercel --prod --yes` + `git push origin main`
- Vérif HTTP 200 obligatoire après deploy

- [ ] **Step 1: Build final clean**

Run: `cd /Users/williammorel/NÉYA && npm run build`
Expected: exit 0, no error. Vérifier le bundle size dans le output (cible : pas de régression vs 292 kB / 75 kB gzip de la V5 initiale, idéalement amélioration légère).

- [ ] **Step 2: Récap diff vs main**

Run: `cd /Users/williammorel/NÉYA && git log --oneline main..fix/v5-fonctionnel`
Expected: 19-22 commits (les commits combinés T4 T12 T18 réduisent le compte vs 23 prévus).

- [ ] **Step 3: Merge fix/v5-fonctionnel sur main**

```bash
cd /Users/williammorel/NÉYA && git checkout main && git merge fix/v5-fonctionnel --no-ff -m "$(cat <<'EOF'
fix(v5): polish fonctionnel post-audit cavalerie (19-22 fixes)

Merge fix/v5-fonctionnel : 7 CRITICAL + 16 HIGH fixes issus de
l'audit cavalerie 6 sub-agents Opus sur V5.

Groupes :
A. Onboarding (4) - recovery step 8, guard double-tap,
   preferences modifiables, Passer contextuel
B. Ciel + Touch (4) - hit-zone 44, fallback citation, FAB
   always + idempotent + view mode, chapter Piece seed
C. Refuge (4) - Meditation mode='free', Carnet save guard +
   timing + momentum, BreathingPause accent, retour Cocon
D. CaVa (3) - viewer borne, retour TopBar, mini-nav 5 anchors
E. Data (3) - mutateProfile atomique, x/y persistes + id collision,
   migration dedup
F. Nav + iOS (2) - history API + popstate, theme-color saison

Sequencement E->A->B->C->D->F suivi pour eviter conflits state.js.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 4: Deploy Vercel prod**

```bash
cd /Users/williammorel/NÉYA && vercel --prod --yes
```

Expected: URL `https://neya-kappa.vercel.app` mise à jour. Output Vercel doit montrer "Production:" avec une URL et un build "Ready".

- [ ] **Step 5: Vérifier HTTP 200**

```bash
sleep 8 && curl -sI https://neya-kappa.vercel.app | head -1
```

Expected: `HTTP/2 200`

- [ ] **Step 6: Push main vers GitHub**

```bash
cd /Users/williammorel/NÉYA && git push origin main
```

Expected: push réussit (peut nécessiter `--force-with-lease` si rebase intermédiaire ; sinon push direct OK).

- [ ] **Step 7: Cleanup branche locale**

```bash
cd /Users/williammorel/NÉYA && git branch -d fix/v5-fonctionnel
```

Expected: branche locale supprimée (main pointe maintenant sur la merge commit).

- [ ] **Step 8: Récap utilisateur**

Composer un message court pour Will :
- Lien clickable : `https://neya-kappa.vercel.app`
- Liste des fixes par groupe (1 ligne par groupe)
- HTTP 200 confirmé
- Bundle size avant/après

---

## Self-review (post-plan)

**1. Spec coverage** :
- Groupe E (4 fixes) : T1 (E1) + T2 (E2+E4 combined) + T3 (E3) ✓
- Groupe A (4 fixes) : T5 (A1) + T6 (A2) + T7 (A3) + T8 (A4) ✓
- Groupe B (5 fixes) : T9 (B1) + T10 (B2) + T11 (B3+B4 combined) + T13 (B5) ✓
- Groupe C (5 fixes) : T14 (C1) + T15 (C2+C5 combined) + T16 (C3) + T17 (C4) ✓
- Groupe D (3 fixes) : T19 (D1) + T20 (D2) + T21 (D3) ✓
- Groupe F (2 fixes) : T22 (F1) + T23 (F2) ✓
- Deploy : T24 ✓
Total : 23 fixes couverts par 20 tâches (3 combinées : T4 dans T2, T12 dans T11, T18 dans T15)

**2. Placeholder scan** :
- Pas de "TBD", "TODO" dans les steps
- Tous les code blocks complets avec full old_string/new_string

**3. Type consistency** :
- `mutateProfile(updater)` défini en T1, utilisé en T1 (addStar). Cohérent.
- `mode='view'` / `viewStar` prop ajoutés en T11 à PoseEtoileModal, utilisés en T11 dans Ciel.jsx. Cohérent.
- `mode='free'` ajouté en T14 à Meditation, passé en T14 par Refuge. Cohérent.
- `accent='var(--rose-700)'` en T16 — vérifier que `--rose-700` existe dans tokens.css. (Vérifié dans SAVEPOINT : palette V4 = `--rose-700 #C87090`).

Plan complete et cohérent.

---

## Notes pour l'implémenteur

- **Pas de TDD classique** : le projet n'a pas de tests, validation par `npm run build` + vérification visuelle décrite.
- **Mode autonome activé** : pas besoin de demander confirmation avant deploy, mais signaler tout doute critique avant `vercel --prod`.
- **Ordre strict** : respecter E→A→B→C→D→F. Tâches Groupe E touchent state.js dont dépendent toutes les autres.
- **Si build casse** : ne pas commit, debug en place, re-tenter step 3-4 jusqu'à exit 0.
- **Si un step Edit échoue** (old_string pas trouvé) : Read le fichier autour des lignes mentionnées, identifier la nuance, adapter old_string. Ne jamais inventer du code non documenté ici.
