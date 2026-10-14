# Administration — suivi progressif

La checklist A1–A6 est maintenue dans `ROADMAP.md`. Les lots A1 (audit), A2 (suspension/réactivation), A3 (supervision) et A4 (statistiques) sont livrés. Les modifications de droits et exports restent à implémenter.

## A1 : journal d’audit

- Migration `1758296400000-AdminAudit` : table `admin_audit_events`, index chronologique et trigger refusant UPDATE, DELETE et TRUNCATE.
- Route `GET /admin/audit?page=1&pageSize=10`, protégée par JWT et contrôle du rôle administrateur courant.
- Page dédiée `/dashboard/admin/audit`, accessible depuis le lien Journal d’audit sous Administration, avec pagination, skeleton, état vide et erreur.
- Champs conservés : identifiant de l’événement, auteur, cible éventuelle, action, date. Aucun email, numéro, contenu de tâche, jeton, mot de passe, IP ou corps arbitraire n’est enregistré.
- Les identifiants sont pseudonymes, pas anonymes. Ils sont conservés sans FK vers le compte, pour éviter une altération du journal lors d’une future suppression de compte.

### Contrat obligatoire pour les prochaines mutations

Appeler `AdminAuditService.mutate(actorId, action, targetId, callback)` depuis le service administratif. Le callback reçoit l’EntityManager de la transaction : **toutes les écritures doivent utiliser ce manager**.

Le service verrouille en lecture le rôle courant de l’auteur, refuse un compte non administrateur, écrit l’événement avant le callback puis valide les deux ensemble. En cas d’échec, aucun événement de succès n’est conservé. Ce journal décrit les mutations validées ; les tentatives refusées et erreurs devront être suivies séparément si nécessaire.

Ne pas effectuer d’appel fournisseur ou Redis dans cette transaction : A2 devra utiliser un état durable du compte, vérifié par les workers, et des opérations asynchrones idempotentes. Les notifications déjà acceptées par un fournisseur ne pourront pas être rappelées.

Le trigger protège contre les altérations applicatives ; il ne constitue pas une preuve d’inviolabilité contre un propriétaire/superutilisateur PostgreSQL. Un archivage externe signé et des permissions DB séparées pourront renforcer cette garantie. A6 devra définir une procédure privilégiée et supervisée de conservation/purge ; aucune purge du journal n’est activée actuellement.

### Installation et tests

`cd api && npm run migration:run`

`cd api && ADMIN_AUDIT_DATABASE_TESTS=1 npm test -- --runInBand admin-audit.integration.spec`

Les tests utilisent des transactions annulées : pas d’action administrative artificielle conservée dans le journal et aucun rappel envoyé.

## Ordre proposé

1. A1 : audit et consultation — livré.
2. A2 : suspension/réactivation, révocation des sessions, refus des JWT et contrôle des workers — livré.
3. A3 : supervision et coûts estimés ; A4 : courbes et instrumentation de l’activité — livrés.
4. A5 : support en lecture seule, MFA et gestion des droits avec réauthentification.
5. A6 : exports minimisés et durées de conservation, après choix des durées et des tarifs applicables.

Les coûts fournisseurs ne seront pas présentés comme des montants facturés sans données de facturation. Les durées de conservation et le niveau d’accès support nécessiteront des décisions explicites avant activation.

## A2 : suspension / réactivation

Migration `1758296500000-AccountSuspension` appliquée en local. En déploiement : exécuter les migrations avant de redémarrer les API et **tous les workers** ; un ancien worker ne connaît pas les nouveaux contrôles.

Dans Administration, la colonne Compte affiche Actif/Suspendu et Actions ouvre un dialog. Un motif contrôlé est obligatoire pour suspendre. L’auto-suspension est refusée ; le dernier administrateur actif est protégé. Les modifications sont sérialisées et le rôle courant de l’auteur est revérifié dans la transaction d’audit.

`PATCH /admin/users/:id/status` reçoit `{suspended:true,reason:"security"}` ou `{suspended:false}`. La transaction met à jour l’état du compte, incrémente sa version de session et révoque ses refresh tokens. La stratégie JWT relit l’état et la version sur chaque requête : un ancien JWT reste invalide après réactivation. Les connexions/refresh sont refusés pendant la suspension. Les changements concurrents vers le même état sont rejetés sans nouvel événement d’audit.

Les workers de rappels (email, SMS, WhatsApp et push), résumé matinal et digest des excédents SMS prennent un verrou partagé par compte et relisent l’état juste avant traitement. La suspension prend le verrou exclusif : elle attend la fin d’un envoi déjà en cours, puis interdit les suivants. Un message déjà accepté par un fournisseur ne peut pas être rappelé.

