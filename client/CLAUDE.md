
 CLAUDE.md — Claude Code

Instructions pour Claude travaillant sur le **client** My-daily-page.

## Contexte

Frontend de gestion de tâches. Dossier racine du client : `client/`.

## Technologies

| Outil | Usage |
|-------|-------|
| React 19 | UI composants fonctionnels |
| Next.js 16 | Pages Router — `src/pages/` |
| TypeScript | Typage strict |
| Tailwind CSS v4 | Styles utilitaires |
| shadcn/ui | Composants UI (Radix) |
| TanStack Query | État serveur, cache API |
| axios | Requêtes HTTP |

## Architecture

- **Routing** : Pages Router uniquement (`_app.tsx`, `pages/dashboard/`, `pages/auth/`).
- **Layouts** : `DashboardLayout`, `AuthLayout`, `SidebarLayout`.
- **Providers** : `ThemeProvider`, `TooltipProvider`, `QueryClientProvider`, `Toaster`.
- **Features** : tasks (list, form, calendar, table), charts, notifications, auth forms.
- **Données** : types `Task` dans `src/types/task.ts`, mocks dans `src/mocks/`.

## Principes

1. **Minimal scope** — changement le plus petit qui résout le problème.
2. **Conventions existantes** — lire le code environnant avant d'écrire.
3. **shadcn first** — Button, Card, Sheet, Select, Input déjà disponibles.
4. **Hydratation** — initialiser dates/état client dans `useEffect`, pas dans `useState(new Date())`.
5. **TanStack Query** — `useQuery` / `useMutation` / `useQueryClient`, clés stables.
6. **Pas de `any`** — typer props, réponses API, handlers.

## Patterns TanStack Query

```typescript
// src/hooks/use-tasks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasksApi.getAll(),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}
```

## Patterns React

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function Example({ className }: { className?: string }) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Titre</CardTitle>
      </CardHeader>
      <CardContent>{/* ... */}</CardContent>
    </Card>
  );
}
```

## Tailwind / thème

- Tokens : `bg-background`, `text-foreground`, `text-muted-foreground`, `border`, `primary`.
- Dark mode via classe `.dark` (next-themes).
- Charts : `var(--chart-1)` à `var(--chart-5)`.

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `src/pages/_app.tsx` | Root app + Providers |
| `src/components/providers/providers.tsx` | Providers globaux |
| `components.json` | Config shadcn |
| `src/styles/globals.css` | Tailwind + variables |
| `src/types/task.ts` | Types métier |
| `src/utils/task-utils.ts` | Labels & helpers |

## Skill Claude

Référence complète : `.claude/skills/client-stack/SKILL.md`

## Commandes

```bash
cd client && npm run dev
cd client && npm run build
cd client && npm run lint
```
