---
name: client-stack
description: >-
  Guide le développement frontend My-daily-page dans client/ : Next.js 16,
  React 19, TypeScript strict, Tailwind v4, Shadcn/UI, Zustand, TanStack React
  Query, Axios, Zod, NextAuth v5, Vitest et Playwright. Utiliser pour toute
  tâche client — pages, composants, stores, hooks, auth, schémas Zod, tests,
  intégration API ou skeletons de chargement.
---

# Client Stack — My-daily-page

## Stack

Next.js 16 · React 19 · TypeScript strict · Tailwind v4 · Shadcn/UI
Zustand · TanStack React Query · Axios · Zod
NextAuth v5
Vitest · Playwright

Compléments UI déjà en place : lucide-react, sonner, next-themes.

## Routing

Next.js 16 **Pages Router** uniquement — `src/pages/`. Pas de dossier `app/`.

## Séparation des responsabilités

| Couche | Outil | Rôle |
|--------|-------|------|
| UI | React 19 + shadcn/ui | Rendu, événements |
| État client | Zustand | Filtres, sheets, sélection, UI |
| État serveur | TanStack React Query | Cache API, mutations |
| HTTP | Axios | Appels REST vers `api/` |
| Validation | Zod | Formulaires + parsing des réponses |
| Auth | NextAuth v5 | Session, guards, JWT |
| Tests unitaires | Vitest | Schémas, stores, utils, hooks |
| Tests e2e | Playwright | Parcours auth, dashboard, CRUD tâches |

**Ne jamais** mettre la liste des tâches (ou toute ressource serveur) dans Zustand. Query = source de vérité serveur. Zustand = UI.

## Conventions

1. `"use client"` sur tout composant avec état, effets ou événements.
2. Imports via alias `@/` (`@/components`, `@/stores`, `@/schemas`, `@/auth`…).
3. `strict: true` — pas de `any` ; types inférés depuis Zod (`z.infer<typeof schema>`).
4. Réutiliser shadcn avant de créer un composant UI. `cn()` pour les classes.
5. Hydratation : pas de `new Date()`, `Math.random()`, `localStorage` au premier rendu.
6. Formulaire : schema Zod → `safeParse` → mutation Query. Toast `sonner` en feedback.
7. `userId` vient de la session NextAuth, jamais d'un champ formulaire.
8. Diff minimal, style du fichier respecté.
9. Skeleton Query obligatoire : voir **Skeletons de chargement**.

## Skeletons de chargement

Toute page ou bloc alimenté par TanStack Query affiche un skeleton pendant le premier chargement **et** quand la query key change sans cache (filtres, période, pagination).

- Chrome fixe (titre, toolbar, alertes) : rester visible
- Zone de données : skeleton qui imite le layout réel (KPI, camemberts, tableau, cartes, lignes)
- Condition : `showQuerySkeleton(query)` dans `client/src/lib/query-skeleton.ts` — pas `isFetching` seul
- Ne pas afficher l’état vide (« Aucune tâche ») pendant le chargement
- Réutiliser `@/components/ui/skeleton` et `@/components/ui/data-skeleton`
- Nouvelle page / nouvel écran Query : ajouter le skeleton **dans le même changement**

## Interdit

- App Router (`app/`)
- `fetch` / axios dans `useEffect` (passer par un hook Query)
- React Context pour les tâches (`task-context` = dette, ne pas étendre)
- `localStorage` comme source de vérité des tâches
- Statut client `"complete"` — utiliser `"done"` / `"archived"` (aligné API)
- Envoi email / SMS / WhatsApp depuis le client

## Commandes

```bash
cd client
npm run dev
npm run build
npm run lint
npm run test          # Vitest
npm run test:e2e      # Playwright
```

## Checklist

- [ ] Types stricts, schémas Zod sur les entrées
- [ ] Query pour l'API, Zustand pour l'UI
- [ ] Session NextAuth sur les pages protégées
- [ ] Pas d'erreur d'hydratation
- [ ] shadcn réutilisé, tokens Tailwind (`bg-background`, `text-foreground`…)
- [ ] Skeleton Query sur la zone de données (entrée + filtres / période)
- [ ] Test Vitest (règle / schema / store) ou e2e si parcours utilisateur

## Ressources

- Architecture cible : [architecture.md](architecture.md)
- Règles métier : [business-rules.md](business-rules.md)
- Patterns code : [reference.md](reference.md)
