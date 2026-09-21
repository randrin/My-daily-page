# CLAUDE.md — Claude Code (index)

Instructions pour Claude travaillant sur **My-daily-page**.

Le fichier principal du dépôt est [`../CLAUDE.md`](../CLAUDE.md).

## Monorepo

| Dossier | Stack | Agent file |
|---------|-------|------------|
| `client/` | Next.js 16 · React 19 · TypeScript strict · Tailwind v4 · Shadcn/UI · Zustand · TanStack Query · Axios · Zod · NextAuth v5 · Vitest · Playwright | `client/CLAUDE.md` |
| `api/` | Nestjs, TypeScript, PostgreSQL, TypeORM, JWT, class-validator + class-transformer | `api/CLAUDE.md` |

## Skills

- Frontend : `.claude/skills/client-stack/SKILL.md` (+ `architecture.md`, `business-rules.md`)
- Backend : `.claude/skills/api-stack/SKILL.md` (+ `architecture.md`, `business-rules.md`)

## Démarrage rapide

```bash
docker compose up -d
cd api && npm install && npm run migration:run && npm run start:dev
cd client && npm run dev
```
