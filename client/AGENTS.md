
 AGENTS.md — Cursor

Instructions pour les agents IA travaillant sur le **client** My-daily-page.

## Projet

Application de gestion de tâches quotidiennes. Frontend dans `client/`.

## Stack technique

- **React 19** — composants fonctionnels, hooks
- **Next.js 16** — Pages Router (`src/pages/`), pas App Router
- **TypeScript** — types stricts
- **Tailwind CSS v4** — utilitaires, variables CSS oklch
- **shadcn/ui** — style new-york, base neutral, Radix UI
- **TanStack Query** (`@tanstack/react-query`) — cache, fetching, mutations
- **axios** — client HTTP
- **lucide-react** — icônes
- **sonner** — notifications toast
- **next-themes** — thème clair/sombre

## Structure

```
client/src/
├── components/ui/      # shadcn
├── components/layout/  # layouts dashboard & auth
├── components/tasks/   # features tâches
├── components/charts/  # graphiques SVG
├── pages/              # routes Next.js
├── types/              # interfaces TypeScript
├── utils/              # helpers
├── mocks/              # données mock
├── hooks/              # custom hooks & queries
├── context/            # React Context
├── lib/utils.ts        # cn()
└── styles/globals.css  # Tailwind + tokens
```

## Règles de code

1. Toujours `"use client"` pour composants interactifs.
2. Imports via alias `@/` (`@/components`, `@/utils`, `@/lib`…).
3. Réutiliser composants shadcn existants avant d'en créer.
4. `cn()` pour fusionner classes Tailwind.
5. Pas de `new Date()`, `Math.random()` ou `localStorage` au premier rendu — utiliser `useEffect` pour éviter les erreurs d'hydratation.
6. TanStack Query pour toutes les données API — pas de `fetch` dans `useEffect`.
7. Types métier dans `src/types/` (`Task`, `TaskStatus`, `TaskPriority`, `TaskCategory`).
8. Toasts via `sonner` pour feedback utilisateur.
9. Diff minimal — respecter le style du fichier modifié.

## TanStack Query

```tsx
// Provider dans components/providers/providers.tsx
<QueryClientProvider client={queryClient}>...</QueryClientProvider>

// Hook exemple
const { data, isLoading, error } = useQuery({
  queryKey: ["tasks"],
  queryFn: tasksApi.getAll,
});
```

## shadcn/ui

Installer : `cd client && npx shadcn@latest add button`
Config : `components.json` — aliases `@/components`, `@/lib`.

## Commandes

```bash
cd client
npm run dev      # développement
npm run build    # build production
npm run lint     # eslint
```

## Skill Cursor

Pour plus de détails : skill `client-stack` dans `.cursor/skills/client-stack/SKILL.md`.
