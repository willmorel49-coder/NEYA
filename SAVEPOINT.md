# SAVEPOINT — ÇA VA ? V5 Constellation

**Date** : 2026-05-26
**Branche** : `feat/v5-constellation` (V4 reste sur `main`)
**Prod V4** : https://neya-kappa.vercel.app
**Repo** : github.com/willmorel49-coder/NEYA

## Refonte V5 en cours

Métaphore **Ciel Intérieur** — chaque moment posé devient une étoile dans ta constellation personnelle. 2 onglets (Ciel · Espaces).

## Avancement plan V5 (33 tâches)

### ✅ Phase 1 Foundation (T1-T6) — DONE
- T1 tokens.css palette Ciel + saisons (commit `fbd7710`)
- T2 48 citations Camus/Prévert/Matt Haig/marque (`48b28a5`)
- T3 state schema stars[] + helpers/stars.js (`c81bf99`)
- T4 hooks useDailyStarStatus + useCitation + event (`9028303`)
- T5 useSeasonalPalette (`f4b9d11`)
- T6 push branche

### ✅ Phase 2 Ciel (T7-T13) — DONE
- T7 Star.jsx component (`bca4893`)
- T8 StarField SVG + algo placement déterministe (`cda0b9c`)
- T9 PersonAvatar cheveux teal halo pulse (`6034adb`)
- T10 CielChapter glass scroll (`8f28b6a`)
- T11 chapter-generator (hier/semaine/mois/mémoire/pièce) (`6a3b954`)
- T12 PoseEtoileModal 3 étapes (`0acb9be`)
- T13 écran Ciel.jsx (`d46653d`)

### ✅ Phase 3 Espaces (T14-T17) — DONE
- T14 shell Espaces 3 sous-routes (`47a32d7`)
- T15 Refuge fusion Méditation/Breath/Carnet/Cocon (`b936b73`)
- T16 Voix simplifiée + composer (`5d81fc9`)
- T17 CaVa accepte onClose (`29ffd41`)

### ✅ Phase 4 Cleanup (T18-T22) — DONE
- T18 BottomNav 2 onglets (`16dc6ce`)
- T19 App.jsx routing 2 onglets + useSeasonalPalette (`c8fb566`)
- T20 suppression 13 écrans + nettoyage imports (`b9fe131`) → -8721 lignes, bundle -32 kB
- T21 migration V4→V5 (`2cbbad0`)
- T22 menu + SAVEPOINT (en cours)

### ⏳ Phase 5 Magie (T23-T28) — À FAIRE
- T23 M2 citation flottante animée
- T24 M4 mémoire qui ressurgit (déjà inclus dans T11)
- T25 M6 pièce qui résonne (mapping image précis)
- T26 M7 saisons du ciel wiring final
- T27 M11 ambiance sonore opt-in
- T28 M12 toast pose silencieuse

### ⏳ Phase 6 Onboarding amplifié (T29-T32) — À FAIRE
- T29 étape mantra (8 citations + libre)
- T30 étape couleur favorite
- T31 étape heure rituel
- T32 1ère étoile pendant onboarding

### ⏳ Final (T33) — À FAIRE
- T33 validation DoD + push + preview + merge main

## Composants UI Design System V4 (26 + 5 nouveaux V5)

`src/components/ui/` :
- **V4 Foundation** : Header, BackButton, GlassCard, Eyebrow, HeroTitle, SectionTitle, Body, CTA, Stat, tokens
- **V4 Primitives** : Overlay, Sheet, Modal, Input, Textarea, FormField, Toggle, Choice, Toast, ToastProvider, Icon, EmptyState, Skeleton, Spinner, Badge
- **V5 Ciel** : Star, StarField, PersonAvatar, CielChapter, PoseEtoileModal

## Bundle

- V4 prod : 446 kB / 110 kB gzip
- V5 actuel : 286 kB / 72 kB gzip (-32% grâce à suppression 13 écrans)

## Pour reprendre

```bash
git checkout feat/v5-constellation
git pull origin feat/v5-constellation
npm install && npm run dev
```

Plan détaillé : `docs/superpowers/plans/2026-05-25-ca-va-v5-constellation-plan.md`
Spec : `docs/superpowers/specs/2026-05-25-ca-va-v5-constellation-design.md`
