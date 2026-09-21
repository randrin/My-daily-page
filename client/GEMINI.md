# GEMINI.md — Google Gemini (client)

Instructions pour Gemini travaillant sur le **client** My-daily-page.

> Contexte global : `../GEMINI.md` et `../.gemini/GEMINI.md`
> Skill : `../.gemini/skills/client-stack/SKILL.md`
> Architecture : `../.gemini/skills/client-stack/architecture.md`
> Métier : `../.gemini/skills/client-stack/business-rules.md`

## Stack

Next.js 16 · React 19 · TypeScript strict · Tailwind v4 · Shadcn/UI
Zustand · TanStack React Query · Axios · Zod
NextAuth v5
Vitest · Playwright

Pages Router — `src/pages/` (pas de `app/`).

## Architecture

```
client/src/
├── pages/                 # routes + pages/api/auth/[...nextauth].ts
├── auth/                  # NextAuth v5
├── api/                   # Axios
├── schemas/               # Zod
├── stores/                # Zustand (UI)
├── hooks/                 # TanStack Query
├── components/ui|layout|tasks|charts|forms|providers
├── types/ lib/ utils/ styles/
```

- Query = données serveur. Zustand = filtres / sheets.
- `_app.tsx` : SessionProvider → Query → Theme.

## Règles

### React & Next.js
- Composants fonctionnels, `"use client"` si état / effets.
- Hydratation : pas de `new Date()` au rendu initial.

### Données
- Hooks Query (`taskKeys.all`). Mutations → `invalidateQueries`.
- Zod `safeParse` avant submit. Types via `z.infer`.

### Auth
- NextAuth v5, session JWT. Dashboard protégé.
- `userId` depuis la session, jamais le formulaire.

### Métier
- Statuts : `todo | in-process | done | archived`
- Catégories API par user — pas d'enum hardcodé
- Pas d'envoi de notification depuis le client

### Tests
- Vitest : schemas, stores, utils
- Playwright : auth + CRUD tâches

## Commandes

```bash
cd client
npm run dev
npm run test
npm run test:e2e
npm run lint
```
