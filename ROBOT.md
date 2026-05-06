# ROBOT.md — NEYA

Manuel d'opération pour tout agent (Claude, Codex, humain) intervenant sur ce dépôt.
Lis ce fichier en entier avant toute modification.

---

## 1. Identité du projet

- **Nom** : NEYA
- **Pitch** : application de bien-être émotionnel — aider l'utilisateur à reconnaître, nommer et réguler ses émotions au quotidien.
- **Propriétaire** : @willmorel49-coder
- **Langue produit (UI/UX)** : français
- **Langue code, commits, docs techniques** : anglais
- **Statut** : amorçage (aucun code applicatif encore écrit)

## 2. Stack technique (décidée)

| Domaine | Choix | Raison |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR + DX + Vercel |
| Langage | TypeScript (strict) | Sûreté de typage |
| UI | Tailwind CSS + shadcn/ui | Vélocité + accessibilité |
| Backend / DB | Supabase (Postgres + Auth + Storage) | Tout-en-un managé |
| Validation | Zod | Schémas partagés client/serveur |
| Tests unitaires | Vitest | Rapide, compatible Vite/Next |
| Tests E2E | Playwright | Standard de fait |
| Lint / Format | ESLint + Prettier | Hygiène |
| Package manager | pnpm | Performance + lockfile strict |
| Hébergement | Vercel | Intégration native Next |
| CI | GitHub Actions | Lint + typecheck + tests sur PR |

Toute déviation doit être justifiée dans la PR et reportée ici.

## 3. Commandes de référence

_(à initialiser lors du scaffolding ; cette section doit rester synchrone avec `package.json`)_

```bash
pnpm install        # dépendances
pnpm dev            # serveur de dev
pnpm build          # build de production
pnpm start          # serveur de prod local
pnpm lint           # ESLint
pnpm typecheck      # tsc --noEmit
pnpm test           # Vitest
pnpm test:e2e       # Playwright
```

## 4. Conventions

### 4.1 Commits — Conventional Commits (strict)

Format : `<type>(<scope>): <sujet à l'impératif présent>`

Types autorisés : `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

Exemples :
- `feat(journal): add mood entry form`
- `fix(auth): prevent session refresh loop`
- `docs(robot): clarify branching rules`

Le sujet est en anglais, en minuscules, sans point final, ≤ 72 caractères.
Le corps explique le **pourquoi** (pas le quoi).

### 4.2 Branches

- `main` : protégée, déployée en prod.
- `claude/<slug>` : travail d'un agent Claude.
- `feat/<slug>`, `fix/<slug>`, `chore/<slug>` : travail humain.
- Une branche = un objectif. Pas de fourre-tout.

### 4.3 Pull Requests

- Titre = même format que le commit principal.
- Description : contexte, captures (si UI), checklist de test.
- Pas de merge sans CI verte.
- Squash merge par défaut.

### 4.4 Code

- TypeScript `strict: true`. Pas de `any` implicite ni explicite sans justification en commentaire.
- Composants React : function components + hooks.
- Pas de logique métier dans les composants — extraire en hooks ou modules `lib/`.
- Accessibilité : tout composant interactif doit être utilisable au clavier et lisible au lecteur d'écran (NEYA touche à la santé mentale, l'accessibilité n'est pas optionnelle).

### 4.5 Sécurité & vie privée

- Aucune donnée émotionnelle utilisateur ne doit fuiter vers des logs, des outils tiers de tracking, ou un LLM externe sans consentement explicite.
- Secrets : uniquement via variables d'environnement, jamais commités.
- Toute table Supabase contenant des données utilisateur **doit** avoir une RLS active dès sa création.

## 5. Format des leçons apprises

Fichier : `LESSONS.md`.
Format **daté inline avec séparateur pipe**, une ligne par leçon, ordre antichronologique :

```
YYYY-MM-DD | <catégorie> | <leçon, une phrase> | <contexte ou lien>
```

Catégories : `stack`, `produit`, `process`, `bug`, `sécurité`, `ux`, `perf`, `outillage`.

Exemple :
```
2026-05-06 | process | Toujours figer la stack dans ROBOT.md avant d'écrire du code | bootstrap initial
```

## 6. Boucle d'agent

À chaque session, l'agent **doit** :

1. Lire `ROBOT.md` et `LESSONS.md`.
2. Vérifier l'état du dépôt (`git status`, branche courante).
3. Travailler sur la branche désignée par l'utilisateur (jamais directement sur `main`).
4. Commiter en Conventional Commits.
5. À la fin de la session, ajouter au moins une ligne à `LESSONS.md` si quelque chose de non-trivial a été appris.
6. Pousser, puis s'arrêter — **pas de PR** sans demande explicite de l'utilisateur.

## 7. Hors-scope (pour l'instant)

- App mobile native.
- IA générative côté produit.
- Internationalisation au-delà du français.

_Ces points seront réévalués une fois le MVP web livré._
