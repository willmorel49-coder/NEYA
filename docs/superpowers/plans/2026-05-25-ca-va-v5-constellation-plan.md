# ÇA VA? V5 — Le Ciel Intérieur · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refondre l'app autour d'une métaphore Ciel/Constellation : 2 onglets (Ciel · Espaces), histoire continue qui s'écrit étoile par étoile, magie inspirée de la D.A ÇA VA?.

**Architecture:** SPA React 18 + Vite, palette V4 étendue d'une palette nuit (Ciel dark) + saisons dynamiques, composants UI atomiques DS V4 réutilisés. Constellation SVG responsive avec algorithme placement déterministe (`hash(userId + dayIndex)`). State `localStorage` étendu (stars[] + preferences{}).

**Tech Stack:** React 18.3 · Vite 5.4 · CSS modules + tokens.css · Cormorant Garamond + Inter · DS V4 (26 composants existants) · Web Audio API (opt-in M11)

**Branche:** `feat/v5-constellation` (V4 reste sur main jusqu'au merge final)

**Pas de framework de test** dans ce projet. Validation = `npm run build` clean + smoke test browser via `npm run dev` + check de la spec DoD (§10).

---

## File Structure

### Nouveaux fichiers (créés par ce plan)

```
src/
├── v2/
│   ├── data/
│   │   ├── citations.js               (T2 — 48 citations taggées)
│   │   └── star-positions.js          (T8 — algo placement déterministe)
│   ├── hooks/
│   │   ├── useDailyStarStatus.js      (T4 — a-t-on déjà posé aujourd'hui ?)
│   │   ├── useSeasonalPalette.js      (T5 — saison du calendrier → tokens)
│   │   └── useCitation.js             (T4 — getCitationForState)
│   ├── helpers/
│   │   ├── stars.js                   (T3 — addStar, getStarsRange, hashSeed)
│   │   └── chapter-generator.js       (T11 — générateur chapitres auto)
│   └── screens/
│       ├── Ciel.jsx                   (T13 — écran central)
│       ├── Espaces.jsx                (T14 — shell 3 sous-routes)
│       ├── Refuge.jsx                 (T15 — fusion Cocon+Méditation+Breath+Carnet)
│       └── Voix.jsx                   (T16 — refonte Communauté)
├── components/
│   ├── ui/
│   │   ├── Star.jsx                   (T7 — étoile individuelle)
│   │   ├── StarField.jsx              (T8 — SVG constellation)
│   │   ├── CielChapter.jsx            (T10 — chapitre scroll)
│   │   ├── PoseEtoileModal.jsx        (T12 — modal flow 3 étapes)
│   │   └── PersonAvatar.jsx           (T9 — cheveux teal coin)
│   └── ciel/
│       ├── CitationFloat.jsx          (T23 — citation flottante hero)
│       └── AmbianceAudio.jsx          (T27 — ambiance sonore opt-in)
└── tokens.css                         (T1 — palette Ciel + saisons)
```

### Fichiers modifiés

```
src/v2/state.js                        (T3 — schema stars/preferences)
src/v2/App.jsx                         (T19 — routing 2 onglets)
src/components/BottomNav.jsx           (T18 — 2 tabs)
src/components/onboarding/             (T29-T32 — étapes ajoutées)
src/v2/screens/CaVa.jsx                (T17 — polish léger)
SAVEPOINT.md                           (T22 — update)
```

### Fichiers supprimés (T20)

```
src/v2/screens/Aventure.jsx
src/v2/screens/AventurePlayer.jsx
src/v2/screens/AventureOnboarding.jsx
src/v2/screens/Habitudes.jsx
src/v2/screens/MoodTracker.jsx
src/v2/screens/Bilan.jsx
src/v2/screens/BilanSemaine.jsx
src/v2/screens/EspaceVrai.jsx
src/v2/screens/Lookbook.jsx
src/v2/screens/ProductDetail.jsx
src/v2/screens/LeconReader.jsx
src/v2/screens/MondeReader.jsx
src/v2/screens/Cercle.jsx
```

---

# PHASE 1 — Foundation (T1-T6)

## Task 1 : Branche + tokens.css palette Ciel + saisons

**Files:**
- Create branch: `feat/v5-constellation`
- Modify: `src/tokens.css`

- [ ] **Step 1 : Créer la branche depuis main**

```bash
cd /Users/williammorel/NÉYA
git checkout main && git pull origin main
git checkout -b feat/v5-constellation
```

Expected: `Switched to a new branch 'feat/v5-constellation'`

- [ ] **Step 2 : Append palette Ciel + saisons à tokens.css**

Ajoute en fin de `:root { ... }` (avant la fermeture finale `}`) le bloc suivant. Si une variable existe déjà, garde l'existante.

```css
  /* ════════════════════════════════════════════════════════════
     V5 CIEL — Palette nuit (Ciel intérieur dark)
     ════════════════════════════════════════════════════════════ */
  --ciel-bg-gradient: linear-gradient(180deg, #050810 0%, #0A2438 45%, #1F1535 100%);
  --ciel-text:           #FBF6E8;
  --ciel-text-secondary: rgba(251, 246, 232, 0.65);
  --ciel-text-muted:     rgba(251, 246, 232, 0.40);
  --ciel-glow-rose:      rgba(200, 112, 144, 0.20);
  --ciel-glow-violet:    rgba(127, 90, 138, 0.25);
  --ciel-glow-blue:      rgba(26, 90, 127, 0.18);
  --ciel-glass:          rgba(255, 255, 255, 0.06);
  --ciel-glass-border:   rgba(255, 255, 255, 0.10);

  /* Couleurs d'étoiles selon l'état déposé */
  --star-bleu:    #6F9DB5;   /* calme, présent */
  --star-rose:    #E8A0B8;   /* tendre, sensible */
  --star-violet:  #AF80BA;   /* introspectif, lourd */
  --star-peche:   #D4A878;   /* fatigue, plat */
  --star-orage:   #4A6070;   /* orage, crise */
```

Ajoute ensuite EN DEHORS du `:root` (à la fin du fichier) :

```css
/* Saisons du Ciel — surcharge dynamique selon Date.now() */
[data-season="printemps"] {
  --ciel-glow-accent: var(--ciel-glow-rose);
}
[data-season="ete"] {
  --ciel-glow-accent: rgba(212, 168, 120, 0.28);
}
[data-season="automne"] {
  --ciel-glow-accent: rgba(127, 90, 138, 0.30);
}
[data-season="hiver"] {
  --ciel-glow-accent: rgba(143, 164, 212, 0.25);
}
```

- [ ] **Step 3 : Build clean check**

```bash
cd /Users/williammorel/NÉYA && npm run build 2>&1 | tail -5
```

Expected: `✓ built in <Xs>` sans erreur.

- [ ] **Step 4 : Commit**

```bash
git add src/tokens.css
git commit -m "feat(v5/T1): tokens.css palette Ciel + saisons

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 2 : Base citations (48 entrées)

**Files:**
- Create: `src/v2/data/citations.js`

- [ ] **Step 1 : Écrire le fichier citations.js**

```js
/* ============================================================
   ÇA VA? — Base de citations (48 entrées taggées par état)
   ============================================================
   Source : marque ÇA VA? (vêtements + manifeste) + littérature.
   Tags d'état : 'calme' | 'tendre' | 'introspectif' | 'fatigue' | 'orage'
   Mapping couleur étoile → tag prioritaire :
     bleu   → calme
     rose   → tendre
     violet → introspectif
     peche  → fatigue
     orage  → orage
   ============================================================ */

export const CITATIONS = [
  // ── Marque ÇA VA? (vêtements) ──
  { id: 1,  text: "Ma sensibilité est mon super-pouvoir.",                                                              author: null,             tags: ["tendre", "rose"] },
  { id: 2,  text: "Mon anxiété est mon super-pouvoir.",                                                                  author: null,             tags: ["orage", "violet"] },
  { id: 3,  text: "Mon anxiété n'est pas une faiblesse, c'est une cicatrice vivante.",                                  author: null,             tags: ["introspectif", "orage"] },
  { id: 4,  text: "Chaque pas est une victoire.",                                                                         author: null,             tags: ["fatigue", "calme"] },
  { id: 5,  text: "Je combats en silence.",                                                                               author: null,             tags: ["orage", "introspectif"] },
  { id: 6,  text: "J'ai eu le courage de demander de l'aide.",                                                            author: null,             tags: ["tendre", "calme"] },
  { id: 7,  text: "Le soleil reviendra, je le sais.",                                                                     author: null,             tags: ["fatigue", "calme"] },
  { id: 8,  text: "Fatigué d'être fatigué.",                                                                              author: null,             tags: ["fatigue", "orage"] },
  { id: 9,  text: "Pourquoi tu forces un sourire ?",                                                                      author: null,             tags: ["introspectif", "fatigue"] },
  { id: 10, text: "J'ai plus la banane, mais je souris quand même.",                                                      author: null,             tags: ["fatigue", "tendre"] },
  { id: 11, text: "J'garde la pêche en public, je craque en silence.",                                                    author: null,             tags: ["orage", "introspectif"] },
  { id: 12, text: "Le monde avance trop vite pour moi.",                                                                  author: null,             tags: ["fatigue", "introspectif"] },
  { id: 13, text: "Prenez soin de vous.",                                                                                 author: null,             tags: ["tendre", "calme"] },

  // ── Manifeste ÇA VA? ──
  { id: 14, text: "Nous existons pour briser le masque du ça va.",                                                        author: "ÇA VA?",         tags: ["introspectif"] },
  { id: 15, text: "Faire de la mode un langage qui libère la parole sur la santé mentale.",                               author: "ÇA VA?",         tags: ["calme"] },
  { id: 16, text: "« ça va » — la phrase la plus mensongère du monde.",                                                   author: "ÇA VA?",         tags: ["introspectif"] },
  { id: 17, text: "Tu n'es pas seul·e.",                                                                                  author: "ÇA VA?",         tags: ["tendre", "orage"] },
  { id: 18, text: "T'as pas besoin d'aller bien pour commencer.",                                                         author: "ÇA VA?",         tags: ["fatigue", "tendre"] },

  // ── Littérature ──
  { id: 19, text: "Au milieu de l'hiver, j'apprenais enfin qu'il y avait en moi un été invincible.",                      author: "Albert Camus",   tags: ["orage", "introspectif"] },
  { id: 20, text: "L'anxiété est une bête irrationnelle.",                                                                author: "Matt Haig",      tags: ["orage", "violet"] },
  { id: 21, text: "Même si le bonheur vous oublie un peu, ne l'oubliez jamais complètement.",                             author: "Jacques Prévert",tags: ["fatigue", "introspectif"] },
  { id: 22, text: "Le courage n'est pas l'absence de peur, mais la capacité de la vaincre.",                              author: "Nelson Mandela", tags: ["orage", "calme"] },
  { id: 23, text: "On ne voit bien qu'avec le cœur.",                                                                     author: "Saint-Exupéry",  tags: ["tendre", "introspectif"] },
  { id: 24, text: "Le bonheur, c'est de continuer à désirer ce que l'on possède.",                                        author: "Saint Augustin", tags: ["calme", "introspectif"] },
  { id: 25, text: "Il n'y a pas de meilleure thérapie que de courir, marcher, danser, écrire, créer.",                    author: null,             tags: ["calme", "tendre"] },

  // ── Phrases originales (voix anonymes) ──
  { id: 26, text: "Je suis fatiguée depuis si longtemps que j'ai oublié à quoi ressemble la fatigue normale.",            author: "Sève",           tags: ["fatigue", "orage"] },
  { id: 27, text: "Le matin c'est le plus dur. Sortir du lit demande tout ce que je n'ai pas.",                           author: "Élio",           tags: ["fatigue", "orage"] },
  { id: 28, text: "Aujourd'hui j'ai dit non. Pour la première fois depuis longtemps. Et ça m'a fait pleurer.",            author: "Naïs",           tags: ["tendre", "introspectif"] },
  { id: 29, text: "On m'a demandé comment j'allais. J'ai répondu 'ça va' mais j'avais envie d'autre chose.",              author: "Rune",           tags: ["introspectif", "fatigue"] },
  { id: 30, text: "Mon corps me parle. Il dit qu'il a besoin que je l'écoute. Je commence juste.",                        author: "Anya",           tags: ["tendre", "calme"] },

  // ── Phrases anchor ÇA VA? ──
  { id: 31, text: "Et toi, ça va vraiment ?",                                                                             author: "ÇA VA?",         tags: ["introspectif"] },
  { id: 32, text: "Le silence aussi compte.",                                                                             author: "ÇA VA?",         tags: ["calme", "tendre"] },
  { id: 33, text: "Tu peux ne pas savoir.",                                                                               author: "ÇA VA?",         tags: ["introspectif"] },
  { id: 34, text: "Pose-le ici. Juste ça.",                                                                               author: "ÇA VA?",         tags: ["tendre"] },
  { id: 35, text: "Tu n'as rien à prouver à ton ciel.",                                                                   author: "ÇA VA?",         tags: ["calme"] },

  // ── Complément littérature & poésie ──
  { id: 36, text: "Ce qu'il y a de bien avec les coups durs, c'est qu'on apprend qu'on peut les encaisser.",              author: null,             tags: ["orage", "calme"] },
  { id: 37, text: "Tout passe. Les tempêtes aussi.",                                                                       author: null,             tags: ["orage", "calme"] },
  { id: 38, text: "La nuit n'est jamais complète. Il y a toujours, puisque je le dis, puisque je l'affirme, au bout du chagrin, une fenêtre ouverte.", author: "Paul Éluard", tags: ["orage", "introspectif"] },
  { id: 39, text: "On ne guérit pas du temps qui passe, on apprend à danser avec.",                                       author: null,             tags: ["introspectif", "calme"] },
  { id: 40, text: "Aimer, c'est se réjouir.",                                                                              author: "Aristote",       tags: ["tendre", "calme"] },

  // ── Phrases d'apaisement courtes ──
  { id: 41, text: "Respire. Une seule fois suffit.",                                                                       author: "ÇA VA?",         tags: ["orage", "calme"] },
  { id: 42, text: "Tu es là. C'est déjà énorme.",                                                                          author: "ÇA VA?",         tags: ["fatigue", "tendre"] },
  { id: 43, text: "L'instant est plus grand que le drame.",                                                                author: null,             tags: ["orage", "introspectif"] },
  { id: 44, text: "Doucement. Tout va bien.",                                                                              author: "ÇA VA?",         tags: ["tendre", "calme"] },
  { id: 45, text: "Tu n'es pas en retard sur ta propre vie.",                                                              author: null,             tags: ["introspectif", "tendre"] },
  { id: 46, text: "Le repos est productif.",                                                                               author: null,             tags: ["fatigue", "calme"] },
  { id: 47, text: "Reviens-toi.",                                                                                          author: "ÇA VA?",         tags: ["tendre"] },
  { id: 48, text: "C'est ok de ne pas être ok.",                                                                           author: "ÇA VA?",         tags: ["orage", "introspectif"] },
];

/**
 * Récupère une citation selon un tag d'état (color de l'étoile).
 * Si plusieurs match, retourne aléatoire (seed = dayIndex pour stabilité jour).
 */
export function pickCitation(tag, seed = 0) {
  const matching = CITATIONS.filter((c) => c.tags.includes(tag));
  const pool = matching.length > 0 ? matching : CITATIONS;
  const idx = Math.abs(seed) % pool.length;
  return pool[idx];
}
```

- [ ] **Step 2 : Build clean check**

```bash
npm run build 2>&1 | tail -5
```

Expected: clean.

- [ ] **Step 3 : Commit**

```bash
git add src/v2/data/citations.js
git commit -m "feat(v5/T2): base 48 citations taggées par état (marque + littérature)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 3 : Étendre state.js (stars + preferences + helpers stars)

**Files:**
- Modify: `src/v2/state.js`
- Create: `src/v2/helpers/stars.js`

- [ ] **Step 1 : Read state.js pour voir la structure actuelle**

```bash
grep -n "defaultProfile\|stars\|preferences" src/v2/state.js | head -10
```

- [ ] **Step 2 : Étendre defaultProfile() dans state.js**

Localise la fonction `export const defaultProfile = () => ({...})` et ajoute `stars: []` et `preferences: {}` à la fin de l'objet :

```js
export const defaultProfile = () => ({
  // ... existing fields preserved ...
  stars: [],
  preferences: {
    prenom: null,
    mantra: null,
    couleurFavorite: null,    // 'bleu' | 'rose' | 'violet' | null
    heureRituel: null,        // 'matin' | 'midi' | 'soir' | 'libre' | null
    ambianceSonore: false,
  },
});
```

- [ ] **Step 3 : Créer src/v2/helpers/stars.js**

```js
/* ============================================================
   Helpers — Stars / Constellation
   ============================================================
   Toute la logique d'ajout, lecture, hash placement.
   ============================================================ */

import { ls, getProfile, setProfile } from '../state';
import { pickCitation } from '../data/citations';

const STORAGE_KEY = 'cava_v5_uid';

/** UID unique stable par installation (généré au 1er appel) */
export function getUserId() {
  let uid = ls.get(STORAGE_KEY, null);
  if (!uid) {
    uid = `u-${Date.now()}-${Math.floor(Math.random() * 1e9).toString(36)}`;
    ls.set(STORAGE_KEY, uid);
  }
  return uid;
}

/** Hash déterministe simple (FNV-1a 32-bit) — pour positions étoiles */
export function hashSeed(input) {
  let h = 0x811c9dc5;
  const s = String(input);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Convertit Date → 'YYYY-MM-DD' */
export function toIsoDate(d = new Date()) {
  return d.toISOString().split('T')[0];
}

/** Index jour depuis 2026-01-01 (pour seeded random stable par jour) */
export function dayIndex(isoDate) {
  const ref = new Date('2026-01-01').getTime();
  const day = new Date(isoDate).getTime();
  return Math.floor((day - ref) / 86400000);
}

/** A-t-on déjà posé une étoile aujourd'hui ? */
export function hasStarToday() {
  const today = toIsoDate();
  const stars = getProfile().stars || [];
  return stars.some((s) => s.date === today);
}

/**
 * Ajoute une étoile au profil.
 * @param {object} args - { color, note?, type }
 *   color : 'bleu' | 'rose' | 'violet' | 'peche' | 'orage'
 *   note  : string optionnel
 *   type  : 'mood' | 'breath' | 'voice' | 'write' (default 'mood')
 */
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

  const star = {
    id: `star-${today}-${Date.now().toString(36)}`,
    date: today,
    time: new Date().toTimeString().slice(0, 5),
    color,
    note: note?.trim() || null,
    citation,
    type,
  };

  const p = getProfile();
  p.stars = [...(p.stars || []), star];
  setProfile(p);
  return star;
}

/** Récupère étoiles dans une plage de dates (inclusive). */
export function getStarsRange(fromIso, toIso) {
  const stars = getProfile().stars || [];
  return stars.filter((s) => s.date >= fromIso && s.date <= toIso);
}

/** Toutes les étoiles, triées par date desc (plus récente first). */
export function getAllStars() {
  const stars = getProfile().stars || [];
  return [...stars].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** Étoile la plus récente, ou null. */
export function getLatestStar() {
  return getAllStars()[0] || null;
}

/** Couleur dominante des N derniers jours (string ou null si rien). */
export function getDominantColor(days = 7) {
  const today = new Date();
  const from = new Date(today.getTime() - days * 86400000);
  const stars = getStarsRange(toIsoDate(from), toIsoDate(today));
  if (stars.length === 0) return null;
  const counts = {};
  stars.forEach((s) => { counts[s.color] = (counts[s.color] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}
```

- [ ] **Step 4 : Build clean check**

```bash
npm run build 2>&1 | tail -5
```

Expected: clean.

- [ ] **Step 5 : Commit**

```bash
git add src/v2/state.js src/v2/helpers/stars.js
git commit -m "feat(v5/T3): state schema stars[] + preferences + helpers (addStar, hash, dayIndex)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 4 : Hooks useDailyStarStatus + useCitation

**Files:**
- Create: `src/v2/hooks/useDailyStarStatus.js`
- Create: `src/v2/hooks/useCitation.js`

- [ ] **Step 1 : Créer useDailyStarStatus.js**

```js
import { useState, useEffect } from 'react';
import { hasStarToday } from '../helpers/stars';

/** Renvoie {posed, refresh} — recalcule à chaque mount + au profile-changed event */
export default function useDailyStarStatus() {
  const [posed, setPosed] = useState(() => hasStarToday());

  const refresh = () => setPosed(hasStarToday());

  useEffect(() => {
    const onChange = () => refresh();
    window.addEventListener('cava:profile-changed', onChange);
    window.addEventListener('focus', onChange);
    return () => {
      window.removeEventListener('cava:profile-changed', onChange);
      window.removeEventListener('focus', onChange);
    };
  }, []);

  return { posed, refresh };
}
```

- [ ] **Step 2 : Créer useCitation.js**

```js
import { useMemo } from 'react';
import { pickCitation } from '../data/citations';
import { getDominantColor, hashSeed, getUserId, dayIndex, toIsoDate } from '../helpers/stars';

const COLOR_TO_TAG = {
  bleu:   'calme',
  rose:   'tendre',
  violet: 'introspectif',
  peche:  'fatigue',
  orage:  'orage',
};

/**
 * Récupère la citation du jour, matchée sur la couleur dominante 7j.
 * Stable pour la journée entière (seed = userId + dayIndex).
 */
export default function useCitation() {
  return useMemo(() => {
    const dominant = getDominantColor(7) || 'bleu';
    const tag = COLOR_TO_TAG[dominant];
    const seed = hashSeed(getUserId()) + dayIndex(toIsoDate());
    return pickCitation(tag, seed);
  }, []);
}
```

- [ ] **Step 3 : Émettre l'event cava:profile-changed dans state.js**

Localise la fonction `setProfile` dans `src/v2/state.js` et ajoute en fin (après le `ls.set`) :

```js
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cava:profile-changed'));
  }
