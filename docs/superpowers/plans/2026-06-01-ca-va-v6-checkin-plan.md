# ÇA VA? V6 — Check-in du jour — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer la charpente V5 Constellation par un check-in quotidien direct, comprehensible dès le premier contact, en livrant 2 onglets (Check-in + Marque) + FAB Crise safety.

**Architecture:** State machine 4 états dans `Checkin.jsx` (question → echo → action → done) qui orchestre 4 mini-flows réutilisant les composants existants (BreathingPause, Carnet) + 1 nouveau (BoueeModal). Timeline narrative séparée. Migration douce des `profile.stars` V5 vers `profile.checkins` V6 sans perte d'historique. Suppression massive du code constellation/refuge/voix/cocon (~25 fichiers).

**Tech Stack:** React 18 (functional + hooks), Vite 5, JSX single-page (pas de tests, pas de lint), localStorage seul (pas de backend), Web Audio API pour la respiration, Cormorant Garamond + Inter via Google Fonts.

**Note sur la validation:** Ce projet n'a **pas d'infra de tests** (cf. ROBOT.md). Chaque tâche valide via :
1. `npm run build` clean (pas d'erreur, pas de warning bloquant)
2. Smoke test manuel en dev (`npm run dev`)
3. `grep` pour vérifier qu'aucun import orphelin ne reste après suppression

Spec source : [`docs/superpowers/specs/2026-06-01-ca-va-v6-checkin-design.md`](../specs/2026-06-01-ca-va-v6-checkin-design.md)

---

## File Structure

### Nouveaux fichiers (à créer)

| Fichier | Responsabilité | Taille estimée |
|---|---|---|
| `src/v2/helpers/checkins.js` | Data layer V6 : addCheckin idempotent, getTodayCheckin, getCheckinsRange, getDominantMood, hasCheckinToday | ~120 lignes |
| `src/v2/helpers/migrate-v5-to-v6.js` | Migration star → checkin, mapping color→mood + type→action, dedup par jour | ~80 lignes |
| `src/v2/screens/Checkin.jsx` | State machine 4 états (question/echo/action/done), orchestre les mini-flows | ~280 lignes |
| `src/v2/screens/Timeline.jsx` | Liste narrative chronologique + overlay détail au tap | ~180 lignes |
| `src/components/ui/BoueeModal.jsx` | Modal action concrète (1 bouée affichée + bouton Fait) | ~90 lignes |
| `src/components/ui/CitationKeepModal.jsx` | Modal "Citation à garder" (mood='ca-va' uniquement) | ~70 lignes |

### Fichiers modifiés

| Fichier | Changement | Lignes touchées |
|---|---|---|
| `src/v2/App.jsx` | Réécrit complet : 2 onglets Check-in/Marque, FAB Crise, BottomNav simple | rewrite ~250 lignes |
| `src/v2/screens/Onboarding.jsx` | Réécrit complet : 1 écran manifeste + Commencer | rewrite ~90 lignes |
| `src/v2/screens/BreathingPause.jsx` | Ajout prop `rhythm` ('4-7-8' \| '5-5' \| '4-6'), default '5-5' | +30 lignes |
| `src/v2/screens/Carnet.jsx` | Ajout prop `mood` (placeholder + accent adaptatifs) | +15 lignes |
| `src/v2/screens/Crise.jsx` | Simplification : retrait paramètres custom, utilise BreathingPause rhythm='4-6' | -50/+20 lignes |
| `src/v2/state.js` | Cleanup : retire `completeMeditation`, `WORLD_PROGRESSION`, helpers Cercle/Lumières, `detectCrisisKeywords`. Garde `mutateProfile`, `addSouvenir`, `BOUEES`, `pickDailyPrompt` (à voir si utile), greet, haptic, ls, mutateProfile, recordCrisis*. | -150/+0 lignes |
| `src/v2/data/citations.js` | Inchangé (utilisé pour les écho citations) | 0 |

### Fichiers supprimés (Phase 8)

```
src/v2/screens/Ciel.jsx
src/v2/screens/Espaces.jsx
src/v2/screens/EspacesIRL.jsx
src/v2/screens/Refuge.jsx
src/v2/screens/Voix.jsx
src/v2/screens/Cocon.jsx
src/v2/screens/CoconAmbiance.jsx
src/v2/screens/Meditation.jsx
src/v2/screens/Manifeste.jsx
src/v2/screens/Tour.jsx
src/v2/screens/Patronus.jsx
src/v2/screens/Aide.jsx
src/v2/screens/CriseSettings.jsx
src/v2/screens/Splash.jsx (si présent et inutilisé)
src/v2/screens/RituelPlayer.jsx
src/v2/screens/Musique.jsx
src/v2/screens/Souvenirs.jsx
src/components/ui/StarField.jsx
src/components/ui/Star.jsx
src/components/ui/CielChapter.jsx
src/components/ui/PoseEtoileModal.jsx
src/components/ui/PersonAvatar.jsx
src/v2/data/star-positions.js
src/v2/data/aventure-foret.js
src/v2/data/aventure-oasis.js
src/v2/data/aventure-temple.js
src/v2/data/mondes.js
src/v2/data/lecons.js
src/v2/data/rituels-temps.js
src/v2/worlds.js
src/v2/helpers/chapter-generator.js
src/v2/community.js
src/v2/hooks/useDailyStarStatus.js
src/v2/hooks/useCitation.js
src/v2/hooks/useSeasonalPalette.js
src/components/onboarding/  (tout le dossier — l'onboarding cavalerie est dans src/components/onboarding/, on bascule sur Onboarding.jsx racine v2)
```

> Note: le `src/v2/helpers/stars.js` est **conservé lecture-seule** pour la migration (cf. spec §8). Aucun nouveau code ne doit l'importer après Phase 1.

---

## Phase 0 — Prérequis (à faire AVANT V6)

### Task 0.1: Valider preview cavalry + promote sur prod

**Files:** Pas de modif code — pure ops Git/Vercel.

- [ ] **Step 1: Will valide visuellement le preview cavalry**

URL : `https://neya-qrb4efhnh-willmorel49-coders-projects.vercel.app`

Tester les 7 fixes CRITICAL :
- Onboarding pose-star CTA visible (A1)
- Touch zones étoiles ≥ 44 (B1)
- Pas de crash modal sans citation (B2)
- FAB visible tout le temps (B3)
- Mode méditation libre sans souvenir "Forêt" (C1)
- Viewer mosaïque compteur correct (D1)
- Hash routing back Android (F1)

Si OK → Step 2. Si KO → patcher dans `fix/v5-fonctionnel`, redéployer preview, re-valider.

- [ ] **Step 2: Merge fix/v5-fonctionnel sur main**

```bash
git checkout main
git merge --ff-only fix/v5-fonctionnel
git push origin main
```

Si fast-forward refusé (commits sur main entre temps), faire un `git merge --no-ff fix/v5-fonctionnel` avec un commit message clair.

- [ ] **Step 3: Déployer prod + vérifier HTTP 200**

```bash
vercel --prod --yes
curl -sI https://neya-kappa.vercel.app | head -1
```

Expected: `HTTP/2 200`

- [ ] **Step 4: Update SAVEPOINT.md V5.1**

Edit `SAVEPOINT.md` : ajouter section "V5.1 — Cavalerie post-audit (23 fixes) prod live" avec liste des fixes.

- [ ] **Step 5: Commit + push**

```bash
git add SAVEPOINT.md
git commit -m "chore(v5.1): cavalerie 23 fixes prod live - SAVEPOINT update"
git push origin main
```

### Task 0.2: Créer branche V6

- [ ] **Step 1: Branch depuis main propre**

```bash
git checkout main
git pull origin main
git checkout -b feat/v6-checkin
```

- [ ] **Step 2: Vérifier le baseline**

```bash
npm install
npm run build
```

Expected: build clean, bundle ~292 kB (V5 baseline post-cavalry).

- [ ] **Step 3: Stop visual companion server (cleanup)**

```bash
ls .superpowers/brainstorm/  # find session dir
/Users/williammorel/.claude/plugins/cache/claude-plugins-official/superpowers/5.1.0/skills/brainstorming/scripts/stop-server.sh .superpowers/brainstorm/<session-dir>
```

---

## Phase 1 — Data layer (foundation)

### Task 1.1: Créer `src/v2/helpers/checkins.js`

**Files:**
- Create: `src/v2/helpers/checkins.js`

- [ ] **Step 1: Créer le fichier avec tous les helpers V6**

```js
/* ============================================================
   Helpers — Checkins V6
   ============================================================
   Data layer pour le check-in quotidien.
   Toutes les mutations passent par mutateProfile (atomique).
   ============================================================ */

import { ls, getProfile, mutateProfile } from '../state';
import { pickCitation } from '../data/citations';

/** Convertit Date → 'YYYY-MM-DD' */
export function toIsoDate(d = new Date()) {
  return d.toISOString().split('T')[0];
}

/** Hash déterministe simple (FNV-1a 32-bit) — pour seeds citation */
export function hashSeed(input) {
  let h = 0x811c9dc5;
  const s = String(input);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Index jour depuis 2026-01-01 (pour seeded stable par jour) */
export function dayIndex(isoDate = toIsoDate()) {
  const ref = new Date('2026-01-01').getTime();
  const day = new Date(isoDate).getTime();
  return Math.floor((day - ref) / 86400000);
}

const MOOD_TAGS = {
  'pas-terrible':    ['fardeau', 'peur', 'manque'],
  'ca-va-pas-trop':  ['présence', 'tendresse'],
  'ca-va':           ['gratitude', 'joie'],
};

/** Pour un mood, choisit une citation déterministe par jour + user. */
export function pickEchoCitation(mood) {
  const tags = MOOD_TAGS[mood] || ['présence'];
  const seed = dayIndex() + hashSeed(mood);
  const tag = tags[seed % tags.length];
  return pickCitation(tag, seed);
}

/** A-t-on déjà un check-in pour aujourd'hui ? */
export function hasCheckinToday() {
  const today = toIsoDate();
  const list = getProfile().checkins || [];
  return list.some((c) => c.date === today);
}

/** Le check-in d'aujourd'hui ou null. */
export function getTodayCheckin() {
  const today = toIsoDate();
  const list = getProfile().checkins || [];
  return list.find((c) => c.date === today) || null;
}

/**
 * Crée le check-in du jour (idempotent : si existe déjà, retourne l'existant).
 * @param {object} args - { mood }
 *   mood : 'ca-va' | 'ca-va-pas-trop' | 'pas-terrible'
 */
export function addCheckin({ mood }) {
  const existing = getTodayCheckin();
  if (existing) return existing;

  const today = toIsoDate();
  const citation = pickEchoCitation(mood);

  const checkin = {
    id: `checkin-${today}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    date: today,
    time: new Date().toTimeString().slice(0, 5),
    mood,
    citation,
    actions: [],
  };

  mutateProfile((p) => ({ ...p, checkins: [...(p.checkins || []), checkin] }));
  return checkin;
}

