# NEYA

Application de bien-être émotionnel. Focus initial : anxiété et stress.

> Reconnaître, nommer, réguler — un geste à la fois.

## Démarrage rapide

```bash
pnpm install
cp .env.example .env.local       # remplir avec les clefs Supabase
pnpm dev                         # → http://localhost:3000
```

## Scripts

| Commande            | Rôle                              |
|---------------------|-----------------------------------|
| `pnpm dev`          | serveur de développement          |
| `pnpm build`        | build de production               |
| `pnpm start`        | serveur de prod local             |
| `pnpm lint`         | ESLint (Next + jsx-a11y)          |
| `pnpm typecheck`    | `tsc --noEmit`                    |
| `pnpm test`         | tests unitaires (Vitest)          |
| `pnpm test:e2e`     | tests E2E (Playwright)            |
| `pnpm format`       | Prettier (avec plugin Tailwind)   |

## Stack

Next.js 15 (App Router) · TypeScript strict · Tailwind v4 · Supabase (Postgres + Auth + Storage) · Zod · Vitest · Playwright · pnpm.

## Documents clés

- [`ROBOT.md`](./ROBOT.md) — manuel d'opération pour tout contributeur (humain ou agent).
- [`LESSONS.md`](./LESSONS.md) — journal des leçons apprises.
- [`.claude/agents/`](./.claude/agents) — sous-agents Claude Code (clinique, a11y, RGPD, Supabase).