Les rappels PENDING et digests pending sont annulés en base. Les jobs différés éventuellement encore présents dans Redis deviennent inopérants : les workers relisent l’état durable. Les préférences de notification ne sont pas effacées. Après réactivation, seuls les rappels futurs reprennent par réconciliation ; les anciennes sessions et les rappels antérieurs à la reprise restent invalides/annulés. Un résumé quotidien annulé ne sera pas renvoyé rétroactivement.

Les commandes entrantes et liens de confirmation refusent les comptes suspendus. Les emails de récupération de mot de passe restent des messages d’authentification distincts des rappels ; changer son mot de passe ne réactive pas un compte.

Tests : `ADMIN_ACCOUNTS_DATABASE_TESTS=1 ADMIN_AUDIT_DATABASE_TESTS=1 npm test -- --runInBand admin-accounts.integration.spec admin-audit.integration.spec` dans `api/`. Comptes temporaires et transactions annulées, aucun compte réel suspendu et aucun envoi réel. Vérifications : login, refresh, anciennes versions JWT, nouveau login après reprise, rappels annulés, barrières multi-connexions, audit, auto-suspension et changements répétés.

L’annuaire Utilisateurs propose les filtres Rôle et Compte (Tous / Actif / Suspendu). Le filtre Compte est appliqué côté API avant comptage et pagination ; Réinitialiser efface aussi ce filtre.

Le journal accepte `sortBy=action|actorId|target|createdAt` et `sortDirection=asc|desc`, avec une liste blanche côté API et un ordre stable par ID. La colonne Compte concerné affiche nom et email actuels via une jointure limitée à ces champs ; aucun nom/email n’est ajouté aux événements persistés. Après suppression du compte, son ID reste affiché.

## A3 : supervision notifications et fournisseurs

Page `/dashboard/admin/notifications`, lien **Supervision** sous Administration. Accès JWT + rôle admin courant. Filtres des 7/30/90 derniers jours, canal et fournisseur ; période basée sur `trigger_at` (date prévue du rappel), pas la date de réception du webhook. Le tableau regroupe état/canal/fournisseur et la liste paginée isole les échecs ou envois à vérifier. Les diagnostics sont catégorisés : aucun contenu de tâche, numéro ou message d’erreur fournisseur brut n’est exposé.

Les statuts accepté/envoyé/livré/lu restent distincts. Une absence de webhook ne prouve pas un échec de livraison. Les rappels sans fournisseur enregistré sont **Non identifiés**, sans attribution devinée.

Les trois files `notifications`, `daily-digests`, `sms-overflow-digests` affichent waiting/delayed/active/failed/completed, workers connectés et date du plus ancien job waiting. Instantané global indépendant des filtres. Les jobs terminés/échoués sont soumis aux durées de nettoyage BullMQ et ne constituent pas un historique comptable. Redis indisponible : les autres données restent affichables ; lecture des files bornée à 3 secondes. Un worker connecté n’est pas une garantie de traitement.

### Tarifs estimés

Variables API, à définir dans l’environnement puis redémarrer l’API :

- `ADMIN_COST_CURRENCY=EUR` (devise d’affichage commune).
- `ADMIN_COST_EMAIL`, `ADMIN_COST_SMS`, `ADMIN_COST_WHATSAPP`, `ADMIN_COST_PUSH` : montant décimal par rappel envoyé/accepté, sans valeur inventée par défaut. `0` explicite est accepté.
- Surcharges optionnelles prioritaires : `ADMIN_COST_RESEND_EMAIL`, `ADMIN_COST_TWILIO_SMS`, `ADMIN_COST_TWILIO_WHATSAPP`, `ADMIN_COST_ULTRAMSG_WHATSAPP`.

L’estimation multiplie le tarif par les rappels ayant un identifiant fournisseur ou le statut SENT. Elle exclut les digests, abonnements, taxes, pays de destination, segmentation SMS, doublons de tentatives chez le fournisseur et facturation réelle. Un prix absent ou invalide affiche À configurer, jamais zéro implicite. Aucune connexion aux portails de facturation n’est mise en place.

### Réessai manuel sûr et audité

Migration `1758296600000-AdminNotificationRetry` appliquée en local. `POST /admin/notifications/:id/retry` est réservé aux admins et nécessite le dialog de confirmation côté client.

