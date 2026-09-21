# GEMINI.md — My-daily-page

> Fichier de contexte principal pour **Google Gemini CLI**.
> Client : `client/GEMINI.md` · API : `api/GEMINI.md`
> Skills : `.gemini/skills/client-stack/` · `.gemini/skills/api-stack/`

## Projet

Monorepo de gestion de tâches :
- **client/** — Next.js 16 · React 19 · TypeScript strict · Tailwind v4 · Shadcn/UI · Zustand · TanStack React Query · Axios · Zod · NextAuth v5 · Vitest · Playwright
- **api/** — Nestjs, TypeScript, PostgreSQL, TypeORM, JWT, class-validator + class-transformer

## Stack

| Partie | Technologies |
|--------|-------------|
| Frontend | Next.js 16 · React 19 · TypeScript strict · Tailwind v4 · Shadcn/UI · Zustand · TanStack React Query · Axios · Zod · NextAuth v5 · Vitest · Playwright |
| Backend | Nestjs · TypeScript · PostgreSQL · TypeORM · JWT · class-validator + class-transformer |

## Règles essentielles

### Client (`client/`)
- Pages Router, `"use client"`, Zod + Query + Zustand (UI only)
- NextAuth v5 pour les pages protégées

### API (`api/`)
- Pattern **Module / Controller / Service** par feature
- TypeORM + JWT ; BullMQ pour les notifications async

## Commandes

```bash
# Infrastructure
docker compose up -d

# API
cd api && npm install && npm run migration:run && npm run start:dev

# Client
cd client && npm run dev
```

## Agents du projet

| Outil | Client | API | Skills |
|-------|--------|-----|--------|
| Cursor | `client/AGENTS.md` | `api/AGENTS.md` | `.cursor/skills/` |
| Codex | `client/AGENTS.md` | `api/AGENTS.md` | `.agents/skills/` |
| Claude | `client/CLAUDE.md` | `api/CLAUDE.md` | `.claude/skills/` |
| Gemini | `client/GEMINI.md` | `api/GEMINI.md` | `.gemini/skills/` |
