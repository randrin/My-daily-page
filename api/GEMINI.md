# GEMINI.md — API (Gemini)

Backend NestJS pour My-daily-page. Dossier : `api/`.

> Skill : `../.gemini/skills/api-stack/SKILL.md`

## Stack

NestJS 11 · Prisma · PostgreSQL · BullMQ · Redis · Resend · Twilio

## Pattern Module/Controller/Service

Chaque feature suit ce pattern :

- **Module** — enregistre controller + service
- **Controller** — routes HTTP, délègue au service
- **Service** — logique métier + Prisma
- **DTO** — validation des entrées

## Modules existants

- `tasks` — CRUD `/tasks`
- `categories` — CRUD `/categories`
- `notifications` — `POST /notifications/send` (async via BullMQ)

## Commandes

```bash
cd api
npm run start:dev
npm run prisma:migrate
```
