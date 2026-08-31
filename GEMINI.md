# GEMINI.md — My-daily-page

> Fichier de contexte principal pour **Google Gemini CLI**.
> Client : `client/GEMINI.md` · API : `api/GEMINI.md`
> Skills : `.gemini/skills/client-stack/` · `.gemini/skills/api-stack/`

## Projet

Monorepo de gestion de tâches :
- **client/** — React 19, Next.js, Tailwind, shadcn, TanStack Query
- **api/** — NestJS, Prisma, PostgreSQL, BullMQ, Resend, Twilio

## Stack

| Partie | Technologies |
|--------|-------------|
| Frontend | React 19 · Next.js · Tailwind v4 · shadcn/ui · TanStack Query |
| Backend | NestJS 11 · Prisma · PostgreSQL · BullMQ · Redis · Resend · Twilio |

## Règles essentielles

### Client (`client/`)
- Pages Router, `"use client"`, pas d'hydratation SSR
- TanStack Query pour les données API

### API (`api/`)
- Pattern **Module / Controller / Service** par feature
- Prisma pour la DB, BullMQ pour les notifications async

## Commandes

```bash
# Infrastructure
docker compose up -d

# API
cd api && npm install && npm run prisma:migrate && npm run start:dev

# Client
cd client && npm run dev
```

## Agents du projet

| Outil | Client | API |
|-------|--------|-----|
| Cursor | `client/AGENTS.md` | `api/AGENTS.md` |
| Claude | `client/CLAUDE.md` | `api/CLAUDE.md` |
| Gemini | `client/GEMINI.md` | `api/GEMINI.md` |
