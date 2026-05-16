# SAVEPOINT — NÉYA

**Date** : 2026-05-16
**Commit HEAD** : à pousser · feat(v28): onboarding visuel pré-app 4 écrans swipe (style Apple)
**Prod** : https://neya-kappa.vercel.app · HTTP 200
**Repo** : github.com/willmorel49-coder/NEYA

## Dernière action

Onboarding visuel pré-app livré : 4 écrans plein écran avec photos brand cava-007 / cava-100 / cava-040 / cava-105, navigation swipe horizontal + tap zones, ProgressDots barre Apple, "Passer" + "Commencer" route vers le main shell. Remplace `<Manifeste>` dans `v2/App.jsx`. Gate double : `localStorage.neya_onboarded` + `profile.onboarding.completed`. Fichiers créés : `src/components/onboarding/{OnboardingFlow,OnboardingScreen,ProgressDots}.jsx` + `onboarding.module.css` + `onboardingContent.js`.

## État des onglets

- **Aventure** — V3.21 (texts/features disparition fix, profile-changed event listener)
- **Cocon** — V4 (sanctuaire vivant personnalisable, 5 items SVG sur-mesure)
- **Communauté** — V3.22 (sweep QA round 2 : long-press fixes, ActionSheet pearl)
- **ça va ♡** — V7 (page condensée 8 blocs + storytelling phrases-clés + 120 photos `/cava/brand/`)
- **Onboarding pré-app** — V1 (4 écrans cinématiques swipe + photos cava-brand)

## Fondations

- **tokens.css** — 705 lignes + layer sémantique shadcn-style V8
- **prefers-reduced-motion** — global, respecté aussi dans nouveau OnboardingFlow
- **:focus-visible** — ring 2px accent (tilleul par défaut dans onboarding)
- **CaVaPhotoViewer.jsx** — viewer cinéma swipe + zoom + caption (V5)
- **OnboardingFlow** — scroll-snap horizontal + ken-burns 12s + fade-in stagger
- **Manifeste.jsx** — fichier conservé (déconnecté du routing, supprimable plus tard)

## Photos onboarding sélectionnées

| Écran | Photo | Raison |
|---|---|---|
| 1 Merci | `cava-007.jpg` | Santorini coucher de soleil, dos warm cream — douceur, lumière diffuse |
| 2 D'où ça vient | `cava-100.jpg` | Shibuya nuit, dos seul au milieu de la foule masquée — masque social |
| 3 Pourquoi | `cava-040.jpg` | Intérieur ouvert sur la mer — refuge, espace qui respire |
| 4 Qui l'a fait | `cava-105.jpg` | Couple côte italienne, ouverture dorée — humanité, profondeur |

Toutes les photos brand portent du texte t-shirt (branding ÇA VA?). L'overlay gradient noir-vers-transparent 0 → 0.92 du bas vers le haut atténue le conflit visuel avec le texte d'onboarding.

## Workflow Claude

- **ROBOT.md** — Definition of Done + Anti-patterns explicites (V8)
- **`.claude/agents/cavalry-coordinator.md`** — template briefing standardisé
- **`.claude/commands/savepoint.md`** — slash command
- **Memory** — `project_neya`, `project_cava_brandbook`, `project_cava_storytelling`, `feedback_autonomous_mode`, `feedback_neya_simplify`, `feedback_neya_visual_refs`

## Backlog priorisé

1. **Valider visuellement onboarding sur mobile/desktop** (Will) — iPhone SE 375px → iPad → desktop
2. **Phase 2 — Dialog primitive headless** dans `src/components/ui/Dialog.jsx` + migration pilote Carnet
3. **Phase 2bis — Audit ARIA** sur les 12+ overlays
4. **Phase 3 — BlurFade primitive CSS pur** + `useReveal()` hook
5. **Phase 3bis — NumberTicker JS pur** pour stats joursConnectes/minutesTotales
6. **Phase 4+** — Apple Cards Carousel (Aventure), Sticky Scroll Reveal (Cocon), Toaster Sonner-style
7. **Cleanup** — supprimer `src/v2/screens/Manifeste.jsx` si onboarding visuel validé

## Décisions en attente

- Aucune. Onboarding livré, attend retour Will sur photos et lisibilité mobile.

## Volontairement écarté (anti-NÉYA)

- shadcn Calendar / DataTable / Carousel
- magicui Meteors / Sparkles / Globe / Border Beam
- IBM Carbon density / Material ripple
- Aceternity Background Beams / Hover Border Gradient
- Tests unitaires stricts (post-V1 stabilisée)
- Monorepo / Conventional Commits stricts
- Framer Motion pour onboarding (CSS pur + scroll-snap suffit)
