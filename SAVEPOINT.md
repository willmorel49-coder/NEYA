# SAVEPOINT — NÉYA

**Date** : 2026-05-16
**Commit HEAD** : `7679843` · feat(v7): ÇA VA? — condensé + storytelling officiel par phrases-clés
**Prod** : https://neya-kappa.vercel.app · HTTP 200
**Repo** : github.com/willmorel49-coder/NEYA

## Dernière action

Phase 1 fondations livrée : ajout couche sémantique shadcn-style à `tokens.css` (`--background`, `--accent` dynamique via `[data-world]`, `--card`, `--muted`, `--ring`, `--destructive`) + workflow Claude consolidé (agent `cavalry-coordinator`, slash command `/savepoint`, anti-patterns dans ROBOT.md). Zéro refactor JSX existant.

## État des onglets

- **Aventure** — V3.21 (texts/features disparition fix, profile-changed event listener)
- **Cocon** — V4 (sanctuaire vivant personnalisable, 5 items SVG sur-mesure)
- **Communauté** — V3.22 (sweep QA round 2 : long-press fixes, ActionSheet pearl)
- **ça va ♡** — V7 (page condensée 8 blocs + storytelling phrases-clés + 120 photos `/cava/brand/`)

## Fondations

- **tokens.css** — 705 lignes + layer sémantique shadcn-style ajouté V8. Bindings `[data-world]` pour les 6 mondes (foret/temple/oasis/lac/montagne/communaute).
- **prefers-reduced-motion** — global, désactive animations + transitions
- **:focus-visible** — ring 2px accent du monde courant + offset 3px
- **CaVaPhotoViewer.jsx** — viewer cinéma swipe + zoom + caption (V5)
- **Dialog primitive** — ❌ pas encore (Phase 2)
- **Sheet primitive** — ❌ pas encore (Phase 2)
- **Toaster queue** — ❌ pas encore (Phase 4)
- **BlurFade hook** — ❌ pas encore (Phase 3)

## Workflow Claude

- **ROBOT.md** — Definition of Done + Anti-patterns explicites (V8)
- **`.claude/agents/cavalry-coordinator.md`** — template briefing standardisé pour missions parallèles
- **`.claude/commands/savepoint.md`** — slash command pour réécrire ce fichier
- **Memory** — `project_neya`, `project_cava_brandbook`, `project_cava_storytelling`, `feedback_autonomous_mode`, `feedback_neya_simplify`, `feedback_neya_visual_refs`

## Backlog priorisé

1. **Phase 2 — Dialog primitive headless** dans `src/components/ui/Dialog.jsx` (compound : Backdrop, Content, Title, Description) + migration pilote Carnet. Mutualise body-scroll-lock + focus trap + ESC + ARIA des 12+ overlays. Validation Will requise avant lancement.
2. **Phase 2bis — Audit ARIA** sur les 12+ overlays (`role=dialog aria-modal aria-labelledby`) — pur ajout d'attributs.
3. **Phase 3 — BlurFade primitive CSS pur** + `useReveal()` hook IntersectionObserver pour entrées de sections (zéro dépendance, ~50 lignes).
4. **Phase 3bis — NumberTicker JS pur** pour stats joursConnectes/minutesTotales (~80 lignes).
5. **Phase 4+** — Apple Cards Carousel (Aventure), Sticky Scroll Reveal (Cocon), Toaster Sonner-style.

## Décisions en attente

- Aucune. Phase 1 livrée, Phase 2 attend GO de Will.

## Volontairement écarté (anti-NÉYA)

- shadcn Calendar / DataTable / Carousel
- magicui Meteors / Sparkles / Globe / Border Beam
- IBM Carbon density / Material ripple
- Aceternity Background Beams / Hover Border Gradient
- Tests unitaires stricts (post-V1 stabilisée)
- Monorepo / Conventional Commits stricts
