# AGENTS.md — Cursor (index)

Instructions pour Cursor travaillant sur **My-daily-page**.

Le fichier principal du dépôt est [`../AGENTS.md`](../AGENTS.md).

## Monorepo

| Dossier | Stack | Agent file |
|---------|-------|------------|
| `client/` | Next.js 16 · React 19 · TypeScript strict · Tailwind v4 · Shadcn/UI · Zustand · TanStack Query · Axios · Zod · NextAuth v5 · Vitest · Playwright | `client/AGENTS.md` |
| `api/` | Nestjs, TypeScript, PostgreSQL, TypeORM, JWT, class-validator + class-transformer | `api/AGENTS.md` |

## Skills & rules

- Frontend skill : `.cursor/skills/client-stack/SKILL.md` (+ `architecture.md`, `business-rules.md`)
- Backend skill : `.cursor/skills/api-stack/SKILL.md` (+ `architecture.md`, `business-rules.md`)
- Rules : `.cursor/rules/client-*.mdc`, `.cursor/rules/api-*.mdc`

## Démarrage rapide

```bash
docker compose up -d
cd api && npm install && npm run migration:run && npm run start:dev
cd client && npm run dev
```
