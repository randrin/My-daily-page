# Architecture cible — client/

Frontend My-daily-page : Pages Router Next.js 16, couches séparées, aligné sur l'API NestJS (`api/`).

## Couches

```
pages/  →  components/  →  hooks (Query) + stores (Zustand)
                │                    │
                │                    ├── schemas/ (Zod)
                │                    └── auth/ (NextAuth session)
                ▼
              api/ (Axios)  →  NestJS :3001
```

| Couche | Dossier | Interdit d'y mettre |
|--------|---------|---------------------|
| Routing | `src/pages/` | Logique métier, appels HTTP |
| UI | `src/components/` | Axios, QueryClient, Zod parse |
| État UI | `src/stores/` | Données serveur (tâches, user API) |
| État serveur | `src/hooks/` | Filtres UI, open/close de sheets |
| HTTP | `src/api/` | JSX, stores |
| Validation | `src/schemas/` | Appels réseau |
| Auth | `src/auth/` | Composants visuels (sauf SessionProvider) |
| Types | `src/types/` | Logique — préférer `z.infer` |

## Arborescence cible

```
client/
├── e2e/                          # Playwright
│   ├── auth.spec.ts
│   └── dashboard.spec.ts
├── tests/                        # Vitest (colocaliser aussi à côté du fichier testé)
│   ├── schemas/
│   └── stores/
├── playwright.config.ts
├── vitest.config.ts
└── src/
    ├── pages/
    │   ├── _app.tsx              # SessionProvider + Providers
    │   ├── api/auth/[...nextauth].ts
    │   ├── index.tsx
    │   ├── dashboard/
    │   └── auth/                 # signin, signup, forgot, reset
    ├── auth/
    │   ├── auth.ts               # NextAuth v5 (providers, callbacks)
    │   └── guards.ts             # requireSession côté page
    ├── api/
    │   ├── client.ts             # Axios + interceptor Bearer
    │   ├── tasks.ts
    │   ├── categories.ts
    │   └── users.ts
    ├── schemas/
    │   ├── auth.schema.ts
    │   ├── task.schema.ts
    │   └── category.schema.ts
    ├── stores/
    │   ├── ui.store.ts           # sidebar, theme extras
    │   └── dashboard.store.ts    # filtres, sheet tâche, sélection
    ├── hooks/
    │   ├── use-tasks.ts
    │   ├── use-categories.ts
    │   └── use-auth.ts
    ├── components/
    │   ├── ui/                   # shadcn — ne pas forker
    │   ├── layout/               # DashboardLayout, AuthLayout
    │   ├── providers/            # Query, Theme, Tooltip
    │   ├── tasks/
    │   ├── charts/
    │   ├── forms/
    │   └── notifications/
    ├── types/                    # z.infer + types API partagés
    ├── lib/                      # cn(), query-client
    ├── utils/
    ├── config/
    └── styles/globals.css
```

## Flux de données

1. **Lecture** — page/composant appelle `useTasks()` → Query → `tasksApi` → Axios → API. Affichage via `isLoading` / `isError` / `data`.
2. **Écriture** — formulaire → Zod `safeParse` → `useCreateTask().mutate` → invalidation `taskKeys`. Toast succès/erreur.
3. **UI** — ouverture du sheet, filtres, tâche sélectionnée → `dashboard.store` (Zustand).
4. **Auth** — NextAuth session → interceptor Axios (`Authorization: Bearer <token>`). Pages dashboard : redirection `/auth/signin` si non authentifié.
5. **Filtres** — Zustand filtre la liste **déjà en cache** Query, ou passe des params au `queryKey` si filtrage serveur.

## Auth (NextAuth v5)

- Config dans `src/auth/auth.ts` (Credentials + Google si activé).
- Route catch-all : `src/pages/api/auth/[...nextauth].ts`.
- `_app.tsx` enveloppe avec `SessionProvider`.
- Session JWT ; le `user.id` alimente l'API (jamais un `userId` saisi).
- Pages publiques : `/`, `/auth/*`. Pages protégées : `/dashboard` et mutations.

## Providers (`_app.tsx`)

Ordre : `SessionProvider` → `QueryClientProvider` → `ThemeProvider` → `TooltipProvider` → `Toaster`.

Pas de `TaskProvider` Context.

## Dette à ne pas étendre

| Actuel | Cible |
|--------|--------|
| `context/task-context.tsx` + `localStorage` | Query + API |
| Dashboard `useState` + `tasksMock` | `useTasks()` |
| Catégories enum hardcodées | `useCategories()` (API, par user) |
| Statut `"complete"` | `"done"` / `"archived"` |
| Formulaires sans Zod | `src/schemas/` |
| Auth UI sans session | NextAuth v5 |

Quand tu touches ces fichiers, migrer vers la cible plutôt qu'ajouter du Context / mock / `complete`.

## Alias

`@/components`, `@/ui`, `@/stores`, `@/hooks`, `@/api`, `@/schemas`, `@/auth`, `@/lib`, `@/utils`, `@/types`, `@/styles`