Seuls les échecs FAILED appartenant à une liste exacte d’erreurs avant envoi (configuration manquante/coordonnées invalides connues) sont éligibles, sans identifiant fournisseur ni état de livraison. Le compte et le canal doivent être actifs, la tâche non clôturée et son échéance future. Un fallback email déjà présent interdit le réessai. Timeouts, SENDING, états acceptés/livrés et échecs ambigus sont refusés, même si le client tente un appel direct.

La transaction utilise le même verrou par rappel que le worker, enregistre `notification.retry` avec le compte cible et l’ID du rappel (`resource_id`), puis remet le rappel PENDING avec `admin_retry_requested_at`. Aucun appel Redis/fournisseur dans la transaction. Le planificateur réveille le job échoué existant ou crée le job manquant avec le même ID ; le worker recontrôle les conditions et évite un envoi déjà traité. Si Redis échoue, la demande durable reste à reprendre au prochain passage. Les pauses et horaires silencieux restent respectés.

Déploiement : migrations puis redémarrage de l’API et de tous les workers. Aucun renvoi réel n’a été déclenché par les tests. Tests PostgreSQL : `ADMIN_NOTIFICATIONS_DATABASE_TESTS=1 npm test -- --runInBand admin-notifications.integration.spec`. Tests règles et handoff : `npm test -- --runInBand admin-notifications.spec admin-retry-scheduler.spec`.

## A4 : courbes, périodes et mesure d’utilisation

Page `/dashboard/admin/analytics`, lien **Statistiques** sous Administration. API `GET /admin/analytics?days=7|30|90&timezone=Europe/Paris` protégée comme les autres pages admin. Le fuseau IANA est validé. Les jours absents sont complétés pour les inscriptions ; les journées d’activité antérieures au démarrage restent nulles et ne sont pas tracées.

Les périodes incluent aujourd’hui (journée partielle). La comparaison porte sur les mêmes N jours calendaires immédiatement précédents ; les dates exactes sont affichées. Les inscriptions concernent les comptes encore présents. Les timestamps historiques `users.created_at`, sans fuseau, sont interprétés dans le fuseau PostgreSQL configuré (UTC sur l’environnement local) avant regroupement ; conserver ce réglage stable en déploiement.

### Définition de l’activité

Un utilisateur actif distinct a réussi au moins une mutation d’organisation dans l’application après authentification. L’intercepteur global couvre les tâches, notes et rappels via TasksController, les catégories, les modèles enregistrés/modifiés/supprimés et la confirmation de propositions de l’assistant. Une requête réussie compte pour une action, même si elle concerne plusieurs tâches. Le total des utilisateurs actifs sur une période est dédupliqué entre les journées ; ce n’est pas la somme des actifs journaliers.

Les connexions, lectures seules, actions d’administration, suggestions IA non confirmées, workers et envois automatiques sont exclus. Les commandes entrantes SMS/WhatsApp et liens publics signés sont également hors de cette mesure centrée sur les actions authentifiées dans l’application. Il ne s’agit pas d’un comptage des visites ni de tous les usages externes.

Seuls UUID utilisateur, catégorie d’action et timestamp sont enregistrés ; aucun contenu, email, IP, URL, payload ou session. Une action métier échouée n’est pas comptée. Si l’écriture de mesure échoue, l’action métier réussie est préservée et un avertissement sans données personnelles est journalisé : la mesure est indicative, pas un journal transactionnel. L’audit administratif conserve son contrat strict séparé.

Migration `1758296700000-UserActivity` appliquée en local. La date de démarrage est stockée une seule fois. Aucun historique d’activité n’est inventé ou déduit des tâches automatiques. Une comparaison active/actions est indisponible tant que la totalité de la période précédente n’a pas été mesurée. Depuis un dénominateur zéro, aucune variation en pourcentage n’est inventée : l’écart absolu reste affiché.

Les événements d’un utilisateur sont supprimés avec son compte. Les courbes historiques peuvent donc évoluer après suppression ; pas de politique de rétention supplémentaire avant A6.

Déploiement : migrations avant redémarrage des API ; pas de fournisseur ni clé supplémentaire. Tests : `npm test -- --runInBand admin-analytics.spec`, puis `ADMIN_ANALYTICS_DATABASE_TESTS=1 npm test -- --runInBand admin-analytics.integration.spec`. Tests en transactions annulées : déduplication, comparaison, jours non mesurés et regroupement autour de minuit dans différents fuseaux.

## A5 — Droits contrôlés et MFA

Trois rôles sont disponibles : `user`, `support`, `admin`. Le support accède uniquement aux lectures explicitement autorisées de l’administration (annuaire minimisé, statistiques, supervision, audit). Il ne peut ni modifier un compte, ni changer les droits, ni relancer un rappel. Les contenus des tâches, secrets MFA et coordonnées téléphoniques ne sont pas exposés par cet annuaire. Les anciennes mutations génériques `POST/PATCH/DELETE /users` sont désactivées : utiliser les parcours dédiés, protégés et audités.

