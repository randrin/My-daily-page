# P2 — Configurer et vérifier les rappels

## Comportement implémenté

Les préférences sont explicites : un canal absent ou désactivé n’envoie rien. SMS nécessite le téléphone du profil. WhatsApp nécessite le numéro et la case de consentement dans Notifications.

Toutes les 15 secondes, l’API réconcilie les échéances avec les rappels persistés. Pour une tâche normale, un seul canal est choisi, dans cet ordre : email, WhatsApp, SMS. Pour une tâche urgente, les canaux activés sont planifiés à J-3, J-1, H-2 et à l’échéance ; les créneaux déjà passés sont ignorés. Le délai est calculé depuis l’instant ISO stocké en base, pas depuis l’heure du serveur. La timezone du profil sert à l’affichage du message et au plafond journalier SMS.

Les rappels sont persistés même si les envois sont désactivés. Le scheduler répare les jobs absents après un redémarrage. Chaque job utilise l’ID du rappel, trois tentatives et un backoff exponentiel de 30 secondes. Les jobs terminés sont conservés 7 jours ; les échecs 30 jours. Une modification d’échéance ou des préférences annule les futurs rappels devenus inutiles au prochain passage. Le worker revalide la tâche et les préférences avant chaque envoi. Une tâche terminée, archivée ou supprimée ne déclenche plus de rappel.

Le worker utilise un verrou PostgreSQL par rappel pour empêcher deux workers de traiter le même rappel simultanément. Un rappel SENT est ignoré. Resend reçoit une clé d’idempotence stable. Après une interruption pendant l’envoi, un rappel SENDING n’est pas renvoyé aveuglément : il passe en échec avec un message demandant de vérifier le fournisseur. Cela privilégie l’absence de doublons, sans promettre une livraison « exactement une fois » avec Twilio.

Après l’échec final de WhatsApp, un rappel email séparé est créé si l’email est activé. Le plafond SMS est de 3 rappels distincts par jour dans la timezone du profil, contrôlé atomiquement dans Redis. Un excédent passe en email si ce canal est activé ; sinon il échoue avec une erreur visible.

SENT signifie **accepté par le fournisseur**, pas reçu sur le téléphone ou dans la boîte mail. La page Notifications affiche les dates, tentatives et erreurs. Les webhooks de livraison restent à implémenter pour confirmer la réception.

Le lien signé « J’ai fait » est valable sept jours après le déclenchement. Il ouvre `/reminders/done` sur le client (`APP_URL`). Le client lit l’aperçu sans modifier la tâche, puis appelle POST uniquement après « Oui, j’ai fait ». La réussite affiche des confettis, masqués si la réduction des animations est activée. L’API valide toujours la signature et les bloqueurs. Les anciens liens API redirigent vers cette page client. APP_URL et l’URL API du client doivent être publics et en HTTPS en production.

## Services nécessaires

| Service | Rôle | Où configurer |
| --- | --- | --- |
| PostgreSQL | Utilisateurs, tâches, préférences, historique | `api/.env` : `DATABASE_URL` |
| Redis | BullMQ, jobs différés et quotas SMS | `REDIS_HOST`, `REDIS_PORT` |
| API Nest | Scheduler et worker BullMQ dans le même processus | garder le processus actif en continu |
| Resend | Emails | clé API et domaine expéditeur vérifié |
| Twilio SMS | SMS | compte, token, numéro expéditeur compatible avec les destinations |
| Twilio WhatsApp | WhatsApp | expéditeur WhatsApp et template approuvé |
| Client Next.js | Préférences et historique | URL API existante côté client |

Il n’y a pas de service worker séparé à démarrer dans cette version : démarrer l’API démarre le worker et le scheduler. Le compose API active désormais AOF et un volume Redis persistant (pris en compte au prochain `docker compose up -d redis`) ; un navigateur ouvert n’est pas nécessaire pour envoyer.

## Variables côté API

Ne jamais placer les clés Resend/Twilio dans `NEXT_PUBLIC_*` ni les commiter.