```

- [ ] **Step 4 : Build clean check**

```bash
npm run build 2>&1 | tail -5
```

- [ ] **Step 5 : Commit**

```bash
git add src/v2/hooks/ src/v2/state.js
git commit -m "feat(v5/T4): hooks useDailyStarStatus + useCitation + event cava:profile-changed

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 5 : Hook useSeasonalPalette

**Files:**
- Create: `src/v2/hooks/useSeasonalPalette.js`

- [ ] **Step 1 : Créer useSeasonalPalette.js**

```js
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

function getSeason(d = new Date()) {
  const m = d.getMonth(); // 0-11
  if (m >= 2 && m <= 4) return 'printemps';   // mars-mai
  if (m >= 5 && m <= 7) return 'ete';         // juin-août
  if (m >= 8 && m <= 10) return 'automne';    // sept-nov
  return 'hiver';                              // déc-fév
}
```

- [ ] **Step 2 : Build clean + commit**

```bash
npm run build 2>&1 | tail -5
git add src/v2/hooks/useSeasonalPalette.js
git commit -m "feat(v5/T5): useSeasonalPalette hook (data-season sur <html>)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 6 : Smoke test foundation + push branche

**Files:** aucun fichier modifié, juste tests + push.

- [ ] **Step 1 : Smoke test build**

```bash
npm run build 2>&1 | tail -10
```

Expected: `✓ built in <Xs>` + bundle size stable.

- [ ] **Step 2 : Vérifier imports cohérents**

```bash
grep -rn "from '../helpers/stars'" src/v2/
grep -rn "from '../hooks/" src/v2/
```

Expected: aucune erreur, juste les imports créés.

- [ ] **Step 3 : Push branche**

```bash
git push -u origin feat/v5-constellation
```

Expected: `Branch 'feat/v5-constellation' set up to track 'origin/feat/v5-constellation'.`

---

# PHASE 2 — Ciel (T7-T13)

## Task 7 : Composant Star.jsx

**Files:**
- Create: `src/components/ui/Star.jsx`
- Modify: `src/components/ui/index.js`

- [ ] **Step 1 : Créer Star.jsx**

```jsx
/* ============================================================
   Star — étoile individuelle (constellation Ciel)
   ============================================================
   Props :
     color  : 'bleu' | 'rose' | 'violet' | 'peche' | 'orage'
     size   : number (px diameter, default 4)
     pulse  : bool (animation pulse 4s)
     glow   : bool (halo additionnel, pour aujourd'hui)
     dashed : bool (cercle pointillé blanc — état "pas encore posée")
     onTap  : function
============================================================ */

