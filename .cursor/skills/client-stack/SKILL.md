---
name: client-stack
description: >-
  Guide le développement du client My-daily-page avec React 19, Next.js Pages
  Router, Tailwind CSS v4, shadcn/ui, TanStack Query et TypeScript. Utiliser
  pour toute tâche frontend dans client/ : composants, pages, hooks, API, styles,
  charts, formulaires ou intégration de données.
---

# Client Stack — My-daily-page

## Stack

| Technologie | Version / détail |
|-------------|------------------|
| React | 19 — composants fonctionnels, hooks |
| Next.js | 16 — **Pages Router** (`src/pages/`) |
| TypeScript | strict, types dans `src/types/` |
| Tailwind CSS | v4 — `@import "tailwindcss"` dans `globals.css` |
| shadcn/ui | style **new-york**, base **neutral**, Radix UI |
| TanStack Query | `@tanstack/react-query` — fetching, cache, mutations |
| HTTP | axios |
| Icons | lucide-react |
| Toasts | sonner |
| Thème | next-themes (light/dark) |

## Structure du projet (`client/`)

```
src/
├── components/
│   ├── ui/           # shadcn — ne pas modifier sans raison
│   ├── layout/       # dashboard, auth, sidebar, header
│   ├── tasks/        # task-list, task-form, task-calendar…
│   ├── charts/       # pie, bar, line, area, multi-line
│   ├── forms/        # login, signup…
│   └── providers/    # ThemeProvider, QueryClient, TooltipProvider
├── pages/            # routes Next.js (index, dashboard, auth/*)
├── types/            # Task, CategoryType…
├── utils/            # task-utils, notification-utils
├── mocks/            # données de test
├── context/          # React Context (ex. task-context)
├── hooks/            # custom hooks
├── lib/utils.ts      # cn() — clsx + tailwind-merge
└── styles/globals.css
```

## Alias de chemins

`@/components`, `@/ui`, `@/utils`, `@/lib`, `@/hooks`, `@/context`, `@/styles`

## Conventions React / Next.js

1. **`"use client"`** en tête des composants interactifs (état, effets, événements).
2. **Pages** dans `src/pages/` — `_app.tsx` enveloppe avec `<Providers>`.
3. **Pas d'App Router** — pas de `app/` directory.
4. **Hydratation** : éviter `new Date()`, `Math.random()`, `localStorage` au rendu initial ; utiliser `useEffect` + `isMounted`.
5. **Composants** : une responsabilité, props typées, réutiliser l'existant avant d'en créer.

## shadcn/ui

- Installer via CLI : `npx shadcn@latest add <component>` depuis `client/`.
- Composants dans `@/components/ui/`.
- Utiliser `cn()` pour les classes conditionnelles.
- Tokens CSS : `bg-background`, `text-foreground`, `text-muted-foreground`, `border`, `primary`, `chart-1`…
- Icônes : lucide-react, taille `h-4 w-4` par défaut.

## Tailwind CSS v4

- Config via `globals.css` (pas de `tailwind.config.js` classique).
- Variables CSS oklch dans `:root` et `.dark`.
- Préférer les utilitaires Tailwind aux styles inline.
- Responsive : `md:`, `lg:` — grille dashboard `md:grid-cols-2 lg:grid-cols-4`.

## TanStack Query

Provider dans `providers.tsx` :

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
});
```

Hooks dans `src/hooks/` ou `src/api/` :

```tsx
// Query
export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: () => api.getTasks(),
  });
}

// Mutation
export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}
```

- `queryKey` stable et hiérarchique : `["tasks"]`, `["tasks", id]`.
- Mutations → `invalidateQueries` ou `setQueryData` optimiste.
- États UI : `isLoading`, `isError`, `error` — jamais ignorer.

## Patterns du projet

- **Tasks** : types dans `src/types/task.ts` (`TaskStatus`, `TaskPriority`, `TaskCategory`).
- **Labels** : `taskStatusLabels`, `taskPriorityLabels` depuis `@/utils/task-utils`.
- **Mocks** : `src/mocks/tasks.mock.ts`, `categories.mock.ts`.
- **Layouts** : `DashboardLayout` (sidebar + header), `AuthLayout`.
- **Feedback** : `toast` de sonner pour succès/erreur.

## Checklist avant de livrer

- [ ] Types TypeScript complets, pas de `any`
- [ ] Pas d'erreur d'hydratation (dates/état client-only)
- [ ] Composants shadcn réutilisés quand possible
- [ ] Classes Tailwind cohérentes avec le thème
- [ ] TanStack Query pour les données serveur (pas de fetch brut dans useEffect)
- [ ] Diff minimal, conventions du fichier respectées

## Ressources

- Détails par techno : [reference.md](reference.md)
