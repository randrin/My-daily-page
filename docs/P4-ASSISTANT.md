# P4 — Assistant et validation humaine

L’espace `/dashboard/assistant` propose une capture, un découpage en étapes, un brief et une revue. Les données sont privées par compte JWT.

## Configuration

1. Exécuter `cd api && npm run migration:run` (table `assistant_drafts`). La migration est appliquée en local.
2. Réutiliser `TEMPLATE_AI_OPENAI_API_KEY` et `TEMPLATE_AI_MODEL` de l’intégration des modèles, puis redémarrer l’API. Aucune clé côté client.
3. Le mode guidé reste disponible sans service externe. Il sépare les étapes par ligne ou point-virgule et laisse les échéances à saisir.
4. L’IA utilise l’intégration Responses existante, une sortie structurée validée, un délai de 25 secondes et `store:false`. Le quota de 20 appels par jour et par compte est partagé avec les modèles ; les essais échoués comptent aussi.

## Parcours

- Choisir une idée, un email, un message WhatsApp ou une transcription vocale, puis coller le texte (4000 caractères maximum).
- L’appel IA est explicite. Seuls le texte saisi, sa source, le mode, l’heure courante et le fuseau partent au fournisseur. Ne pas coller de secrets ou d’informations inutiles.
- La proposition est enregistrée, mais aucune tâche n’est créée. L’IA reçoit l’instruction de ne proposer une échéance que si une date et une heure sont explicites ; toute date suggérée doit être vérifiée par l’utilisateur.
- Réviser titres, dates, heures et priorités. Les échéances sont converties dans le fuseau du profil ; les dates passées et heures inexistantes au changement d’heure sont refusées.
- Cocher les étapes souhaitées et confirmer. La transaction et le verrou PostgreSQL empêchent une double création pour la même proposition. Les étapes sont des tâches indépendantes, sans dépendances inventées.
- Les éléments non sélectionnés sont conservés dans une nouvelle proposition. Plus de deux urgences proposées : les suivantes sont décochées et proposées en priorité haute. L’utilisateur garde la décision finale.
- Les brouillons sont visibles pendant 30 jours, dans la limite des 20 derniers. Il ne s’agit pas d’une suppression automatique des données en base.
- Les rappels suivent le planificateur existant, les canaux activés, les pauses et les horaires autorisés. Aucune notification n’est envoyée par l’assistant lui-même.

## Brief et revue

Le brief explique les trois prochaines tâches, selon les règles de priorité et d’échéance déjà utilisées par la Page du jour. L’explication est locale et intégrée au digest, sans envoyer les tâches à un fournisseur IA.

La revue est consultable à tout moment. Elle expose les tâches en retard et bloquées, avec accès à leur édition. L’analyse interactive est limitée aux 200 premières tâches ouvertes et l’indique. Le compteur des tâches terminées utilise leur dernière modification dans les sept jours (le projet ne conserve pas une date distincte de clôture).

Le résumé du dimanche ajoute les comptes de retard et blocage et un CTA vers la revue, même sans tâche due ce jour si des retards/blocages existent. Il utilise le digest email opt-in de 7h30, sans nouveau canal ni rattrapage rétroactif. Aucun report n’est automatique. L’historique exact des changements d’échéance reste à ajouter pour distinguer une tâche « reportée » d’une tâche simplement en retard.

## Ce qui reste distinct

- Réception automatique d’emails entrants, de messages WhatsApp ou de fichiers audio : non branchée. Le collage de message/transcription est opérationnel ; aucune boîte mail ni microphone n’est consulté.
- Tester une vraie proposition avec le modèle configuré et le digest du dimanche sur l’environnement de déploiement. Les tests locaux n’appellent pas OpenAI et n’envoient pas d’email.
- Les validations de livraison en production de P2 restent nécessaires et ne sont pas cochées par cette implémentation.

## Vérifications

`cd api && npm test -- --runInBand assistant.spec daily-digest.spec`

`cd api && ASSISTANT_DATABASE_TESTS=1 npm test -- --runInBand assistant.integration.spec`

`cd client && npm test -- --run src/api/assistant.test.ts`

Les tests PostgreSQL utilisent des comptes temporaires avec notifications désactivées et les nettoient. Ils vérifient l’isolation, l’absence de création avant confirmation, la confirmation concurrente, les échéances et la conservation des propositions non sélectionnées.