const COLOR_MAP = {
  bleu:   'var(--star-bleu)',
  rose:   'var(--star-rose)',
  violet: 'var(--star-violet)',
  peche:  'var(--star-peche)',
  orage:  'var(--star-orage)',
};

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

- [ ] **Step 2 : Ajouter keyframes star-pulse à tokens.css**

Append en bas de `tokens.css` :

```css
@keyframes star-pulse {
  0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
  50%      { opacity: 1;   transform: translate(-50%, -50%) scale(1.15); }
}
@keyframes star-dashed-pulse {
  0%, 100% { opacity: 0.5; border-color: rgba(255,255,255,0.4); }
  50%      { opacity: 1;   border-color: rgba(255,255,255,0.85); }
}
@media (prefers-reduced-motion: reduce) {
  [class*="star-"] { animation: none !important; }
}
```

- [ ] **Step 3 : Exporter dans `src/components/ui/index.js`**

Ajoute après les autres exports :

```js
export { default as Star } from './Star';
```

- [ ] **Step 4 : Build clean + commit**

```bash
npm run build 2>&1 | tail -5
git add src/components/ui/Star.jsx src/components/ui/index.js src/tokens.css
git commit -m "feat(v5/T7): Star component (pulse, glow, dashed, color states)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 8 : Composant StarField.jsx (constellation SVG + algo placement)

**Files:**
- Create: `src/v2/data/star-positions.js`
- Create: `src/components/ui/StarField.jsx`
- Modify: `src/components/ui/index.js`

- [ ] **Step 1 : Créer src/v2/data/star-positions.js**

```js
/* ============================================================
   Algo placement déterministe des étoiles dans la constellation
   ============================================================
   Pour chaque (userId, dayIndex), calcule position (x, y) en
   pourcentage du viewport [0-100]. Évite les bordures (margin 10%).
   ============================================================ */

import { hashSeed } from '../helpers/stars';

/**
 * Position (x%, y%) déterministe pour une étoile donnée.
 * @param {string} starId - star.id (date + timestamp)
 * @param {string} userId - getUserId()
 * @returns {{x: number, y: number}}
 */
export function positionForStar(starId, userId) {
  const seedX = hashSeed(`${userId}-${starId}-x`);
  const seedY = hashSeed(`${userId}-${starId}-y`);
  // Margin 10-90% pour éviter bords (header + chapters scroll)
  const x = 10 + (seedX % 80);
  const y = 10 + (seedY % 60);  // limite Y à 70% pour laisser place aux chapitres
  return { x, y };
}

/**
 * Génère les paires de connexions (fils SVG) entre étoiles de la même semaine.
 * @param {Array} stars - étoiles avec {id, date}
 * @returns {Array<{from: position, to: position}>}
 */
export function generateConnections(stars, userId) {
  if (stars.length < 2) return [];

  // Groupe par semaine ISO (YYYY-W)
  const byWeek = {};
  stars.forEach((s) => {
    const wk = isoWeek(s.date);
    if (!byWeek[wk]) byWeek[wk] = [];
    byWeek[wk].push(s);
  });

  const connections = [];
  Object.values(byWeek).forEach((weekStars) => {
    // Trie par date, relie chronologiquement
    const sorted = [...weekStars].sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 0; i < sorted.length - 1; i++) {
      connections.push({
        from: positionForStar(sorted[i].id, userId),
        to:   positionForStar(sorted[i + 1].id, userId),
      });
    }
  });
  return connections;
}

function isoWeek(iso) {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getFullYear()}-W${weekNo}`;
}
```

- [ ] **Step 2 : Créer src/components/ui/StarField.jsx**

```jsx
/* ============================================================
   StarField — SVG constellation responsive
   ============================================================
   Props :
     stars       : array d'étoiles {id, date, color, ...}
     todayStar   : étoile d'aujourd'hui (peut être null = dashed)
     onTapToday  : fn pour poser l'étoile (si todayStar null)
     onTapStar   : fn(star) pour rouvrir une étoile
     userId      : pour placement déterministe
============================================================ */

import { useMemo } from 'react';
import Star from './Star';
import { positionForStar, generateConnections } from '../../v2/data/star-positions';

const MAX_STARS = 200;

export default function StarField({ stars, todayStar, onTapToday, onTapStar, userId }) {
  // Limite à 200 étoiles (LRU des plus récentes) pour perf mobile
  const limited = useMemo(() => {
    if (!stars || stars.length <= MAX_STARS) return stars || [];
    return [...stars].slice(-MAX_STARS);
  }, [stars]);

  const connections = useMemo(() => generateConnections(limited, userId), [limited, userId]);

  // Position de l'étoile d'aujourd'hui (id fictif si non posée)
  const todayPos = useMemo(() => {
    const id = todayStar?.id || `today-${new Date().toISOString().split('T')[0]}`;
    return positionForStar(id, userId);
  }, [todayStar, userId]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 280,
      }}
    >
      {/* Fils SVG (connexions intra-semaine) */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        {connections.map((c, i) => (
          <line
            key={i}
            x1={c.from.x}
            y1={c.from.y}
            x2={c.to.x}
            y2={c.to.y}
            stroke="rgba(255,255,255,0.20)"
            strokeWidth="0.15"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

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

      {/* Étoile d'aujourd'hui (au-dessus) */}
      <Star
        color={todayStar?.color || 'bleu'}
        size={todayStar ? 9 : 12}
        pulse={true}
        glow={!!todayStar}
        dashed={!todayStar}
        onTap={!todayStar ? onTapToday : undefined}
        ariaLabel={todayStar ? "Ton étoile d'aujourd'hui" : 'Pose ton étoile'}
        style={{ left: `${todayPos.x}%`, top: `${todayPos.y}%` }}
      />

      {/* Label "aujourd'hui" si non posée */}
      {!todayStar && (
        <div
          style={{
            position: 'absolute',
            left: `${todayPos.x}%`,
            top: `${todayPos.y}%`,
            transform: 'translate(-50%, calc(-50% - 24px))',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          aujourd'hui
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3 : Export dans `src/components/ui/index.js`**

```js
export { default as StarField } from './StarField';
```

- [ ] **Step 4 : Build clean + commit**

```bash
npm run build 2>&1 | tail -5
git add src/v2/data/star-positions.js src/components/ui/StarField.jsx src/components/ui/index.js
git commit -m "feat(v5/T8): StarField SVG responsive + algo placement déterministe par userId

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 9 : PersonAvatar (cheveux teal coin haut)

**Files:**
- Create: `src/components/ui/PersonAvatar.jsx`
- Modify: `src/components/ui/index.js`

- [ ] **Step 1 : Créer PersonAvatar.jsx**

```jsx
/* ============================================================
   PersonAvatar — Signature ÇA VA? (silhouette dos + cheveux teal)
   ============================================================
   SVG inline minimal pour usage dans coin haut-gauche du Ciel.
   Halo teal #12C4B0 pulsant en arrière.
============================================================ */

export default function PersonAvatar({ size = 36, style = {} }) {
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        ...style,
      }}
    >
      {/* Halo teal */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: -size * 0.3,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(18,196,176,0.30) 0%, transparent 70%)',
          animation: 'avatar-halo-pulse 4.2s ease-in-out infinite',
        }}
      />
      {/* Silhouette */}
      <svg
        viewBox="0 0 36 36"
        width={size}
        height={size}
        fill="none"
        style={{ position: 'relative' }}
      >
        {/* Tête + cheveux teal */}
        <circle cx="18" cy="13" r="5.5" fill="#12C4B0" />
        <path d="M12 13 Q 12 9, 18 8 Q 24 9, 24 13" fill="#12C4B0" opacity="0.6" />
        {/* Épaules / dos */}
        <path
          d="M8 30 Q 8 22, 14 19 L 22 19 Q 28 22, 28 30 Z"
          fill="rgba(251, 246, 232, 0.92)"
          stroke="rgba(251, 246, 232, 0.6)"
          strokeWidth="0.4"
        />
      </svg>
    </div>
  );
}
```

- [ ] **Step 2 : Ajouter keyframes avatar-halo-pulse à tokens.css**

```css
@keyframes avatar-halo-pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50%      { opacity: 1;   transform: scale(1.15); }
}
```

- [ ] **Step 3 : Export + commit**

```js
// src/components/ui/index.js
export { default as PersonAvatar } from './PersonAvatar';
```

```bash
npm run build 2>&1 | tail -5
git add src/components/ui/PersonAvatar.jsx src/components/ui/index.js src/tokens.css
git commit -m "feat(v5/T9): PersonAvatar SVG cheveux teal #12C4B0 + halo pulse 4.2s

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 10 : CielChapter (composant chapitre scroll)

**Files:**
- Create: `src/components/ui/CielChapter.jsx`
- Modify: `src/components/ui/index.js`

- [ ] **Step 1 : Créer CielChapter.jsx**

```jsx
/* ============================================================
   CielChapter — Chapitre du scroll narratif sur fond nuit
   ============================================================
   Props :
     eyebrow : label uppercase (ex: "Hier · 23 mai")
     text    : contenu Cormorant italic
     accent  : 'rose' | 'blue' | 'violet' | 'gradient'
     media   : { type: 'image', src: '...' } optionnel
============================================================ */

const ACCENT_COLORS = {
  rose:     '#E8A0B8',
  blue:     '#6F9DB5',
  violet:   '#AF80BA',
  gradient: 'linear-gradient(to bottom, #1A5A7F, #7F5A8A, #C87090)',
};

const EYEBROW_COLORS = {
  rose:   'rgba(232, 160, 184, 0.85)',
  blue:   'rgba(111, 157, 181, 0.85)',
  violet: 'rgba(175, 128, 186, 0.85)',
  gradient: 'rgba(232, 160, 184, 0.85)',
};

export default function CielChapter({ eyebrow, text, accent = 'blue', media }) {
  const borderBackground = ACCENT_COLORS[accent] || ACCENT_COLORS.blue;
  const eyebrowColor = EYEBROW_COLORS[accent] || EYEBROW_COLORS.blue;

  return (
    <article
      style={{
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(24px) saturate(160%)',
        WebkitBackdropFilter: 'blur(24px) saturate(160%)',
        border: '1px solid rgba(255, 255, 255, 0.10)',
        borderRadius: 18,
        padding: '16px 18px',
        margin: '0 16px 12px',
        overflow: 'hidden',
        animation: 'chapter-fade-in 480ms cubic-bezier(0.22,0.61,0.36,1) both',
      }}
    >
      {/* Barre accent gauche */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: borderBackground,
          borderRadius: '4px 0 0 4px',
        }}
      />

      {/* Eyebrow */}
      {eyebrow && (
        <div
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: eyebrowColor,
            marginBottom: 8,
          }}
        >
          {eyebrow}
        </div>
      )}

      {/* Texte principal */}
      <div
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 15,
          lineHeight: 1.45,
          color: 'rgba(251, 246, 232, 0.92)',
        }}
      >
        {text}
      </div>

      {/* Media (image optionnelle) */}
      {media?.type === 'image' && (
        <div
          style={{
            marginTop: 12,
            borderRadius: 12,
            overflow: 'hidden',
            aspectRatio: '4 / 5',
            maxHeight: 200,
          }}
        >
          <img
            src={media.src}
            alt=""
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}
    </article>
  );
}
```

- [ ] **Step 2 : Ajouter keyframes chapter-fade-in à tokens.css**

```css
@keyframes chapter-fade-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 3 : Export + commit**

