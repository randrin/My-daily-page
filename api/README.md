# My-daily-page — API

Backend REST de l'application **My-daily-page**, construit avec NestJS. Il gère l'authentification JWT, les tâches, les catégories et l'envoi de notifications asynchrones (email, SMS, WhatsApp).

**Documentation interactive :** [http://localhost:3001/docs](http://localhost:3001/docs) (Swagger UI)  
**Schéma OpenAPI :** [http://localhost:3001/docs-json](http://localhost:3001/docs-json)

## Stack

| Technologie | Rôle |
|-------------|------|
| [NestJS 11](https://nestjs.com/) | Framework API |
| [TypeORM](https://typeorm.io/) | ORM PostgreSQL |
| [PostgreSQL](https://www.postgresql.org/) | Base de données |
| [JWT](https://jwt.io/) + Passport | Authentification (`Authorization: Bearer`) |
| [BullMQ](https://docs.bullmq.io/) + [Redis](https://redis.io/) | File d'attente pour les notifications |
| [Resend](https://resend.com/) | Envoi d'emails |
| [Twilio](https://www.twilio.com/) | SMS et WhatsApp |
| [class-validator](https://github.com/typestack/class-validator) | Validation des DTOs |
| [@nestjs/swagger](https://docs.nestjs.com/openapi/introduction) | OpenAPI / Swagger UI |

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
| `JWT_SECRET` | Secret de signature JWT | `change-me-in-production` |
| `JWT_EXPIRES_IN` | Durée de vie du token | `7d` |
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
npm run migration:run
npm run seed
```

### 4. Lancer l'API

```bash
# Développement (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
```

| URL | Usage |
|-----|--------|
| [http://localhost:3001](http://localhost:3001) | API REST |
| [http://localhost:3001/docs](http://localhost:3001/docs) | Swagger UI |
| [http://localhost:3001/docs-json](http://localhost:3001/docs-json) | OpenAPI JSON |

## Documentation API (Swagger)

Swagger est la **source de vérité** des contrats HTTP (schémas, exemples, codes d'erreur).

### Tester une route protégée

1. Ouvrir [http://localhost:3001/docs](http://localhost:3001/docs).
2. Exécuter `POST /auth/register` ou `POST /auth/login`.
3. Copier `access_token` dans la réponse.
4. Cliquer **Authorize**, coller le token **sans** le préfixe `Bearer`, valider.
5. Les cadenas des routes protégées envoient `Authorization: Bearer <token>`.

Le token reste en session navigateur (`persistAuthorization`). `userId` n'est jamais lu dans le body : il vient du JWT (`sub`).

Routes **publiques** : `POST /auth/register`, `POST /auth/login`.  
Routes **JWT** : `/auth/me`, `/categories`, `/tasks`, `/notifications`.  
`/users` est un CRUD legacy **non protégé** (à remplacer par `/users/me`).

## Architecture

Chaque feature suit le pattern **Module / Controller / Service** :

```
src/
├── entities/                  # Entités TypeORM
├── database/                  # DataSource, migrations, seed
├── common/                    # JwtAuthGuard, @CurrentUser, @ApiJwtAuth
├── docs/                      # Swagger (OpenAPI)
├── modules/
│   ├── auth/                  # JWT register / login / me
│   ├── users/
│   ├── tasks/
│   ├── categories/
│   ├── notifications/
│   └── queue/
├── config/
├── main.ts                    # CORS, ValidationPipe, Swagger /docs
└── app.module.ts
```

### Couches

| Couche | Outil | Rôle |
|--------|-------|------|
| HTTP | NestJS controllers | Routes, status codes, décorateurs Swagger |
| Auth | JWT (`@nestjs/jwt` + Passport) | Login, guards, `req.user` |
| Validation | class-validator + class-transformer | DTOs + `ValidationPipe` |
| Métier | Services | Invariants, isolation user |
| Persistance | TypeORM + PostgreSQL | Entités, repos, migrations |
| Async | BullMQ | Envoi notifications |
| Docs | `@nestjs/swagger` | UI `/docs` |

### Conventions

- **Controller** — routes HTTP + JWT, délègue au service
- **Service** — logique métier, accès DB via `Repository` TypeORM
- **DTO** — validation des entrées avec `class-validator` ; `PartialType` / `OmitType` depuis `@nestjs/swagger`
- **Providers** — intégrations externes (Resend, Twilio) isolées dans `notifications/providers/`

## Authentification JWT

```
POST /auth/register  ou  POST /auth/login
        │
        ▼
{ access_token, user }     # user sans mot de passe
        │
        ▼
Authorization: Bearer <access_token>
        │
        ▼
JwtAuthGuard  →  payload.sub = userId
```

- Mot de passe hashé (bcrypt), jamais renvoyé.
- Isolation : une requête ne voit que les ressources du token.
- Durée : `JWT_EXPIRES_IN` (défaut `7d`).

## Endpoints

Détail et essai interactif : [Swagger](http://localhost:3001/docs).

### Auth — `/auth`

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/auth/register` | public | Créer un compte, retourne un JWT |
| `POST` | `/auth/login` | public | Connexion, retourne un JWT |
| `GET` | `/auth/me` | JWT | Profil de l'utilisateur connecté |

### Catégories — `/categories`

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `GET` | `/categories` | JWT | Liste les catégories de l'utilisateur |
| `GET` | `/categories/:id` | JWT | Détail d'une catégorie |
| `POST` | `/categories` | JWT | Créer une catégorie |
| `PATCH` | `/categories/:id` | JWT | Mettre à jour |
| `DELETE` | `/categories/:id` | JWT | Supprimer |

### Tâches — `/tasks`

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `GET` | `/tasks` | JWT | Liste les tâches de l'utilisateur |
| `GET` | `/tasks/:id` | JWT | Détail d'une tâche |
| `POST` | `/tasks` | JWT | Créer une tâche |
| `PATCH` | `/tasks/:id` | JWT | Mettre à jour une tâche |
| `DELETE` | `/tasks/:id` | JWT | Supprimer une tâche |
| `POST` | `/tasks/:id/reminders` | JWT | Ajouter un rappel |
| `PATCH` | `/tasks/:id/reminders/:reminderId` | JWT | Mettre à jour un rappel |
| `DELETE` | `/tasks/:id/reminders/:reminderId` | JWT | Supprimer un rappel |

**Corps de création (exemple) :**

```json
{
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

> L'API accepte les valeurs client-friendly en minuscules et les mappe vers les enums TypeORM en majuscules. Les réponses tâches utilisent toujours `todo` / `in-process` / `done` / `archived`.

### Notifications — `/notifications`

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `GET` | `/notifications` | JWT | Historique (`?taskId=` optionnel) |
| `GET` | `/notifications/:id` | JWT | Détail d'une notification |
| `POST` | `/notifications/send` | JWT | Enqueue une notification (BullMQ) |

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

### Utilisateurs — `/users` (legacy)

CRUD non protégé. Préférer `POST /auth/register` et `GET /auth/me`. Cible : `GET/PATCH /users/me`.

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

## Modèle de données

Entités TypeORM : `src/entities/`

| Modèle | Description |
|--------|-------------|
| `User` | Compte (email unique, mot de passe hashé) |
| `Task` | Tâches avec statut, priorité, catégorie, dates |
| `Category` | Catégories de tâches (uniques par user) |
| `Reminder` | Rappels et statut des envois |
| `NotificationPreference` | Préférences de canaux |

## Scripts npm

| Commande | Description |
|----------|-------------|
| `npm run start:dev` | Développement avec rechargement |
| `npm run build` | Compilation TypeScript |
| `npm run start:prod` | Lancer la version compilée |
| `npm run lint` | ESLint |
| `npm run test` | Tests unitaires |
| `npm run test:e2e` | Tests end-to-end |
| `npm run migration:run` | Appliquer les migrations TypeORM |
| `npm run seed` | Peupler la base |

## Docker

Un `Dockerfile` est fourni pour le déploiement. Il compile l'API et expose le port `3001`.

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

**Swagger inaccessible**

L'API doit être démarrée (`npm run start:dev`). L'UI est sur `/docs`, pas à la racine.
