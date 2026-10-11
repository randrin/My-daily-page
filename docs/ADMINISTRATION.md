# Administration

`/dashboard/admin` : indicateurs globaux et annuaire paginé, filtrable par nom/email et rôle. Première version en lecture seule. Les nombres de tâches sont agrégés ; leurs contenus et les téléphones ne sont pas renvoyés.

## Installation

1. Appliquer les migrations API : `cd api && npm run migration:run`.
2. Redémarrer l’API puis le client.
3. Dans une session PostgreSQL de confiance, attribuer explicitement le rôle au compte souhaité (remplacer l’email) :

```sql
UPDATE users SET role = 'admin' WHERE email = 'votre-email@example.com' RETURNING id, email, role;
```

Ne jamais exposer cette opération au formulaire de profil ou d’inscription. Aucun compte existant n’est promu automatiquement. Pour retirer l’accès : même requête avec `role = 'user'`. Le guard vérifie la base à chaque appel ; les anciens JWT ne conservent pas le droit. Rafraîchir la page pour actualiser le menu.

## Protection

Les endpoints `/admin/*` et les anciennes routes `/users/*` exigent JWT + rôle admin. Les inscriptions restent sur `/auth/register`, le profil personnel sur `/auth/me`. Une URL admin saisie par un utilisateur ordinaire retourne 404 côté client et 403 côté API. Les DTO publics n’acceptent pas `role`.

## Suggestions pour la suite

- Journal d’audit des actions administratives avant toute mutation.
- Suspension/réactivation des comptes, avec révocation des sessions et arrêt des rappels.
- Supervision des échecs et livraisons par canal, files d’attente et coûts fournisseurs.
- Courbes d’inscriptions et d’utilisation avec périodes filtrables.
- Rôles support en lecture seule distincts de l’administrateur, MFA et gestion contrôlée des droits.
- Exports minimisés et politique de conservation des données.