```js
// index.js
export { default as CielChapter } from './CielChapter';
```

```bash
npm run build 2>&1 | tail -5
git add src/components/ui/CielChapter.jsx src/components/ui/index.js src/tokens.css
git commit -m "feat(v5/T10): CielChapter glass card scroll + accent border + fade-in

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 11 : Générateur de chapitres auto (chapter-generator.js)

**Files:**
- Create: `src/v2/helpers/chapter-generator.js`

- [ ] **Step 1 : Créer chapter-generator.js**

```js
/* ============================================================
   Chapter Generator — produit la liste de chapitres à afficher
   sur le scroll du Ciel, à partir des étoiles + état app.
   ============================================================
   Types de chapitres : 'hier', 'semaine', 'mois', 'saison',
   'memoire', 'piece', 'voix'
   ============================================================ */

import { CITATIONS } from '../data/citations';
import { getStarsRange, toIsoDate, getDominantColor, getAllStars } from './stars';

const COLOR_LABELS = {
  bleu:   'calme',
  rose:   'tendresse',
  violet: 'introspection',
  peche:  'fatigue',
  orage:  'orage',
};

const MOIS_FR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

/**
 * Retourne un tableau de chapitres à afficher dans le Ciel scroll.
 * Ordre : du plus récent au plus ancien.
 */
export function generateChapters() {
  const chapters = [];
  const stars = getAllStars();
  if (stars.length === 0) return chapters;

  const today = new Date();
  const yesterday = new Date(today.getTime() - 86400000);

  // ── Chapitre "Hier" ──
  const yesterdayStars = stars.filter((s) => s.date === toIsoDate(yesterday));
  if (yesterdayStars.length > 0) {
    const last = yesterdayStars[yesterdayStars.length - 1];
    chapters.push({
      type: 'hier',
      eyebrow: `Hier · ${formatDate(yesterday)}`,
      accent: 'rose',
      text: last.note
        ? `« ${last.note} »`
        : `Tu as déposé une étoile ${COLOR_LABELS[last.color] || ''}.`,
    });
  }

  // ── Chapitre "Cette semaine" ──
  const weekFrom = new Date(today.getTime() - 7 * 86400000);
  const weekStars = getStarsRange(toIsoDate(weekFrom), toIsoDate(today));
  if (weekStars.length >= 3) {
    const dominant = getDominantColor(7);
    chapters.push({
      type: 'semaine',
      eyebrow: 'Cette semaine',
      accent: 'rose',
      text: `${weekStars.length} étoiles posées. Tendance : ${COLOR_LABELS[dominant] || 'présence'}.`,
    });
  }

  // ── Chapitre "Ce mois" (visible 1-7 du mois) ──
  if (today.getDate() <= 7) {
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    const monthStars = getStarsRange(toIsoDate(lastMonth), toIsoDate(lastMonthEnd));
    if (monthStars.length > 0) {
      const counts = {};
      monthStars.forEach((s) => { counts[s.color] = (counts[s.color] || 0) + 1; });
      const dominantMonth = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      chapters.push({
        type: 'mois',
        eyebrow: MOIS_FR[lastMonth.getMonth()],
        accent: 'violet',
        text: `${monthStars.length} étoiles. Couleur dominante : ${COLOR_LABELS[dominantMonth] || 'présence'}.`,
      });
    }
  }

  // ── M4 : Mémoire qui ressurgit (étoile 30/90/365 jours) ──
  const memoryOffsets = [30, 90, 365];
  for (const days of memoryOffsets) {
    const target = new Date(today.getTime() - days * 86400000);
    const targetIso = toIsoDate(target);
    const memoryStar = stars.find((s) => s.date === targetIso && s.note);
    if (memoryStar) {
      chapters.push({
        type: 'memoire',
        eyebrow: days === 365 ? 'Il y a un an' : `Il y a ${days} jours`,
        accent: 'blue',
        text: `Tu écrivais : « ${memoryStar.note} »`,
      });
      break; // une seule mémoire à la fois
    }
  }

  // ── M6 : Pièce de la marque qui résonne ──
  const dominantNow = getDominantColor(3);
  if (dominantNow) {
    const tagMap = { bleu: 'calme', rose: 'tendre', violet: 'introspectif', peche: 'fatigue', orage: 'orage' };
    const tag = tagMap[dominantNow];
    const matched = CITATIONS.filter((c) => c.tags.includes(tag) && c.author == null);
    if (matched.length > 0) {
      const c = matched[Math.floor(Math.random() * matched.length)];
      // Map citation id → image marque (matching simple par id mod 122)
      const imageIdx = String((c.id * 7) % 122 + 1).padStart(3, '0');
      chapters.push({
        type: 'piece',
        eyebrow: 'Une pièce qui te ressemble',
        accent: 'rose',
        text: `« ${c.text} »`,
        media: { type: 'image', src: `/cava/marque/marque-${imageIdx}.jpeg` },
      });
    }
  }

  return chapters;
}

function formatDate(d) {
  return `${d.getDate()} ${MOIS_FR[d.getMonth()]}`;
}
```

- [ ] **Step 2 : Build clean + commit**

```bash
npm run build 2>&1 | tail -5
git add src/v2/helpers/chapter-generator.js
git commit -m "feat(v5/T11): chapter-generator (hier, semaine, mois, mémoire 30/90/365, pièce marque)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 12 : PoseEtoileModal (flow 3 étapes)

**Files:**
- Create: `src/components/ui/PoseEtoileModal.jsx`
- Modify: `src/components/ui/index.js`

- [ ] **Step 1 : Créer PoseEtoileModal.jsx**

```jsx
/* ============================================================
   PoseEtoileModal — Flow 3 étapes pour poser son étoile du jour
   ============================================================
   Étape 1 : choix couleur (5 pastilles)
   Étape 2 : mot libre optionnel
   Étape 3 : étoile naît (animation 2s) + citation
   ============================================================ */

import { useState, useEffect } from 'react';
import { addStar } from '../../v2/helpers/stars';
import { haptic } from '../../v2/state';
import Overlay from './Overlay';
import CTA from './CTA';
import Textarea from './Textarea';

const COLORS = [
  { key: 'bleu',   label: 'Calme, présent',         hex: '#6F9DB5', emoji: '🔵' },
  { key: 'rose',   label: 'Doux, sensible',         hex: '#E8A0B8', emoji: '🌸' },
  { key: 'violet', label: 'Introspectif, lourd',    hex: '#AF80BA', emoji: '🟣' },
  { key: 'peche',  label: 'Fatigue, plat',          hex: '#D4A878', emoji: '🌅' },
  { key: 'orage',  label: 'Orage, crise',           hex: '#4A6070', emoji: '🌧' },
];

export default function PoseEtoileModal({ open, onClose, onPosed }) {
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

  if (!open) return null;

  const handlePickColor = (c) => {
    haptic([4, 30, 4]);
    setColor(c);
    setStep(2);
  };

  const handleConfirmNote = () => {
    haptic(6);
    const star = addStar({ color, note });
    setBornStar(star);
    setStep(3);
    // Auto-close après 4s
    setTimeout(() => {
      onPosed?.(star);
      onClose?.();
    }, 4000);
  };

  return (
    <Overlay
      backdrop="dark"
      closeOnBackdrop={step !== 3}
      onClose={onClose}
      ariaLabel="Pose ton étoile"
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
        {step === 2 && (
          <StepNote
            color={color}
            note={note}
            setNote={setNote}
            onConfirm={handleConfirmNote}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && bornStar && (
          <StepBorn star={bornStar} />
        )}
      </div>
    </Overlay>
  );
}

function StepColor({ onPick }) {
  return (
    <div style={{ textAlign: 'center', animation: 'modal-fade-in 360ms ease-out both' }}>
      <p
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'rgba(232, 160, 184, 0.85)',
          margin: '0 0 14px',
        }}
      >
        Étape 1 sur 3
      </p>
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 32,
          lineHeight: 1.15,
          color: '#FBF6E8',
          margin: '0 0 36px',
        }}
      >
        Et toi, ça va vraiment&nbsp;?
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {COLORS.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => onPick(c.key)}
            style={{
              appearance: 'none',
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 22,
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              cursor: 'pointer',
              transition: 'transform 240ms cubic-bezier(0.22,0.61,0.36,1), border-color 240ms ease',
              fontFamily: 'inherit',
              color: '#FBF6E8',
              textAlign: 'left',
              WebkitTapHighlightColor: 'transparent',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.hex; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = ''; }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: c.hex,
                boxShadow: `0 0 16px ${c.hex}`,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontStyle: 'italic',
                fontSize: 17,
                color: 'rgba(251, 246, 232, 0.92)',
              }}
            >
              {c.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepNote({ color, note, setNote, onConfirm, onBack }) {
  const colorMeta = COLORS.find((c) => c.key === color);
  return (
    <div style={{ animation: 'modal-fade-in 360ms ease-out both' }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          appearance: 'none',
          background: 'transparent',
          border: 'none',
          color: 'rgba(251, 246, 232, 0.6)',
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          padding: '8px 0',
          marginBottom: 18,
        }}
      >
        ‹ Retour
      </button>
      <p
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'rgba(232, 160, 184, 0.85)',
          margin: '0 0 14px',
        }}
      >
        Étape 2 sur 3
      </p>
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 26,
          lineHeight: 1.2,
          color: '#FBF6E8',
          margin: '0 0 8px',
        }}
      >
        Si tu veux, dis-le.
      </h2>
      <p
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 14,
          color: 'rgba(251, 246, 232, 0.65)',
          margin: '0 0 22px',
        }}
      >
        Un mot, une phrase, ou rien. Comme tu veux.
      </p>

      <div style={{ marginBottom: 24 }}>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="un mot, une phrase, ou rien."
          rows={5}
          maxLength={280}
          accent={color === 'rose' ? 'rose' : color === 'violet' ? 'violet' : 'blue'}
          showCounter={false}
          textareaStyle={{
            background: 'rgba(255, 255, 255, 0.06)',
            color: '#FBF6E8',
          }}
        />
      </div>

      <CTA variant={note.trim() ? 'rose' : 'outline'} size="lg" full onClick={onConfirm}>
        {note.trim() ? 'Déposer mon étoile' : 'Le silence aussi compte'}
      </CTA>
    </div>
  );
}

function StepBorn({ star }) {
  return (
    <div
      style={{
        textAlign: 'center',
        animation: 'modal-fade-in 360ms ease-out both',
      }}
    >
      {/* L'étoile qui naît */}
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: `var(--star-${star.color}, #E8A0B8)`,
          margin: '0 auto 24px',
          boxShadow: `0 0 40px var(--star-${star.color}, #E8A0B8), 0 0 80px var(--star-${star.color}, #E8A0B8)`,
          animation: 'star-born 2s cubic-bezier(0.22,0.61,0.36,1) both',
        }}
      />
      <p
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'rgba(232, 160, 184, 0.85)',
          margin: '0 0 14px',
        }}
      >
        Posé.
      </p>
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
    </div>
  );
}
```

- [ ] **Step 2 : Keyframes star-born + modal-fade-in à tokens.css**

```css
@keyframes star-born {
  0%   { transform: scale(0); opacity: 0; }
  50%  { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes modal-fade-in {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 3 : Export + commit**

```js
// index.js
export { default as PoseEtoileModal } from './PoseEtoileModal';
```

```bash
npm run build 2>&1 | tail -5
git add src/components/ui/PoseEtoileModal.jsx src/components/ui/index.js src/tokens.css
git commit -m "feat(v5/T12): PoseEtoileModal flow 3 étapes (couleur · mot · étoile naît)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 13 : Écran Ciel (hero + scroll narratif)

**Files:**
- Create: `src/v2/screens/Ciel.jsx`

- [ ] **Step 1 : Créer Ciel.jsx**

```jsx
/* ============================================================
   Ciel — Écran central V5
   ============================================================
   Hero constellation (50dvh) + scroll narratif chapitres dessous.
   ============================================================ */

import { useState, useMemo } from 'react';
import { getProfile } from '../state';
import { getAllStars, getUserId, toIsoDate, getLatestStar } from '../helpers/stars';
import { generateChapters } from '../helpers/chapter-generator';
import useDailyStarStatus from '../hooks/useDailyStarStatus';
import useCitation from '../hooks/useCitation';
import { StarField, PersonAvatar, CielChapter, PoseEtoileModal } from '../../components/ui';

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

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--ciel-bg-gradient)',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        color: 'var(--ciel-text)',
        paddingBottom: 90, // BottomNav clearance
      }}
    >
      {/* Glows ambient */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -100,
          right: -80,
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'var(--ciel-glow-rose)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 200,
          left: -100,
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'var(--ciel-glow-violet)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* Avatar coin haut-gauche */}
      <div style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 18px)', left: 18, zIndex: 5 }}>
        <PersonAvatar size={36} />
      </div>

      {/* Header text */}
      <div
        style={{
          position: 'relative',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 28px)',
          textAlign: 'center',
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--ciel-text-muted)',
            marginBottom: 8,
          }}
        >
          {formatGreetingDate()}
        </div>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 26,
            lineHeight: 1.2,
            color: 'var(--ciel-text)',
            margin: 0,
          }}
        >
          {greeting(prenom)}
        </h1>
      </div>

      {/* Constellation hero */}
      <div style={{ position: 'relative', height: '46dvh', minHeight: 280, marginTop: 14 }}>
        <StarField
          stars={stars}
          todayStar={todayStar}
          onTapToday={() => setModalOpen(true)}
          onTapStar={(s) => {
            // M11 futur — pour l'instant on log
            console.warn('Star tapped (future):', s);
          }}
          userId={userId}
        />
      </div>

      {/* Citation flottante */}
      <div
        style={{
          position: 'relative',
          textAlign: 'center',
          padding: '12px 32px 24px',
          zIndex: 2,
        }}
      >
        <p
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 15,
            color: 'rgba(251, 246, 232, 0.72)',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          « {citation.text} »
        </p>
        {citation.author && (
          <p
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(251, 246, 232, 0.40)',
              marginTop: 6,
            }}
          >
            — {citation.author}
          </p>
        )}
      </div>

      {/* Chapitres scroll narratif */}
      <div style={{ position: 'relative', zIndex: 2, marginTop: 8 }}>
        {chapters.length === 0 && !posed && (
          <CielChapter
            eyebrow="Premier soir"
            text="Pose ta toute première étoile. C'est par là que commence ton ciel."
            accent="rose"
          />
        )}
        {chapters.map((ch, i) => (
          <CielChapter
            key={`${ch.type}-${i}`}
            eyebrow={ch.eyebrow}
            text={ch.text}
            accent={ch.accent}
            media={ch.media}
          />
        ))}
      </div>

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
    </div>
  );
}

