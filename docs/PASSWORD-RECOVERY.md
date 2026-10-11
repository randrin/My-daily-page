# Récupération du mot de passe

- POST `/auth/forgot-password` avec `{ "email": "..." }` : 202 identique, compte connu ou inconnu. Vérification effectuée dans le worker BullMQ ; le client ne révèle pas l’existence d’un compte.
- Resend envoie un CTA vers `${APP_URL}/auth/reset.password?token=...`. Configurer `APP_URL` avec l’origine réelle du client (par exemple `http://localhost:3001`). Utilise `RESEND_API_KEY` et `RESEND_FROM_EMAIL` existants. Redis et le worker API doivent être démarrés.
- Lien valable 30 minutes, aléatoire, 256 bits, hash SHA-256 seul en PostgreSQL. Aucun token brut dans la queue (généré par le worker), ni dans les logs.
- Une demande par adresse sur une fenêtre de 5 minutes ; déduplication Redis et verrou PostgreSQL. L’envoi n’est pas conditionné par les préférences de rappels : c’est un email de sécurité demandé par l’utilisateur.
- POST `/auth/reset-password` consomme le lien dans une transaction, change le hash bcrypt, invalide les autres liens et révoque les refresh tokens. Les JWT d’accès déjà émis restent valables jusqu’à leur expiration (15 minutes par défaut).
- En cas d’échec de livraison, le job échoue sans log de données fournisseur et le lien est invalidé. La confirmation UI indique seulement que la demande est acceptée, jamais une livraison garantie.
- En production : ajouter les limites globales/IP au proxy pour les routes publiques d’authentification et surveiller la queue `password-reset`. La déduplication par adresse ne remplace pas une protection anti-abus globale.

## Test manuel

1. Utiliser une adresse de compte de test existant, envoyer la demande et vérifier le confetti.
2. Ouvrir l’email, suivre le CTA et enregistrer un nouveau mot de passe.
3. Vérifier la connexion avec le nouveau mot de passe, puis le refus de réutilisation du lien.
4. Une adresse inconnue produit exactement le même message public, sans email.

Les tests automatisés utilisent un fournisseur email simulé et n’envoient aucun email réel.

Test PostgreSQL reproductible : `cd api && PASSWORD_RESET_DATABASE_TESTS=1 npm test -- --runInBand password-reset.integration.spec`. Il crée et nettoie un compte temporaire, sans email réel.
