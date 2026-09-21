# Architecture cible — api/

Backend My-daily-page : NestJS, TypeORM sur PostgreSQL, auth JWT. Aligné sur le client (`client/`).

## Couches

```
HTTP (controller + JWT guard)
        → service (règles métier)
            → TypeORM Repository
                → PostgreSQL
        → BullMQ (notifications)
            → Resend / Twilio
```

| Couche | Dossier | Interdit d'y mettre |
|--------|---------|---------------------|
| Bootstrap | `main.ts`, `app.module.ts` | Métier |
| HTTP | `modules/*/ *.controller.ts` | `Repository`, requêtes SQL |
| Auth | `modules/auth/` | Entités métier hors User |
| Métier | `modules/*/ *.service.ts` | `Resend` / `Twilio` directs |
| Persistance | `entities/` + `database/` | HTTP, JWT sign |
| Validation | `modules/*/dto/` | Accès DB |
| Queue | `modules/queue/`, `notifications/processors/` | Controllers |

## Arborescence cible

```
api/
├── src/
│   ├── main.ts                      # CORS + ValidationPipe + Swagger /docs
│   ├── docs/swagger.ts              # OpenAPI DocumentBuilder
│   ├── app.module.ts
│   ├── config/configuration.ts
│   ├── database/
│   │   ├── data-source.ts           # DataSource TypeORM (CLI migrations)
│   │   └── database.module.ts       # TypeOrmModule.forRootAsync
│   ├── common/
│   │   ├── decorators/current-user.decorator.ts
│   │   ├── guards/jwt-auth.guard.ts
│   │   └── interceptors/            # optionnel : ClassSerializerInterceptor
│   ├── entities/
│   │   ├── user.entity.ts
│   │   ├── category.entity.ts
│   │   ├── task.entity.ts
│   │   ├── reminder.entity.ts
│   │   └── notification-preference.entity.ts
│   └── modules/
│       ├── auth/                    # register, login, JwtStrategy
│       ├── users/
│       ├── tasks/                   # + task.mapper.ts (statuts client)
│       ├── categories/
│       ├── notifications/
│       │   ├── processors/
│       │   └── providers/           # email, sms, whatsapp
│       └── queue/
├── test/                            # e2e Jest + supertest
└── .env.example
```

Alias : `@modules/*`, `@entities/*`, `@config/*`, `@common/*`.

## Auth JWT

1. `POST /auth/register` — crée le user (password hashé), retourne `{ access_token, user }`.
2. `POST /auth/login` — vérifie email/password, signe un JWT (`sub` = user id, `email`).
3. `GET /auth/me` — guard JWT, profil sans password.
4. Stratégie `passport-jwt` : header `Authorization: Bearer <token>`.
5. Toutes les routes `tasks`, `categories`, `notifications`, `users` (hors register) : `@UseGuards(JwtAuthGuard)`.
6. `@CurrentUser()` injecte `{ id, email }` dans controllers / services.

NextAuth côté client consomme `login` / `register` (Credentials). L'API ne gère pas les cookies NextAuth.

## TypeORM

- Driver `postgres`, entités décorées (`@Entity`, `@Column`, `@ManyToOne`, …).
- UUID en PK (`@PrimaryGeneratedColumn('uuid')`).
- `synchronize: false` hors local throwaway — **migrations** pour tout changement de schéma.
- `TypeOrmModule.forFeature([Task, Category, …])` dans chaque feature module.
- Injection : `@InjectRepository(Task) private readonly tasks: Repository<Task>`.

## Validation

`ValidationPipe` global déjà en place. DTOs :

- `class-validator` : `@IsEmail`, `@IsNotEmpty`, `@IsEnum`, `@IsUUID`, …
- `class-transformer` : `@Transform`, `@Exclude` (password), `@Type(() => NestedDto)`
- `UpdateXDto` = `PartialType(CreateXDto)` (`@nestjs/swagger`)

## Swagger

UI : `GET /docs`. Schéma : `GET /docs-json`. Bearer JWT nommé `JWT` (Authorize). Routes protégées : `@ApiJwtAuth()`.

## Notifications

1. Service crée un `Reminder` (`status: pending`) + job BullMQ.
2. `NotificationProcessor` consomme la queue.
3. Providers uniquement : `EmailProvider` (Resend), `SmsProvider`, `WhatsappProvider` (Twilio).
4. Mise à jour `sent` / `failed` sur le reminder.

## Dette à ne pas étendre

| Actuel | Cible |
|--------|--------|
| `userId` query/body | JWT `sub` |
| `GET /users` liste tout le monde | `GET /users/me` (soi-même) |

Quand tu touches ces fichiers, migrer vers la cible plutôt qu'ajouter un `userId` client.

## Endpoints cibles

| Module | Routes |
|--------|--------|
| auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| users | `GET/PATCH /users/me` |
| tasks | `GET/POST /tasks`, `GET/PATCH/DELETE /tasks/:id`, rappels nested |
| categories | `GET/POST /categories`, `GET/PATCH/DELETE /categories/:id` |
| notifications | `GET /notifications`, `POST /notifications/send` |
