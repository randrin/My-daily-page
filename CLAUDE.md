# CLAUDE.md — My-daily-page

> Contexte principal pour **Claude Code**.
> Client : `client/CLAUDE.md` · API : `api/CLAUDE.md`
> Skills : `.claude/skills/client-stack/` · `.claude/skills/api-stack/`

## Projet

Monorepo de gestion de tâches :
- **client/** — Next.js 16 · React 19 · TypeScript strict · Tailwind v4 · Shadcn/UI · Zustand · TanStack React Query · Axios · Zod · NextAuth v5 · Vitest · Playwright
- **api/** — Nestjs, TypeScript, PostgreSQL, TypeORM, JWT, class-validator + class-transformer

## Règles essentielles

### Client (`client/`)
- Pages Router, `"use client"`, Zod + Query + Zustand (UI only)
- NextAuth v5 pour les pages protégées
- Skill : `.claude/skills/client-stack/SKILL.md`

### API (`api/`)
- Pattern **Module / Controller / Service** par feature
- TypeORM + JWT ; BullMQ pour les notifications async
- Skill : `.claude/skills/api-stack/SKILL.md`

## Commandes

```bash
docker compose up -d
cd api && npm install && npm run migration:run && npm run start:dev
cd client && npm run dev
```

## Agents du projet

| Outil | Client | API | Skills |
|-------|--------|-----|--------|
| Cursor | `client/AGENTS.md` | `api/AGENTS.md` | `.cursor/skills/` |
| Codex | `client/AGENTS.md` | `api/AGENTS.md` | `.agents/skills/` |
| Claude | `client/CLAUDE.md` | `api/CLAUDE.md` | `.claude/skills/` |
| Gemini | `client/GEMINI.md` | `api/GEMINI.md` | `.gemini/skills/` |
