# Excédents SMS et suivi de livraison

## Résumé des excédents SMS

Le plafond reste de 3 SMS par utilisateur et journée locale. Chaque excédent est ajouté durablement à un digest unique `(user_id, date)` ; un rappel ne peut y apparaître qu’une fois. L’historique affiche « Regroupé dans le résumé email » : aucun SMS n’a été envoyé pour cet excédent.

Le digest est envoyé après la fin de la journée locale, au premier horaire autorisé par les pauses et horaires silencieux. Ce choix permet d’inclure les excédents de toute la journée dans un seul email. Il ne s’agit donc pas d’un email immédiat. Sans horaires silencieux, il peut partir juste après minuit ; avec une plage 22 h–7 h, il attend 7 h. L’opt-in du résumé du matin n’est pas requis : c’est le repli du canal SMS, soumis au consentement Email et aux rappels globaux.

Le worker revérifie ces préférences. Les tâches déjà terminées/archivées sont exclues avant le premier envoi. Le contenu est ensuite figé pour conserver une clé d’idempotence Resend stable. Un verrou PostgreSQL empêche deux workers d’envoyer le même digest. Une interruption après un envoi possible laisse un état `uncertain` à vérifier manuellement ; aucun renvoi aveugle. Les échecs explicites ont au plus trois tentatives BullMQ. Les tables `sms_overflow_digests` et `sms_overflow_items` permettent l’audit opérationnel.

## Migration et services

Exécuter `npm run migration:run` dans `api/`, puis redémarrer l’API et les workers. PostgreSQL, Redis/BullMQ et Resend existants sont réutilisés ; la nouvelle queue s’appelle `sms-overflow-digests`. Aucun service payant supplémentaire n’est nécessaire.

## Twilio — SMS et WhatsApp

Définir dans l’environnement API :

```dotenv
TWILIO_STATUS_CALLBACK_URL=https://<api>/notification-webhooks/twilio/status
```

Cette URL est fournie automatiquement au fournisseur à chaque nouvel envoi. Elle doit être publique et correspondre exactement à l’URL signée, sans réécriture. Le webhook vérifie le compte et `X-Twilio-Signature`. Les callbacks `delivered`, `read`, `failed` et `undelivered` alimentent le suivi. Le webhook de commandes `/notification-webhooks/twilio` reste distinct.

Documentation : https://www.twilio.com/docs/messaging/guides/track-outbound-message-status

## Resend — email et digest SMS

Créer un webhook dans Resend vers `https://<api>/notification-webhooks/resend`, avec les événements `email.sent`, `email.delivered`, `email.bounced`, `email.failed`, `email.complained`. Copier son secret dans :

```dotenv
RESEND_WEBHOOK_SECRET=whsec_...
```

Les signatures Svix sont vérifiées sur le corps brut avec contrôle d’horodatage. Une livraison email signifie l’acceptation par le serveur destinataire, pas une lecture humaine. Le digest transmet son résultat de livraison aux rappels qu’il contient. Les anciens rappels envoyés avant cette modification n’ont pas d’identifiant fournisseur enregistré : pas de confirmation rétroactive automatique.

Documentation : https://resend.com/docs/webhooks/verify-webhooks-requests

## UltraMsg — WhatsApp

Conserver l’URL HTTPS `/notification-webhooks/ultramsg?secret=<secret>` et le secret dédié existants. Activer **Webhook on ACK** en plus de la réception. Le secret et l’instance sont contrôlés avant traitement.

L’identifiant WhatsApp du webhook peut différer de l’ID numérique de l’API d’envoi. À réception d’un ACK, le serveur consulte donc l’API authentifiée UltraMsg pour retrouver les statuts par ID numérique, sans rapprochement approximatif par numéro ou titre. Une réconciliation toutes les minutes rattrape les callbacks précoces/manqués. `server` devient Envoyé, `device` devient Livré, `read`/`played` deviennent Lu. Les recherches sont bornées aux 1 000 derniers messages et aux rappels des 7 derniers jours ; à très gros volume, prévoir une réconciliation paginée dédiée. Si aucun statut fiable n’est trouvé, le rappel reste Accepté, jamais Livré par supposition.

Documentation : https://blog.ultramsg.com/whatsapp-message-delivery-read-status-ack/

## Historique et limites

L’API conserve séparément l’état du traitement (`SENT` = accepté) et `deliveryStatus` (livraison). Les badges affichent Livré, Lu, Livraison échouée, Signalé comme indésirable ou Regroupé. Les filtres incluent les livraisons et les rappels regroupés. Les doublons de callbacks sont ignorés et une notification ancienne ne fait pas régresser un statut Livré/Lu. Le Push conserve son statut d’acceptation : ces services n’offrent pas ici de confirmation d’affichage.

## Tests reproductibles

Depuis `api/`, avec Node compatible :

```bash
npm test -- --runInBand
P2_DATABASE_TESTS=1 npm test -- --runInBand delivery.integration.spec.ts
npm run test:p2
```

Le test PostgreSQL crée puis supprime un schéma isolé. Il couvre 15 collectes concurrentes, les replays, les callbacks précoces/hors ordre, deux traitements simultanés, un crash simulé et une coupure réelle d’un serveur HTTP local. Les fournisseurs sont simulés : aucun message réel. `test:p2` utilise deux workers BullMQ (concurrence 5 chacun) et 20 jobs de replay sur le même rappel, puis couvre le parcours PostgreSQL → Redis/BullMQ → fournisseur simulé → replay → annulation après clôture. Ce test de concurrence local ne constitue pas un benchmark de charge soutenue en production.

À valider après déploiement :

- [ ] Recevoir un nouveau SMS, WhatsApp et email ; observer les callbacks signés et le passage à Livré/Lu ou à un échec contrôlé.
- [ ] Dépasser le quota de 3 SMS avec des tâches de test ; constater un seul digest après clôture de la journée locale.
- [ ] Vérifier qu’une désactivation Email ou des rappels empêche l’envoi du digest et qu’une pause le décale.
- [ ] Exécuter plusieurs processus BullMQ avec une charge soutenue en staging, interrompre le réseau vers le fournisseur et tuer un worker pendant l’envoi ; vérifier qu’aucun envoi incertain n’est relancé automatiquement.
- [ ] Rejouer les callbacks réels, et vérifier le maintien du statut final et l’absence de doublons.

Ne pas cocher ces validations réelles sur la seule base des tests locaux.
