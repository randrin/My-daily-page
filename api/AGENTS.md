# AGENTS.md — API (Cursor)

Instructions pour les agents IA travaillant sur le **backend** My-daily-page.

## Projet

API REST dans `api/`. Frontend dans `client/`.

## Stack

- **NestJS 11** — Module / Controller / Service
- **Prisma** — ORM PostgreSQL
- **PostgreSQL** — base de données
- **BullMQ + Redis** — files d'attente
- **Resend** — emails
- **Twilio** — SMS & WhatsApp

## Modules

| Module | Routes | Rôle |
|--------|--------|------|
| `tasks` | `/tasks` | CRUD tâches |
| `categories` | `/categories` | CRUD catégories |
| `notifications` | `/notifications` | Envoi async email/SMS/WhatsApp |

## Pattern

```
module/
├── *.module.ts
├── *.controller.ts    # HTTP only
├── *.service.ts       # business logic + Prisma
└── dto/
```

## Commandes

```bash
cd api
npm run start:dev
npm run prisma:migrate
npm run prisma:seed
```

## Skill

`.cursor/skills/api-stack/SKILL.md`
