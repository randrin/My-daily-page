# Modèles personnels et listes datées

## Parcours

1. Ouvrir **Modèles** dans le sidebar, puis **Nouveau modèle**.
2. Saisir un nom et, si utile, un objectif détaillé.
3. Ajouter les tâches manuellement, demander des **Suggestions guidées**, ou utiliser **Suggérer avec l’IA** si configurée.
4. Examiner les suggestions et cliquer **Ajouter ces suggestions**. Rien n’est enregistré à cette étape ; les tâches existantes sont conservées.
5. Ajuster le titre, le décalage en jours et l’heure de chaque tâche. Jour 0 désigne la date de départ. Activer/désactiver chaque tâche et le modèle, puis enregistrer.
6. Dans **Page du jour → Utiliser un modèle**, seuls les modèles activés avec au moins une tâche activée sont proposés.
7. Choisir le modèle et la date de départ. Seules les tâches activées sont copiées dans le brouillon. Modifier, retirer ou ajouter des tâches, puis vérifier l’aperçu et cliquer **Créer les N tâches**.

Les changements de cette dernière étape ne modifient pas le modèle. Les décalages restent ceux du modèle : désactiver une tâche au jour 1 ne déplace pas celle au jour 2. Les heures utilisent le fuseau du profil, y compris au changement d’heure. Une heure locale inexistante doit être corrigée. Les dates passées et échéances déjà écoulées sont refusées. Limite : 20 tâches par modèle/liste. Création atomique de tâches À faire, priorité Moyenne, sans catégorie. Supprimer un modèle conserve les tâches déjà créées.

## Suggestions et alternatives

- **Guidées** : disponibles sans configuration ni appel externe. Quelques thèmes (voyage, paie/budget, rentrée, déménagement, événement) et étapes génériques pour les autres objectifs. Ce moteur est déterministe, ce n’est pas une IA.
- **OpenAI (intégré, optionnel)** : nom et description uniquement transmis après clic explicite. Réponse structurée, validée côté serveur, puis validation humaine avant enregistrement. Aucune donnée de compte, tâche existante ou contact n’est envoyée. Aucune action automatique. `store: false`. Limite persistante de 20 tentatives par utilisateur/jour UTC, erreurs comprises. Appel limité à 25 secondes et 2500 tokens de sortie, sans relance automatique. En cas d’échec, les suggestions guidées restent disponibles.
- **Ollama (alternative à intégrer)** : modèle hébergé sur sa propre machine/serveur, avec sortie JSON structurée. Permet de garder le traitement sur l’infrastructure choisie ; nécessite d’exploiter le serveur et de dimensionner la machine.
- **Gemini (alternative à intégrer)** : autre fournisseur avec sortie structurée ; nécessite une clé et la même validation serveur/humaine.

Documentation officielle : [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses), [Ollama Structured Outputs](https://docs.ollama.com/capabilities/structured-outputs), [Gemini Structured Outputs](https://ai.google.dev/gemini-api/docs/structured-output).

## Activer OpenAI

Dans `api/.env`, renseigner (ne jamais exposer au client) :

```dotenv
TEMPLATE_AI_OPENAI_API_KEY=<clé du projet OpenAI>
TEMPLATE_AI_MODEL=<modèle accessible prenant en charge Responses et Structured Outputs>
```

Redémarrer l’API. Le bouton IA devient disponible automatiquement à la prochaine ouverture du formulaire. Aucun abonnement ChatGPT n’est utilisé par cette intégration ; c’est une clé API du serveur. L’intégration n’a pas été testée avec un appel facturé dans cette session : parsing, erreurs et quotas sont testés sans appel réel.

## Déploiement

Appliquer `1758295900000-TaskTemplates` avant de démarrer la nouvelle API. Elle crée `task_templates` et `task_template_ai_usage`, avec suppression en cascade des données lors de la suppression du compte. Aucun modèle par défaut n’est injecté dans les comptes existants. Les anciennes listes Paie/Voyage/Rentrée peuvent être recréées en entrant leur nom et en utilisant les suggestions guidées.

Routes JWT : GET/POST `/task-templates`, GET `/task-templates/config`, POST `/task-templates/suggestions`, PATCH/DELETE `/task-templates/:id`. Identité issue du JWT ; lecture, modification et suppression filtrées par propriétaire. Les suggestions ne sauvegardent rien. La liste finale utilise POST `/tasks/lists` et ses contrôles existants.
