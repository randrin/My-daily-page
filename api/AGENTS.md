# AGENTS.md — API (Cursor / Codex)

Instructions pour les agents IA travaillant sur le **backend** My-daily-page.

## Projet

API REST dans `api/`. Frontend dans `client/`.

## Stack

Nestjs, TypeScript, PostgreSQL, TypeORM, JWT, class-validator + class-transformer

Compléments : BullMQ + Redis, Resend, Twilio, Jest, Swagger (`/docs`).

## Architecture (résumé)

| Couche | Outil | Dossier |
|--------|-------|---------|
| HTTP | NestJS controllers | `src/modules/*/` |
| Auth | JWT | `src/modules/auth/` |
| Métier | Services | `*.service.ts` |
| DB | TypeORM | `src/entities/`, `src/database/` |
| Validation | class-validator + class-transformer | `dto/` |
| Async | BullMQ | `notifications/processors/` |

`userId` = JWT `sub`.

## Règles métier (résumé)

- Session JWT requise hors `/auth/register` et `/auth/login`.
- Isolation : uniquement les ressources du token.
- Tâche : titre obligatoire ; `todo | in-process | done | archived`.
- Catégories unique par user ; rappels async (jamais d'envoi dans le controller).
- Password hashé, jamais dans les réponses.

## Pattern

```
module/
├── *.module.ts
├── *.controller.ts    # HTTP + JwtAuthGuard + @ApiJwtAuth
├── *.service.ts       # métier + Repository
└── dto/
```

## Commandes

```bash
cd api
npm run start:dev
npm run migration:run
npm run test
npm run test:e2e
```

## Skills

| Outil | Skill |
|-------|--------|
| Cursor | `.cursor/skills/api-stack/SKILL.md` |
| Codex | `.agents/skills/api-stack/SKILL.md` |

Architecture : `architecture.md` · Métier : `business-rules.md` · Patterns : `reference.md`
