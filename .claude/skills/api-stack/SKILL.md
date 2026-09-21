---
name: api-stack
description: >-
  Guide le développement backend My-daily-page dans api/ : Nestjs, TypeScript,
  PostgreSQL, TypeORM, JWT, class-validator + class-transformer. Utiliser pour
  toute tâche API — modules, controllers, services, DTOs, entités TypeORM,
  auth JWT, queues ou notifications.
---

# API Stack — My-daily-page

## Stack

Nestjs, TypeScript, PostgreSQL, TypeORM, JWT, class-validator + class-transformer

Compléments : BullMQ + Redis (queues), Resend (email), Twilio (SMS / WhatsApp), Jest, Swagger (`/docs`).

## Pattern obligatoire

Chaque feature = **1 module + 1 controller + 1 service + dto/ + entities/** :

```
feature/
├── feature.module.ts
├── feature.controller.ts    # HTTP, guards, mapping — pas de TypeORM
├── feature.service.ts       # métier + Repository TypeORM
├── dto/                     # class-validator + class-transformer
└── entities/                # @Entity TypeORM (si colocalisé)
```

- **Controller** : routes, `@UseGuards(JwtAuthGuard)`, `@ApiJwtAuth()`, DTOs, délègue au service.
- **Service** : règles métier, `@InjectRepository`, exceptions NestJS.
- **Module** : `TypeOrmModule.forFeature([...])`, exports du service si réutilisé.

## Séparation des responsabilités

| Couche | Outil | Rôle |
|--------|-------|------|
| HTTP | NestJS controllers | Routes, status codes, Swagger |
| Auth | JWT (`@nestjs/jwt` + Passport) | Login, guards, `req.user` |
| Validation | class-validator + class-transformer | DTOs + `ValidationPipe` |
| Métier | Services | Invariants, isolation user |
| Persistance | TypeORM + PostgreSQL | Entités, repos, migrations |
| Async | BullMQ | Envoi notifications |

`userId` = `payload.sub` du JWT. Jamais un `userId` dans le body / query du client.

## Conventions

1. `ValidationPipe` global : `whitelist`, `forbidNonWhitelisted`, `transform: true`.
2. Mot de passe hashé (bcrypt), jamais renvoyé (`@Exclude()` / `toSafeJSON()`).
3. Exceptions : `NotFoundException`, `BadRequestException`, `UnauthorizedException`, `ConflictException`.
4. Réponses tâches alignées client : `todo` / `in-process` / `done` / `archived` via mapper.
5. Notifications : enqueue BullMQ, jamais d'appel Resend/Twilio dans le controller.
6. TypeScript : pas de `any`. Diff minimal.

## Interdit

- Logique TypeORM / métier dans les controllers
- Envoi synchrone email / SMS / WhatsApp
- `userId` saisi par le client
- Mot de passe en clair en base ou dans les JSON

## Commandes

```bash
cd api
npm run start:dev
npm run migration:run
npm run test
npm run test:e2e
npm run lint
```

## Checklist

- [ ] DTO class-validator sur toutes les entrées (`PartialType` depuis `@nestjs/swagger`)
- [ ] Route protégée par JWT (sauf `/auth/login`, `/auth/register`) + `@ApiJwtAuth()`
- [ ] Route documentée (`@ApiTags`, `@ApiOperation`) — UI : `/docs`
- [ ] Isolation : requêtes scoped `userId` du token
- [ ] Repository TypeORM
- [ ] Test Jest du service ou e2e du parcours

## Ressources

- Architecture cible : [architecture.md](architecture.md)
- Règles métier : [business-rules.md](business-rules.md)
- Patterns code : [reference.md](reference.md)