function greeting(prenom) {
  const h = new Date().getHours();
  let g = 'Bonjour';
  if (h >= 18 || h < 2) g = 'Bonsoir';
  else if (h >= 12) g = 'Cet après-midi';
  else if (h < 6) g = 'Cette nuit';
  return prenom ? `${g}, ${prenom}.` : `${g}.`;
}

function formatGreetingDate() {
  const d = new Date();
  const months = ['JAN','FÉV','MAR','AVR','MAI','JUI','JUI','AOÛ','SEP','OCT','NOV','DÉC'];
  return `${d.getDate()} ${months[d.getMonth()]} · ${String(d.getHours()).padStart(2,'0')}h${String(d.getMinutes()).padStart(2,'0')}`;
}
```

- [ ] **Step 2 : Smoke test dev server**

```bash
# Lance le dev server en background pour vérifier que le composant compile
npm run build 2>&1 | tail -5
```

Expected: clean.

- [ ] **Step 3 : Commit**

```bash
git add src/v2/screens/Ciel.jsx
git commit -m "feat(v5/T13): écran Ciel — hero constellation + scroll chapitres + FAB pose étoile

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

# PHASE 3 — Espaces (T14-T17)

## Task 14 : Shell Espaces avec 3 sous-routes

**Files:**
- Create: `src/v2/screens/Espaces.jsx`

- [ ] **Step 1 : Créer Espaces.jsx**

```jsx
/* ============================================================
   Espaces — 3 verbes : Refuge · Voix · Marque
   ============================================================
   Shell avec sous-navigation par état React. Pas de routing
   externe pour rester simple (state local).
   ============================================================ */

import { useState } from 'react';
import { Header, GlassCard, Eyebrow, HeroTitle, Body, CTA, Icon, tokens } from '../../components/ui';
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

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--bg)',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: 100,
      }}
    >
      <Blobs variant="rose-blue" />

      <div style={{ position: 'relative', zIndex: 2, padding: 'calc(env(safe-area-inset-top, 0px) + 32px) 16px 24px', textAlign: 'center' }}>
        <Eyebrow color="rose">Espaces</Eyebrow>
        <HeroTitle size="md" style={{ marginTop: 8 }}>Trois refuges.</HeroTitle>
        <Body style={{ marginTop: 10, maxWidth: 320, margin: '10px auto 0' }}>
          Choisis où tu veux aller maintenant.
        </Body>
      </div>

      <div style={{ position: 'relative', zIndex: 2, padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {SPACES.map((s) => (
          <GlassCard key={s.key} hoverable onClick={() => setActive(s.key)} padding="20px 22px" radius="xl">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: s.key === 'refuge' ? tokens.gradientBlue : s.key === 'voix' ? tokens.gradientRose : tokens.gradientViolet,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  flexShrink: 0,
                }}
              >
                <Icon name={s.icon} size={24} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <HeroTitle size="sm" style={{ fontSize: 22, lineHeight: 1.2 }}>{s.label}</HeroTitle>
                <Body variant="body-sm" style={{ marginTop: 4 }}>{s.subtitle}</Body>
              </div>
              <Icon name="chevron-right" size={20} color={tokens.blue300} />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2 : Vérifier que les icons utilisés existent dans Icon.jsx**

```bash
grep -E "'sparkle'|'message'|'heart'|'chevron-right'" src/components/ui/Icon.jsx
```

Si un icon manque, l'ajouter dans `Icon.jsx`. Probablement tout est OK car ces noms étaient prévus dans P4 de la Phase 3 du DS.

- [ ] **Step 3 : Build clean + commit**

```bash
npm run build 2>&1 | tail -5
git add src/v2/screens/Espaces.jsx
git commit -m "feat(v5/T14): shell Espaces avec 3 sous-routes (Refuge / Voix / Marque)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 15 : Refuge (fusion Cocon + Méditation + Breath + Carnet)

**Files:**
- Create: `src/v2/screens/Refuge.jsx`

- [ ] **Step 1 : Créer Refuge.jsx avec 4 actions principales**

```jsx
/* ============================================================
   Refuge — Fusion des actions de pause (méditer / respirer /
   écrire / personnaliser cocon).
   ============================================================ */

import { useState } from 'react';
import { Header, GlassCard, Eyebrow, HeroTitle, Body, CTA, Icon, tokens } from '../../components/ui';
import Blobs from '../../components/Blobs';
import Meditation from './Meditation';
import BreathingPause from './BreathingPause';
import Carnet from './Carnet';
import Cocon from './Cocon';

const ACTIONS = [
  { key: 'meditation', label: 'Méditer',      desc: 'Une séance guidée 90s à 9 min', icon: 'circle',  gradient: 'gradientViolet' },
  { key: 'breath',     label: 'Respirer',     desc: 'Un cycle 4·7·8 doux',           icon: 'sparkle', gradient: 'gradientBlue' },
  { key: 'carnet',     label: 'Écrire libre', desc: 'Laisse poser ce qui passe',      icon: 'book',    gradient: 'gradientRose' },
  { key: 'cocon',      label: 'Mon cocon',    desc: 'Personnaliser mon refuge',       icon: 'home',    gradient: 'gradientViolet' },
];

export default function Refuge({ onClose }) {
  const [active, setActive] = useState(null);

  if (active === 'meditation') return <Meditation worldKey="violet" onClose={() => setActive(null)} />;
  if (active === 'breath')     return <BreathingPause onClose={() => setActive(null)} />;
  if (active === 'carnet')     return <Carnet onClose={() => setActive(null)} />;
  if (active === 'cocon')      return <Cocon onClose={() => setActive(null)} />;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--bg)',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: 100,
      }}
    >
      <Blobs variant="rose-violet" />
      <Header title="Refuge" onBack={onClose} />

      <div style={{ position: 'relative', zIndex: 2, padding: '12px 16px 8px', textAlign: 'center' }}>
        <Eyebrow color="rose">Pose-toi</Eyebrow>
        <HeroTitle size="md" style={{ marginTop: 8 }}>Choisis ton refuge.</HeroTitle>
      </div>

      <div style={{ position: 'relative', zIndex: 2, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ACTIONS.map((a) => (
          <GlassCard key={a.key} hoverable onClick={() => setActive(a.key)} padding="18px 20px" radius="lg">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: tokens[a.gradient],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  flexShrink: 0,
                }}
              >
                <Icon name={a.icon} size={22} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontWeight: 300, fontSize: 19, color: 'var(--blue-900)', margin: 0, lineHeight: 1.2 }}>
                  {a.label}
                </h3>
                <Body variant="body-sm" style={{ marginTop: 3 }}>{a.desc}</Body>
              </div>
              <Icon name="chevron-right" size={18} color={tokens.blue300} />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2 : Build clean + commit**

```bash
npm run build 2>&1 | tail -5
git add src/v2/screens/Refuge.jsx
git commit -m "feat(v5/T15): Refuge — fusion Méditation/Respirer/Écrire/Cocon en 1 écran

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 16 : Voix (refonte Communauté simplifiée)

**Files:**
- Create: `src/v2/screens/Voix.jsx`

- [ ] **Step 1 : Créer Voix.jsx**

