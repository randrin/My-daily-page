# CLAUDE.md — API (Claude)

Backend NestJS pour My-daily-page. Dossier : `api/`.

## Stack

Nestjs, TypeScript, PostgreSQL, TypeORM, JWT, class-validator + class-transformer

Compléments : BullMQ, Redis, Resend, Twilio, Jest, Swagger (`http://localhost:3001/docs`).

## Architecture

```
api/src/
├── config/              # env
├── database/            # TypeOrmModule + data-source
├── common/              # JwtAuthGuard, @CurrentUser(), @ApiJwtAuth()
├── docs/                # Swagger UI /docs
├── entities/            # User, Task, Category, Reminder, Preference
└── modules/
    ├── auth/            # register, login, JWT
    ├── users/
    ├── tasks/
    ├── categories/
    ├── notifications/   # processors + providers
    └── queue/
```

`userId` depuis le JWT, pas le body.

## Règles métier

1. Anonyme : register / login seulement.
2. Isolation stricte par `jwt.sub` (404 si autre user).
3. Tâche : titre obligatoire ; cycle `todo → in-process → done → archived`.
4. Catégorie : unique `(userId, name)` ; appartient au même user que la tâche.
5. Notifications via BullMQ ; Resend/Twilio uniquement dans `providers/`.
6. Password bcrypt ; jamais renvoyé.

## Principes

1. Module / Controller / Service par domaine
2. DTOs class-validator + class-transformer
3. Repository TypeORM dans le service
4. Exceptions NestJS (`NotFoundException`, `UnauthorizedException`, `ConflictException`)
5. Mapper statuts client dans `task.mapper.ts`

## Skill

`.claude/skills/api-stack/SKILL.md`  
Compléments : `architecture.md`, `business-rules.md`, `reference.md`

## Setup

```bash
docker compose up -d
cd api && npm install
npm run migration:run
npm run start:dev             # port 3001, docs : /docs
```
