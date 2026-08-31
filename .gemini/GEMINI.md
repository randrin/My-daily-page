# GEMINI.md — Google Gemini CLI

Instructions pour Gemini travaillant sur **My-daily-page**.

## Monorepo

| Dossier | Stack | Agent file |
|---------|-------|------------|
| `client/` | React, Next.js, Tailwind, shadcn, TanStack Query | `client/GEMINI.md` |
| `api/` | NestJS, Prisma, PostgreSQL, BullMQ, Resend, Twilio | `api/GEMINI.md` |

## Skills

- Frontend : `.gemini/skills/client-stack/SKILL.md`
- Backend : `.gemini/skills/api-stack/SKILL.md`

## Démarrage rapide

```bash
docker compose up -d
cd api && npm install && npm run prisma:migrate && npm run start:dev
cd client && npm run dev
```