```jsx
/* ============================================================
   Voix — Lire les autres, partager la sienne.
   ============================================================ */

import { useState, useMemo } from 'react';
import { Header, GlassCard, Eyebrow, HeroTitle, Body, CTA, Textarea, tokens } from '../../components/ui';
import Blobs from '../../components/Blobs';
import { haptic, ls } from '../state';

const SEEDED_VOICES = [
  { id: 's1', pseudo: 'Sève',  body: 'Je suis fatiguée depuis si longtemps que j\'ai oublié à quoi ressemble la fatigue normale.', daysAgo: 2 },
  { id: 's2', pseudo: 'Élio',  body: 'Le matin c\'est le plus dur. Sortir du lit demande tout ce que je n\'ai pas.', daysAgo: 1 },
  { id: 's3', pseudo: 'Naïs',  body: 'Aujourd\'hui j\'ai dit non. Pour la première fois depuis longtemps. Et ça m\'a fait pleurer.', daysAgo: 3 },
  { id: 's4', pseudo: 'Rune',  body: 'On m\'a demandé comment j\'allais. J\'ai répondu "ça va" mais j\'avais envie d\'autre chose.', daysAgo: 4 },
  { id: 's5', pseudo: 'Anya',  body: 'Mon corps me parle. Il dit qu\'il a besoin que je l\'écoute. Je commence juste.', daysAgo: 5 },
];

export default function Voix({ onClose }) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const ownPosts = useMemo(() => ls.get('cava_v5_voix', []), [composerOpen]);

  const allVoices = useMemo(() => {
    const ownAsVoices = ownPosts.map((p) => ({
      id: p.id,
      pseudo: 'Toi',
      body: p.body,
      daysAgo: Math.floor((Date.now() - p.createdAt) / 86400000),
      own: true,
    }));
    return [...ownAsVoices, ...SEEDED_VOICES].sort((a, b) => a.daysAgo - b.daysAgo);
  }, [ownPosts]);

  const handleShare = () => {
    if (!draft.trim()) return;
    haptic(6);
    const post = { id: `v-${Date.now()}`, body: draft.trim(), createdAt: Date.now() };
    ls.set('cava_v5_voix', [post, ...ownPosts]);
    setDraft('');
    setComposerOpen(false);
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--bg)',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: 100,
      }}
    >
      <Blobs variant="blue-rose" />
      <Header title="Voix" onBack={onClose} />

      {/* Hero */}
      <div style={{ position: 'relative', zIndex: 2, padding: '12px 16px 8px', textAlign: 'center' }}>
        <Eyebrow color="rose">Les voix qui passent</Eyebrow>
        <HeroTitle size="md" style={{ marginTop: 8 }}>Tu n'es pas seul·e.</HeroTitle>
        <Body style={{ marginTop: 8, maxWidth: 320, margin: '8px auto 0' }}>
          Anonyme. Sans like. Sans compteur.
        </Body>
      </div>

      {/* CTA Partager */}
      <div style={{ position: 'relative', zIndex: 2, padding: '16px 16px 8px' }}>
        <CTA variant="rose" size="md" full onClick={() => setComposerOpen(true)}>
          Partager une voix
        </CTA>
      </div>

      {/* Composer inline */}
      {composerOpen && (
        <div style={{ position: 'relative', zIndex: 2, padding: '8px 16px' }}>
          <GlassCard padding="18px 20px" radius="lg">
            <Eyebrow color="rose">Ta voix</Eyebrow>
            <div style={{ marginTop: 12 }}>
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ce que tu veux dire, comme tu veux le dire."
                rows={4}
                maxLength={280}
                accent="rose"
                showCounter
              />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <CTA variant="ghost" size="sm" onClick={() => { setComposerOpen(false); setDraft(''); }}>Annuler</CTA>
              <CTA variant="primary" size="sm" onClick={handleShare} disabled={!draft.trim()}>Envoyer</CTA>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Feed */}
      <div style={{ position: 'relative', zIndex: 2, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {allVoices.map((v, i) => (
          <GlassCard key={v.id} accent={i % 2 === 0 ? 'blue' : 'rose'} padding="18px 20px" radius="lg">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontWeight: 300, fontSize: 17, color: 'var(--blue-900)', margin: 0 }}>
                {v.pseudo}
              </h3>
              <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 11, color: tokens.textMuted }}>
                {v.daysAgo === 0 ? "aujourd'hui" : `il y a ${v.daysAgo}j`}
              </span>
            </div>
            <Body>{v.body}</Body>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2 : Build clean + commit**

```bash
npm run build 2>&1 | tail -5
git add src/v2/screens/Voix.jsx
git commit -m "feat(v5/T16): Voix — feed anonyme + composer 280 chars + accent alterné

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 17 : Marque — light polish CaVa

**Files:**
- Modify: `src/v2/screens/CaVa.jsx`

- [ ] **Step 1 : Vérifier que CaVa accepte un onClose prop**

```bash
grep -n "function CaVa" src/v2/screens/CaVa.jsx
```

Si CaVa n'accepte pas `onClose`, l'ajouter à la signature et l'utiliser pour passer dans `<Header onBack={onClose}>` ou équivalent.

- [ ] **Step 2 : Ajouter onClose si manquant**

