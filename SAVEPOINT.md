# SAVEPOINT — ÇA VA ?

**Date** : 2026-05-25
**Commit HEAD** : `b85a22c` · feat(v50-pivot/ds-phase3): DS V4 Phase 3 primitives avances (Opus x4)
**Prod** : https://neya-kappa.vercel.app · HTTP 200
**Repo** : github.com/willmorel49-coder/NEYA · branche `main`

## Pivot massif livré (v31 → v50, 20 commits)

NÉYA → **ÇA VA?** — rebrand complet + nouvelle DA bleu/rose/violet glassmorphism + Cormorant Garamond italic + Inter + Design System V4 unifié.

## Design System V4 — 26 composants atomiques

`src/components/ui/` source de vérité visuelle :

**Foundation**
- `Header` (sticky glass + back + titre + action)
- `BackButton` (pill glass fixed top-left z-80)
- `GlassCard` (radius/elevation/accent variants)
- `Eyebrow` (Inter 10/600/0.18em, color pilier)
- `HeroTitle` (Cormorant italic clamp sm/md/lg/xl)
- `SectionTitle`
- `Body` (variants body/body-sm/caption/whisper)
- `CTA` (primary/rose/outline/ghost · sizes sm/md/lg)
- `Stat` (tabular-nums)
- `tokens-ui` (constantes JS pour inline styles)

**Phase 3 — Primitives avancés**
- `Overlay` (backdrop dark/light/clear + ESC + focus trap)
- `Sheet` (bottom slide-up iOS + snap + drag-to-dismiss)
- `Modal` (center alert + scale entrance)
- `Input` (border-left accent + prefix/suffix + error)
- `Textarea` (counter tabular-nums rouge si max 10%)
- `FormField` (wrapper accessibilité)
- `Toggle` (switch iOS 44×26 gradient)
- `Choice` (card sélectionnable border 3→4px)
- `Toast` + `ToastProvider` + `useToast` (variants info/success/warning/crisis)
- `Icon` (20+ icônes Tabler outline 1.5px)
- `EmptyState` (icon glass + title + description + action)
- `Skeleton` / `SkeletonText` / `SkeletonCard` (shimmer 1.6s)
- `Spinner` (rotate 800ms)
- `Badge` (5 variants)

## État des onglets

- **Aventure** (1811 lignes) — 3 piliers structurels (01 L'Aventure bleu / 02 La Connaissance rose / 03 Les 3 Temps du Soi violet), glass cards, blobs, BUG-06 fixé
- **Cocon** (1230 lignes) — glass hero + halo teal `#12C4B0` animé pulse 4.2s, BUG-05 fixé, 3 ActionCards glass
- **Communauté** — hero glass 343×280, feed voix glass accent alterné bleu/rose, témoignages, composer modal
- **ÇA VA?** (1281 lignes) — Storytelling 9 chapitres avec 122 images marque en mosaïque (collection "Ma belle anxiété" 14 pièces, Fruits 🍌🍑, Essentiels, L'Univers galerie complète, Voix, Final)

## Fondations

- **tokens.css** — palette V4 `--bg #EEF3F8 / --blue-* / --rose-* / --violet / --gradient-* / --glass-*` + legacy mapping (`--cream → bg`, `--ink → blue-900`, etc.) pour transition douce
- **index.html** — Cormorant Garamond + Inter + theme-color #EEF3F8
- **OnboardingFlow** (pré-app) — 4 diapos photos cava-007/100/040/105, scroll-snap horizontal, ken-burns, Cormorant italic, blobs, CTA gradient bleu
- **BottomNav** — pill glass blur 20 + indicateur dégradé bleu→rose + Icons Tabler (arrow-up / sparkle / circle / heart)
- **SOS** — FAB bas-droite rose `--rose-700` 52×52 + ActionSheet "Urgence" (3114 / 15 / Mode crise respirer 90s)
- **Menu hamburger** — top-left glass blur + Histoire ÇA VA? / Aide / Espaces / Refuge

## Bugs fixés

| # | Statut | Détail |
|---|---|---|
| BUG-01 apostrophes échappées | ✅ | Tous les `\'` → `'` typographiques |
| BUG-02 CTA TERMINER dark | ✅ | Gradient bleu partout |
| BUG-03 question du jour vide | ✅ | DEFAULT_PROMPT fallback Communauté |
| BUG-04 SOS chevauche header | ✅ | FAB bas-droite + z-index hierarchy commentée |
| BUG-05 personnage Cocon coupé | ✅ | objectPosition center 30% + height 78% |
| BUG-06 Bilan du soir orphelin | ✅ | Glass card aligné PilierCard |
| BUG-07 NÉYA dans UI | ✅ | Rebrand global 63 fichiers |

## Photos disponibles

- `/public/cava/brand/` — 120 photos shooting brand (cava-001 à cava-120)
- `/public/cava/selection/` — 17 photos curées (anx-01 à anx-12 citations + fruit-01 banane + fruit-02 pêche + sel-01 à sel-04 + ess-01 hoodie noir)
- `/public/cava/marque/` — 122 photos univers complet (marque-001 à marque-123 + marque-special)

## Workflow Claude

- **CLAUDE.md** — pointe vers `/NOUVELLE DA/CLAUDE.md` (palette V3 officielle)
- **Sub-agents foreground** = permissions OK (Write/Edit)
- **Sub-agents `run_in_background: true`** = BLOQUÉ par sandbox (limitation harness)
- **Modèle Opus** explicite recommandé pour cavalry migrations DS

## Z-index hierarchy (commentée dans v2/App.jsx)

```
BottomNav     30
Back buttons  80
SOS button    100
Menu          100
ActionSheets  200
Modals/Onboarding 9999
```

## Backlog priorisé

1. **Auditer photos cocon** (BUG-05 visuel — l'image personnage tronquée à vérifier sur mobile réel)
2. **Crise + CriseSettings** : intégrer les nouveaux Overlay/Sheet primitives
3. **Touts les ActionSheets** : migrer vers le nouveau Sheet primitive
4. **AventurePlayer / RituelPlayer / LeconReader / MondeReader** : migration DS V4 (non couverts par Phase 2)
5. **Lookbook / ProductDetail / Cercle / Manifeste** : migration DS V4
6. **Préfetch images marque** sur entrée onglet CaVa (perf)
7. **Animation system global** : variants entry/exit/stagger centralisés
8. **Loading states** : utiliser SkeletonCard sur les overlays qui chargent
9. **EmptyStates** : intégrer dans Communauté/Souvenirs/Carnet si listes vides
10. **Theming dynamique** : palette qui s'adapte selon heure (jour/nuit/twilight)

## Volontairement écarté

- shadcn Calendar / DataTable / Carousel
- magicui Meteors / Sparkles / Globe / Border Beam
- IBM Carbon density / Material ripple
- Aceternity Background Beams / Hover Border Gradient
- Tests unitaires stricts (post-V1)
- Monorepo
- React Native (reste PWA web)

## Bundle

- **JS** : 446 kB (110 kB gzip)
- **CSS** : ~26 kB (6.7 kB gzip)
- **PWA precache** : 111 entries (~5.85 MB images incluses)
- Build time : ~1.8s

## Pour reprendre sur mobile Claude Code

1. Ouvrir Claude Code sur ton tel
2. Branche `main` à jour (commit `b85a22c`)
3. Tous les composants UI dans `src/components/ui/` (importer via `'../../components/ui'`)
4. Lire `/NOUVELLE DA/CLAUDE.md` pour les règles design strictes
5. Lire `ROBOT.md` pour le workflow et anti-patterns
