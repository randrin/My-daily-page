---
name: api-stack
description: >-
  Guides Claude on the My-daily-page API: NestJS, Prisma, PostgreSQL, BullMQ,
  Redis, Resend, Twilio. Use for backend work in api/ — modules, controllers,
  services, DTOs, Prisma schema, queues, or notifications.
---

# API Stack — My-daily-page

## Stack

NestJS 11 · Prisma · PostgreSQL · BullMQ · Redis · Resend · Twilio

## Module pattern

Each feature = `*.module.ts` + `*.controller.ts` + `*.service.ts` + `dto/`

- Controller: HTTP routes only
- Service: business logic + PrismaService
- Module: registers and exports

## Structure

```
api/src/
├── prisma/          # global PrismaModule
├── queue/           # BullMQ config
├── tasks/
├── categories/
└── notifications/
    ├── processors/  # NotificationProcessor
    └── providers/   # Email, Sms, Whatsapp
```

## Rules

1. No business logic in controllers
2. DTOs with class-validator
3. Notifications via BullMQ queue (async)
4. External APIs only in providers/
5. Use NestJS exceptions (NotFoundException)

## Commands

`cd api && npm run start:dev | prisma:migrate | prisma:seed`
