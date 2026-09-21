# GEMINI.md — API (Gemini)

Backend NestJS pour My-daily-page. Dossier : `api/`.

> Contexte global : `../GEMINI.md` et `../.gemini/GEMINI.md`
> Skill : `../.gemini/skills/api-stack/SKILL.md`
> Architecture : `../.gemini/skills/api-stack/architecture.md`
> Métier : `../.gemini/skills/api-stack/business-rules.md`

## Stack

Nestjs, TypeScript, PostgreSQL, TypeORM, JWT, class-validator + class-transformer

Compléments : BullMQ, Redis, Resend, Twilio, Jest, Swagger (`/docs`).

## Architecture

```
api/src/
├── database/            # TypeORM
├── common/              # guards, @CurrentUser, @ApiJwtAuth
├── docs/                # Swagger /docs
├── entities/
└── modules/auth|users|tasks|categories|notifications|queue
```

- Controller : HTTP + `JwtAuthGuard`. Service : métier + `Repository`.
- `userId` = JWT `sub`.

## Règles

- Register / login publics ; le reste protégé.
- Isolation user ; 404 si ressource étrangère.
- Statuts JSON : `todo | in-process | done | archived`.
- Catégories unique par user.
- Envoi notif async (BullMQ) uniquement.
- DTOs : class-validator + class-transformer. Password hashé, exclu des réponses.

## Pattern Module/Controller/Service

- **Module** — `TypeOrmModule.forFeature`, controller, service
- **Controller** — routes, DTO, délègue
- **Service** — invariants + TypeORM
- **DTO** — validation des entrées

## Commandes

```bash
cd api
npm run start:dev
npm run migration:run
npm run test
```
