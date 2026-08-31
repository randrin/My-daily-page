
 CLAUDE.md — API (Claude)

Backend NestJS pour My-daily-page. Dossier : `api/`.

## Stack

NestJS 11 · Prisma · PostgreSQL · BullMQ · Redis · Resend · Twilio

## Architecture

```
api/src/
├── config/           # env configuration
├── prisma/           # PrismaModule (global)
├── queue/            # BullMQ
├── tasks/            # Module/Controller/Service
├── categories/
└── notifications/
    ├── processors/   # BullMQ workers
    └── providers/    # Email, SMS, WhatsApp
```

## Principes

1. **Module/Controller/Service** — un module par domaine métier
2. **DTOs** — `class-validator` sur toutes les entrées
3. **PrismaService** — seul point d'accès DB dans les services
4. **Notifications async** — BullMQ queue, processors séparés
5. **Providers** — Resend et Twilio isolés dans `providers/`
6. **Exceptions NestJS** — `NotFoundException`, `BadRequestException`

## Skill

`.claude/skills/api-stack/SKILL.md`

## Setup

```bash
docker compose up -d          # depuis la racine
cd api && npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev             # port 3001
```
