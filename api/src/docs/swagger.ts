import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const SWAGGER_PATH = 'docs';
export const JWT_AUTH_NAME = 'JWT';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('My Daily Page API')
    .setDescription(
      [
        'API REST de **My Daily Page** : tâches quotidiennes, catégories et notifications (email, SMS, WhatsApp).',
        '',
        '## Authentification',
        '1. Appeler `POST /auth/register` ou `POST /auth/login`.',
        '2. Copier `access_token` dans la réponse (Authorize, sans `Bearer`).',
        '3. Quand il expire, `POST /auth/refresh` avec `refresh_token` (rotation).',
        '',
        'Les routes protégées exigent `Authorization: Bearer <token>`.',
        '`userId` est lu depuis le JWT (`sub`), jamais depuis le body ou la query.',
        '`PATCH /auth/me` met à jour email / téléphones / fuseau. `POST /auth/change-password` exige le mot de passe actuel.',
        '',
        '## Statuts des tâches',
        'Réponses : `todo` · `in-process` · `blocked` · `done` · `archived`.',
        'Entrées aussi acceptées : `TODO`, `IN_PROGRESS`, `BLOCKED`, `in-progress`.',
        'Une tâche `blocked` doit lister `blockerIds` (tâches filles). Elle ne peut passer à `done` / `archived` tant qu’une fille n’est pas `done` ou `archived`.',
        '',
        '## Images',
        'Upload optionnel : `POST /files` (multipart, `kind=task-image`) puis `imageUrl` sur `POST /tasks` / `PATCH /tasks/:id`. Stockage MinIO, isolé par utilisateur.',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'JWT obtenu via POST /auth/login ou POST /auth/register. Coller uniquement le token.',
        in: 'header',
      },
      JWT_AUTH_NAME,
    )
    .addTag('auth', 'Inscription, connexion et profil')
    .addTag('categories', 'Catégories de tâches (isolées par utilisateur)')
    .addTag('tasks', 'Tâches et rappels')
    .addTag('files', 'Upload d’images de tâches (MinIO)')
    .addTag('notifications', 'Historique et envoi asynchrone')
    .addTag(
      'notification-preferences',
      'Préférences de canaux (isolées par utilisateur)',
    )
    .addTag('users', 'CRUD utilisateurs (legacy, non protégé par JWT)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    customSiteTitle: 'My Daily Page — API docs',
    jsonDocumentUrl: 'docs-json',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
  });
}