```dotenv
NOTIFICATIONS_ENABLED=false
APP_URL=http://localhost:3000
PUBLIC_API_URL=http://localhost:5500
REDIS_HOST=localhost
REDIS_PORT=6379
RESEND_API_KEY=
RESEND_FROM_EMAIL=My Daily Page <rappels@ton-domaine.fr>
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
TWILIO_WHATSAPP_NUMBER=whatsapp:+...
TWILIO_WHATSAPP_CONTENT_SID=HX...
```

`JWT_SECRET` doit être une valeur forte et stable : il signe aussi les liens de confirmation. Le template WhatsApp doit contenir une variable texte `{{1}}` correspondant au texte du rappel. Le code utilise `contentSid` et `contentVariables` pour les notifications hors fenêtre de conversation.

## Procédure locale

1. Dans `api/`, lancer `docker compose up -d postgres redis minio` avec le fichier `.env` existant. Le compose racine actuel est vide : utiliser celui de `api/`.
2. Appliquer les migrations avec `npm run migration:run`.
3. Lancer `npm run start:dev` dans `api/`, puis `npm run dev` dans `client/`.
4. Renseigner le profil, notamment la timezone. Dans Notifications, créer une préférence email activée. Pour WhatsApp, renseigner le numéro puis cocher le consentement.
5. Laisser `NOTIFICATIONS_ENABLED=false` pour vérifier les rappels planifiés sans contacter les fournisseurs. Attendre au plus 15 secondes puis consulter l’historique.
6. Configurer Resend, puis activer les envois avec `NOTIFICATIONS_ENABLED=true` et redémarrer l’API **uniquement lorsque les échéances existantes sont revues**. Les rappels PENDING arrivés à échéance pendant la désactivation pourront partir à l’activation.
7. Vérifier l’email reçu, le lien de confirmation et l’état de la tâche. Configurer ensuite SMS et WhatsApp et répéter le parcours sur les coordonnées du testeur consentant.

La migration `UserContactUniqueness1758294900000` est encore bloquée sur la base locale par des doublons de téléphone existants. Ils ne sont ni supprimés ni réassignés automatiquement. La migration P2 `ReminderWorkflow1758295000000` a été appliquée indépendamment sur cette base locale, mais la commande globale restera bloquée tant que ces doublons ne sont pas corrigés. Cette limitation doit être résolue avant un déploiement neuf cohérent.

## Resend

Créer un compte, ajouter un domaine expéditeur dans Resend, poser les enregistrements DNS demandés, vérifier le domaine puis créer une clé API d’envoi. Renseigner `RESEND_API_KEY` et `RESEND_FROM_EMAIL`. Commencer par une seule adresse de test autorisée.

