---
name: api-stack
description: >-
  Guide le développement du backend My-daily-page avec NestJS, Prisma, PostgreSQL,
  BullMQ, Redis, Resend (email) et Twilio (SMS/WhatsApp). Utiliser pour toute tâche
  dans api/ : modules, controllers, services, DTOs, Prisma, queues ou notifications.
---

# API Stack — My-daily-page

## Stack

| Technologie | Usage |
|-------------|-------|
| NestJS 11 | Framework API — pattern Module/Controller/Service |
| Prisma | ORM PostgreSQL |
| PostgreSQL | Base de données |
| BullMQ + Redis | File d'attente notifications |
| Resend | Envoi emails |
| Twilio | SMS & WhatsApp |
| class-validator | Validation DTOs |

## Structure (`api/src/`)

```
src/
├── main.ts                 # bootstrap + ValidationPipe + CORS
├── app.module.ts           # module racine
├── config/                 # configuration.ts (env)
├── prisma/                 # PrismaModule + PrismaService (global)
├── queue/                  # BullMQ setup
├── tasks/                  # module tâches
│   ├── tasks.module.ts
│   ├── tasks.controller.ts
│   ├── tasks.service.ts
│   ├── task.mapper.ts
│   └── dto/
├── categories/             # module catégories
├── notifications/        # module notifications
│   ├── notifications.module.ts
│   ├── notifications.controller.ts
│   ├── notifications.service.ts
│   ├── processors/         # BullMQ workers
│   └── providers/          # Resend, Twilio SMS, Twilio WhatsApp
```

## Pattern obligatoire par module

Chaque feature = **1 module + 1 controller + 1 service** :

```
feature/
├── feature.module.ts      # @Module({ controllers, providers, exports })
├── feature.controller.ts  # routes HTTP uniquement
├── feature.service.ts     # logique métier + Prisma
└── dto/                   # CreateXDto, UpdateXDto (class-validator)
```

- **Controller** : routes, validation via DTOs, délègue au service.
- **Service** : logique métier, accès DB via `PrismaService`, exceptions NestJS.
- **Module** : enregistre controller + service, exporte le service si réutilisé.

## Prisma

- Schéma : `prisma/schema.prisma`
- Service global : `PrismaService` injectable partout
- Migrations : `npm run prisma:migrate`
- Seed : `npm run prisma:seed`

```typescript
// Injection standard
constructor(private readonly prisma: PrismaService) {}

await this.prisma.task.findMany();
```

## Notifications (BullMQ)

1. `POST /notifications/send` → crée en DB + ajoute job à la queue
2. `NotificationProcessor` consomme la queue
3. Providers : `EmailProvider` (Resend), `SmsProvider`, `WhatsappProvider` (Twilio)

## Variables d'environnement

Copier `api/.env.example` → `api/.env`

## Commandes

```bash
cd api
docker compose -f ../docker-compose.yml up -d   # PostgreSQL + Redis
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

## Règles

1. Un module = une responsabilité métier
2. DTOs avec `class-validator` pour toutes les entrées
3. `NotFoundException`, `BadRequestException` pour les erreurs HTTP
4. Pas de logique métier dans les controllers
5. Providers externes (email, SMS) dans `notifications/providers/`
6. Aligner les réponses API avec le client (`task.mapper.ts` pour status `in-process`)

## Endpoints

| Module | Routes |
|--------|--------|
| tasks | `GET/POST /tasks`, `GET/PATCH/DELETE /tasks/:id` |
| categories | `GET/POST /categories`, `GET/PATCH/DELETE /categories/:id` |
| notifications | `GET /notifications`, `POST /notifications/send` |

## Ressources

- [reference.md](reference.md)
