# Validation P0

Le parcours utilise les vrais serveurs client/API et une vraie base locale, sans mocks HTTP.

## Exécution

1. Démarrer PostgreSQL/Redis, appliquer les migrations et démarrer l’API et le client.
2. Installer les dépendances : `npm install` dans `client/`.
3. Installer Chromium si nécessaire : `npx playwright install chromium`.
4. Lancer `npm run typecheck`, `npm run test`, puis `npm run test:e2e`.

Le script lit `.env.local` pour `AUTH_API_URL`. Variables facultatives :

- `E2E_BASE_URL` : URL du client, défaut `http://localhost:3000`.
- `E2E_API_URL` : URL API, sinon `AUTH_API_URL` puis `http://localhost:3001`.
- `E2E_CHROMIUM_EXECUTABLE` : chemin d’un Chromium déjà installé.

## Contrôles

- API et page tâches protégées sans authentification.
- Connexion réelle par le formulaire NextAuth.
- Validation du titre et de l’échéance obligatoire.
- Création réelle et échéance persistée.
- Persistance après rechargement.
- Modification puis rechargement.
- Refus de lecture, modification et suppression depuis un second compte.
- Suppression depuis le formulaire et vérification API après rechargement.
- Absence d’erreurs d’hydratation détectées.

Le test crée deux comptes réservés `p0-…@example.com` par exécution. Il supprime la tâche de test, y compris après échec si son identifiant est connu. Les comptes restent en base ; utiliser une base locale dédiée aux tests pour des exécutions fréquentes.

Les rapports, captures et traces sont écrits dans `test-results/p0/` et ignorés par Git. Les traces peuvent contenir des sessions : ne pas les partager publiquement.

Dernière validation : **5 octobre 2026**, parcours complet réussi sur serveurs locaux. Ce résultat ne certifie pas un déploiement en production.
