# My-daily-page — API

Backend REST de l'application **My-daily-page**, construit avec NestJS. Il gère les tâches, les catégories et l'envoi de notifications asynchrones (email, SMS, WhatsApp).

## Stack

| Technologie | Rôle |
|-------------|------|
| [NestJS 11](https://nestjs.com/) | Framework API |
| [Prisma](https://www.prisma.io/) | ORM |
| [PostgreSQL](https://www.postgresql.org/) | Base de données |
| [BullMQ](https://docs.bullmq.io/) + [Redis](https://redis.io/) | File d'attente pour les notifications |
| [Resend](https://resend.com/) | Envoi d'emails |
| [Twilio](https://www.twilio.com/) | SMS et WhatsApp |
| [class-validator](https://github.com/typestack/class-validator) | Validation des DTOs |

## Prérequis

- Node.js 20+ (`.nvmrc` fourni)
- Docker & Docker Compose (PostgreSQL + Redis)
- Comptes Resend et Twilio (optionnels en dev, requis pour l'envoi réel)

## Démarrage rapide

### 1. Infrastructure

Depuis la racine du monorepo :

```bash
docker compose up -d
```

Cela démarre :
- **PostgreSQL** sur le port `5432` (base `my_daily_page`)
- **Redis** sur le port `6379`

### 2. Configuration

```bash
cd api
cp .env.example .env
```

Variables d'environnement :

| Variable | Description | Défaut |
|----------|-------------|--------|
| `PORT` | Port du serveur | `3001` |
| `NODE_ENV` | Environnement | `development` |
| `DATABASE_URL` | URL PostgreSQL | voir `.env.example` |
| `REDIS_HOST` | Hôte Redis | `localhost` |
| `REDIS_PORT` | Port Redis | `6379` |
| `RESEND_API_KEY` | Clé API Resend | — |
| `RESEND_FROM_EMAIL` | Email expéditeur | `onboarding@resend.dev` |
| `TWILIO_ACCOUNT_SID` | SID compte Twilio | — |
| `TWILIO_AUTH_TOKEN` | Token Twilio | — |
| `TWILIO_PHONE_NUMBER` | Numéro SMS | — |
| `TWILIO_WHATSAPP_NUMBER` | Numéro WhatsApp | `whatsapp:+14155238886` |

### 3. Installation et base de données

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 4. Lancer l'API

```bash
# Développement (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
```

L'API est disponible sur [http://localhost:3001](http://localhost:3001).

## Architecture

Chaque feature suit le pattern **Module / Controller / Service** :

```
src/
├── models/                    # Entités domaine (miroir Prisma)
│   ├── user.entity.ts
│   ├── category.entity.ts
│   ├── task.entity.ts
│   ├── reminder.entity.ts
│   ├── notification-preference.entity.ts
│   ├── enums.ts
│   └── index.ts
├── modules/
│   ├── users/                 # CRUD utilisateurs
│   ├── tasks/                 # CRUD tâches + reminders
│   ├── categories/
│   ├── notifications/
│   ├── prisma/
│   └── queue/
├── config/
├── main.ts
└── app.module.ts
```

### Modèles (2 niveaux)

| Niveau | Emplacement | Rôle |
|--------|-------------|------|
| **Schéma DB** | `prisma/schema.prisma` | Source de vérité PostgreSQL (génère `@prisma/client`) |
| **Entités domaine** | `src/models/*.entity.ts` | Classes TypeScript avec `fromPrisma()` pour les services |

```typescript
import { TaskEntity } from '@models/task.entity';

const task = await prisma.task.findFirst({ include: { reminders: true } });
return TaskEntity.fromPrisma(task);
```

### Conventions

- **Controller** — routes HTTP uniquement, délègue au service
- **Service** — logique métier, accès DB via `PrismaService`
- **DTO** — validation des entrées avec `class-validator`
- **Providers** — intégrations externes (Resend, Twilio) isolées dans `notifications/providers/`

## Endpoints

### Utilisateurs — `/users`

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/users` | Liste les utilisateurs |
| `GET` | `/users/:id` | Détail (sans mot de passe) |
| `POST` | `/users` | Créer un utilisateur |
| `PATCH` | `/users/:id` | Mettre à jour |
| `DELETE` | `/users/:id` | Supprimer |

### Tâches — `/tasks`

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/tasks` | Liste toutes les tâches |
| `GET` | `/tasks/:id` | Détail d'une tâche |
| `POST` | `/tasks` | Créer une tâche |
| `PATCH` | `/tasks/:id` | Mettre à jour une tâche |
| `DELETE` | `/tasks/:id` | Supprimer une tâche |

**Corps de création (exemple) :**

```json
{
  "userId": "uuid-utilisateur",
  "title": "Préparer la réunion",
  "description": "Slides et ordre du jour",
  "status": "todo",
  "priority": "high",
  "categoryId": "uuid-categorie",
  "deadline": "2026-07-15T10:00:00.000Z"
}
```

**Valeurs possibles :**
- `status` : `todo`, `in-process`, `in-progress`, `done`, `archived`
- `priority` : `low`, `medium`, `high`, `urgent`
- `channel` : `email`, `sms`, `whatsapp`

> L'API accepte les valeurs client-friendly en minuscules et les mappe vers les enums Prisma en majuscules.

### Catégories — `/categories`

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/categories` | Liste les catégories |
| `GET` | `/categories/:id` | Détail d'une catégorie |
| `POST` | `/categories` | Créer une catégorie |
| `PATCH` | `/categories/:id` | Mettre à jour |
| `DELETE` | `/categories/:id` | Supprimer |

### Notifications — `/notifications`

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/notifications` | Historique des notifications |
| `GET` | `/notifications/:id` | Détail d'une notification |
| `POST` | `/notifications/send` | Envoyer une notification |

**Corps d'envoi (exemple) :**

```json
{
  "taskId": "uuid-tache",
  "channel": "email",
  "recipient": "user@example.com",
  "subject": "Rappel de tâche",
  "body": "Votre tâche arrive à échéance demain."
}
```

**Canaux :** `email`, `sms`, `whatsapp`

### Flux des notifications

```
POST /notifications/send
       │
       ▼
  Enregistrement en DB (status: pending)
       │
       ▼
  Job ajouté à la queue BullMQ (status: queued)
       │
       ▼
  NotificationProcessor
       │
       ├── email    → EmailProvider (Resend)
       ├── sms      → SmsProvider (Twilio)
       └── whatsapp → WhatsappProvider (Twilio)
       │
       ▼
  Mise à jour DB (status: sent | failed)
```

## Modèle de données (Prisma)

Schéma : `prisma/schema.prisma`

| Modèle | Description |
|--------|-------------|
| `Task` | Tâches avec statut, priorité, catégorie, dates |
| `Category` | Catégories de tâches |
| `Notification` | Historique et statut des envois |

## Scripts npm

| Commande | Description |
|----------|-------------|
| `npm run start:dev` | Développement avec rechargement |
| `npm run build` | Compilation TypeScript |
| `npm run start:prod` | Lancer la version compilée |
| `npm run lint` | ESLint |
| `npm run test` | Tests unitaires |
| `npm run test:e2e` | Tests end-to-end |
| `npm run prisma:generate` | Générer le client Prisma |
| `npm run prisma:migrate` | Appliquer les migrations |
| `npm run prisma:seed` | Peupler la base |
| `npm run prisma:studio` | Interface graphique Prisma |

## Docker

Un `Dockerfile` est fourni pour le déploiement. Il exécute `prisma generate` avant le build et expose le port `3001`.

```bash
docker build -t my-daily-page-api .
docker run -p 3001:3001 --env-file .env my-daily-page-api
```

## Agents IA

Des skills et règles sont configurés pour guider les assistants (Cursor, Claude, Gemini) :

- `api/AGENTS.md` — Cursor
- `api/CLAUDE.md` — Claude
- `api/GEMINI.md` — Gemini
- `.cursor/skills/api-stack/SKILL.md` — skill détaillé

## Dépannage

**Erreur `EACCES` sur `npm install`**

```bash
sudo chown -R $(whoami) node_modules
rm -rf node_modules && npm install
```

**Connexion PostgreSQL refusée**

Vérifier que Docker est lancé : `docker compose ps`

**Notifications non envoyées**

Vérifier que Redis tourne et que les clés Resend/Twilio sont renseignées dans `.env`.
