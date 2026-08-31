# My-daily-page

Application de gestion de tâches quotidiennes : tableau de bord, suivi par statut, catégories et notifications (email, SMS, WhatsApp).

Monorepo composé d'un **frontend** Next.js et d'une **API** NestJS.

## Structure du projet

```
My-daily-page/
├── client/          # Frontend — React 19, Next.js, Tailwind, shadcn/ui
├── api/             # Backend  — NestJS, Prisma, PostgreSQL, BullMQ
├── docker-compose.yml   # PostgreSQL + Redis
└── README.md
```

| Dossier | Documentation | Port |
|---------|---------------|------|
| [`client/`](client/) | [client/README.md](client/README.md) | `3000` |
| [`api/`](api/) | [api/README.md](api/README.md) | `3001` |

## Stack

| Couche | Technologies |
|--------|-------------|
| **Frontend** | React 19 · Next.js 16 (Pages Router) · TypeScript · Tailwind v4 · shadcn/ui · TanStack Query · axios |
| **Backend** | NestJS 11 · Prisma · PostgreSQL · BullMQ · Redis · Resend · Twilio |
| **Infra** | Docker Compose (PostgreSQL 16, Redis 7) |

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
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

→ [http://localhost:3001](http://localhost:3001)

### 3. Client

```bash
cd client
# Créer .env.local (voir client/README.md)
npm install
npm run dev
```

→ [http://localhost:3000](http://localhost:3000)

## Fonctionnalités

- **Tâches** — CRUD avec statut, priorité, catégorie et dates
- **Catégories** — work, personal, shopping, health, finance, education, other
- **Dashboard** — graphiques (donut, barres, courbes, aires), calendrier, filtres
- **Notifications** — envoi asynchrone par email (Resend), SMS et WhatsApp (Twilio)
- **Auth** — pages connexion, inscription, mot de passe oublié (UI en place)

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
