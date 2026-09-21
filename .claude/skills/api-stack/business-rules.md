# Règles métier — api My-daily-page

L'API est la **source de vérité**. Le client (Zod / NextAuth) reflète ces règles ; il ne les remplace pas.

## Acteurs

| Acteur | Peut | Ne peut pas |
|--------|------|-------------|
| Anonyme | `POST /auth/register`, `POST /auth/login` | Lire / muter tâches, catégories, users |
| Utilisateur JWT | CRUD **ses** ressources, préférences notif | Accéder aux données d'un autre `userId` |
| Providers (Resend/Twilio) | Envoyer un message via la queue | Être appelés depuis un controller |

## Authentification

- Email **unique**, format email. Mot de passe **≥ 8**, stocké **hashé** (bcrypt).
- JWT signé (`JWT_SECRET`), payload `{ sub: userId, email }`. Expiration raisonnable (ex. 7j).
- Téléphone / WhatsApp optionnels ; **obligatoires** si le user active le canal SMS / WhatsApp.
- Timezone par défaut : `Europe/Paris`.
- 401 si token absent, expiré ou invalide. 403 si ressource d'un autre user (préférer 404 pour ne pas fuiter l'existence).
- Login : email inconnu ou mauvais mot de passe → `UnauthorizedException` (même message, pas d'énumération).
- Register : email déjà pris → `ConflictException`.
- Réponses user : jamais `password`.

## Isolation

Toute requête authentifiée filtre par `user.id` du JWT.

- `GET /tasks` → `where: { userId: currentUser.id }` — **interdit** de lister sans filtre.
- `GET /tasks/:id` : 404 si `task.userId !== currentUser.id`.
- Idem catégories, rappels (via la tâche parente), notifications.
- Interdit d'accepter `userId` dans le DTO / query pour « choisir » le propriétaire.

## Tâches

### Cycle de vie

```
todo → in-process → done → archived
         ↑              │
         └──────────────┘  (réouverture autorisée)
```

| API (enum persisté) | JSON client |
|---------------------|-------------|
| `TODO` | `todo` |
| `IN_PROGRESS` | `in-process` |
| `DONE` | `done` |
| `ARCHIVED` | `archived` |

Le mapper (`task.mapper.ts`) convertit à la frontière HTTP. Refuser `"complete"`.

### Invariants

1. **Titre** obligatoire, non vide après trim.
2. **Propriétaire** = user JWT à la création (ignorer / interdire `userId` body).
3. Défauts : `status = TODO`, `priority = MEDIUM`.
4. Priorités : `LOW` | `MEDIUM` | `HIGH` | `URGENT` (JSON : `low`…`urgent` via `@Transform`).
5. `categoryId` optionnel ; si présent, la catégorie **existe et appartient** au même user sinon 404.
6. `deadline` optionnelle (ISO). `recurrence` optionnelle (string opaque).
7. Suppression user → cascade tasks / categories / reminders.
8. Suppression catégorie → `categoryId` des tâches à `null` (`onDelete: SET NULL`).
9. Archivée : toujours persistée ; le client la masque des KPI — l'API la renvoie sauf filtre `status`.

## Catégories

- Unique `(userId, name)`. Doublon → `ConflictException`.
- `name` et `color` obligatoires ; `icon` optionnel.
- CRUD uniquement sur les catégories du JWT.

## Rappels et notifications

- Rappel = `triggerAt` + `channel` (`EMAIL` | `SMS` | `WHATSAPP`). JSON : `email` | `sms` | `whatsapp`.
- `triggerAt` dans le futur pour un rappel planifié. Envoi immédiat : `triggerAt` maintenant + job queue.
- Canal **enabled** dans `NotificationPreference` du user. Sinon `BadRequestException`.
- SMS / WhatsApp : `phoneNumber` / `whatsappNumber` renseignés, sinon 400.
- Statuts rappel : `PENDING` → `SENT` | `FAILED` (processor uniquement).
- `POST /notifications/send` : la tâche doit appartenir au JWT. Body : canal, destinataire, body, subject optionnel.
- Jamais d'envoi dans le cycle HTTP synchrone.

## Users

- `GET /users/me` / `PATCH /users/me` seulement (pas de listing global).
- Patch : email unique, password re-hashé si fourni, pas de changement d'`id`.

## Erreurs HTTP

| Cas | Code |
|-----|------|
| Token manquant / invalide | 401 |
| Ressource absente ou d'un autre user | 404 |
| DTO invalide / canal non activé | 400 |
| Email déjà utilisé / nom de catégorie dupliqué | 409 |
| ValidationPipe whitelist | 400 |
