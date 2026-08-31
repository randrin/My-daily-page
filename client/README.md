# My-daily-page — Client

Interface web de l'application **My-daily-page** : gestion de tâches, tableau de bord analytique et pages d'authentification.

## Stack

| Technologie | Rôle |
|-------------|------|
| [React 19](https://react.dev/) | Bibliothèque UI |
| [Next.js 16](https://nextjs.org/) | Framework (Pages Router) |
| [TypeScript](https://www.typescriptlang.org/) | Typage statique |
| [Tailwind CSS v4](https://tailwindcss.com/) | Styles utilitaires |
| [shadcn/ui](https://ui.shadcn.com/) | Composants UI (Radix UI) |
| [TanStack Query](https://tanstack.com/query) | Cache et fetching API |
| [axios](https://axios-http.com/) | Client HTTP |
| [lucide-react](https://lucide.dev/) | Icônes |
| [sonner](https://sonner.emilkowal.ski/) | Notifications toast |
| [next-themes](https://github.com/pacocoursey/next-themes) | Thème clair / sombre |
| [framer-motion](https://www.framer.com/motion/) | Animations |
| [date-fns](https://date-fns.org/) | Manipulation de dates |

## Prérequis

- Node.js 20+
- API backend lancée sur le port `3001` (voir [`api/README.md`](../api/README.md))

## Démarrage rapide

```bash
cd client
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Variables d'environnement

Créer un fichier `.env.local` à la racine de `client/` :

```env
NEXT_PUBLIC_APP_NAME=My Daily Page
NEXT_PUBLIC_HOST_CLIENT=http://localhost:3000
NEXT_PUBLIC_HOST_SERVER=http://localhost:3001
NEXT_PUBLIC_ENV=development
```

| Variable | Description | Défaut |
|----------|-------------|--------|
| `NEXT_PUBLIC_APP_NAME` | Nom de l'application | — |
| `NEXT_PUBLIC_HOST_CLIENT` | URL du frontend | — |
| `NEXT_PUBLIC_HOST_SERVER` | URL de l'API backend | `http://localhost:3001` |
| `NEXT_PUBLIC_ENV` | Environnement | `development` |

## Structure du projet

```
src/
├── api/                    # Client HTTP et endpoints
│   ├── client.ts           # Instance axios (baseURL)
│   └── tasks.ts            # CRUD tâches
├── components/
│   ├── ui/                 # Composants shadcn/ui
│   ├── layout/             # Layouts (dashboard, auth, sidebar…)
│   ├── tasks/              # Liste, formulaire, calendrier, carte
│   ├── charts/             # Graphiques SVG (pie, bar, line, area…)
│   ├── forms/              # Formulaires auth
│   ├── providers/          # QueryProvider, ThemeProvider
│   └── notifications/      # Dropdown notifications
├── hooks/
│   ├── use-tasks.ts        # Hooks TanStack Query (tâches)
│   └── use-mobile.ts       # Détection mobile
├── pages/                  # Routes Next.js (Pages Router)
│   ├── index.tsx           # Page d'accueil
│   ├── dashboard/          # Tableau de bord
│   └── auth/               # Connexion, inscription, mot de passe
├── types/                  # Types TypeScript (Task, Category…)
├── mocks/                  # Données mock (dev / fallback)
├── lib/                    # Utilitaires (cn, query-client)
├── utils/                  # Helpers, constantes
├── context/                # React Context
├── config/                 # Configuration (env)
└── styles/
    └── globals.css         # Tailwind + tokens CSS
```

## Pages et routes

| Route | Fichier | Description |
|-------|---------|-------------|
| `/` | `pages/index.tsx` | Page d'accueil |
| `/dashboard` | `pages/dashboard/index.tsx` | Tableau de bord (tâches, graphiques) |
| `/auth/signin` | `pages/auth/signin.tsx` | Connexion |
| `/auth/signup` | `pages/auth/signup.tsx` | Inscription |
| `/auth/forgot.password` | `pages/auth/forgot.password.tsx` | Mot de passe oublié |
| `/auth/reset.password` | `pages/auth/reset.password.tsx` | Réinitialisation |

## Communication avec l'API

### Client HTTP

```typescript
// src/api/client.ts
import { apiClient } from "@/api/client";
// baseURL → NEXT_PUBLIC_HOST_SERVER (défaut: http://localhost:3001)
```

### TanStack Query

Les hooks dans `src/hooks/use-tasks.ts` encapsulent les appels API :

```tsx
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";

const { data: tasks, isLoading, error } = useTasks();
const createTask = useCreateTask();
const updateTask = useUpdateTask();
const deleteTask = useDeleteTask();
```

| Hook | Description |
|------|-------------|
| `useTasks()` | Liste toutes les tâches |
| `useTask(id)` | Détail d'une tâche |
| `useCreateTask()` | Mutation de création |
| `useUpdateTask()` | Mutation de mise à jour |
| `useDeleteTask()` | Mutation de suppression |

Le `QueryProvider` est monté dans `src/components/providers/providers.tsx` et enveloppe l'application via `_app.tsx`.

## Types métier

Définis dans `src/types/task.ts` :

```typescript
type TaskStatus = "todo" | "in-process" | "done" | "complete";
type TaskPriority = "low" | "medium" | "high" | "urgent";
type TaskCategory = "work" | "personal" | "shopping" | "health" | "finance" | "education" | "other";
```

Ces types sont alignés avec le schéma Prisma de l'API.

## Composants UI (shadcn/ui)

Configuration dans `components.json` :
- Style : **new-york**
- Base color : **neutral**
- Icônes : **lucide**

Ajouter un composant :

```bash
npx shadcn@latest add button
```

Alias d'import : `@/components`, `@/lib`, `@/hooks`, `@/utils`.

Fusion de classes Tailwind via `cn()` (`src/lib/utils.ts`).

## Graphiques

Composants SVG custom dans `src/components/charts/` :

| Composant | Usage |
|-----------|-------|
| `pie-chart.tsx` | Répartition (donut chart) |
| `bar-chart.tsx` | Barres avec tooltips |
| `line-chart.tsx` | Courbes |
| `multi-line-chart.tsx` | Tendances multi-séries |
| `area-chart.tsx` | Aires empilées interactives |

## Règles de développement

1. **Pages Router** — pas d'App Router ; les pages sont dans `src/pages/`.
2. **`"use client"`** — obligatoire sur les composants interactifs (hooks, événements).
3. **Hydratation** — ne pas appeler `new Date()`, `Math.random()` ou `localStorage` au premier rendu ; utiliser `useEffect` pour différer.
4. **Données API** — préférer TanStack Query (`useTasks`, etc.) plutôt que `fetch` dans `useEffect`.
5. **Styling** — Tailwind + composants shadcn existants ; `cn()` pour les classes conditionnelles.
6. **Toasts** — feedback utilisateur via `sonner`.
7. **Diff minimal** — respecter le style du fichier modifié.

## Scripts npm

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Lancer le build |
| `npm run lint` | ESLint |

## Thème

Le thème clair/sombre est géré par `next-themes` via `ThemeProvider`. Le composant `ThemeToggle` permet de basculer entre les modes.

## Agents IA

Des skills et règles guident les assistants (Cursor, Claude, Gemini) :

- `client/AGENTS.md` — Cursor
- `client/CLAUDE.md` — Claude
- `client/GEMINI.md` — Gemini
- `.cursor/skills/client-stack/SKILL.md` — skill détaillé

## Dépannage

**Erreur d'hydratation React**

Vérifier qu'aucune valeur dynamique (`new Date()`, `localStorage`) n'est utilisée au rendu initial. Voir `task-calendar.tsx` et `area-chart.tsx` pour des exemples de correction avec `useEffect`.

**API inaccessible**

Vérifier que le backend tourne sur le port `3001` et que `NEXT_PUBLIC_HOST_SERVER` pointe vers la bonne URL.

**CORS**

L'API active CORS globalement (`main.ts`). En production, restreindre les origines autorisées.
