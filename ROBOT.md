# ROBOT.md — NÉYA

> Slim ≤ 200 lignes. Doc volumineuse dans `.claude/skills/` (lazy-loaded).

## 1. Identité

**NÉYA** — App de bien-être émotionnel gamifiée, prolongement digital de la marque ÇA VA?.

- **Repo** : `# ← à remplir (github.com/...)`
- **Prod** : `# ← à remplir`
- **Owner** : Will · macOS · VS Code · réponses en français
- **Statut** : MVP en cours

**Philosophie produit non-négociable** : Espace émotionnel esthétique, premium et humain — adulte, poétique, épique. Jamais clinique ni infantilisant. Gamification non-toxique : présence récompensée, pas performance. Pas de classement, pas de comparaison.

## 2. Stack

| Couche | Tech |
|---|---|
| Frontend | React 18 + Vite 5 (JSX single-file, `src/App.jsx`) |
| Backend | Aucun (MVP) |
| BDD | Aucune (MVP) |
| Tests | Aucun (MVP) |
| Lint | Aucun (MVP) |
| CI | Aucune |
| Hébergement | Vercel (à configurer) |

## 3. Variables d'environnement

Aucune pour l'instant (pas de backend).

## 4. Commandes

```bash
# Dev local
npm run dev   # http://localhost:5173

# Build prod
npm run build

# Preview build
npm run preview
```

## 5. Stratégie git

- **Branche principale** : `main`
- **Branches** : `feat/<scope>` / `fix/<scope>` / `chore/<scope>` / `claude/<task>`
- **Commits** : conventional commits (`feat:`, `fix:`, `chore:`, `style:`, `refactor:`)

## 6. Skills disponibles

Lazy-loaded dans `.claude/skills/`. Charge à la demande.

| Skill | Quand l'invoquer |
|---|---|
| `neya-da` | Direction artistique, palette, typographie, composants visuels |
| `neya-structure` | Architecture, modules, écrans, organisation des fichiers |

## 7. Sub-agents

Aucun pour l'instant.

## 8. Workflow Claude pour ce projet

### Démarrage

Lis `tasks/lessons.md` + `tasks/todo.md`, dis ce qui est en cours.

### Conventions

**Build de référence** : `neya-final.jsx` (alias `neya-aventure.jsx`) — single-file React. Toujours itérer sur l'existant, jamais repartir de zéro.

**Design system** :
- Fond `#050810` · Indigo `#6366f1` · Magenta `#ec4899` · Teal `#14b8a6` · Gold `#f59e0b`
- Display : Sora · Body : Inter
- Fille cheveux bleus, toujours de dos · Esprits animaux géants et lumineux
- Esthétique semi-réaliste picturale · Fonds sombres immersifs par monde émotionnel

**Copy anchors** : "Et toi, ça va vraiment ?" · "T'as pas besoin d'aller bien pour commencer" · "Tu n'es pas seul.e"

**Collaboration** : instructions courtes → code direct. Dépendances minimales. Partage images de ref pour valider DA.

### Pièges connus à NE PAS reproduire

- Ne jamais refactoriser en multi-fichiers sans accord explicite de Will
- Ton jamais clinique, médicalisé ou startup générique
- Pas de mécaniques de classement, comparaison ou validation publique
- Ne pas ajouter de features non demandées (scope discipline stricte)
- Ne pas proposer de réécriture complète — toujours itérer sur `neya-final.jsx`

## 9. État actuel

> Mettre à jour à chaque savepoint.

**Date** : 2026-05-07
**Branche** : `main`
**Phase** : V1 visuelle complète — DA intégrée, vraies images de fond, logo, esprit animal

### Features actives (`src/App.jsx`)
- Onboarding 3 écrans : image de fond réelle (fille de dos + grotte mandalas), texte séquentiel
- Rituel sensoriel : couleur → texture (spatiale) → son (Web Audio API)
- Monde Brume : image de fond réelle (fille + loup-esprit), logo NÉYA, cerf SVG lumineux
- Espace Vrai : image de fond réelle (fille dans l'eau), flux anonyme organique
- Logo NÉYA (étoile + wordmark) présent sur WorldReveal et Espace Vrai
- Cerf redesigné : silhouette éthérée avec bois ramifiés lumineux et particules
- Grain texture sur les fonds rituel
- Skill files DA + Structure créés dans `.claude/skills/`

### Assets dans `public/`
- `cerf.svg` — esprit animal redesigné, lumineux
- `bg-onboarding.png` — fille de dos, grotte avec eau et mandalas bleus
- `bg-brume.png` — fille face au loup-esprit dans une grotte
- `bg-vrai.png` — fille debout dans l'eau avec orbes lumineux

### Backlog code
- [ ] Transition retour au rituel depuis Espace Vrai (nouvelle session)
- [ ] V1.1 : histoire silencieuse (`history: []`)
- [ ] Déploiement Vercel

### Actions Will (hors code)
- [ ] Ajouter URL repo + prod dans §1
- [ ] Choisir d'autres fonds parmi `NÉYA/image fond app/` pour les prochains mondes
