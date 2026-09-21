# AGENTS.md — Cursor / Codex

Instructions pour les agents IA travaillant sur le **client** My-daily-page.

## Projet

Frontend de gestion de tâches quotidiennes. Dossier : `client/`.

## Stack

Next.js 16 · React 19 · TypeScript strict · Tailwind v4 · Shadcn/UI
Zustand · TanStack React Query · Axios · Zod
NextAuth v5
Vitest · Playwright

Routing : **Pages Router** (`src/pages/`) — pas d'App Router.

## Architecture (résumé)

| Couche | Outil | Dossier |
|--------|-------|---------|
| UI | React + shadcn | `src/components/` |
| État UI | Zustand | `src/stores/` |
| État serveur | TanStack Query | `src/hooks/` |
| HTTP | Axios | `src/api/` |
| Validation | Zod | `src/schemas/` |
| Auth | NextAuth v5 | `src/auth/` + `pages/api/auth/` |
| Tests | Vitest / Playwright | `tests/`, `e2e/` |

Query = tâches / catégories. Zustand = filtres, sheets, sélection. Jamais les deux pour la même donnée.

## Règles métier (résumé)

- Session requise pour `/dashboard` et les mutations. `userId` depuis la session.
- Tâche : titre obligatoire ; défauts `todo` / `medium` ; statuts `todo | in-process | done | archived`.
- Catégories utilisateur via l'API (pas d'enum hardcodé).
- Notifications : le client crée des rappels ; l'API envoie (BullMQ).

## Règles de code

1. `"use client"` sur les composants interactifs.
2. Alias `@/`. `cn()` pour Tailwind.
3. Pas de `any`. Types via `z.infer`.
4. Pas de `new Date()` / `localStorage` au premier rendu.
5. Pas de `fetch` dans `useEffect`.
6. Toasts `sonner`. Diff minimal.

## Commandes

```bash
cd client
npm run dev
npm run build
npm run lint
npm run test
npm run test:e2e
```

## Skills

| Outil | Skill |
|-------|--------|
| Cursor | `.cursor/skills/client-stack/SKILL.md` |
| Codex | `.agents/skills/client-stack/SKILL.md` |

Architecture : `architecture.md` · Métier : `business-rules.md` · Patterns : `reference.md`
