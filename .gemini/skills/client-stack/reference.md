# Client Stack — Référence détaillée (Gemini)

## Next.js Pages Router

```tsx
// src/pages/dashboard/index.tsx
"use client";

import DashboardLayout from "@/components/layout/dashboard.layout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      {/* contenu */}
    </DashboardLayout>
  );
}
```

## API layer

```tsx
// src/api/client.ts — baseURL depuis NEXT_PUBLIC_HOST_SERVER
// src/api/tasks.ts — CRUD tasks avec parsing des dates

import { tasksApi } from "@/api/tasks";
const tasks = await tasksApi.getAll();
```

## Hooks TanStack Query

| Hook | Usage |
|------|-------|
| `useTasks()` | Liste toutes les tâches |
| `useTask(id)` | Détail d'une tâche |
| `useCreateTask()` | Mutation création |
| `useUpdateTask()` | Mutation mise à jour |
| `useDeleteTask()` | Mutation suppression |

## Éviter les erreurs d'hydratation

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return <Skeleton />;
```

## Charts (SVG custom)

- Composants dans `src/components/charts/`.
- Couleurs : `var(--chart-1)` … `var(--chart-5)`.
- Tooltips Radix sur les éléments SVG (wrapper `<g>`).
