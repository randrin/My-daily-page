---
name: api-stack
description: >-
  Guides Gemini on the My-daily-page API: NestJS, Prisma, PostgreSQL, BullMQ,
  Redis, Resend, Twilio. Use for backend work in api/ — modules, controllers,
  services, DTOs, Prisma, queues, or notifications.
---

# API Stack — My-daily-page

## Stack

NestJS 11 · Prisma · PostgreSQL · BullMQ · Redis · Resend · Twilio

## Pattern

Each domain = Module + Controller + Service + DTOs

## Modules

- `tasks` → `/tasks` CRUD
- `categories` → `/categories` CRUD
- `notifications` → async via BullMQ (Resend + Twilio)

## Rules

1. Business logic in services, not controllers
2. PrismaService for all DB access
3. class-validator on all DTOs
4. Notifications queued via BullMQ

## Commands

```bash
cd api
npm run start:dev
npm run prisma:migrate
npm run prisma:seed
```

## Additional resources

- [reference.md](reference.md)