/**
 * Ajoute une action au check-in du jour (multi-actions permises).
 * @param {object} action - { type: 'breath'|'write'|'bouee'|'citation', ...args }
 */
export function appendActionToTodayCheckin(action) {
  const today = toIsoDate();
  const withTs = { ...action, doneAt: new Date().toISOString() };
  mutateProfile((p) => ({
    ...p,
    checkins: (p.checkins || []).map((c) =>
      c.date === today ? { ...c, actions: [...(c.actions || []), withTs] } : c
    ),
  }));
}

/** Récupère check-ins dans une plage de dates (inclusive). */
export function getCheckinsRange(fromIso, toIso) {
  const list = getProfile().checkins || [];
  return list.filter((c) => c.date >= fromIso && c.date <= toIso);
}

/** Tous les check-ins, triés par date desc (plus récent first). Max 90 jours. */
export function getAllCheckins() {
  const list = getProfile().checkins || [];
  const today = new Date();
  const cutoff = toIsoDate(new Date(today.getTime() - 90 * 86400000));
  return [...list]
    .filter((c) => c.date >= cutoff)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** Check-in le plus récent ou null. */
export function getLatestCheckin() {
  return getAllCheckins()[0] || null;
}

/** Mood dominant des N derniers jours (string ou null). */
export function getDominantMood(days = 7) {
  const today = new Date();
  const from = new Date(today.getTime() - days * 86400000);
  const list = getCheckinsRange(toIsoDate(from), toIsoDate(today));
  if (list.length === 0) return null;
  const counts = {};
  list.forEach((c) => { counts[c.mood] = (counts[c.mood] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

/** Couleur visuelle pour un mood (utilisée par Timeline + dot). */
export const MOOD_COLORS = {
  'ca-va':           '#7dc8a0',  // vert tendre
  'ca-va-pas-trop':  '#e8a0b8',  // rose tendre
  'pas-terrible':    '#aac6dd',  // bleu nuit
};

/** Label humain pour un mood. */
export const MOOD_LABELS = {
  'ca-va':           'Ça va',
  'ca-va-pas-trop':  'Ça va pas trop',
  'pas-terrible':    'Pas terrible',
};
```

- [ ] **Step 2: Build clean**

```bash
npm run build
```

Expected: pas d'erreur. Le fichier n'est pas encore importé, donc pas de side-effect.

- [ ] **Step 3: Commit**

```bash
git add src/v2/helpers/checkins.js
git commit -m "feat(v6/T1.1): helpers checkins.js - data layer V6 (addCheckin idempotent, getTodayCheckin, getCheckinsRange, getDominantMood, MOOD_COLORS, MOOD_LABELS)"
```

### Task 1.2: Créer `src/v2/helpers/migrate-v5-to-v6.js`

**Files:**
- Create: `src/v2/helpers/migrate-v5-to-v6.js`

- [ ] **Step 1: Créer le fichier de migration**

```js
/* ============================================================
   Migration V5 -> V6 : stars -> checkins
   ============================================================
   Idempotent via flag cava_v6_migrated.
   Conserve profile.stars intact pour rollback.
   ============================================================ */

import { ls, getProfile, mutateProfile } from '../state';
import { pickEchoCitation } from './checkins';

const MIGRATED_FLAG = 'cava_v6_migrated';

const STAR_COLOR_TO_MOOD = {
  bleu:   'ca-va',
  rose:   'ca-va',
  violet: 'ca-va-pas-trop',
  peche:  'ca-va-pas-trop',
  orage:  'pas-terrible',
};

function starTypeToAction(star) {
  switch (star.type) {
    case 'mood':
      return null;
    case 'breath':
      return { type: 'breath', legacy: true, doneAt: star.date + 'T' + (star.time || '12:00') + ':00.000Z' };
    case 'voice':
      return { type: 'voice-legacy', doneAt: star.date + 'T' + (star.time || '12:00') + ':00.000Z' };
    case 'write':
      return { type: 'write', text: star.note || null, doneAt: star.date + 'T' + (star.time || '12:00') + ':00.000Z' };
    default:
      return null;
  }
}

export function migrateV5ToV6() {
  if (ls.get(MIGRATED_FLAG, false)) return;

  const p = getProfile();
  const stars = p.stars || [];
  const existingCheckins = p.checkins || [];
  const existingDates = new Set(existingCheckins.map((c) => c.date));

  if (stars.length === 0) {
    ls.set(MIGRATED_FLAG, true);
    return;
  }

  // Groupe les stars par date. Première star du jour = mood. Toutes les actions cumulées.
  const starsByDate = {};
  stars.forEach((s) => {
    if (!s.date) return;
    if (!starsByDate[s.date]) starsByDate[s.date] = [];
    starsByDate[s.date].push(s);
  });

  const newCheckins = [];
  Object.entries(starsByDate).forEach(([date, dayStars]) => {
    if (existingDates.has(date)) return; // dedup: ne pas migrer si checkin déjà présent

    // Tri par time pour prendre le premier
    const sorted = [...dayStars].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    const first = sorted[0];
    const mood = STAR_COLOR_TO_MOOD[first.color] || 'ca-va-pas-trop';

    const actions = sorted
      .map((s) => starTypeToAction(s))
      .filter(Boolean);

    const citation = first.citation && first.citation.text
      ? first.citation
      : pickEchoCitation(mood);

    newCheckins.push({
      id: `migrated-${date}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      date,
      time: first.time || '12:00',
      mood,
      citation,
      actions,
    });
  });

  if (newCheckins.length > 0) {
    mutateProfile((prof) => ({
      ...prof,
      checkins: [...(prof.checkins || []), ...newCheckins],
    }));
  }

  ls.set(MIGRATED_FLAG, true);
}
```

- [ ] **Step 2: Build clean**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/v2/helpers/migrate-v5-to-v6.js
git commit -m "feat(v6/T1.2): migration V5 -> V6 (star.color -> mood, star.type -> actions, dedup par date, fusion same-day)"
```

### Task 1.3: Ajouter `checkins: []` au defaultProfile

**Files:**
- Modify: `src/v2/state.js`

- [ ] **Step 1: Ajouter le champ `checkins` à `defaultProfile()`**

Dans `src/v2/state.js`, trouver `export const defaultProfile = () => ({` (autour de la ligne 77), et ajouter `checkins: [],` après `stars: [],` :

```js
  stars: [],
  checkins: [],
  preferences: {
```

- [ ] **Step 2: Build clean**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/v2/state.js
git commit -m "feat(v6/T1.3): defaultProfile - ajout champ checkins[]"
```

---

## Phase 2 — Composant Check-in (charpente)

### Task 2.1: Squelette `Checkin.jsx` avec state machine

**Files:**
- Create: `src/v2/screens/Checkin.jsx`

- [ ] **Step 1: Créer le squelette state machine**

```jsx
/* ============================================================
   Checkin — Écran principal V6
   ============================================================
   State machine 4 états :
     'question'  -> "Et toi, ça va vraiment ?" + 3 choix
     'echo'      -> menu 3 options adaptées au mood
     'action'    -> mini-flow (respiration/écriture/bouée/citation)
     'done'      -> "Tu t'es posé·e aujourd'hui."
   ============================================================ */

import { useState, useEffect } from 'react';
import { hasCheckinToday, getTodayCheckin, addCheckin, appendActionToTodayCheckin, MOOD_COLORS, MOOD_LABELS } from '../helpers/checkins';
import { greet, getProfile, haptic } from '../state';

const ECHO_MENU = {
  'pas-terrible': [
    { id: 'respi-478', label: 'Respirer 4·7·8', sublabel: 'Calme le système', icon: '◯', kind: 'respi-478' },
    { id: 'write',     label: 'Écrire ce qui pèse', sublabel: 'Vider la tête', icon: '✎', kind: 'write' },
    { id: 'bouee',     label: 'Une bouée douce', sublabel: 'Action concrète', icon: '◐', kind: 'bouee', boueeLevel: ['corps', 'lien'] },
  ],
  'ca-va-pas-trop': [
    { id: 'respi-55',  label: 'Respirer 5·5', sublabel: 'Cohérence cardiaque', icon: '◯', kind: 'respi-55' },
    { id: 'write',     label: 'Écrire (texte libre)', sublabel: 'Pose tes mots', icon: '✎', kind: 'write' },
    { id: 'bouee',     label: 'Une bouée', sublabel: 'Petit pas concret', icon: '◐', kind: 'bouee' },
  ],
  'ca-va': [
    { id: 'citation',  label: 'Une citation à garder', sublabel: 'Pour aujourd\'hui', icon: '✦', kind: 'citation' },
    { id: 'write',     label: 'Un mot pour toi', sublabel: 'Gratitude, joie', icon: '✎', kind: 'write' },
    { id: 'bouee',     label: 'Une bouée légère', sublabel: 'Continue ton élan', icon: '◐', kind: 'bouee', boueeLevel: ['esprit', 'monde'] },
  ],
};

export default function Checkin() {
  const [step, setStep] = useState(() => (hasCheckinToday() ? 'done' : 'question'));
  const [currentCheckin, setCurrentCheckin] = useState(() => getTodayCheckin());
  const [activeAction, setActiveAction] = useState(null); // { kind, label, ... }
  const [timelineOpen, setTimelineOpen] = useState(false);

  // Garde le checkin sync si autre tab modifie
  useEffect(() => {
    const onChange = () => {
      setCurrentCheckin(getTodayCheckin());
      if (hasCheckinToday() && step === 'question') setStep('done');
    };
    window.addEventListener('cava:profile-changed', onChange);
    return () => window.removeEventListener('cava:profile-changed', onChange);
  }, [step]);

  const handlePickMood = (mood) => {
    haptic(4);
    const c = addCheckin({ mood });
    setCurrentCheckin(c);
    setStep('echo');
  };

  const handlePickAction = (option) => {
    haptic(4);
    setActiveAction(option);
    setStep('action');
  };

  const handleActionDone = (actionPayload) => {
    appendActionToTodayCheckin(actionPayload);
    setCurrentCheckin(getTodayCheckin());
    setActiveAction(null);
    setStep('done');
  };

  const handleContinue = () => {
    haptic(2);
    setStep('echo');
  };

  return (
    <div style={{ minHeight: '100dvh', padding: '40px 20px 100px', display: 'flex', flexDirection: 'column' }}>
      {step === 'question' && <QuestionStep onPick={handlePickMood} />}
      {step === 'echo'     && <EchoStep mood={currentCheckin?.mood} citation={currentCheckin?.citation} onPick={handlePickAction} />}
      {step === 'action'   && <ActionStep option={activeAction} mood={currentCheckin?.mood} onDone={handleActionDone} onCancel={() => setStep('echo')} />}
      {step === 'done'     && <DoneStep checkin={currentCheckin} onContinue={handleContinue} onViewPast={() => setTimelineOpen(true)} />}
    </div>
  );
}

function QuestionStep({ onPick }) {
  const profile = getProfile();
  const prenom = profile?.preferences?.prenom;
  const today = new Date();
  const dayName = today.toLocaleDateString('fr-FR', { weekday: 'long' });
  const dateLong = today.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.55, marginBottom: 8 }}>
        {greet()}{prenom ? `, ${prenom}` : ''} · {dayName} {dateLong}
      </div>
      <h1 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontStyle: 'italic',
        fontSize: 32,
        lineHeight: 1.2,
        marginBottom: 32,
        color: 'var(--ink)',
      }}>
        Et toi,<br/>ça va vraiment ?
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { mood: 'ca-va',           emoji: '👌', label: 'Ça va' },
          { mood: 'ca-va-pas-trop',  emoji: '😶', label: 'Ça va pas trop' },
          { mood: 'pas-terrible',    emoji: '🌧', label: 'Pas terrible' },
        ].map((opt) => (
          <button
            key={opt.mood}
            onClick={() => onPick(opt.mood)}
            style={{
              minHeight: 56,
              padding: '14px 18px',
              background: 'rgba(255,255,255,0.55)',
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: 16,
              fontSize: 16,
              fontFamily: 'inherit',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              color: 'var(--ink)',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span style={{ fontSize: 22 }}>{opt.emoji}</span>
            <span>{opt.label}</span>
            <span style={{ marginLeft: 'auto', opacity: 0.4 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function EchoStep({ mood, citation, onPick }) {
  const options = ECHO_MENU[mood] || ECHO_MENU['ca-va-pas-trop'];
  const moodLabel = MOOD_LABELS[mood];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'inline-block', alignSelf: 'flex-start',
        padding: '4px 10px',
        background: `${MOOD_COLORS[mood]}30`,
        color: MOOD_COLORS[mood],
        borderRadius: 10,
        fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
        marginBottom: 12,
      }}>
        Tu m'as dit : {moodLabel}
      </div>
      <h1 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontStyle: 'italic',
        fontSize: 28,
        lineHeight: 1.2,
        marginBottom: 8,
        color: 'var(--ink)',
      }}>
        {mood === 'pas-terrible' ? 'Reste là.' : mood === 'ca-va' ? 'Belle énergie.' : 'Pose-toi.'}
        <br/>Tu veux faire quoi ?
      </h1>
      <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 24 }}>3 options. Tu peux aussi juste fermer.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onPick(opt)}
            style={{
              minHeight: 56,
              padding: '14px 16px',
              background: 'rgba(255,255,255,0.55)',
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: 14,
              fontSize: 14,
              fontFamily: 'inherit',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: 'var(--ink)',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 18, opacity: 0.8 }}>{opt.icon}</span>
            <div style={{ flex: 1 }}>
              <div>{opt.label}</div>
              <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>{opt.sublabel}</div>
            </div>
            <span style={{ opacity: 0.4 }}>→</span>
          </button>
        ))}
      </div>

      {citation && (
        <div style={{ marginTop: 'auto', paddingTop: 24, opacity: 0.7 }}>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontSize: 14, lineHeight: 1.5 }}>« {citation.text} »</p>
          {citation.author && <p style={{ fontSize: 11, opacity: 0.55, marginTop: 4 }}>— {citation.author}</p>}
        </div>
      )}
    </div>
  );
}

function ActionStep({ option, mood, onDone, onCancel }) {
  // Stubs — Phase 3 implémente les vrais mini-flows.
  // Pour l'instant : placeholder qui complète immédiatement.
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic' }}>
        [Stub] Mini-flow : {option?.label}
      </h2>
      <button
        onClick={() => onDone({ type: option?.kind || 'unknown' })}
        style={{ padding: '12px 24px', background: 'var(--rose-700, #BE185D)', color: 'white', border: 'none', borderRadius: 12 }}
      >
        Terminer (stub)
      </button>
      <button onClick={onCancel} style={{ background: 'transparent', border: 'none', opacity: 0.5 }}>
        Annuler
      </button>
    </div>
  );
}

function DoneStep({ checkin, onContinue, onViewPast }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <h1 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontStyle: 'italic',
        fontSize: 28,
        lineHeight: 1.2,
        marginBottom: 8,
        color: 'var(--ink)',
      }}>
        Tu t'es posé·e<br/>aujourd'hui.
      </h1>
      <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 32 }}>
        À demain. Sauf si tu veux revenir.
      </p>

      {checkin?.actions?.length > 0 && (
        <div style={{ marginBottom: 32, padding: 16, background: 'rgba(255,255,255,0.4)', borderRadius: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 8 }}>Ce que tu as fait</div>
          {checkin.actions.map((a, i) => (
            <div key={i} style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
              ✓ {a.type === 'breath' ? 'Respiration' : a.type === 'write' ? 'Écriture' : a.type === 'bouee' ? 'Bouée' : a.type === 'citation' ? 'Citation gardée' : a.type}
            </div>
          ))}
        </div>
      )}

      {checkin?.citation && (
        <div style={{ opacity: 0.8 }}>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontSize: 16, lineHeight: 1.5 }}>« {checkin.citation.text} »</p>
          {checkin.citation.author && <p style={{ fontSize: 11, opacity: 0.55, marginTop: 4 }}>— {checkin.citation.author}</p>}
        </div>
      )}

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={onContinue}
          style={{ minHeight: 48, background: 'rgba(232,160,184,0.16)', color: '#BE185D', border: 'none', borderRadius: 12, fontFamily: 'inherit', fontSize: 14 }}
        >
          Faire autre chose
        </button>
        <button
          onClick={onViewPast}
          style={{ minHeight: 40, background: 'transparent', border: 'none', opacity: 0.6, fontFamily: 'inherit', fontSize: 13 }}
        >
          Voir le passé →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build clean**

```bash
npm run build
```

Expected: clean. Pas encore importé.

- [ ] **Step 3: Commit**

```bash
git add src/v2/screens/Checkin.jsx
git commit -m "feat(v6/T2.1): Checkin.jsx state machine 4 etats (question/echo/action/done) avec stubs mini-flows"
```

### Task 2.2: Tester le flow Checkin en isolation

**Files:**
- Modify: `src/v2/App.jsx` (modif minimale temporaire)

- [ ] **Step 1: Importer Checkin et l'afficher temporairement à la place de la home**

Pour smoke test, on remplace temporairement le rendu de la tab principale :

```jsx
// Tout en bas de V2AppInner, AVANT le return final, ajouter pour debug :
import Checkin from './screens/Checkin';
// ...
// Dans le return, en mode DEBUG, render seulement Checkin
return (
  <div data-app="cava-v6-debug">
    <Checkin />
  </div>
);
```

(C'est temporaire — on rétablit le router en Task 7.)

- [ ] **Step 2: Lancer dev et tester**

```bash
npm run dev
# Ouvre http://localhost:5173
```

Vérifier manuellement :
- État question s'affiche au boot (si pas de checkin du jour)
- Tap "Pas terrible" → menu écho avec 3 options (Respirer 4·7·8 / Écrire / Bouée douce)
- Tap une option → stub d'action
- Tap "Terminer (stub)" → état done avec récap action
- Tap "Faire autre chose" → retour menu écho
- Refresh la page : si checkin du jour fait, atterrit direct sur done
- DevTools console : `localStorage.clear()` puis refresh → revient à question

- [ ] **Step 3: Revert le hack de debug dans App.jsx**

Reset App.jsx aux changements minimaux. On reviendra à App.jsx en Task 7.

```bash
git checkout HEAD -- src/v2/App.jsx
```

- [ ] **Step 4: Commit (rien si revert OK)**

Si le revert a tout nettoyé, pas de commit nécessaire. Juste passer.

---

## Phase 3 — Mini-flows (actions concrètes)

### Task 3.1: Adapter `BreathingPause.jsx` pour prop `rhythm`

**Files:**
- Modify: `src/v2/screens/BreathingPause.jsx`

- [ ] **Step 1: Lire le composant existant pour comprendre sa structure**

```bash
cat src/v2/screens/BreathingPause.jsx | head -80
```

Identifier où le rythme est codé en dur (probablement un objet `RHYTHMS` ou des constantes inspire/hold/exhale).

- [ ] **Step 2: Ajouter prop `rhythm` avec 3 valeurs**

En haut du composant, ajouter :

```js
const RHYTHMS = {
  '4-7-8': { inspire: 4, hold: 7, exhale: 8, label: '4·7·8' },
  '5-5':   { inspire: 5, hold: 0, exhale: 5, label: '5·5' },
  '4-6':   { inspire: 4, hold: 0, exhale: 6, label: '4·6' },
};

// Dans la signature : ({ accent = 'rose', rhythm = '5-5', onComplete })
const r = RHYTHMS[rhythm] || RHYTHMS['5-5'];
```

Remplacer les timings hardcodés par `r.inspire`, `r.hold`, `r.exhale` et afficher `r.label` au lieu du label hardcodé.

Si le composant ne supporte pas `onComplete`, l'ajouter : à la fin du dernier cycle (par exemple 4 cycles), appeler `onComplete?.({ type: 'breath', rhythm, cycles: N })`.

- [ ] **Step 3: Build + smoke test**

```bash
npm run build
npm run dev
# Importer BreathingPause manuellement dans Checkin.jsx ActionStep, tester rhythm 4-7-8 et 5-5
```

- [ ] **Step 4: Commit**

```bash
git add src/v2/screens/BreathingPause.jsx
git commit -m "feat(v6/T3.1): BreathingPause prop rhythm (4-7-8 / 5-5 / 4-6) + callback onComplete"
```

### Task 3.2: Adapter `Carnet.jsx` pour prop `mood`

**Files:**
- Modify: `src/v2/screens/Carnet.jsx`

- [ ] **Step 1: Ajouter prop `mood` qui adapte le placeholder**

Dans la signature : `({ onSave, onClose, mood })`.

Ajouter :

```js
const PLACEHOLDER_BY_MOOD = {
  'pas-terrible':   'Ce qui pèse, sans filtre…',
  'ca-va-pas-trop': 'Ce qui te traverse…',
  'ca-va':          'Un mot pour toi, pour aujourd\'hui…',
};
const placeholder = PLACEHOLDER_BY_MOOD[mood] || 'Tape, librement.';
```

Et passer `placeholder` au `<textarea placeholder={placeholder} />`.

Au save (`handleSave`), appeler `onSave?.({ type: 'write', text: noteText.trim() || null })` en plus de la logique existante (qui peut être conservée pour rétro-compat si Carnet est appelé d'ailleurs).

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add src/v2/screens/Carnet.jsx
git commit -m "feat(v6/T3.2): Carnet prop mood (placeholder adaptatif) + callback onSave"
```

### Task 3.3: Créer `BoueeModal.jsx`

**Files:**
- Create: `src/components/ui/BoueeModal.jsx`

- [ ] **Step 1: Créer le composant**

```jsx
/* ============================================================
   BoueeModal — Mini-flow "Une bouée concrète"
   ============================================================
   Affiche une bouée tirée du pool (filtré optionnellement par level),
   bouton Fait → onDone({ type: 'bouee', boueeId, action })
   ============================================================ */

import { useMemo } from 'react';
import Overlay from './Overlay';
import { haptic } from '../../v2/state';

const BOUEES = [
  { id: 'b01', action: 'Bois trois verres d\'eau, tranquillement.',                level: 'corps',  icon: '◯' },
  { id: 'b02', action: 'Ouvre la fenêtre cinq minutes. Respire.',                  level: 'corps',  icon: '◐' },
  { id: 'b03', action: 'Envoie un message court à une personne aimée.',            level: 'lien',   icon: '♡' },
  { id: 'b04', action: 'Marche dix minutes dehors, sans téléphone.',               level: 'corps',  icon: '↗' },
  { id: 'b05', action: 'Mange quelque chose de simple. Lentement.',                level: 'corps',  icon: '◓' },
  { id: 'b06', action: 'Écris trois lignes dans ton carnet.',                      level: 'esprit', icon: '✎' },
  { id: 'b07', action: 'Appelle quelqu\'un dont tu n\'as pas eu de nouvelles.',    level: 'lien',   icon: '☎' },
  { id: 'b08', action: 'Range un seul tiroir, un seul.',                           level: 'esprit', icon: '□' },
  { id: 'b09', action: 'Prends une douche tiède, lentement.',                      level: 'corps',  icon: '◇' },
  { id: 'b10', action: 'Écoute une chanson que tu n\'as plus écoutée depuis longtemps.', level: 'esprit', icon: '♪' },
  { id: 'b11', action: 'Sors prendre un café (ou un thé) hors de chez toi.',       level: 'monde',  icon: '☕' },
  { id: 'b12', action: 'Demande de l\'aide pour une petite chose aujourd\'hui.',   level: 'lien',   icon: '✦' },
  { id: 'b13', action: 'Touche une plante, sens-la.',                              level: 'corps',  icon: '❦' },
  { id: 'b14', action: 'Ne fais rien pendant cinq minutes. Vraiment rien.',        level: 'esprit', icon: '·' },
];

export default function BoueeModal({ open, onDone, onClose, levels }) {
  const bouee = useMemo(() => {
    if (!open) return null;
    const pool = levels && levels.length ? BOUEES.filter((b) => levels.includes(b.level)) : BOUEES;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [open, levels]);

  if (!open || !bouee) return null;

  const handleDone = () => {
    haptic([4, 30, 4]);
    onDone?.({ type: 'bouee', boueeId: bouee.id, action: bouee.action });
  };

  return (
    <Overlay backdrop="dark" onClose={onClose} ariaLabel="Une bouée">
      <div style={{
        minHeight: '100dvh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '40px 24px', textAlign: 'center', gap: 24,
      }}>
        <div style={{ fontSize: 60, opacity: 0.7 }}>{bouee.icon}</div>
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontSize: 26,
          lineHeight: 1.4,
          color: 'var(--ink)',
          maxWidth: 320,
        }}>
          « {bouee.action} »
        </p>
        <button
          onClick={handleDone}
          style={{
            marginTop: 24,
            minHeight: 56, minWidth: 200,
            padding: '14px 32px',
            background: 'var(--rose-700, #BE185D)',
            color: 'white',
            border: 'none',
            borderRadius: 14,
            fontFamily: 'inherit',
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          Fait ✓
        </button>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', opacity: 0.5, fontSize: 13, padding: 12 }}
        >
          Plus tard
        </button>
      </div>
    </Overlay>
  );
}
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add src/components/ui/BoueeModal.jsx
git commit -m "feat(v6/T3.3): BoueeModal - mini-flow action concrete avec filtre par level"
```

### Task 3.4: Créer `CitationKeepModal.jsx`

**Files:**
- Create: `src/components/ui/CitationKeepModal.jsx`

- [ ] **Step 1: Créer le composant**

```jsx
/* ============================================================
   CitationKeepModal — Mini-flow "Garder une citation" (mood='ca-va')
   ============================================================ */

import { useMemo } from 'react';
import Overlay from './Overlay';
import { pickCitation } from '../../v2/data/citations';
import { hashSeed, dayIndex } from '../../v2/helpers/checkins';
import { haptic } from '../../v2/state';

export default function CitationKeepModal({ open, onDone, onClose }) {
  const citation = useMemo(() => {
    if (!open) return null;
    const tags = ['gratitude', 'joie'];
    const seed = dayIndex() + hashSeed('keep');
    const tag = tags[seed % tags.length];
    return pickCitation(tag, seed);
  }, [open]);

  if (!open || !citation) return null;

  const handleKeep = () => {
    haptic(6);
    onDone?.({ type: 'citation', citationId: citation.id, text: citation.text });
  };

  return (
    <Overlay backdrop="dark" onClose={onClose} ariaLabel="Une citation à garder">
      <div style={{
        minHeight: '100dvh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '40px 24px', textAlign: 'center', gap: 32,
      }}>
        <div style={{ fontSize: 40, opacity: 0.5 }}>✦</div>
        <div>
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 24,
            lineHeight: 1.5,
            color: 'var(--ink)',
            maxWidth: 360,
          }}>
            « {citation.text} »
          </p>
          {citation.author && <p style={{ fontSize: 13, opacity: 0.6, marginTop: 12 }}>— {citation.author}</p>}
        </div>
        <button
          onClick={handleKeep}
          style={{
            marginTop: 24,
            minHeight: 56, minWidth: 200,
            padding: '14px 32px',
            background: 'var(--rose-700, #BE185D)',
            color: 'white',
            border: 'none',
            borderRadius: 14,
            fontFamily: 'inherit',
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          Garder
        </button>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', opacity: 0.5, fontSize: 13, padding: 12 }}
        >
          Fermer
        </button>
      </div>
    </Overlay>
  );
}
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add src/components/ui/CitationKeepModal.jsx
git commit -m "feat(v6/T3.4): CitationKeepModal - mini-flow 'garder citation' pour mood ca-va"
```

### Task 3.5: Remplacer les stubs dans `Checkin.jsx` ActionStep

**Files:**
- Modify: `src/v2/screens/Checkin.jsx`

- [ ] **Step 1: Importer les mini-flows**

En haut du fichier :

```jsx
import BreathingPause from './BreathingPause';
import Carnet from './Carnet';
import BoueeModal from '../../components/ui/BoueeModal';
import CitationKeepModal from '../../components/ui/CitationKeepModal';
```

- [ ] **Step 2: Réécrire `ActionStep`**

Remplacer la fonction `ActionStep` par :

```jsx
function ActionStep({ option, mood, onDone, onCancel }) {
  if (!option) return null;

  if (option.kind === 'respi-478' || option.kind === 'respi-55' || option.kind === 'respi-46') {
    const rhythm = option.kind === 'respi-478' ? '4-7-8' : option.kind === 'respi-46' ? '4-6' : '5-5';
    return (
      <BreathingPause
        rhythm={rhythm}
        accent="rose"
        onComplete={(payload) => onDone({ ...payload, type: 'breath', rhythm })}
        onClose={onCancel}
      />
    );
  }

  if (option.kind === 'write') {
    return (
      <Carnet
        mood={mood}
        onSave={(payload) => onDone(payload)}
        onClose={onCancel}
      />
    );
  }

  if (option.kind === 'bouee') {
    return (
      <BoueeModal
        open={true}
        levels={option.boueeLevel}
        onDone={(payload) => onDone(payload)}
        onClose={onCancel}
      />
    );
  }

  if (option.kind === 'citation') {
    return (
      <CitationKeepModal
        open={true}
        onDone={(payload) => onDone(payload)}
        onClose={onCancel}
      />
    );
  }

  return null;
}
```

- [ ] **Step 3: Build + smoke test**

```bash
npm run build
npm run dev
```

Tester chaque mood → option → action complète :
- pas-terrible / Respirer 4·7·8 → BreathingPause cycle, à la fin → done
- ca-va-pas-trop / Écrire → Carnet, save → done
- ca-va / Citation → CitationKeepModal → done
- ca-va / Bouée légère → BoueeModal niveau esprit/monde uniquement

- [ ] **Step 4: Commit**

```bash
git add src/v2/screens/Checkin.jsx
git commit -m "feat(v6/T3.5): Checkin ActionStep wiring BreathingPause/Carnet/BoueeModal/CitationKeepModal"
```

---

## Phase 4 — Timeline narrative

### Task 4.1: Créer `Timeline.jsx`

**Files:**
- Create: `src/v2/screens/Timeline.jsx`

- [ ] **Step 1: Créer le composant**

```jsx
/* ============================================================
   Timeline — Vue narrative des check-ins passés
   ============================================================
   Liste verticale, plus récent en haut.
   Cap 90 jours (cf. helpers/checkins.js getAllCheckins).
   Tap ligne -> overlay détail.
   ============================================================ */

import { useState, useMemo } from 'react';
import { getAllCheckins, MOOD_COLORS, MOOD_LABELS } from '../helpers/checkins';
import Overlay from '../../components/ui/Overlay';

const ACTION_LABELS = {
  'breath':         'respiration',
  'write':          'écriture',
  'bouee':          'bouée',
  'citation':       'citation gardée',
  'voice-legacy':   'voix (legacy)',
};

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

function formatActions(actions) {
  if (!actions || actions.length === 0) return 'juste passé·e';
  return actions.map((a) => ACTION_LABELS[a.type] || a.type).join(' + ');
}

export default function Timeline({ open, onClose }) {
  const [detail, setDetail] = useState(null);

  const checkins = useMemo(() => (open ? getAllCheckins() : []), [open]);

  if (!open) return null;

  return (
    <Overlay backdrop="default" onClose={onClose} ariaLabel="Ton mois">
      <div style={{
        minHeight: '100dvh',
        padding: '40px 20px 80px',
        WebkitOverflowScrolling: 'touch',
        overflowY: 'auto',
      }}>
        <button
          onClick={onClose}
          style={{
            minHeight: 44, minWidth: 44,
            background: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 22,
            marginBottom: 24,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
          aria-label="Fermer"
        >
          ←
        </button>

        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontSize: 32,
          lineHeight: 1.2,
          marginBottom: 4,
          color: 'var(--ink)',
        }}>
          Ton mois
        </h1>
        <p style={{ fontSize: 13, opacity: 0.55, marginBottom: 32 }}>
          {checkins.length} jour{checkins.length > 1 ? 's' : ''} où tu es revenu·e
        </p>

        {checkins.length === 0 ? (
          <p style={{ opacity: 0.5, fontStyle: 'italic', textAlign: 'center', marginTop: 60 }}>
            Pas encore d'historique. Commence par un check-in aujourd'hui.
          </p>
        ) : (
          checkins.map((c) => (
            <button
              key={c.id}
              onClick={() => setDetail(c)}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: '14px 8px',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                textAlign: 'left',
                fontFamily: 'inherit',
                cursor: 'pointer',
                minHeight: 56,
              }}
            >
              <div style={{
                width: 12, height: 12,
                borderRadius: '50%',
                background: MOOD_COLORS[c.mood] || '#aaa',
                marginTop: 6,
                flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, opacity: 0.5, letterSpacing: '0.05em' }}>{formatDate(c.date)}</div>
                <div style={{ fontSize: 14, color: 'var(--ink)', marginTop: 2 }}>
                  {MOOD_LABELS[c.mood] || c.mood} · {formatActions(c.actions)}
                </div>
                {c.citation?.text && (
                  <div style={{
                    fontSize: 11, opacity: 0.5, marginTop: 4,
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontStyle: 'italic',
                    maxWidth: 280,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    « {c.citation.text} »
                  </div>
                )}
              </div>
            </button>
          ))
        )}

        {checkins.length >= 90 && (
          <p style={{ opacity: 0.5, fontStyle: 'italic', textAlign: 'center', marginTop: 24, fontSize: 12 }}>
            Plus de 3 mois. Tu es revenu·e souvent.
          </p>
        )}
      </div>

      {detail && (
        <Overlay backdrop="dark" onClose={() => setDetail(null)} ariaLabel="Détail du jour">
          <div style={{ padding: 40, maxWidth: 480, margin: '60px auto' }}>
            <div style={{ fontSize: 11, opacity: 0.55, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {formatDate(detail.date)} · {detail.time}
            </div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 26,
              margin: '12px 0 24px',
              color: 'var(--ink)',
            }}>
              {MOOD_LABELS[detail.mood]}
            </h2>

            {detail.actions?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 10, opacity: 0.5, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Ce que tu as fait</div>
                {detail.actions.map((a, i) => (
                  <div key={i} style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>
                    ✓ {ACTION_LABELS[a.type] || a.type}
                    {a.text && <div style={{ fontSize: 13, opacity: 0.7, marginLeft: 18, marginTop: 4, fontStyle: 'italic' }}>« {a.text} »</div>}
                  </div>
                ))}
              </div>
            )}

            {detail.citation?.text && (
              <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontSize: 16, lineHeight: 1.5 }}>« {detail.citation.text} »</p>
                {detail.citation.author && <p style={{ fontSize: 11, opacity: 0.55, marginTop: 4 }}>— {detail.citation.author}</p>}
              </div>
            )}

            <button
              onClick={() => setDetail(null)}
              style={{
                marginTop: 32, minHeight: 44, padding: '10px 24px',
                background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 12, cursor: 'pointer',
              }}
            >
              Fermer
            </button>
          </div>
        </Overlay>
      )}
    </Overlay>
  );
}
```

- [ ] **Step 2: Wire Timeline dans Checkin.jsx**

Dans `Checkin.jsx`, importer et utiliser :

```jsx
import Timeline from './Timeline';

// Dans le return, après les autres steps :
<Timeline open={timelineOpen} onClose={() => setTimelineOpen(false)} />
```

- [ ] **Step 3: Build + smoke test**

```bash
npm run build
npm run dev
```

Test : faire 2-3 check-ins simulés via console (`localStorage.setItem('neya_v2_profile', ...)`) ou en avançant la date système, puis tap "Voir le passé →" pour voir la timeline.

- [ ] **Step 4: Commit**

```bash
git add src/v2/screens/Timeline.jsx src/v2/screens/Checkin.jsx
git commit -m "feat(v6/T4.1): Timeline narrative + detail overlay + wiring depuis Checkin done step"
```

---

## Phase 5 — FAB Crise + simplification

### Task 5.1: Simplifier `Crise.jsx`

**Files:**
- Modify: `src/v2/screens/Crise.jsx`

- [ ] **Step 1: Lire le composant existant pour comprendre sa structure**

```bash
wc -l src/v2/screens/Crise.jsx
cat src/v2/screens/Crise.jsx | head -50
```

- [ ] **Step 2: Réécrire Crise.jsx en mode safety simple**

Remplacer le contenu par :

```jsx
/* ============================================================
   Crise — Overlay safety (V6 simplifié)
   ============================================================
   Plein écran : respiration 4·6 + 3114 + 15 + bouton sortir.
   Tracking via recordCrisisEntry / recordCrisisExit.
   ============================================================ */

import { useEffect } from 'react';
import Overlay from '../../components/ui/Overlay';
import BreathingPause from './BreathingPause';
import { recordCrisisEntry, recordCrisisExit, haptic } from '../state';

export default function Crise({ open, onClose }) {
  useEffect(() => {
    if (open) {
      recordCrisisEntry();
      haptic([4, 60, 4]);
    }
  }, [open]);

  const handleClose = () => {
    recordCrisisExit();
    onClose?.();
  };

  if (!open) return null;

  return (
    <Overlay
      backdrop="dark"
      onClose={handleClose}
      ariaLabel="Tu n'es pas seul·e"
      style={{ background: 'rgba(15, 20, 30, 0.96)', backdropFilter: 'blur(20px)' }}
    >
      <div style={{
        minHeight: '100dvh',
        padding: '40px 24px 60px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        color: '#fffafa',
      }}>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontSize: 30,
          textAlign: 'center',
          margin: '20px 0 32px',
        }}>
          Tu n'es pas seul·e.
        </h1>

        <div style={{ width: '100%', maxWidth: 360, marginBottom: 32 }}>
          <BreathingPause rhythm="4-6" accent="rose" inline />
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 16,
          padding: 24,
          maxWidth: 360,
          marginBottom: 24,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 12 }}>
            Si tu veux parler
          </div>
          <a href="tel:3114" style={{
            display: 'block',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 32,
            color: '#f7d2dd',
            textDecoration: 'none',
            marginBottom: 4,
          }}>
            3114
          </a>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Suicide écoute · gratuit · 24h/24</div>

          <div style={{ margin: '20px 0', height: 1, background: 'rgba(255,255,255,0.1)' }} />

          <a href="tel:15" style={{
            display: 'block',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 28,
            color: '#f7d2dd',
            textDecoration: 'none',
            marginBottom: 4,
          }}>
            15
          </a>
          <div style={{ fontSize: 12, opacity: 0.7 }}>SAMU · urgence vitale</div>
        </div>

        <p style={{ fontSize: 13, opacity: 0.65, textAlign: 'center', maxWidth: 320, lineHeight: 1.5, marginBottom: 32 }}>
          Si tu es en danger immédiat, appelle.
          <br/>Si tu veux juste parler, le 3114 t'écoute, sans jugement.
        </p>

        <button
          onClick={handleClose}
          style={{
            marginTop: 'auto',
            minHeight: 44, padding: '10px 24px',
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.7)',
            border: 'none', borderRadius: 12,
            fontSize: 13, fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          Sortir
        </button>
      </div>
    </Overlay>
  );
}
```

> Note: la prop `inline` sur BreathingPause peut nécessiter un ajout — si BreathingPause est conçu pour plein-écran uniquement, créer une variante ou passer `style` overrides. Sinon supprimer la prop et accepter le rendu plein écran imbriqué (l'overlay Crise est lui-même plein écran, l'imbrication est cosmétique).

- [ ] **Step 3: Build + smoke test**

```bash
npm run build
# Smoke test après wire FAB (Task 5.3)
```

- [ ] **Step 4: Commit**

```bash
git add src/v2/screens/Crise.jsx
git commit -m "feat(v6/T5.1): Crise simplifie - respiration 4-6 + 3114 + 15, retrait config custom"
```

### Task 5.2: Créer `CriseFab.jsx`

**Files:**
- Create: `src/components/ui/CriseFab.jsx`

- [ ] **Step 1: Créer le composant FAB**

```jsx
/* ============================================================
   CriseFab — FAB discret pour ouvrir l'overlay Crise
   ============================================================
   Toujours visible (sauf overlay fullscreen actif), bottom-right.
   ============================================================ */

import { haptic } from '../../v2/state';

export default function CriseFab({ onClick, hidden = false }) {
  if (hidden) return null;
  return (
    <button
      onClick={() => { haptic(6); onClick?.(); }}
      aria-label="Aide en cas de crise"
      title="Aide"
      style={{
        position: 'fixed',
        bottom: 'calc(72px + env(safe-area-inset-bottom, 0))',
        right: 16,
        width: 56, height: 56,
        borderRadius: '50%',
        background: 'rgba(190, 30, 50, 0.92)',
        color: 'white',
        border: 'none',
        boxShadow: '0 4px 14px rgba(190, 30, 50, 0.35)',
        fontSize: 22,
        fontFamily: 'inherit',
        cursor: 'pointer',
        zIndex: 110,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.92,
      }}
    >
      ◉
    </button>
  );
}
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add src/components/ui/CriseFab.jsx
git commit -m "feat(v6/T5.2): CriseFab - bouton discret bottom-right z-index 110"
```

### Task 5.3: Supprimer `CriseSettings.jsx`

**Files:**
- Delete: `src/v2/screens/CriseSettings.jsx`

- [ ] **Step 1: Vérifier les usages**

```bash
grep -rn "CriseSettings" src/
```

Expected: usages dans App.jsx ou similaire. Noter pour les retirer en Task 7.

- [ ] **Step 2: Delete**

```bash
rm src/v2/screens/CriseSettings.jsx
```

- [ ] **Step 3: Build (peut échouer si encore importé)**

```bash
npm run build
```

Si échec : noter les imports cassés, on les nettoiera en Task 7. Pas de commit tant que ça build pas.

Si succès : commit immédiat.

```bash
git add -u
git commit -m "chore(v6/T5.3): delete CriseSettings.jsx - parametres crise retires (V6 overlay direct)"
```

> Si build échoue, ne pas committer maintenant. Passer à Task 7 (réécriture App.jsx) qui résoudra les imports.

---

## Phase 6 — Onboarding 1 écran

### Task 6.1: Réécrire `Onboarding.jsx`

**Files:**
- Modify: `src/v2/screens/Onboarding.jsx`

- [ ] **Step 1: Réécrire le composant en mono-écran**

```jsx
/* ============================================================
   Onboarding V6 — 1 écran manifeste + Commencer
   ============================================================ */

import { patchProfile, haptic } from '../state';

export default function Onboarding({ onDone }) {
  const handleStart = () => {
    haptic([4, 30, 4]);
    patchProfile({ onboarding: { completed: true, completedAt: new Date().toISOString() } });
    onDone?.();
  };

  return (
    <div style={{
      minHeight: '100dvh',
      padding: '60px 28px 80px',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg, #EEF3F8)',
    }}>
      <div style={{
        fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase',
        opacity: 0.5, marginBottom: 28,
      }}>
        ÇA VA?
      </div>

      <h1 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontStyle: 'italic',
        fontSize: 36,
        lineHeight: 1.15,
        marginBottom: 24,
        color: 'var(--ink)',
      }}>
        Cette app te demande<br/>
        chaque jour comment<br/>
        tu vas.
      </h1>

      <p style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontStyle: 'italic',
        fontSize: 22,
        lineHeight: 1.4,
        opacity: 0.75,
        marginBottom: 32,
        color: 'var(--ink)',
      }}>
        Et te répond.
      </p>

      <p style={{ fontSize: 13, opacity: 0.6, lineHeight: 1.6, maxWidth: 320 }}>
        Trois options pour répondre. Tu décides ce qui suit — respirer, écrire, ou juste passer une bouée du jour.
      </p>

      <button
        onClick={handleStart}
        style={{
          marginTop: 'auto',
          minHeight: 56,
          padding: '16px 32px',
          background: 'rgba(255,255,255,0.7)',
          color: 'var(--ink)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 16,
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontSize: 18,
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
        }}
      >
        Commencer →
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Build clean**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/v2/screens/Onboarding.jsx
git commit -m "feat(v6/T6.1): Onboarding 1 ecran - manifeste 'cette app te demande chaque jour' + Commencer"
```

---

## Phase 7 — Nouveau App shell

### Task 7.1: Réécrire `src/v2/App.jsx`

**Files:**
- Modify: `src/v2/App.jsx` (rewrite complet)

- [ ] **Step 1: Réécrire App.jsx**

```jsx
/* ============================================================
   V2App — Shell V6
   ============================================================
   2 onglets : Check-in (charpente) + Marque (philosophie).
   + FAB Crise toujours visible (hors fullscreen overlays).
   + Onboarding 1 écran si pas encore complété.
   + Migration V5 -> V6 au boot.
   ============================================================ */

import { useState, useEffect } from 'react';
import { ToastProvider } from '../components/ui';
import { isOnboarded, ls } from './state';
import { migrateV5ToV6 } from './helpers/migrate-v5-to-v6';
import Onboarding from './screens/Onboarding';
import Checkin from './screens/Checkin';
import CaVa from './screens/CaVa';
import Crise from './screens/Crise';
import CriseFab from '../components/ui/CriseFab';

export default function V2App() {
  return (
    <ToastProvider>
      <V2AppInner />
    </ToastProvider>
  );
}

function V2AppInner() {
  useEffect(() => {
    migrateV5ToV6();
  }, []);

  const [onboarded, setOnboarded] = useState(() => isOnboarded());
  const [activeTab, setActiveTab] = useState(() => ls.get('active_tab', 'checkin'));
  const [criseOpen, setCriseOpen] = useState(false);

  useEffect(() => {
    ls.set('active_tab', activeTab);
  }, [activeTab]);

  if (!onboarded) {
    return <Onboarding onDone={() => setOnboarded(true)} />;
  }

  return (
    <div style={{ minHeight: '100dvh', position: 'relative', background: 'var(--bg, #EEF3F8)' }}>
      {/* Tab content */}
      {activeTab === 'checkin' && <Checkin />}
      {activeTab === 'marque'  && <CaVa />}

      {/* BottomNav */}
      <BottomNav active={activeTab} onChange={setActiveTab} />

      {/* FAB Crise (toujours visible sauf overlay fullscreen) */}
      <CriseFab onClick={() => setCriseOpen(true)} hidden={criseOpen} />

      {/* Crise overlay */}
      <Crise open={criseOpen} onClose={() => setCriseOpen(false)} />
    </div>
  );
}

function BottomNav({ active, onChange }) {
  const tabs = [
    { id: 'checkin', label: 'Check-in', icon: '◐' },
    { id: 'marque',  label: 'Marque',   icon: '✦' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      height: 'calc(64px + env(safe-area-inset-bottom, 0))',
      paddingBottom: 'env(safe-area-inset-bottom, 0)',
      background: 'rgba(255,255,255,0.85)',
      borderTop: '1px solid rgba(0,0,0,0.06)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      zIndex: 30,
    }}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          aria-current={active === t.id ? 'page' : undefined}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            cursor: 'pointer',
            color: active === t.id ? 'var(--rose-700, #BE185D)' : 'rgba(0,0,0,0.55)',
            fontFamily: 'inherit',
            fontSize: 11,
          }}
        >
          <span style={{ fontSize: 22 }}>{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
```

- [ ] **Step 2: Build clean**

```bash
npm run build
```

Si erreurs d'imports (références à anciens écrans/composants déjà supprimés ailleurs), noter pour les batches de suppression en Phase 8.

Si erreurs car CaVa ou Crise ne sont pas importables correctement, vérifier les paths.

- [ ] **Step 3: Smoke test complet**

```bash
npm run dev
```

Test :
- Premier launch (clear localStorage) → Onboarding 1 écran
- Tap "Commencer" → atterit sur Check-in question
- Tap "Pas terrible" → menu écho
- Tap Respirer 4·7·8 → BreathingPause → done state
- Tap onglet Marque → CaVa s'affiche
- FAB Crise visible → tap → overlay safety s'ouvre
- Bouton "Sortir" → ferme l'overlay
- Refresh : revient sur le dernier onglet actif

- [ ] **Step 4: Commit**

```bash
git add src/v2/App.jsx
git commit -m "feat(v6/T7.1): App.jsx rewrite - 2 onglets Check-in/Marque + FAB Crise + onboarding mono-ecran"
```

---

## Phase 8 — Suppressions massives V5

Chaque suppression = batch + build clean + commit. Si une suppression casse le build, c'est qu'un import orphelin reste — corriger avant de committer.

> Note: `src/v2/helpers/stars.js` est CONSERVÉ (lecture-seule pour migration). NE PAS le supprimer.

### Task 8.1: Supprimer Ciel + composants constellation

- [ ] **Step 1: Suppression**

```bash
rm src/v2/screens/Ciel.jsx
rm src/components/ui/StarField.jsx
rm src/components/ui/Star.jsx
rm src/components/ui/CielChapter.jsx
rm src/components/ui/PoseEtoileModal.jsx
rm src/components/ui/PersonAvatar.jsx
rm src/v2/data/star-positions.js
rm src/v2/helpers/chapter-generator.js
rm src/v2/hooks/useDailyStarStatus.js
rm src/v2/hooks/useCitation.js
```

- [ ] **Step 2: Cleanup `src/components/ui/index.js`**

```bash
grep -n "StarField\|Star\b\|CielChapter\|PoseEtoileModal\|PersonAvatar" src/components/ui/index.js
```

Retirer les exports correspondants du fichier `src/components/ui/index.js`.

- [ ] **Step 3: Cleanup state.js (suppr unused)**

```bash
grep -n "completeMeditation\|getDailyPrompt\|getCercle\|addToCercle\|removeFromCercle\|sendLumiere\|hasSentLumiereToday\|getLumieresTotal\|detectCrisisKeywords\|getBoueeDuJour\|markBoueeDone\|isBoueeDoneToday\|getRituels\|logRituel\|isRituelDoneToday" src/
```

Pour chaque fonction qui n'est PLUS utilisée (vérifier par grep dans `src/` hors `state.js`), la retirer de `state.js`.

À retirer probablement : `completeMeditation`, `WORLD_PROGRESSION`, helpers Cercle/Lumières/Bouées si pas utilisés ailleurs (BoueeModal embedded son propre array donc OK), `detectCrisisKeywords`, `CRISIS_KEYWORDS`, helpers Rituels.

À conserver : `mutateProfile`, `setProfile`, `patchProfile`, `getProfile`, `defaultProfile`, `ls`, `haptic`, `greet`, `recordVisitToday`, `addMinutes`, `recordCrisisEntry`, `recordCrisisExit`, `getHabitsToday`, `markHabitDone`, `unmarkHabit`, `addSouvenir`, `getSouvenirs`, `clearSouvenirs`, `getBilanSemaineHistory`, `saveBilanSemaine`, `hasSeenBilanSemaineThisWeek`, `checkMilestone`, `markMilestoneSeen`, `isMilestoneSeen`, `getOnboardingTargetMinutes` ❌ (V5-onboarding-specifique, retirer), `getPaletteMode` ❌ (retirer), `getMotifCTA` ❌ (retirer), `calculateTotemFromOnboarding` ❌ (retirer), `getEtatLine` ❌ (retirer), `isOnboarded`.

Faire un `grep -rn` pour chaque pour décider.

- [ ] **Step 4: Build clean**

```bash
npm run build
```

Si erreurs, lire les messages, identifier qui importe quoi, soit retirer l'import soit conserver la fonction.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(v6/T8.1): suppression code constellation (Ciel, StarField, Star, CielChapter, PoseEtoileModal, PersonAvatar, star-positions, chapter-generator, useDailyStarStatus, useCitation) + cleanup state.js helpers V5-only"
```

### Task 8.2: Supprimer Voix + community.js

- [ ] **Step 1: Suppression**

```bash
rm src/v2/screens/Voix.jsx
rm src/v2/community.js
```

- [ ] **Step 2: Vérifier qu'aucun import ne traîne**

```bash
grep -rn "Voix\|from.*community" src/ --include="*.jsx" --include="*.js"
```

Retirer les imports orphelins.

- [ ] **Step 3: Build clean + commit**

```bash
npm run build
git add -A
git commit -m "chore(v6/T8.2): suppression Voix + community.js (feed anonyme retire)"
```

### Task 8.3: Supprimer Refuge, Cocon, Meditation

- [ ] **Step 1: Suppression**

```bash
rm src/v2/screens/Refuge.jsx
rm src/v2/screens/Cocon.jsx
rm src/v2/screens/CoconAmbiance.jsx
rm src/v2/screens/Meditation.jsx
```

- [ ] **Step 2: Vérif + build + commit**

```bash
grep -rn "Refuge\|Cocon\|from.*Meditation" src/ --include="*.jsx" --include="*.js"
npm run build
git add -A
git commit -m "chore(v6/T8.3): suppression Refuge + Cocon + CoconAmbiance + Meditation"
```

### Task 8.4: Supprimer Espaces + EspacesIRL + écrans residuels

- [ ] **Step 1: Suppression**

```bash
rm src/v2/screens/Espaces.jsx
rm src/v2/screens/EspacesIRL.jsx
rm src/v2/screens/Manifeste.jsx
rm src/v2/screens/Tour.jsx
rm src/v2/screens/Patronus.jsx
rm src/v2/screens/Aide.jsx
rm -f src/v2/screens/Splash.jsx
rm -f src/v2/screens/RituelPlayer.jsx
rm -f src/v2/screens/Musique.jsx
rm -f src/v2/screens/Souvenirs.jsx
```

(Le `-f` ignore l'erreur si le fichier n'existe pas — certains peuvent ne pas être présents.)

- [ ] **Step 2: Vérif + build + commit**

```bash
grep -rn "Espaces\|Manifeste\|Tour\|Patronus\|Aide\|RituelPlayer\|Musique\|Souvenirs\|Splash" src/ --include="*.jsx" --include="*.js" | grep -v "^src/v2/screens/CaVa"
npm run build
git add -A
git commit -m "chore(v6/T8.4): suppression Espaces/EspacesIRL/Manifeste/Tour/Patronus/Aide/Splash/RituelPlayer/Musique/Souvenirs"
```

### Task 8.5: Supprimer data files V5

- [ ] **Step 1: Suppression**

```bash
rm src/v2/data/aventure-foret.js
rm src/v2/data/aventure-oasis.js
rm src/v2/data/aventure-temple.js
rm src/v2/data/mondes.js
rm src/v2/data/lecons.js
rm src/v2/data/rituels-temps.js
rm -f src/v2/worlds.js
```

- [ ] **Step 2: Cleanup hooks**

```bash
rm -f src/v2/hooks/useSeasonalPalette.js
rm -f src/v2/hooks/usePullToRefresh.js
rm -f src/v2/hooks/useReveal.js
rm -f src/v2/hooks/useEdgeSwipeBack.js
rm -f src/v2/hooks/useNumberTicker.js
rm -f src/v2/hooks/useStandardOverlay.js
rm -f src/v2/hooks/useSwipeToDismiss.js
```

> Avant chaque `rm`, faire un `grep -rn "useSeasonalPalette\|<nom>" src/` pour vérifier qu'aucune utilisation ne reste. Garder ceux qui sont encore utilisés.

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add -A
git commit -m "chore(v6/T8.5): suppression data V5 (mondes, lecons, aventure-*, rituels-temps, worlds) + hooks orphelins"
```

### Task 8.6: Cleanup onboarding cavalry (src/components/onboarding/)

> Le V5 cavalry avait ajouté `src/components/onboarding/OnboardingFlow.jsx` etc. (8 étapes). En V6, on utilise `src/v2/screens/Onboarding.jsx` (1 écran). Le dossier `src/components/onboarding/` est obsolète.

- [ ] **Step 1: Vérifier qu'aucun import ne pointe encore**

```bash
grep -rn "components/onboarding\|OnboardingFlow\|OnboardingScreen" src/ --include="*.jsx" --include="*.js"
```

- [ ] **Step 2: Supprimer le dossier**

```bash
rm -rf src/components/onboarding/
```

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add -A
git commit -m "chore(v6/T8.6): suppression src/components/onboarding/ (V5 8-etapes obsolete, V6 utilise src/v2/screens/Onboarding.jsx 1-ecran)"
```

---

## Phase 9 — Validation finale + deploy

### Task 9.1: Build clean + bundle check

- [ ] **Step 1: Clean build**

```bash
rm -rf dist node_modules/.vite
npm run build
```

- [ ] **Step 2: Vérifier bundle size**

Lire la taille du chunk JS principal. Target : < 250 kB (V5 = 292 kB).

Si > 250 kB : grep des imports inutilisés. Vérifier que `src/v2/helpers/stars.js`, `src/v2/data/citations.js` etc. ne sont pas dupliqués.

- [ ] **Step 3: Vérifier qu'aucune ref orpheline**

```bash
grep -rn "Star\|Constellation\|Voix\|Refuge\|Cocon\|Meditation\|Manifeste" src/ --include="*.jsx" --include="*.js" | grep -v "stars.js" | grep -v "migrate-v5"
```

Expected: peu/zéro résultat (sauf les références volontaires dans migrate-v5-to-v6.js et stars.js).

- [ ] **Step 4: Pas de console.log**

```bash
git diff main..HEAD -- src/ | grep -E "^\+" | grep -i "console\."
```

Expected: vide.

### Task 9.2: Smoke test complet en dev

- [ ] **Step 1: Lancer le dev server**

```bash
npm run dev
```

- [ ] **Step 2: Parcourir chaque flow**

Checklist (cochée à la main) :

- [ ] Premier launch (localStorage.clear() puis refresh) → Onboarding 1 écran s'affiche
- [ ] Tap "Commencer" → atterit sur Check-in question
- [ ] Tap "Ça va" → menu écho avec citation gardée + écrire mot + bouée légère
- [ ] Tap "Ça va pas trop" (refresh + clear) → menu écho avec respi 5·5 + écrire + bouée
- [ ] Tap "Pas terrible" (refresh + clear) → menu écho avec respi 4·7·8 + écrire ce qui pèse + bouée douce
- [ ] Tap Respirer 4·7·8 → BreathingPause cycle complet → done state avec récap action
- [ ] Tap "Faire autre chose" → retour menu écho, choisir Écrire → Carnet → save → done avec 2 actions
- [ ] Tap "Voir le passé →" → Timeline avec aujourd'hui visible
- [ ] Tap ligne timeline → overlay détail
- [ ] Tap onglet Marque → CaVa s'affiche (mini-nav + viewer fonctionnent comme post-cavalry)
- [ ] FAB Crise visible sur les 2 onglets, pas sur Onboarding
- [ ] Tap FAB Crise → overlay safety s'ouvre (3114 + 15 + respiration 4·6)
- [ ] Tap "Sortir" → ferme l'overlay
- [ ] Refresh : revient sur dernier onglet
- [ ] Re-faire un check-in le même jour = état done immédiat (pas re-demandé)
- [ ] Migration V5 : simuler des stars dans localStorage (`profile.stars = [{ id, date: '2026-05-30', color: 'orage', type: 'breath', ... }]`), refresh → timeline les affiche en checkins migrés

### Task 9.3: Push branch + preview Vercel

- [ ] **Step 1: Push la branche**

```bash
git push -u origin feat/v6-checkin
```

- [ ] **Step 2: Deploy preview**

```bash
vercel --yes
```

Récupère l'URL preview.

- [ ] **Step 3: Valider en preview**

Tester les mêmes points que Task 9.2 sur le preview URL.

### Task 9.4: Promote prod + verif HTTP

- [ ] **Step 1: Merge sur main**

```bash
git checkout main
git pull origin main
git merge --no-ff feat/v6-checkin -m "feat(v6): Check-in du jour - refonte charpente comprehensible"
git push origin main
```

- [ ] **Step 2: Deploy prod**

```bash
vercel --prod --yes
```

- [ ] **Step 3: Vérif HTTP 200**

```bash
curl -sI https://neya-kappa.vercel.app | head -1
```

Expected: `HTTP/2 200`

### Task 9.5: Update SAVEPOINT.md

- [ ] **Step 1: Réécrire SAVEPOINT.md pour V6**

Section "État actuel" : pointer V6 Check-in en prod, lister les promesses (« On te demande chaque jour comment tu vas »), l'architecture (2 onglets + FAB), les composants, le bundle size, la migration V5→V6.

- [ ] **Step 2: Commit + push**

```bash
git add SAVEPOINT.md
git commit -m "chore(v6): SAVEPOINT V6 prod live - Check-in du jour"
git push origin main
```

### Task 9.6: Récap final à Will

- [ ] **Step 1: Construire le message récap**

Format court (cf. ROBOT.md DoD #9) :
- Lien clickable prod : `https://neya-kappa.vercel.app`
- Résumé : « V6 Check-in livré. 2 onglets, mono-flow, FAB safety, migration V5 préservée. Bundle X kB (-Y%). »
- Liste 3-5 points-clés visibles

---

## Self-review (à exécuter après écriture du plan)

### Spec coverage

| Spec section | Couvert par |
|---|---|
| §1 Objectif | Préambule + Task 6.1 + 7.1 |
| §2 Architecture 2 onglets | Task 7.1 (App shell) |
| §2 Suppressions massives | Phase 8 (Tasks 8.1-8.6) |
| §2 Conservés | Tasks 3.1, 3.2, 5.1, 7.1 |
| §3 Flow du jour 4 états | Task 2.1 (state machine) |
| §4 Mapping mood→menu écho | Task 2.1 (ECHO_MENU) |
| §5 Mini-flows | Tasks 3.1-3.5 |
| §5.5 FAB Crise | Tasks 5.1, 5.2 |
| §6 Timeline narrative | Task 4.1 |
| §7 Onboarding 1 écran | Task 6.1 |
| §8 Migration data | Tasks 1.2, 1.3 |
| §9 Cas limites | Tasks 1.1 (addCheckin idempotent), 2.1 (state init `done` si déjà fait) |
| §10 DA & ton | Conservé dans chaque task (Cormorant, glass, etc.) |
| §11 Acceptance criteria | Task 9.2 (smoke test) |
| §15 Promote cavalerie avant V6 | Phase 0 (Tasks 0.1, 0.2) |

### Placeholder scan

Pas de "TBD", pas de "implement later". Tous les code blocks contiennent le code à coller.

### Type consistency

- `addCheckin({ mood })` cohérent partout (Tasks 1.1, 2.1, migration 1.2)
- `appendActionToTodayCheckin(action)` cohérent (Tasks 1.1, 2.1)
- `MOOD_COLORS` / `MOOD_LABELS` exportés depuis `checkins.js` (Task 1.1), importés dans Timeline (Task 4.1) et Checkin (Task 2.1) — OK
- `pickEchoCitation(mood)` exporté (Task 1.1), utilisé dans migration (Task 1.2) — OK
- `mutateProfile` viens de `state.js` (foundation cavalry Groupe E déjà commité main) — OK
- `BreathingPause` prop `rhythm` ('4-7-8' | '5-5' | '4-6') cohérent entre Task 3.1 (def) et 3.5 (use) et 5.1 (Crise use '4-6')
- `Carnet` callback `onSave({ type: 'write', text })` cohérent entre 3.2 (def) et 3.5 (use)

### Risques d'exécution

- **Task 5.1** : la prop `inline` sur BreathingPause peut ne pas exister — accepter l'imbrication d'overlays si besoin, ou ajouter la prop dans Task 3.1.
- **Task 8.x build failures** : ordre des suppressions important. Si build casse, c'est probablement un import dans App.jsx (Task 7.1 ré-écrit App.jsx — donc 7.1 doit passer AVANT Phase 8 pour que les imports orphelins soient retirés).
- **Task 9.2 smoke test** : pas d'auto, c'est manuel — risque humain d'oubli. Le checklist exhaustif limite le risque.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-01-ca-va-v6-checkin-plan.md`. Two execution options:

1. **Subagent-Driven (recommended)** — Je dispatche un sub-agent fresh par task, review entre tasks, fast iteration.
2. **Inline Execution** — Exécution dans cette session via `executing-plans` skill, batches avec checkpoints pour review.

Quelle approche ?
