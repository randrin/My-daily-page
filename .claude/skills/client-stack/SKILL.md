---
name: client-stack
description: >-
  Guides Claude on the My-daily-page client: React 19, Next.js Pages Router,
  Tailwind v4, shadcn/ui, TanStack Query, TypeScript. Use for any frontend work
  in client/ — components, pages, hooks, API integration, styling, or data
  fetching.
---

# Client Stack — My-daily-page

## Stack

React 19 · Next.js 16 Pages Router · TypeScript · Tailwind v4 · shadcn/ui · TanStack Query · axios

## Project layout (`client/src/`)

- `components/ui/` — shadcn components
- `components/layout/` — DashboardLayout, AuthLayout
- `components/tasks/` — task features
- `components/charts/` — SVG charts
- `pages/` — Next.js routes
- `types/` — TypeScript interfaces
- `utils/`, `mocks/`, `hooks/`, `context/`
- `lib/utils.ts` — `cn()` helper
- `styles/globals.css` — Tailwind + CSS variables

## Rules

1. `"use client"` on interactive components
2. Import via `@/` aliases
3. Reuse shadcn before creating custom UI
4. No `new Date()` / `localStorage` on initial render (hydration)
5. TanStack Query for all server data
6. Minimal diffs, match surrounding code style
7. No `any` — use `src/types/`

## TanStack Query

```tsx
useQuery({ queryKey: ["tasks"], queryFn: tasksApi.getAll });
useMutation({ mutationFn: tasksApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }) });
```

Provider goes in `components/providers/providers.tsx`.

## shadcn/ui

Style: new-york · Base: neutral · Icons: lucide-react
Install: `npx shadcn@latest add <component>` from `client/`

## Tailwind v4

CSS variables in `globals.css`. Use semantic tokens: `bg-background`, `text-muted-foreground`, `primary`.

## Key types

`Task`, `TaskStatus`, `TaskPriority`, `TaskCategory` in `src/types/task.ts`

## Commands

`cd client && npm run dev | build | lint`
