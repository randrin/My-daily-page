# CLAUDE.md — Claude Code

Instructions pour Claude travaillant sur le **client** My-daily-page. Racine client : `client/`.

## Stack

Next.js 16 · React 19 · TypeScript strict · Tailwind v4 · Shadcn/UI
Zustand · TanStack React Query · Axios · Zod
NextAuth v5
Vitest · Playwright

Pages Router uniquement (`src/pages/`, `_app.tsx`). Pas de dossier `app/`.

## Architecture

- **Routing** : `pages/dashboard/`, `pages/auth/*`, `pages/api/auth/[...nextauth].ts`.
- **Layouts** : `DashboardLayout`, `AuthLayout`.
- **Providers** (`_app.tsx`) : `SessionProvider` → Query → Theme → Tooltip → Toaster.
- **Stores** Zustand : UI seulement (`src/stores/`).
- **Hooks** Query : `useTasks`, `useCategories` (`src/hooks/`).
- **Schémas** Zod : `src/schemas/` (formulaires + parsing API).
- **Auth** : `src/auth/auth.ts` (NextAuth v5, JWT).

Ne pas étendre `context/task-context.tsx` ni `localStorage` comme source de tâches.

## Règles métier

1. Pages protégées = session NextAuth. `userId` = `session.user.id`.
2. Titre de tâche obligatoire. Statuts : `todo` → `in-process` → `done` → `archived` (pas `"complete"`).
3. Catégories : CRUD API par user (`name`, `color`), pas l'union `work | personal | …`.
4. Rappels `email | sms | whatsapp` ; envoi réel côté API.
5. Isolation : uniquement les ressources de l'utilisateur connecté.

## Principes

1. Changement le plus petit qui résout le problème.
2. Lire le code voisin avant d'écrire.
3. shadcn first — `npx shadcn@latest add <name>` si manquant.
4. Hydratation : dates / storage dans `useEffect`.
5. Query + Zod + toasts sonner.
6. `strict` — pas de `any`.

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `src/pages/_app.tsx` | Session + Providers |
| `src/auth/auth.ts` | NextAuth v5 |
| `src/components/providers/providers.tsx` | Query, thème, toaster |
| `src/schemas/` | Zod |
| `src/stores/` | Zustand |
| `src/hooks/use-tasks.ts` | Query tâches |
| `src/styles/globals.css` | Tailwind v4 + tokens |
| `components.json` | shadcn (new-york, neutral) |

## Skill

`.claude/skills/client-stack/SKILL.md`  
Compléments : `architecture.md`, `business-rules.md`, `reference.md`

## Commandes

```bash
cd client && npm run dev
cd client && npm run test
cd client && npm run test:e2e
cd client && npm run lint
```