Documentation : [vérifier un domaine](https://resend.com/docs/dashboard/domains/introduction), [clés d’idempotence](https://resend.com/docs/dashboard/emails/idempotency-keys).

## Twilio

SMS : créer le compte et un numéro capable d’envoyer des SMS, renseigner SID/token/numéro. Vérifier les restrictions du compte d’essai, les destinations et les autorisations géographiques avant de passer en production.

WhatsApp : commencer avec le Sandbox et y inscrire explicitement le numéro de test. Pour la production, enregistrer l’expéditeur WhatsApp et faire approuver le template. Les rappels automatiques hors fenêtre de 24 heures nécessitent un template approuvé : le texte libre ne suffit pas.

Documentation : [Sandbox WhatsApp](https://www.twilio.com/docs/whatsapp/sandbox), [notifications par template](https://www.twilio.com/docs/whatsapp/tutorial/send-whatsapp-notification-messages-templates), [concepts et fenêtre de conversation](https://www.twilio.com/docs/whatsapp/key-concepts).

## Vérifications automatisées

Dans `api/` : `npm test` et `npm run test:p2`. Le second test utilise PostgreSQL et Redis locaux, une queue isolée, un utilisateur temporaire supprimé à la fin et des providers simulés. Il ne contacte ni Resend ni Twilio. Il vérifie le délai, la persistance, l’absence de double rappel lors de deux réconciliations, un replay SENT et l’annulation après DONE.

Dans `client/` : `npm test`, `npm run typecheck`. Les tests couvrent la conversion UTC de l’heure sélectionnée, les offsets été/hiver et les heures inexistantes.

## Checklist de recette réelle

- [ ] Créer une tâche datée dans le futur avec email activé et vérifier le rappel PENDING.
- [ ] Recevoir l’email à l’heure attendue ; vérifier l’acceptation Resend et le contenu.
- [ ] Ouvrir « J’ai fait » : l’ouverture seule ne termine pas la tâche ; confirmer puis vérifier DONE.
- [ ] Modifier l’échéance avant l’envoi : l’ancien rappel est annulé et le nouveau planifié.
- [ ] Terminer/archiver/supprimer la tâche avant l’envoi : aucun message ne part.
- [ ] Rejouer un job SENT : aucun deuxième message.
- [ ] Simuler un fournisseur absent : état FAILED, jamais SENT.
- [ ] Vérifier le SMS sur le numéro du testeur.
- [ ] Vérifier le WhatsApp via template et consentement, puis son fallback email.
- [ ] Vérifier le plafond SMS et la bascule email.

## Restant dans P2

Réception réelle email/SMS/WhatsApp et callbacks de livraison ; regroupement des excédents en un digest email unique ; validation avec plusieurs workers et interruptions réseau réelles. Le digest du matin et les quiet hours restent dans P3. Le formulaire de tâche comprend une heure d’échéance (09:00 initialement, modifiable), convertie depuis la timezone du profil. Les heures inexistantes au changement d’heure sont refusées.

## Choix global par utilisateur

La page Préférences de notification permet d’activer ou suspendre tous les rappels via `notificationsEnabled` (colonne `users.notifications_enabled`). Les nouveaux comptes démarrent avec les rappels désactivés. La migration conserve les rappels actifs des comptes ayant déjà un canal activé.

Le scheduler ignore les utilisateurs désactivés et annule leurs rappels en attente au prochain passage (15 secondes). Le worker vérifie à nouveau le choix avant l’envoi. La réactivation reprend uniquement les rappels automatiques futurs, avec les canaux et consentements conservés. Un envoi déjà parti ne peut pas être annulé. La variable serveur `NOTIFICATIONS_ENABLED=true` reste nécessaire.

Migration : `1758295100000-UserNotificationsEnabled`. Routes JWT : `GET/PATCH /notification-preferences/settings`.

## Tester WhatsApp avec UltraMsg

Le fournisseur se sélectionne côté serveur. Twilio reste le choix par défaut et le fournisseur SMS ; UltraMsg peut remplacer uniquement WhatsApp.

```env
NOTIFICATIONS_ENABLED=true
WHATSAPP_PROVIDER=ultramsg
ULTRAMSG_INSTANCE_ID=instance123
ULTRAMSG_TOKEN=token_de_l_instance
APP_URL=https://adresse-publique-du-client
```

Créer une instance UltraMsg et connecter le compte WhatsApp expéditeur depuis leur interface. Renseigner son identifiant complet (`instance...`) et son token dans `api/.env`, puis redémarrer l’API. Aucun numéro expéditeur Twilio ni Content SID n’est requis pour UltraMsg. Les liens localhost ne sont pas accessibles depuis un autre téléphone : utiliser une adresse client accessible pour tester les CTA.

Dans le profil, renseigner le numéro WhatsApp destinataire au format international. Dans les préférences, activer Recevoir des rappels et le canal WhatsApp avec consentement. Désactiver temporairement Email, qui est prioritaire pour les tâches normales. Créer une tâche À faire, priorité Moyenne, avec échéance dans cinq minutes ; maintenir API et Redis démarrés. Vérifier l’historique (planifié puis accepté par le fournisseur) et la réception sur le téléphone. Une instance déconnectée peut conserver les messages dans la file UltraMsg : « accepté » ne signifie pas « livré ».

Les appels passent par `POST https://api.ultramsg.com/{instance_id}/messages/chat`, en formulaire URL-encodé avec `token`, `to` et `body` (4096 caractères maximum). Aucun secret n’est envoyé au client. Les erreurs réseau ou réponses ambiguës restent « Envoi en cours / à vérifier » pour éviter de renvoyer un message potentiellement accepté. Vérifier ces cas dans UltraMsg avant toute relance. Pour revenir à Twilio : `WHATSAPP_PROVIDER=twilio`, renseigner la configuration Twilio et redémarrer.

Documentation : https://docs.ultramsg.com/api/post/messages/chat