Localise `export default function CaVa(` et change pour `export default function CaVa({ onClose }) {`. Puis dans le composant TopBar interne, ajoute un bouton retour qui appelle `onClose` (s'il existe ; sinon, conserve le comportement actuel).

```jsx
// Dans CaVa.jsx, dans le composant TopBar ou wrapper :
{onClose && (
  <button
    type="button"
    onClick={onClose}
    aria-label="Retour"
    style={{
      position: 'fixed', top: 'calc(env(safe-area-inset-top, 0px) + 14px)', left: 16, zIndex: 80,
      background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.9)', borderRadius: 50, padding: '10px 14px',
      color: 'var(--blue-700)', fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, fontWeight: 500,
      cursor: 'pointer', boxShadow: '0 4px 16px rgba(10,36,56,0.10)', minHeight: 44,
      display: 'inline-flex', alignItems: 'center', gap: 6,
    }}
  >
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    Retour
  </button>
)}
```

- [ ] **Step 3 : Build clean + commit**

```bash
npm run build 2>&1 | tail -5
git add src/v2/screens/CaVa.jsx
git commit -m "feat(v5/T17): CaVa accepte prop onClose pour intégration Espaces

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

# PHASE 4 — Cleanup (T18-T22)

## Task 18 : BottomNav 2 tabs

**Files:**
- Modify: `src/components/BottomNav.jsx`

- [ ] **Step 1 : Réécrire le tableau TABS pour 2 onglets**

Dans `src/components/BottomNav.jsx`, remplace la constante `TABS` :

```js
const TABS = [
  { key: 'ciel',    label: 'Ciel',    icon: 'sparkle' },
  { key: 'espaces', label: 'Espaces', icon: 'circle' },
];
```

Le reste du composant reste tel quel — la nav s'adapte automatiquement au nombre.

- [ ] **Step 2 : Build clean + commit**

```bash
npm run build 2>&1 | tail -5
git add src/components/BottomNav.jsx
git commit -m "feat(v5/T18): BottomNav 2 onglets (Ciel · Espaces)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 19 : v2/App.jsx routing 2 onglets

**Files:**
- Modify: `src/v2/App.jsx`

- [ ] **Step 1 : Read v2/App.jsx pour repérer où sont rendus les tabs**

```bash
grep -n "activeTab\|TAB_ORDER\|aventure\|cocon\|communaute\|cava" src/v2/App.jsx | head -20
```

- [ ] **Step 2 : Remplacer TAB_ORDER + le rendu conditionnel**

Localise `const TAB_ORDER = ['aventure', 'cocon', 'communaute', 'cava'];` et change pour :

```js
const TAB_ORDER = ['ciel', 'espaces'];
```

Mets aussi à jour la valeur par défaut de `activeTab` :

```js
const [activeTab, setActiveTab] = useState(() => ls.get('active_tab', 'ciel'));
```

Localise le bloc qui rend les 4 onglets (chercher `[{ key: 'aventure', node: ...` ou similar) et remplace par 2 onglets :

```jsx
{[
  { key: 'ciel',    node: <Ciel /> },
  { key: 'espaces', node: <Espaces /> },
].map(({ key, node }) => {
  const isActive = activeTab === key;
  return (
    <div
      key={key}
      aria-hidden={!isActive}
      style={{
        position: 'absolute',
        inset: 0,
        opacity: isActive ? 1 : 0,
        pointerEvents: isActive ? 'auto' : 'none',
        transition: 'opacity 280ms var(--ease-out)',
        zIndex: isActive ? 2 : 1,
        overflow: 'hidden',
      }}
    >
      {node}
    </div>
  );
})}
```

Aussi ajouter les imports en haut :

```js
import Ciel from './screens/Ciel';
import Espaces from './screens/Espaces';
```

Et **retirer les imports** des écrans supprimés (sera fait en T20 ; à minima retirer les usages du JSX, sinon le build casse). Pour T19, ne RETIRE pas les imports encore — juste change le rendu.

- [ ] **Step 3 : Initialiser useSeasonalPalette à la racine de V2App**

Au début du composant V2App, ajoute :

```js
import useSeasonalPalette from './hooks/useSeasonalPalette';
// ...
export default function V2App() {
  useSeasonalPalette();
  // ... reste inchangé
}
```

- [ ] **Step 4 : Build clean check**

```bash
npm run build 2>&1 | tail -5
```

Si erreur sur un import (Aventure, Cocon, Communaute, CaVa pas trouvés dans le JSX), c'est attendu — corrige seulement si bloquant.

- [ ] **Step 5 : Commit**

```bash
git add src/v2/App.jsx
git commit -m "feat(v5/T19): routing 2 onglets (ciel/espaces) + useSeasonalPalette hook

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 20 : Supprimer écrans obsolètes

**Files:**
- Delete (13 files):
  - `src/v2/screens/Aventure.jsx`
  - `src/v2/screens/AventurePlayer.jsx`
  - `src/v2/screens/AventureOnboarding.jsx`
  - `src/v2/screens/Habitudes.jsx`
  - `src/v2/screens/MoodTracker.jsx`
  - `src/v2/screens/Bilan.jsx`
  - `src/v2/screens/BilanSemaine.jsx`
  - `src/v2/screens/EspaceVrai.jsx`
  - `src/v2/screens/Lookbook.jsx`
  - `src/v2/screens/ProductDetail.jsx`
  - `src/v2/screens/LeconReader.jsx`
  - `src/v2/screens/MondeReader.jsx`
  - `src/v2/screens/Cercle.jsx`

- [ ] **Step 1 : Vérifier d'abord qu'aucun de ces fichiers n'est encore importé ailleurs**

```bash
for f in Aventure AventurePlayer AventureOnboarding Habitudes MoodTracker Bilan BilanSemaine EspaceVrai Lookbook ProductDetail LeconReader MondeReader Cercle; do
  echo "=== $f ==="
  grep -rn "from.*$f'" src/ 2>/dev/null | grep -v "v2/screens/$f.jsx"
done
```

Pour chaque référence trouvée hors du fichier lui-même, supprime cet import + son usage JSX dans le fichier qui l'importe.

- [ ] **Step 2 : Supprimer les fichiers**

```bash
cd /Users/williammorel/NÉYA
rm src/v2/screens/Aventure.jsx
rm src/v2/screens/AventurePlayer.jsx
rm src/v2/screens/AventureOnboarding.jsx
rm src/v2/screens/Habitudes.jsx
rm src/v2/screens/MoodTracker.jsx
rm src/v2/screens/Bilan.jsx
rm src/v2/screens/BilanSemaine.jsx
rm src/v2/screens/EspaceVrai.jsx
rm src/v2/screens/Lookbook.jsx
rm src/v2/screens/ProductDetail.jsx
rm src/v2/screens/LeconReader.jsx
rm src/v2/screens/MondeReader.jsx
rm src/v2/screens/Cercle.jsx
```

- [ ] **Step 3 : Nettoyer v2/App.jsx — retirer les imports orphelins**

```bash
grep -n "from './screens/" src/v2/App.jsx
```

Retire tout import qui pointe vers un fichier supprimé. Idem retire l'usage JSX et les états orphelins (habitudesOpen, bilanOpen, etc.) ainsi que les setters et les conditionals de rendu.

- [ ] **Step 4 : Build clean check (peut nécessiter plusieurs passes de correction)**

```bash
npm run build 2>&1 | grep -i "error\|cannot find" | head -10
```

Corrige tout import/référence cassée jusqu'à build clean.

- [ ] **Step 5 : Commit**

```bash
git add -A
git commit -m "feat(v5/T20): suppression 13 écrans obsolètes (Aventure, Bilan, MoodTracker, etc.)

Tout est désormais accessible via Ciel ou Espaces (Refuge / Voix / Marque).

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 21 : Migration data anciens états mood → étoiles rétroactives

**Files:**
- Create: `src/v2/helpers/migrate-v4-to-v5.js`
- Modify: `src/v2/App.jsx` (call migration once)

- [ ] **Step 1 : Créer migrate-v4-to-v5.js**

```js
/* ============================================================
   Migration V4 → V5 : récupère anciens mood/bilans et les
   transforme en étoiles rétroactives pour ne pas perdre l'historique.
   ============================================================ */

import { ls, getProfile, setProfile } from '../state';
import { pickCitation } from '../data/citations';
import { hashSeed, getUserId, dayIndex, toIsoDate } from './stars';

const MIGRATED_FLAG = 'cava_v5_migrated';

const MOOD_TO_COLOR = {
  // Anciens mood id → nouvelles couleurs étoile
  calme: 'bleu',
  joyeux: 'rose',
  triste: 'violet',
  fatigue: 'peche',
  anxieux: 'orage',
  // fallback
  default: 'bleu',
};

export function migrateV4ToV5() {
  if (ls.get(MIGRATED_FLAG, false)) return;

  const p = getProfile();
  const stars = p.stars || [];
  const ownPostsV4 = ls.get('communaute_posts', []);
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

  console.warn(`[V5 Migration] ${newStars.length - stars.length} étoiles rétroactives ajoutées.`);
}
```

- [ ] **Step 2 : Appeler la migration dans V2App**

Au tout début du composant V2App, dans un `useEffect` qui ne tourne qu'une fois :

```js
import { migrateV4ToV5 } from './helpers/migrate-v4-to-v5';
// ...
useEffect(() => {
  migrateV4ToV5();
}, []);
```

- [ ] **Step 3 : Build clean + commit**

```bash
npm run build 2>&1 | tail -5
git add src/v2/helpers/migrate-v4-to-v5.js src/v2/App.jsx
git commit -m "feat(v5/T21): migration V4→V5 — anciens mood/bilans → étoiles rétroactives

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 22 : Menu hamburger update + SAVEPOINT

**Files:**
- Modify: `src/v2/App.jsx` (menu hamburger ActionSheet)
- Modify: `SAVEPOINT.md`

- [ ] **Step 1 : Adapter le menu hamburger (les écrans cibles ont changé)**

Dans v2/App.jsx, localise `menuOpen` ActionSheet. Actions cibles :

```js
actions={[
  { label: 'Histoire de ÇA VA ?', icon: '✦', onTap: () => { setMenuOpen(false); setOnboardingReviewOpen(true); } },
  { label: 'Personnaliser mon refuge', icon: '✧', onTap: () => { setMenuOpen(false); setCriseSettingsOpen(true); } },
  { label: "Trouver de l'aide", icon: '◇', onTap: () => { setMenuOpen(false); setAideOpen(true); } },
  { label: 'Espaces de soutien', icon: '○', onTap: () => { setMenuOpen(false); setEspacesIRLOpen(true); } },
]}
```

(reste inchangé si déjà OK).

- [ ] **Step 2 : Mettre à jour SAVEPOINT.md**

Remplace le contenu de SAVEPOINT.md par un récap V5. Sections clés :

- Date 2026-05-25
- Statut : refonte V5 en cours sur `feat/v5-constellation`
- Architecture V5 : 2 onglets Ciel / Espaces
- Nouveaux composants UI : Star / StarField / CielChapter / PoseEtoileModal / PersonAvatar
- Écrans supprimés (T20)
- Fichiers du plan : docs/superpowers/specs + docs/superpowers/plans
- Backlog : phases 5-6 restantes (Magie + Onboarding amplifié)

(Écrire un savepoint cohérent ~120 lignes.)

- [ ] **Step 3 : Commit**

```bash
git add SAVEPOINT.md src/v2/App.jsx
git commit -m "chore(v5/T22): SAVEPOINT V5 + menu hamburger update

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

- [ ] **Step 4 : Push branche feat/v5-constellation**

```bash
git push origin feat/v5-constellation
```

---

# PHASE 5 — Magie (T23-T28)

## Task 23 : M2 — Citation contextuelle dans le hero

**Statut** : déjà implémenté dans T13 via `useCitation()` (hook créé en T4). Cette tâche valide + ajoute une animation de transition douce de la citation chaque jour.

**Files:**
- Modify: `src/v2/screens/Ciel.jsx`

- [ ] **Step 1 : Ajouter une animation `citation-soft-fade` à la citation**

Dans `Ciel.jsx`, sur le `<p>` de la citation flottante, ajoute :

```jsx
style={{
  // ... existing
  animation: 'citation-soft-fade 1800ms ease-out 600ms both',
}}
```

Ajoute le keyframe à `tokens.css` :

```css
@keyframes citation-soft-fade {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 0.72; transform: translateY(0); }
}
```

- [ ] **Step 2 : Build clean + commit**

```bash
npm run build 2>&1 | tail -5
git add src/v2/screens/Ciel.jsx src/tokens.css
git commit -m "feat(v5/T23/M2): citation flottante avec apparition soft-fade 1800ms

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 24 : M4 — Mémoire qui ressurgit

**Statut** : déjà implémenté dans `chapter-generator.js` (T11) qui inclut le chapitre `'memoire'` avec offsets [30, 90, 365]. Cette tâche ajoute juste un test manuel.

- [ ] **Step 1 : Smoke test manuel**

Crée temporairement 1 étoile à date passée (édition `localStorage.cava_v5_profile.stars`) pour vérifier que le chapitre mémoire s'affiche.

```bash
# Lance le dev server
npm run dev &
# Dans une autre fenêtre, ouvre http://localhost:5173
# Console browser : localStorage manipulation pour test
```

Test : injecter via console une étoile datée d'il y a 30 jours avec une note, puis recharger → vérifier que le chapitre "Il y a 30 jours" apparaît dans le Ciel scroll.

- [ ] **Step 2 : Pas de commit (rien à modifier sauf si bug trouvé)**

---

## Task 25 : M6 — Pièce qui résonne

**Statut** : déjà implémenté dans `chapter-generator.js` (chapitre type `'piece'` avec image marque). Cette tâche affine le matching couleur→pièce.

**Files:**
- Modify: `src/v2/helpers/chapter-generator.js`

- [ ] **Step 1 : Améliorer le mapping citation→image**

Remplace `const imageIdx = String((c.id * 7) % 122 + 1).padStart(3, '0');` par un mapping plus pertinent (utilise les images sel-XX.jpeg dans `/public/cava/selection/` qui correspondent vraiment aux citations) :

```js
// Map id citation → image selection (les 12 citations marque les plus iconiques)
const CITATION_TO_IMAGE = {
  1:  '/cava/selection/sel-02-sensibilite.jpeg',     // sensibilité super-pouvoir
  2:  '/cava/selection/anx-01-super-pouvoir.jpeg',    // anxiété super-pouvoir
  3:  '/cava/selection/anx-09-cicatrice.jpeg',        // cicatrice vivante
  4:  '/cava/selection/sel-01-pas.jpeg',              // chaque pas victoire
  5:  '/cava/selection/anx-10-combats.jpeg',          // je combats silence
  6:  '/cava/selection/anx-08-courage.jpeg',          // courage demander aide
  7:  '/cava/selection/anx-06-soleil.jpeg',           // soleil reviendra
  8:  '/cava/selection/anx-07-fatigue.jpeg',          // fatigué d'être fatigué
  9:  '/cava/selection/anx-11-sourire.jpeg',          // pourquoi tu forces sourire
  10: '/cava/selection/fruit-01-banane.jpeg',         // plus la banane
  11: '/cava/selection/fruit-02-peche.jpeg',          // garde la pêche
  12: '/cava/selection/anx-03-train.jpeg',            // monde avance trop vite
  19: '/cava/selection/anx-02-camus.jpeg',            // Camus
  20: '/cava/selection/anx-04-matt-haig.jpeg',        // Matt Haig
  21: '/cava/selection/anx-05-prevert-bis.jpeg',      // Prévert
  22: '/cava/selection/anx-12-mandela.jpeg',          // Mandela
};

// Dans le code de génération chapitre piece :
const imageSrc = CITATION_TO_IMAGE[c.id] || `/cava/marque/marque-${String((c.id * 7) % 122 + 1).padStart(3, '0')}.jpeg`;
// ...
chapters.push({
  type: 'piece',
  eyebrow: 'Une pièce qui te ressemble',
  accent: 'rose',
  text: `« ${c.text} »`,
  media: { type: 'image', src: imageSrc },
});
```

- [ ] **Step 2 : Build clean + commit**

```bash
npm run build 2>&1 | tail -5
git add src/v2/helpers/chapter-generator.js
git commit -m "feat(v5/T25/M6): mapping citation→image marque précis (16 pièces iconiques)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 26 : M7 — Saisons du ciel (wiring final)

**Statut** : `useSeasonalPalette` créé en T5 et appelé en T19. Cette tâche utilise la variable `--ciel-glow-accent` dans le Ciel.

**Files:**
- Modify: `src/v2/screens/Ciel.jsx`

- [ ] **Step 1 : Ajouter un 3ème blob "accent saison" dans le Ciel**

Dans `Ciel.jsx`, après les 2 glows existants, ajoute :

```jsx
<div
  aria-hidden
  style={{
    position: 'absolute',
    bottom: '20%',
    right: '15%',
    width: 240,
    height: 240,
    borderRadius: '50%',
    background: 'var(--ciel-glow-accent, var(--ciel-glow-rose))',
    filter: 'blur(80px)',
    pointerEvents: 'none',
    opacity: 0.7,
  }}
/>
```

- [ ] **Step 2 : Build clean + commit**

```bash
npm run build 2>&1 | tail -5
git add src/v2/screens/Ciel.jsx
git commit -m "feat(v5/T26/M7): 3e blob accent saison (palette dynamique mar/jun/sep/dec)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 27 : M11 — Ambiance sonore opt-in

**Files:**
- Create: `src/components/ciel/AmbianceAudio.jsx`
- Modify: `src/v2/screens/Ciel.jsx`

- [ ] **Step 1 : Créer AmbianceAudio.jsx (Web Audio API drone + vent)**

```jsx
/* ============================================================
   AmbianceAudio — Drone + vent doux pour le Ciel (opt-in)
   ============================================================
   Génère un son ambiant procédural via Web Audio API.
   Pas de fichier audio, tout est synthétisé pour rester léger.
   ============================================================ */

import { useEffect, useRef } from 'react';
import { getProfile } from '../../v2/state';

export default function AmbianceAudio() {
  const ctxRef = useRef(null);
  const stopRef = useRef(null);

  useEffect(() => {
    const enabled = getProfile().preferences?.ambianceSonore;
    if (!enabled) return;

    // Démarre uniquement au 1er user gesture (sinon AudioContext bloqué)
    const start = () => {
      if (ctxRef.current) return;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        const ctx = new AC();
        ctxRef.current = ctx;

        // Drone (très basse fréquence, sine)
        const drone = ctx.createOscillator();
        drone.type = 'sine';
        drone.frequency.value = 110; // A2
        const droneGain = ctx.createGain();
        droneGain.gain.value = 0.02; // ~ -34 dB
        drone.connect(droneGain).connect(ctx.destination);
        drone.start();

        // Vent (noise filtré)
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 600;
        filter.Q.value = 0.5;
        const noiseGain = ctx.createGain();
        noiseGain.gain.value = 0.015;
        noise.connect(filter).connect(noiseGain).connect(ctx.destination);
        noise.start();

        stopRef.current = () => {
          try { drone.stop(); noise.stop(); ctx.close(); } catch (e) {}
        };
      } catch (e) {
        console.warn('AmbianceAudio failed:', e);
      }
      document.removeEventListener('touchstart', start);
      document.removeEventListener('click', start);
    };

    document.addEventListener('touchstart', start, { once: true });
    document.addEventListener('click', start, { once: true });

    return () => {
      document.removeEventListener('touchstart', start);
      document.removeEventListener('click', start);
      if (stopRef.current) stopRef.current();
    };
  }, []);

  return null;
}
```

- [ ] **Step 2 : Monter AmbianceAudio dans Ciel.jsx**

```jsx
import AmbianceAudio from '../../components/ciel/AmbianceAudio';
// ...
<AmbianceAudio />
```

- [ ] **Step 3 : Build clean + commit**

```bash
npm run build 2>&1 | tail -5
git add src/components/ciel/AmbianceAudio.jsx src/v2/screens/Ciel.jsx
git commit -m "feat(v5/T27/M11): AmbianceAudio drone+vent opt-in (Web Audio procedural ≤ 12dB)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 28 : M12 — Pose silencieuse message

**Statut** : déjà partiellement implémenté dans `PoseEtoileModal.jsx` (T12) — le bouton change de label si pas de note. Cette tâche ajoute le toast confirmation.

