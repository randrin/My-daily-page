# Client Stack — Référence détaillée

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

## shadcn — composants courants

| Besoin | Composant |
|--------|-----------|
| Carte | `Card`, `CardHeader`, `CardTitle`, `CardContent` |
| Formulaire | `Input`, `Label`, `Select`, `Button` |
| Modal latérale | `Sheet`, `SheetContent` |
| Menu | `DropdownMenu` |
| Tooltip | `Tooltip`, `TooltipTrigger`, `TooltipContent` |
| Table | composants custom ou shadcn table |

## TanStack Query + axios

```tsx
// src/api/client.ts
import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// src/api/tasks.ts
export const tasksApi = {
  getAll: () => apiClient.get<Task[]>("/tasks").then((r) => r.data),
  create: (data: CreateTaskDto) => apiClient.post("/tasks", data).then((r) => r.data),
};
```

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
