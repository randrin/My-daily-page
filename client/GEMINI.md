# GEMINI.md — Google Gemini (client)

Instructions pour Gemini travaillant sur le **client** My-daily-page.

> Contexte global : `../GEMINI.md` et `../.gemini/GEMINI.md`
> Skill : `../.gemini/skills/client-stack/SKILL.md`

## Projet

Application web de gestion de tâches. Code frontend dans `client/`.

## Stack

- React 19
- Next.js 16 (Pages Router — `src/pages/`)
- TypeScript
- Tailwind CSS v4
- shadcn/ui (new-york, neutral)
- TanStack Query (`@tanstack/react-query`)
- axios, lucide-react, sonner, next-themes

## Arborescence

```
client/src/
├── api/                   → apiClient, tasksApi
├── components/ui/         → composants shadcn
├── components/layout/     → layouts (dashboard, auth)
├── components/tasks/      → fonctionnalités tâches
├── components/charts/     → graphiques
├── components/providers/  → QueryProvider, ThemeProvider
├── pages/                 → pages Next.js
├── types/                 → types TypeScript
├── utils/                 → utilitaires
├── mocks/                 → données de démo
├── hooks/use-tasks.ts     → hooks TanStack Query
├── lib/utils.ts           → fonction cn()
└── styles/globals.css     → styles globaux Tailwind
```

## Règles

### React & Next.js
- Composants fonctionnels avec hooks.
- `"use client"` obligatoire si état, effets ou événements.
- Routes dans `src/pages/` (pas de dossier `app/`).
- Éviter hydratation : pas de `new Date()` au rendu initial.

### TanStack Query
- Utiliser les hooks de `src/hooks/use-tasks.ts`.
- `queryKey` : `["tasks"]`, `["tasks", taskId]`.
- Après mutation : `invalidateQueries` automatique dans les hooks.

```tsx
import { useTasks, useCreateTask } from "@/hooks/use-tasks";

const { data: tasks, isLoading, error } = useTasks();
const createTask = useCreateTask();
```

### shadcn/ui
- Composants dans `@/components/ui/`.
- Ajouter via : `npx shadcn@latest add <component>`.
- Utiliser `cn()` de `@/lib/utils` pour les classes.

### TypeScript
- Types dans `src/types/`.
- Pas de `any`.

## Types métier

```typescript
type TaskStatus = "todo" | "in-process" | "done" | "complete";
type TaskPriority = "low" | "medium" | "high" | "urgent";
type TaskCategory = "work" | "personal" | "shopping" | "health" | "finance" | "education" | "other";
```

## Commandes

```bash
cd client
npm run dev
npm run build
npm run lint
```
