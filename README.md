# My-daily-page

Application de gestion de tâches quotidiennes : tableau de bord, suivi par statut, catégories et notifications (email, SMS, WhatsApp).

Monorepo composé d'un **frontend** Next.js et d'une **API** NestJS.

## Structure du projet

```
My-daily-page/
├── client/          # Frontend — React 19, Next.js, Tailwind, shadcn/ui
├── api/             # Backend  — NestJS, TypeORM, PostgreSQL, BullMQ
├── docker-compose.yml   # PostgreSQL + Redis
└── README.md
```

| Dossier | Documentation | Port |
|---------|---------------|------|
| [`client/`](client/) | [client/README.md](client/README.md) | `3000` |
| [`api/`](api/) | [api/README.md](api/README.md) · [Swagger](http://localhost:3001/docs) | `3001` |

## Stack

| Couche | Technologies |
|--------|-------------|
| **Frontend** | React 19 · Next.js 16 (Pages Router) · TypeScript · Tailwind v4 · shadcn/ui · TanStack Query · axios |
| **Backend** | NestJS · TypeScript · PostgreSQL · TypeORM · JWT · class-validator · Swagger |
| **Infra** | Docker Compose (PostgreSQL 16, Redis 7) |

## Architecture

```
Navigateur (client :3000)
        │  NextAuth / Axios  Authorization: Bearer <JWT>
        ▼
API NestJS (:3001)
        ├── /docs          Swagger UI
        ├── /auth          register, login, me
        ├── /categories    CRUD isolé par JWT
        ├── /tasks         CRUD + rappels
        └── /notifications enqueue BullMQ
                │
                ├── PostgreSQL (TypeORM)
                └── Redis → Resend / Twilio
```

Le `userId` vient toujours du JWT (`sub`), jamais du body client.

## Démarrage rapide

### 1. Infrastructure

```bash
docker compose up -d
```

### 2. API

```bash
cd api
cp .env.example .env
npm install
npm run migration:run
npm run seed
npm run start:dev
```

| URL | Description |
|-----|-------------|
| [http://localhost:3001](http://localhost:3001) | API REST |
| [http://localhost:3001/docs](http://localhost:3001/docs) | Documentation Swagger |

Pour tester une route protégée dans Swagger : `POST /auth/login` → copier `access_token` → **Authorize**.

Détail : [api/README.md](api/README.md).

### 3. Client

```bash
cd client
# Créer .env.local (voir client/README.md)
npm install
npm run dev
```

→ [http://localhost:3000](http://localhost:3000)

## Fonctionnalités

- **Auth** — inscription / connexion JWT ; le client consomme le token via NextAuth
- **Tâches** — CRUD avec statut, priorité, catégorie et dates
- **Catégories** — work, personal, shopping, health, finance, education, other
- **Dashboard** — graphiques (donut, barres, courbes, aires), calendrier, filtres
- **Notifications** — envoi asynchrone par email (Resend), SMS et WhatsApp (Twilio)

## Agents IA

Le projet inclut des skills et règles pour guider les assistants (Cursor, Claude, Gemini) :

| Outil | Client | API |
|-------|--------|-----|
| Cursor | [`client/AGENTS.md`](client/AGENTS.md) | [`api/AGENTS.md`](api/AGENTS.md) |
| Claude | [`client/CLAUDE.md`](client/CLAUDE.md) | [`api/CLAUDE.md`](api/CLAUDE.md) |
| Gemini | [`client/GEMINI.md`](client/GEMINI.md) | [`api/GEMINI.md`](api/GEMINI.md) |

Skills détaillés :
- Frontend : `.cursor/skills/client-stack/`
- Backend : `.cursor/skills/api-stack/`

## Licence

Projet privé — tous droits réservés.
