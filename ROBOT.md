# ROBOT.md — NÉYA

> Slim ≤ 200 lignes. Doc volumineuse dans `.claude/skills/` (lazy-loaded).

## 1. Identité

**NÉYA** — App de bien-être émotionnel gamifiée, prolongement digital de la marque ÇA VA?.

- **Repo** : `<TODO: github.com/...>`
- **Prod** : `<TODO>`
- **Owner** : Will
- **Statut** : MVP en cours

**Philosophie produit non-négociable** : Espace émotionnel esthétique, premium et humain — adulte, poétique, épique. Jamais clinique ni infantilisant. Gamification non-toxique : présence récompensée, pas performance. Pas de classement, pas de comparaison.

## 2. Stack

| Couche | Tech |
|---|---|
| Frontend | React (JSX single-file, `neya-final.jsx`) |
| Backend | `<TODO>` |
| BDD | `<TODO>` |
| Tests | `<TODO>` |
| Lint | `<TODO>` |
| CI | `<TODO>` |
| Hébergement | `<TODO>` |

## 3. Variables d'environnement

```
# À compléter selon backend
```

Pas de secret en clair ici. `.env.example` à la racine si besoin.

## 4. Commandes

```bash
# Dev local
<TODO>

# Build
<TODO>

# Lint / types
<TODO>
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

## 9. État actuel

> Mettre à jour à chaque savepoint.

**Date** : 2026-05-07
**Branche** : `claude/harmonize-robot-memory`
**Phase** : Setup mémoire Robot-Memory

### Features actives (`neya-final.jsx`)
- Onboarding narratif (silhouette fille cheveux bleus, vue de dos)
- 6 mondes émotionnels + 6 esprits animaux
- 4 écrans : Aventure, Habitudes, Communauté, Profil
- Espace Vrai (feed anonyme 24h)
- Boutique ÇA VA? avec pass 3 niveaux
- Mode crise

### Backlog code
- [ ] `<à compléter>`

### Actions Will (hors code)
- [ ] `<à compléter>`
