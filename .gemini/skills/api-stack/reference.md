# API Stack — Référence (Gemini)

## Docker

```bash
docker compose up -d   # PostgreSQL :5432, Redis :6379
```

## Env

Copier `api/.env.example` → `api/.env`

## Créer un module NestJS

```bash
nest g module feature
nest g controller feature
nest g service feature
```

## Notification example

```bash
curl -X POST http://localhost:3001/notifications/send \
  -H "Content-Type: application/json" \
  -d '{"channel":"email","recipient":"test@example.com","subject":"Test","body":"<p>Hello</p>"}'
```
