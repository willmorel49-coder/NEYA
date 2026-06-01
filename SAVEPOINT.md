# SAVEPOINT — ÇA VA ? V5 Constellation 🌌

**Date** : 2026-06-01
**Branche** : `main` (V5 mergé)
**Prod** : https://neya-kappa.vercel.app · HTTP 200 (V5 live)
**Repo** : github.com/willmorel49-coder/NEYA

---

## ✨ État actuel : V5 Constellation en prod

Refonte totale livrée. L'app a 2 onglets — **Ciel** (constellation nuit) et **Espaces** (Refuge · Voix · Marque).

### Cœur de l'app
> « ÇA VA? est l'application faite pour ceux qui disent ça va quand ça ne va pas. »

### Métaphore
Chaque moment posé devient une étoile dans la constellation personnelle de l'utilisateur. L'histoire s'écrit étoile par étoile, jamais terminée.

---

## Architecture V5

### 2 onglets

**🌌 Ciel** (`src/v2/screens/Ciel.jsx` · fond nuit cosmic)
- Hero constellation (StarField SVG responsive)
- Salutation personnalisée Cormorant italic
- Citation flottante contextuelle (matche état dominant 7j)
- PersonAvatar cheveux teal #12C4B0 coin haut-gauche
- Scroll narratif : chapitres auto-générés (Hier, Cette semaine, Mois, Mémoire 30/90/365j, Pièce qui résonne)
- FAB rose pour reposer une étoile
- PoseEtoileModal 3 étapes : couleur → mot libre → étoile naît + citation

**◇ Espaces** (`src/v2/screens/Espaces.jsx` · fond clair `--bg`)
- **Refuge** (`Refuge.jsx`) — fusion Méditation + Respirer + Écrire + Cocon
- **Voix** (`Voix.jsx`) — feed anonyme + composer 280 chars
- **Marque ÇA VA?** (`CaVa.jsx`) — manifeste + 2 collections + 122 photos

### Onboarding amplifié (8 étapes)
1. Bienvenue · 2. Manifeste · 3. Choix · 4. Engagement
5. **Mantra** (8 citations marque + libre)
6. **Couleur favorite** (bleu / rose / violet)
7. **Heure de rituel** (matin / midi / soir / libre)
8. **Pose ta première étoile** (PoseEtoileModal final)

### 12 magies embarquées
- **M1** Étoile qui naît (animation 2s halo pulse)
- **M2** Citation contextuelle (48 citations Camus/Prévert/Matt Haig taggées)
- **M3** Constellation unique par user (hash(userId+dayIndex))
- **M4** Mémoire qui ressurgit (étoile à 30/90/365 jours)
- **M5** Salutation personnalisée prénom + time-of-day
- **M6** Pièce qui résonne (mapping état → image marque)
- **M7** Saisons du ciel (data-season dynamic palette)
- **M8** Fils tracés à la main (SVG lines intra-semaine)
- **M9** Halo cheveux teal animé pulse 4.2s
- **M10** Mot du jour Cormorant italic comme manuscrit
- **M11** Ambiance sonore opt-in (Web Audio drone + vent procedural)
- **M12** Pose silencieuse (toast « Le silence aussi compte. »)

---

## Composants UI (`src/components/ui/`)

### V4 Foundation (10)
Header · BackButton · GlassCard · Eyebrow · HeroTitle · SectionTitle · Body · CTA · Stat · tokens

### V4 Primitives (15)
Overlay · Sheet · Modal · Input · Textarea · FormField · Toggle · Choice · Toast · ToastProvider · Icon · EmptyState · Skeleton · Spinner · Badge

### V5 Ciel (5)
**Star** · **StarField** · **PersonAvatar** · **CielChapter** · **PoseEtoileModal**

---

## Data model

### `profile.stars[]` (étoiles déposées)
```js
{
  id: "star-2026-05-25-xxxxx",
  date: "2026-05-25",
  time: "22:47",
  color: "bleu | rose | violet | peche | orage",
  note: "string optional",
  citation: { id, text, author, tags },
  type: "mood | breath | voice | write"
}
```

### `profile.preferences`
- `prenom`, `mantra`, `couleurFavorite`, `heureRituel`, `ambianceSonore`

### Stockage
- `localStorage` only (pas de sync cloud)
- Migration V4→V5 automatique : `mood_history` + `bilan_history` → étoiles rétroactives

---

## Helpers + hooks (`src/v2/helpers/` + `src/v2/hooks/`)

**Helpers :**
- `stars.js` — addStar, getStarsRange, getAllStars, getLatestStar, getDominantColor, hashSeed, dayIndex, getUserId, toIsoDate
- `chapter-generator.js` — generateChapters (Hier, Semaine, Mois, Mémoire, Pièce)
- `migrate-v4-to-v5.js` — backfill historique

**Hooks :**
- `useDailyStarStatus` — { posed, refresh }
- `useCitation` — citation du jour (state-aware)
- `useSeasonalPalette` — détecte saison → data-season sur `<html>`

---

## Bundle

| Métrique | V4 | V5 |
|---|---|---|
| JS bundle | 446 kB | 292 kB (-35%) |
| Gzip | 110 kB | 75 kB (-32%) |
| Lignes screens v2 | ~10k | -8.7k supprimées |

---

## Hors scope (volontairement écarté)

- Notifications push
- Comptes utilisateurs / sync cloud
- Statistiques avancées / graphiques
- Partage social externe
- Multi-langue (FR only)

---

## Documents

- **Spec** : `docs/superpowers/specs/2026-05-25-ca-va-v5-constellation-design.md`
- **Plan** : `docs/superpowers/plans/2026-05-25-ca-va-v5-constellation-plan.md` (33 tâches détaillées)
- **D.A** : `NOUVELLE DA/CLAUDE.md` (palette V4 bleu/rose/violet + Cormorant Garamond + Inter)
- **D.A image** : `ÇA VA?/D.A.JPG` (mood board complet marque)

---

## Pour reprendre

Tout est sur `main`. La V5 est en production. Pas de session pending.

Commande : `git checkout main && git pull && npm install && npm run dev`
Tester : ouvrir `localStorage.clear()` dans la console pour reset l'onboarding et voir le flow complet.
