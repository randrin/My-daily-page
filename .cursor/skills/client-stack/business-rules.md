# Règles métier — client My-daily-page

Le client applique ces règles **avant** d'appeler l'API. L'API reste la source de vérité (isolation par `userId`, validation serveur).

## Acteurs

| Acteur | Peut | Ne peut pas |
|--------|------|-------------|
| Visiteur | Voir `/`, s'inscrire, se connecter, reset mot de passe | Voir le dashboard, CRUD tâches |
| Utilisateur authentifié | Gérer **ses** tâches, catégories, préférences de notif | Voir / modifier les données d'un autre user |
| Client frontend | Valider, afficher, muter via API | Envoyer email / SMS / WhatsApp |

## Authentification

- Email unique, format email. Mot de passe **≥ 8** caractères.
- Téléphone / WhatsApp optionnels (requis seulement si le user active le canal correspondant).
- Timezone par défaut : `Europe/Paris`.
- Session NextAuth v5 obligatoire pour `/dashboard` et toute mutation.
- Déconnexion : `signOut` + `queryClient.clear()`.
- Google : bouton UI existant — brancher uniquement via provider NextAuth, pas un OAuth ad hoc.

## Tâches

### Cycle de vie

```
todo → in-process → done → archived
         ↑              │
         └──────────────┘  (réouverture : done | archived → todo ou in-process)
```

| Statut client | Enum API | Signification |
|---------------|------------|---------------|
| `todo` | `TODO` | À faire |
| `in-process` | `IN_PROGRESS` | En cours |
| `done` | `DONE` | Terminée |
| `archived` | `ARCHIVED` | Archivée, hors listes actives |

Ne plus utiliser `"complete"` (dette client). Le mapper API n'accepte pas `complete`.

### Invariants

1. **Titre** obligatoire après `trim()`. Description optionnelle.
2. **Propriétaire** = `session.user.id`. Ne jamais envoyer un `userId` saisi dans le formulaire.
3. **Statut** par défaut : `todo`. **Priorité** par défaut : `medium`.
4. **Priorités** : `low` | `medium` | `high` | `urgent` (API : `LOW`…`URGENT` — Axios/schema gèrent le mapping).
5. **Catégorie** optionnelle ; si présente, `categoryId` UUID d'une catégorie **du même user**.
6. **Deadline** optionnelle. Si `toDoBefore` existe encore dans l'UI, `toDoBefore ≤ deadline`.
7. Passage à `done` : poser `completedAt` (côté UI) ; réouverture : le retirer.
8. Une tâche archivée n'apparaît pas dans les compteurs / charts « actifs » du dashboard (filtre `status !== "archived"`), sauf vue « archives ».
9. Récurrence optionnelle (string opaque pour l'instant — ne pas inventer un RRULE parser).
10. Isolation : le client n'affiche que les tâches renvoyées par l'API (déjà scoped user). Pas de filtre `userId` local « pour faire joli ».

### Champs cibles (alignés API)

```ts
type TaskStatus = "todo" | "in-process" | "done" | "archived";
type TaskPriority = "low" | "medium" | "high" | "urgent";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline?: Date;
  categoryId?: string;
  category?: Category;
  recurrence?: string;
  reminders?: Reminder[];
  createdAt: Date;
  updatedAt: Date;
}
```

`dueDate` UI = `deadline` API. Mapper dans `src/api/tasks.ts`, pas dans les composants.

## Catégories

- Appartiennent à l'utilisateur. Nom unique **par user** (contrainte API `@@unique([userId, name])`).
- `name` et `color` obligatoires ; `icon` optionnel.
- Suppression : les tâches liées passent `categoryId` à `null` (SetNull) — l'UI doit rester valide sans catégorie.
- **Ne plus** étendre l'enum hardcodé `work | personal | shopping | …`. Lister via `useCategories()`.
- Seed / empty state : proposer des catégories initiales **via l'API**, pas via un union TypeScript figé.

## Rappels et notifications

- Un rappel = `triggerAt` (ISO, **futur**) + `channel` : `email` | `sms` | `whatsapp`.
- Canal autorisé seulement s'il est **enabled** dans les préférences user.
- SMS / WhatsApp : le user doit avoir `phoneNumber` / `whatsappNumber`.
- Le client **crée** le rappel (POST tâche / notifications). L'envoi réel = BullMQ côté API.
- Statuts rappel (lecture seule) : `pending` | `sent` | `failed`.

## Dashboard

- KPI et charts = agrégats des tâches **non archivées** de l'utilisateur.
- Filtres (Zustand) : statut, priorité, catégorie, recherche titre, plage de dates (`deadline` | `createdAt`).
- Création / édition : Sheet shadcn, validation Zod, puis mutation Query.
- Feedback : toast sonner (succès / erreur API). Pas d'`alert()`.

## Formulaires auth

| Formulaire | Règles Zod |
|------------|------------|
| Sign in | email + password non vides |
| Sign up | email, password ≥ 8, confirmation identique |
| Forgot | email valide |
| Reset | password ≥ 8 + confirmation |

## Erreurs UX

- 401 → `signOut` + redirect `/auth/signin`.
- 403 / 404 ressource → toast + ne pas crasher la page.
- Erreur réseau Query → état `isError` visible (pas un spinner infini).
