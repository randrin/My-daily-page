# GEMINI.md — Google Gemini CLI

Instructions pour Gemini travaillant sur **My-daily-page**.

## Monorepo

| Dossier | Stack | Agent file |
|---------|-------|------------|
| `client/` | Next.js 16 · React 19 · TypeScript strict · Tailwind v4 · Shadcn/UI · Zustand · TanStack Query · Axios · Zod · NextAuth v5 · Vitest · Playwright | `client/GEMINI.md` |
| `api/` | Nestjs, TypeScript, PostgreSQL, TypeORM, JWT, class-validator + class-transformer | `api/GEMINI.md` |

## Skills

- Frontend : `.gemini/skills/client-stack/SKILL.md` (+ `architecture.md`, `business-rules.md`)
- Backend : `.gemini/skills/api-stack/SKILL.md` (+ `architecture.md`, `business-rules.md`)

## Démarrage rapide

```bash
docker compose up -d
cd api && npm install && npm run migration:run && npm run start:dev
cd client && npm run dev
```