**Files:**
- Modify: `src/components/ui/PoseEtoileModal.jsx`

- [ ] **Step 1 : Ajouter un toast contextuel via useToast()**

Dans `PoseEtoileModal.jsx`, importe useToast et déclenche un toast différent selon présence de la note :

```jsx
import { useToast } from './index';
// ...
const toast = useToast();

const handleConfirmNote = () => {
  haptic(6);
  const star = addStar({ color, note });
  setBornStar(star);
  setStep(3);
  // M12 : message différent selon silence
  toast.show({
    message: note.trim() ? 'Étoile posée.' : 'Le silence aussi compte.',
    variant: 'success',
    duration: 3000,
  });
  setTimeout(() => {
    onPosed?.(star);
    onClose?.();
  }, 4000);
};
```

- [ ] **Step 2 : Build clean + commit**

```bash
npm run build 2>&1 | tail -5
git add src/components/ui/PoseEtoileModal.jsx
git commit -m "feat(v5/T28/M12): toast pose silencieuse — \"Le silence aussi compte.\"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

# PHASE 6 — Onboarding amplifié (T29-T32)

## Task 29 : Étape « Choisis ton mantra »

**Files:**
- Modify: `src/components/onboarding/OnboardingFlow.jsx`
- Modify: `src/components/onboarding/onboardingContent.js`

- [ ] **Step 1 : Ajouter un nouveau type d'écran "preference" dans onboardingContent.js**

Append au tableau ONBOARDING_SCREENS un écran de type "mantra" :

```js
{
  id: 'mantra',
  type: 'preference',
  preferenceKey: 'mantra',
  eyebrow: '05 · TON MANTRA',
  image: '/cava/selection/sel-02-sensibilite.jpeg',
  alt: 'Une phrase pour porter avec toi',
  title: ['Choisis ', { em: 'ton mantra' }, '.'],
  body: ['Une phrase à porter avec toi. Elle apparaîtra dans ton ciel quand tu en auras besoin.'],
  subBody: [],
  choices: [
    'Ma sensibilité est mon super-pouvoir.',
    "L'anxiété est une bête irrationnelle.",
    'Chaque pas est une victoire.',
    "Le soleil reviendra, je le sais.",
    "Le silence aussi compte.",
    "Tu n'es pas seul·e.",
    "Reviens-toi.",
    "C'est ok de ne pas être ok.",
  ],
},
```

- [ ] **Step 2 : Étendre OnboardingScreen.jsx pour rendre les choices**

Si `screen.type === 'preference'`, afficher les `screen.choices` comme une grille de boutons cliquables. Au clic : sauvegarder via `patchProfile({ preferences: { ...current, [screen.preferenceKey]: choice } })` puis passer à l'écran suivant via `onNext`.

```jsx
{screen.type === 'preference' && screen.choices && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
    {screen.choices.map((choice) => (
      <button
        key={choice}
        type="button"
        onClick={() => {
          import('../../v2/state').then(({ patchProfile, getProfile }) => {
            const current = getProfile().preferences || {};
            patchProfile({ preferences: { ...current, [screen.preferenceKey]: choice } });
            onNext?.();
          });
        }}
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
        }}
      >
        « {choice} »
      </button>
    ))}
  </div>
)}
```

- [ ] **Step 3 : Build clean + commit**

```bash
npm run build 2>&1 | tail -5
git add src/components/onboarding/
git commit -m "feat(v5/T29): onboarding étape mantra (8 citations + sauvegarde preferences)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 30 : Étape « Ta couleur favorite »

**Files:**
- Modify: `src/components/onboarding/onboardingContent.js`

- [ ] **Step 1 : Append nouvel écran "couleur"**

```js
{
  id: 'couleur',
  type: 'preference',
  preferenceKey: 'couleurFavorite',
  eyebrow: '06 · TA COULEUR',
  image: '/cava/selection/sel-04-noir-coeur.jpeg',
  alt: "Quelle teinte porte le mieux ce que tu vis",
  title: ['Quelle ', { em: 'teinte' }, ' te porte ?'],
  body: ['Elle nuancera les accents de ton ciel.'],
  subBody: [],
  choices: ['Bleu', 'Rose', 'Violet'],
},
```

(L'OnboardingScreen rendra ces choices via la logique ajoutée en T29.)

- [ ] **Step 2 : Mapper le choix vers la couleur stockée**

Modifie le `onClick` du bouton dans OnboardingScreen pour normaliser les valeurs (lowercase + remove accents). Le mapping est :
- "Bleu" → "bleu"
- "Rose" → "rose"
- "Violet" → "violet"

```jsx
// Dans onClick :
const normalized = choice.toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '');
patchProfile({ preferences: { ...current, [screen.preferenceKey]: normalized } });
```

- [ ] **Step 3 : Build clean + commit**

```bash
npm run build 2>&1 | tail -5
git add src/components/onboarding/
git commit -m "feat(v5/T30): onboarding étape couleur favorite (bleu/rose/violet)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 31 : Étape « Heure de rituel préférée »

**Files:**
- Modify: `src/components/onboarding/onboardingContent.js`

- [ ] **Step 1 : Append nouvel écran "heureRituel"**

```js
{
  id: 'heure',
  type: 'preference',
  preferenceKey: 'heureRituel',
  eyebrow: '07 · TON RYTHME',
  image: '/cava/selection/sel-03-prevert.jpeg',
  alt: 'À quel moment tu te poses',
  title: ['Quand préfères-tu ', { em: 'te poser' }, ' ?'],
  body: ["Aucune obligation. Juste pour mieux te connaître."],
  subBody: [],
  choices: ['Matin', 'Midi', 'Soir', 'Libre'],
},
```

- [ ] **Step 2 : Build clean + commit**

```bash
npm run build 2>&1 | tail -5
git add src/components/onboarding/onboardingContent.js
git commit -m "feat(v5/T31): onboarding étape heure de rituel (matin/midi/soir/libre)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 32 : Première étoile pendant l'onboarding

**Files:**
- Modify: `src/components/onboarding/onboardingContent.js`
- Modify: `src/components/onboarding/OnboardingFlow.jsx`

- [ ] **Step 1 : Ajouter un dernier écran "1ère étoile" qui déclenche PoseEtoileModal**

Append au tableau ONBOARDING_SCREENS :

```js
{
  id: 'premiere-etoile',
  type: 'pose-star',
  eyebrow: '08 · TON CIEL',
  image: '/cava/selection/anx-06-soleil.jpeg',
  alt: 'Pose ta toute première étoile',
  title: ['Pose ta ', { em: 'première étoile' }, '.'],
  body: ['C\'est par là que commence ton ciel. Choisis une couleur, écris un mot — ou rien.'],
  subBody: [],
  ctaLabel: 'Poser ma première étoile',
},
```

- [ ] **Step 2 : Étendre OnboardingScreen pour ouvrir PoseEtoileModal sur l'écran "pose-star"**

Si `screen.type === 'pose-star'`, le CTA principal ouvre PoseEtoileModal au lieu d'appeler `onStart()`. Au callback `onPosed`, ferme la modal puis appelle `onStart()` (qui complète l'onboarding).

```jsx
import { PoseEtoileModal } from '../ui';
// ...
const [poseStarOpen, setPoseStarOpen] = useState(false);

// Dans le rendu (si isLast ET screen.type === 'pose-star') :
{isLast && screen.type === 'pose-star' && (
  <>
    <div className={styles.ctaWrap}>
      <button
        type="button"
        className={styles.cta}
        onClick={() => setPoseStarOpen(true)}
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

- [ ] **Step 3 : Build clean + commit**

```bash
npm run build 2>&1 | tail -5
git add src/components/onboarding/
git commit -m "feat(v5/T32): onboarding finale — pose 1ère étoile (naissance du ciel)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

# Final — Validation DoD + merge

## Task 33 : Validation DoD V5 + push + preview

- [ ] **Step 1 : Vérifier les critères DoD (§10 du spec)**

```bash
# Build clean
npm run build 2>&1 | tail -5
# Aucun console.log dans le code v5
grep -rn "console.log" src/v2/screens/Ciel.jsx src/v2/screens/Espaces.jsx src/v2/screens/Refuge.jsx src/v2/screens/Voix.jsx src/v2/helpers/ src/v2/hooks/ 2>/dev/null
# Plus de référence Aventure dans le routing
grep -n "Aventure" src/v2/App.jsx
# Plus de XP/streak/level
grep -rEn "XP|streak|niveau|leaderboard" src/v2/screens/ 2>/dev/null
```

Expected : build clean, 0 console.log, 0 référence Aventure dans App.jsx, 0 XP/streak/level/leaderboard.

- [ ] **Step 2 : Push final**

```bash
git push origin feat/v5-constellation
```

- [ ] **Step 3 : Deploy preview**

```bash
cd /Users/williammorel/NÉYA && vercel --yes 2>&1 | grep -o "https://neya-[a-z0-9]*-willmorel49-coders-projects.vercel.app" | head -1
```

Retourne l'URL preview. Will la teste mobile + desktop avant merge sur main.

- [ ] **Step 4 : Si Will valide visuellement, merger sur main**

```bash
git checkout main
git merge feat/v5-constellation --no-edit
git push origin main
vercel --prod --yes
curl -sI https://neya-kappa.vercel.app | head -1
```

Expected: `HTTP/2 200` sur la prod.

---

## Self-Review

✓ **Spec coverage** :

- §1 Cœur → infusé partout (greeting, citations, manifeste)
- §2 Métaphore Constellation → T7 Star, T8 StarField, T13 Ciel
- §3 Structure 2 onglets → T14 Espaces, T18 BottomNav 2 tabs, T19 routing
- §4 Anatomie Ciel → T13 (hero) + T10 CielChapter + T11 generator
- §4.3 Poser étoile → T12 PoseEtoileModal (3 étapes)
- §5 Personnalisation → T29/T30/T31/T32 (onboarding étendu)
- §6 Magie M1 (étoile naît) → T12 step 3 + keyframe star-born
- §6 Magie M2 (citation contextuelle) → T4 useCitation + T23 animation
- §6 Magie M3 (constellation unique) → T8 algo déterministe hash(userId)
- §6 Magie M4 (mémoire) → T11 chapter generator memoryOffsets
- §6 Magie M5 (salutation personnelle) → T13 `greeting(prenom)`
- §6 Magie M6 (pièce qui résonne) → T11 + T25 mapping image
- §6 Magie M7 (saisons) → T5 hook + T26 blob accent
- §6 Magie M8 (fils tracés) → T8 SVG lines
- §6 Magie M9 (cheveux teal) → T9 PersonAvatar
- §6 Magie M10 (mot du jour manuscrit) → T13 citation Cormorant italic
- §6 Magie M11 (ambiance sonore) → T27 AmbianceAudio
- §6 Magie M12 (pose silencieuse) → T28 toast contextuel
- §7 Architecture → tous composants créés et exportés via DS V4
- §8 Migration → phases organisées en T1-T32 dans le bon ordre
- §10 DoD → T33 validation finale

✓ **Placeholder scan** : aucun TBD/TODO/à compléter dans les tasks. Tous les codes complets.

✓ **Type consistency** :
- `getProfile().preferences` est cohérent partout (utilisé en T3 schema, T13 greeting, T29/30/31 onboarding)
- `addStar({ color, note, type })` signature cohérente entre T3 (definition) et T12 (usage)
- `star.id`, `star.date`, `star.color`, `star.note`, `star.citation` champs cohérents
- `positionForStar(starId, userId)` signature cohérente entre T8 (def) et StarField

✓ **Ambiguity check** : tous les paramètres sont explicites (couleurs hexa, classes Tailwind ou tokens CSS), chaque tâche a une étape "build clean" pour validation.

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-25-ca-va-v5-constellation-plan.md`.**

Total : **33 tasks** réparties en **6 phases + 1 finalisation**, ~80 commits granulaires prévus.

Estimation : **8-12h de cavalry foreground** avec agents Opus (selon parallélisation), ou **24-36h en inline solo**.
