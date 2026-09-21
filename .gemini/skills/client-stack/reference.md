# Client Stack — Patterns

## NextAuth v5 (Pages Router)

```ts
// src/auth/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "@/schemas/auth.schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;
        // POST /users/login (ou équivalent API) puis retourner { id, email }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/signin" },
});
```

```ts
// src/pages/api/auth/[...nextauth].ts
import { handlers } from "@/auth/auth";
export default handlers;
```

`_app.tsx` : wrapper `SessionProvider` autour de `<Providers>`.

Interceptor Axios :

```ts
apiClient.interceptors.request.use(async (config) => {
  // token depuis session NextAuth — ne pas stocker le JWT dans Zustand
  return config;
});
```

## Zustand — état UI uniquement

```ts
// src/stores/dashboard.store.ts
import { create } from "zustand";
import type { TaskFilters } from "@/types/task";

type DashboardState = {
  filters: TaskFilters;
  isFormOpen: boolean;
  selectedTaskId: string | null;
  setFilters: (filters: TaskFilters) => void;
  openCreate: () => void;
  openEdit: (id: string) => void;
  closeForm: () => void;
};

export const useDashboardStore = create<DashboardState>((set) => ({
  filters: {},
  isFormOpen: false,
  selectedTaskId: null,
  setFilters: (filters) => set({ filters }),
  openCreate: () => set({ isFormOpen: true, selectedTaskId: null }),
  openEdit: (id) => set({ isFormOpen: true, selectedTaskId: id }),
  closeForm: () => set({ isFormOpen: false, selectedTaskId: null }),
}));
```

## Zod

```ts
// src/schemas/task.schema.ts
import { z } from "zod";

export const taskStatusSchema = z.enum([
  "todo",
  "in-process",
  "done",
  "archived",
]);
export const taskPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().optional(),
  status: taskStatusSchema.default("todo"),
  priority: taskPrioritySchema.default("medium"),
  deadline: z.coerce.date().optional(),
  categoryId: z.string().uuid().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
```

## TanStack React Query + Axios

```ts
export const taskKeys = {
  all: ["tasks"] as const,
  detail: (id: string) => ["tasks", id] as const,
};

export function useTasks() {
  return useQuery({ queryKey: taskKeys.all, queryFn: tasksApi.getAll });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
}
```

Provider : `src/components/providers/query-provider.tsx` (`staleTime: 60_000`, `retry: 1`).

Parser les dates dans `src/api/tasks.ts` (strings ISO → `Date`), pas dans le JSX.

## shadcn/ui + Tailwind v4

- CLI : `cd client && npx shadcn@latest add <component>`
- Style **new-york**, base **neutral**, icônes lucide `h-4 w-4`
- Tokens : `bg-background`, `text-foreground`, `text-muted-foreground`, `border`, `primary`, `var(--chart-1)`…`var(--chart-5)`
- Config dans `globals.css` (pas de `tailwind.config.js` classique)

## Hydratation

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return <Skeleton />;
```

## Vitest

```ts
import { describe, expect, it } from "vitest";
import { createTaskSchema } from "@/schemas/task.schema";

describe("createTaskSchema", () => {
  it("rejette un titre vide", () => {
    const result = createTaskSchema.safeParse({ title: "  " });
    expect(result.success).toBe(false);
  });
});
```

Fichiers : `*.test.ts` à côté du module ou dans `tests/`. Environnement `jsdom` pour les composants.

## Playwright

```ts
import { test, expect } from "@playwright/test";

test("signin puis dashboard", async ({ page }) => {
  await page.goto("/auth/signin");
  await page.getByLabel("Email").fill("user@example.com");
  await page.getByLabel("Password").fill("password12");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/dashboard/);
});
```

Parcours minimaux : signin, création tâche, édition statut, logout.

## Pages Router

```tsx
// src/pages/dashboard/index.tsx
"use client";

import DashboardLayout from "@/components/layout/dashboard.layout";

export default function DashboardPage() {
  return <DashboardLayout>{/* Query + Zustand, pas de mock */}</DashboardLayout>;
}
```
