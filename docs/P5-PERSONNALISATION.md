# P5+ — Personnalisation, habitudes et binôme

## Valeurs par défaut

Dans **Paramètres → Valeurs par défaut et affichage**, chaque utilisateur peut choisir sa catégorie et priorité initiales, un délai de rappel de 0 à 10 080 minutes, la période initiale du dashboard (7 jours ou 1/2/3 mois), la vue tâches (tableau/grille) et son tri initial. Le délai d’échéance déjà disponible reste dans son bloc existant.

- Les choix explicites de la tâche, du calendrier, d’un modèle ou d’une proposition IA restent prioritaires. Le formulaire standard de nouvelle tâche préremplit catégorie/priorité ; l’API utilise ces défauts si les champs sont omis. `categoryId: null` signifie explicitement aucune catégorie.
- Une catégorie doit appartenir au compte. Sa suppression efface aussi le défaut associé.
- Le délai de rappel est mémorisé **par nouvelle tâche**, via un trigger PostgreSQL. Modifier le défaut n’affecte pas les tâches existantes. Les anciennes tâches gardent 0 minute.
- Un rappel non urgent part à `deadline - délai`. Un créneau déjà passé n’est pas rattrapé. Le rappel à l’échéance est remplacé par ce créneau, sans ajout d’un deuxième rappel.
- L’escalade urgente existante est inchangée. L’escalade adaptative, lorsqu’elle s’applique, reste prioritaire. Les pauses, horaires silencieux, canaux activés, plafonds et préférences utilisateur continuent de s’appliquer.
- Une récurrence mensuelle nouvellement créée reçoit le défaut de rappel en vigueur au moment de sa création. Les rappels manuels conservent leurs propres horaires.
- Vue/tri/période sont des valeurs initiales persistées côté API ; les ajustements ponctuels d’une page restent de l’UI.

Routes JWT : `GET/PUT /personalization/defaults` ; DTO strict, isolation utilisateur et validation de la catégorie.

## Créneaux observés — fenêtres d’énergie

Page **Organisation → Habitudes et binôme** (`/dashboard/companion`). L’observation est **désactivée par défaut** et s’active explicitement. Il ne s’agit pas d’un diagnostic d’énergie ou de santé : le classement décrit uniquement des heures de clôture observées.

Un trigger capture la première transition réelle vers `DONE` après activation, quel que soit le parcours de clôture (édition, action rapide, lien signé, commande inbound). Il n’utilise pas `updated_at` pour inventer une date de réalisation historique. La réouverture puis clôture d’une même tâche ne compte pas deux fois.

- Conservation glissante de 90 jours ; suppression immédiate des observations à la désactivation. Les tâches restent intactes.
- Données limitées à l’utilisateur, l’identifiant de tâche et l’instant UTC. Les heures sont agrégées dans le fuseau actuel du profil.
- Trois heures au maximum sont proposées après au moins cinq clôtures sur trois dates locales distinctes. Avant ce seuil, l’écran explique les données encore manquantes.
- Les créneaux apparaissent sur la page dédiée et comme boutons dans le formulaire de **nouvelle tâche**. Cliquer préremplit seulement l’heure : la date, l’échéance et l’enregistrement restent sous contrôle de l’utilisateur. Aucune tâche existante ni aucun rappel n’est déplacé automatiquement.
- La collecte verrouille le consentement utilisateur lors de la clôture pour respecter une désactivation concurrente.

Routes : `GET/PUT /personalization/energy`.

## Binôme de redevabilité

La première version utilise **deux comptes My Daily Page existants**. Un lien privé est partagé manuellement par son créateur : l’application n’envoie pas d’invitation par email/SMS/WhatsApp à un contact non sollicité.