### Mise en service

- Appliquer les migrations `1758296800000` et `1758296900000`, puis redémarrer l’API.
- Configurer `MFA_ENCRYPTION_KEY` : 32 octets aléatoires encodés en base64, par exemple avec `openssl rand -base64 32`. Une clé locale a été créée dans le `.env` ignoré par Git. En production, utiliser le gestionnaire de secrets et sauvegarder cette clé : la remplacer sans migration des secrets rend les TOTP existants inutilisables.
- Dans **Paramètres → Sécurité et MFA**, saisir le mot de passe actuel. Scanner le QR code affiché dans Google Authenticator, Microsoft Authenticator ou une application TOTP compatible (QR généré localement, sans transmission à un service externe), ou saisir manuellement la clé (SHA1, 6 chiffres, 30 secondes), conserver les dix codes de récupération, puis confirmer avec un code de l’application. Le brouillon expire après dix minutes ; Annuler efface le brouillon côté API.
- L’activation et la désactivation révoquent toutes les sessions. Après activation, attendre le prochain code TOTP pour se reconnecter : un code validé ne peut pas être réutilisé. Les codes de récupération sont à usage unique ; seul leur hachage est conservé. Après cinq erreurs, la vérification est bloquée quinze minutes.
- Pour changer le rôle d’un autre compte, l’administrateur doit avoir activé sa MFA et fournir son mot de passe et un second facteur frais. La promotion administrateur exige aussi que le compte cible ait activé sa MFA. Aucun compte n’est promu automatiquement.

Les changements de rôle sont transactionnels et enregistrent ancien/nouveau rôle avant la mutation. L’auto-modification et la suppression du dernier administrateur actif sont interdites ; les sessions de la cible sont révoquées. L’activation, la désactivation et l’usage d’un code de récupération apparaissent également dans le journal. Aucun secret ni mot de passe n’y est enregistré.

La MFA est facultative pour les comptes existants ; elle est exigée pour la gestion des droits. Les autres mutations administratives conservent leurs contrôles existants. Aucun parcours de réinitialisation MFA sans second facteur n’est proposé : conserver les codes de récupération.

### Vérification

Tests unitaires : vecteur TOTP RFC 6238, chiffrement authentifié, permissions support, challenge avant délivrance de tokens, changement de rôle, preuve périmée et dernier administrateur. `MFA_DATABASE_TESTS=1 npm test -- --runInBand mfa.integration` vérifie sur PostgreSQL le cycle d’activation/récupération/désactivation, le refus des anciens tokens, le verrouillage et l’audit. Les comptes de test et événements sont annulés par rollback.

## A6 — Exports et conservation

La page **Administration → Exports et conservation** (`/dashboard/admin/data`) est réservée au rôle `admin`. Les routes `/admin/data/*` portent une permission explicite `data` : le support n’y accède pas, même en lecture. Les créations d’exports, changements de politique, ajouts/levées d’exceptions et purges nécessitent le mot de passe actuel et un second facteur frais. Aucun export ni aucune purge métier n’est déclenché automatiquement lors du déploiement.

### Exports CSV privés

L’export des comptes comporte exactement cinq colonnes : identifiant UUID, rôle, compte actif/suspendu, inscription en UTC et nombre de tâches. Aucun nom, email, téléphone, mot de passe, secret MFA ou contenu de tâche n’est exporté. La période filtre **l’inscription**, de la date de début à la fin incluse dans l’interface (borne de fin exclusive côté API). La conversion utilise le fuseau du navigateur et le CSV indique UTC. Les filtres rôle/état sont optionnels. Limites : 366 jours, 10 000 lignes, trois exports disponibles par administrateur.

Le fichier est stocké temporairement en `bytea` dans PostgreSQL, hors de tout répertoire public. Il n’existe aucun lien anonyme : `POST /admin/data/exports/:id/download` exige le JWT, le rôle administrateur actuel, le même créateur, une MFA toujours activée et la version de session de création. Le téléchargement est audité et servi avec `Cache-Control: no-store`, `nosniff` et un nom fixe dérivé d’un UUID validé. Le CSV protège les cellules contre les formules de tableur, en plus de l’échappement des guillemets et séparateurs.

L’accès expire après **15 minutes**, même si le processus de nettoyage est arrêté. Le contenu expiré est effacé au prochain passage du nettoyage (toutes les 60 secondes lorsque l’API tourne) ; les fiches d’export restent disponibles pour la conservation et les exceptions. En environnement arrêté, cet effacement physique reprend au redémarrage ; PostgreSQL, ses sauvegardes et WAL doivent disposer de leurs propres politiques d’accès, chiffrement et conservation. Les copies déjà téléchargées sortent du contrôle de l’application.

### Politique et exceptions

| Type | Défaut | Bornes | Critère d’ancienneté |
| --- | --- | --- | --- |
| Journal d’audit | 365 jours | 365–3650 jours | Date de l’événement |
| Rappels | 90 jours | 30–3650 jours | Plus récente de l’échéance du rappel et de son envoi |
| Fiches d’export | 7 jours | 1–365 jours | Après l’expiration du fichier |

La politique est globale à la plateforme et versionnée. La modifier invalide les aperçus de purge existants. Ces seuils techniques par défaut ne constituent pas une durée légale universelle : l’exploitant choisit les valeurs applicables à son contexte.

Seuls les rappels `SENT`, `FAILED` ou `CANCELLED`, sans réessai administratif demandé, **rattachés à une tâche `DONE` ou `ARCHIVED`**, peuvent être purgés. Les rappels en attente/en cours et les tâches ouvertes sont préservés pour éviter une perte de travail ou une replanification. La purge des rappels supprime aussi leurs associations `sms_overflow_items` par la clé étrangère existante ; les agrégats historiques calculés depuis ces rappels ne couvrent ensuite que les données conservées. Les tâches, comptes, notes, résumés matinal, événements d’activité, événements entrants et digests fournisseurs ne font pas partie de cette purge.

Une exception protège un enregistrement précis (audit, rappel, fiche d’export) à partir de son UUID et d’un motif réservé à l’administration, jusqu’à sa levée explicite avec MFA et audit. Maximum 100 exceptions actives, toutes visibles. Éviter les données personnelles dans le motif. Une exception sur un export préserve sa fiche, **pas le CSV au-delà de quinze minutes**. Les exceptions levées et les bilans de purge sont conservés comme preuves opérationnelles ; leur archivage/purge n’est pas automatisé dans ce lot.

### Purge supervisée et protection du journal

1. **Calculer l’aperçu** crée un lot privé, audité, valable dix minutes et lié à l’administrateur, sa session et la version de politique. Il contient au maximum 1 000 identifiants par type. Les nouvelles données éligibles ne s’ajoutent pas au lot.
2. Vérifier les compteurs puis choisir **Confirmer la purge**. Le dialog expose le caractère définitif de la suppression, exige `PURGER`, le mot de passe et un code MFA/récupération inutilisé.
3. L’API revalide les droits, la session, la politique et l’expiration. Les exceptions et l’éligibilité sont revérifiées. Une exception ajoutée après l’aperçu est respectée.
4. L’audit `retention.purge` est inséré **avant** la mutation, dans la même transaction. Un trigger PostgreSQL exécute le lot et enregistre les compteurs réellement supprimés. Une erreur annule l’ensemble. Un lot exécuté ne peut pas être rejoué.

`UPDATE` et `TRUNCATE` du journal restent interdits. Un `DELETE` direct, même sur un événement expiré, reste interdit. La seule dérogation est la suppression depuis le trigger d’un lot supervisé, dans sa transaction et pour ses identifiants admissibles non protégés. Les événements récents de purge restent dans le journal et les bilans sont consultables séparément (vingt derniers dans l’interface). Ces barrières ne remplacent pas la séparation des rôles PostgreSQL : un propriétaire/superutilisateur de base conserve la capacité d’altérer son schéma. Restreindre les accès DBA en production.

### Déploiement et validation

Appliquer `1758297000000-AdminDataLifecycle` et `1758297100000-DataLifecycleGuards`, puis redémarrer l’API. La seconde migration corrige aussi l’ancienne contrainte SQL des rôles pour accepter `support`. Aucune configuration de stockage externe n’est nécessaire. Prévoir les sauvegardes et permissions de la base ; ne pas lancer de purge réelle sans en examiner l’aperçu.

Tests : CSV/formules et minimisation, bornes DTO/Zod, permissions `data`, téléchargements intercomptes, expiration/session révoquée, exceptions tardives, non-rejeu des lots, invalidation de politique et conservation des rappels actifs. Commande PostgreSQL : `ADMIN_DATA_DATABASE_TESTS=1 ADMIN_AUDIT_DATABASE_TESTS=1 npm test -- --runInBand admin-data.integration admin-audit.integration`. Les comptes/enregistrements synthétiques et mutations sont annulés par rollback.