1. Le propriétaire saisit l’email du compte choisi et confirme explicitement le partage de son prénom et du **nombre** de tâches en retard depuis plus de 24 heures.
2. L’API produit un jeton aléatoire valable sept jours ; seul son hachage est stocké. Le lien est affiché une seule fois. Une invitation/relation sortante active maximum ; cinq invitations créées par jour maximum.
3. Le destinataire ouvre `/companion-invite#jeton`. Le fragment n’est pas envoyé au serveur de pages. Le navigateur conserve temporairement l’invitation en `sessionStorage` pour le retour de connexion ; les appels API transmettent le jeton dans le corps JSON, pas dans l’URL.
4. Le destinataire se connecte avec le compte initialement ciblé. L’API vérifie **l’identifiant du compte et son email**, l’expiration, le statut et le propriétaire actif. Changer d’email ou créer un autre compte ne permet pas de reprendre l’invitation.
5. L’écran expose le partage minimal. **Accepter** exige un second consentement explicite ; **Refuser** ferme l’invitation. Lire le lien n’accepte rien. Un destinataire peut suivre cinq binômes au maximum.
6. Chacun peut suspendre sa participation ou révoquer définitivement la relation. La reprise après révocation exige une nouvelle invitation et deux nouveaux accords. Les anciennes alertes annulées ne sont pas rattrapées lors d’une réactivation. Si le destinataire change d’email, les envois cessent jusqu’à la création d’une nouvelle relation consentie.

### Déclenchement et données partagées

Une alerte email est envisagée lorsque le propriétaire a **au moins deux tâches ouvertes** (`TODO`, `IN_PROGRESS`, `BLOCKED`) dont l’échéance est dépassée depuis plus de 24 heures. Aucun titre, description, note, montant, catégorie, document ou liste de tâches n’est transmis au binôme.

L’envoi exige la relation acceptée, les deux participations actives, les deux comptes non suspendus, les notifications générales et le canal Email activés chez chacun, ainsi que `NOTIFICATIONS_ENABLED=true` sur le serveur. Aucun second fournisseur n’est ajouté ; **Resend** et Redis/BullMQ sont réutilisés.

- Maximum un email par relation et par **journée locale du propriétaire**, via contrainte unique persistée et ID BullMQ stable.
- Réconciliation toutes les 60 secondes ; les deux pauses et plages silencieuses sont revérifiées par le worker. Une alerte devenue périmée au changement de journée est annulée.
- Revalidation de la relation, du seuil et des préférences juste avant envoi. Les verrous de compte existants empêchent une suspension de contourner le contrôle ; la révocation attend un envoi déjà en cours, puis bloque les suivants. Un message déjà transmis ne peut pas être rappelé.
- État `sending` persisté avant l’appel Resend. Acceptation enregistrée avec l’identifiant fournisseur. Une interruption ambiguë passe en `uncertain`, sans renvoi aveugle. L’acceptation ne garantit pas la livraison réelle.
- Les vingt dernières alertes sont visibles sur la page dédiée. Leur suivi est séparé des rappels de tâches, car elles ne portent sur aucune tâche particulière.
- Alertes et observations expirent après 90 jours. Invitations closes/expirées sont supprimées 90 jours après leur fermeture/expiration. Relations acceptées restent conservées pendant leur utilisation. Le nettoyage tourne lorsque l’API est démarrée, même si les envois sont globalement désactivés.

Routes : `/personalization/companions`, `/personalization/invitation/inspect`, `/accept`, `/decline`, `/companions/:id`, `/companions/:id/revoke` et `/personalization/deliveries` ; toutes exigent un JWT. Les révo­cations et consentements sont réservés aux deux parties, jamais à un `userId` fourni par le client.

## Déploiement et recette

Appliquer la migration `1758297200000-Personalization`, redémarrer l’API et le client. Pas de clé IA ni de nouveau fournisseur requis. Pour les emails de binôme : PostgreSQL, Redis/BullMQ, les clés Resend habituelles, `APP_URL` pointant vers le client et le drapeau global d’envoi doivent être configurés. Aucun opt-in, invitation ou email réel n’est créé par la migration.

Tests PostgreSQL rejouables :

```bash
cd api
PERSONALIZATION_DATABASE_TESTS=1 npm test -- --runInBand personalization.integration
```

Ils vérifient l’isolation des défauts, leur priorité face aux choix explicites, la suppression des catégories, le snapshot du délai, le consentement de collecte, la non-duplication des clôtures, l’effacement des observations, le destinataire lié au compte, la non-réutilisation d’invitation, la révocation et l’envoi minimal sans replay avec un fournisseur simulé. Les comptes et changements de test sont annulés par rollback.

Recette opérationnelle restante, distincte du code livré : tester avec deux comptes réels consentants le partage du lien, la reconnexion MFA, l’acceptation, une véritable réception email et le passage d’une plage silencieuse ; vérifier l’UI sur mobile et après reconnexion. Aucun message réel n’est envoyé par les tests automatisés.
