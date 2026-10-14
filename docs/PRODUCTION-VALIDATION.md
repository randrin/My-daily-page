# Checklist de validation en production

Ces cases concernent des tests opérationnels, pas la présence du code. Les webhooks entrants sont reportés à la mise en production, à la demande de l’utilisateur. Ne les cocher qu’après observation du résultat réel.

## Configuration avant les tests

- [ ] Définir les origines HTTPS publiques : `APP_URL` pour le client, `PUBLIC_API_URL` pour l’API, et vérifier leur cohérence avec le déploiement.
- [ ] Vérifier PostgreSQL, Redis, l’API et les workers de notifications.
- [ ] Utiliser un compte et des tâches de test, un numéro de profil au format international, les rappels globaux et le canal testé activés.
- [ ] Vérifier les consentements WhatsApp, les pauses et les horaires silencieux avant chaque test.

## UltraMsg — commandes texte

- [ ] Configurer `ULTRAMSG_INSTANCE_ID`, `ULTRAMSG_TOKEN` et un `ULTRAMSG_WEBHOOK_SECRET` aléatoire dédié d’au moins 32 caractères ; garder les secrets hors du dépôt et des journaux.
- [ ] Brancher Webhook on Received sur `https://<api>/notification-webhooks/ultramsg?secret=<secret>`.
- [ ] Recevoir un rappel réel sur le numéro WhatsApp du profil, distinct du numéro de l’instance.
- [ ] Répondre `1H <code>` : vérifier un rappel futur unique, sans changement de l’échéance.
- [ ] Répondre `DEMAIN 9H <code>` sur une autre tâche : vérifier le report à 9 h dans le fuseau du profil.
- [ ] Répondre `FAIT <code>` : vérifier le statut Terminée et l’annulation des rappels en attente. UltraMsg ne renvoie pas de confirmation WhatsApp : vérifier dans l’application.

## Twilio — réception signée et bouton WhatsApp

- [ ] Configurer `TWILIO_INBOUND_URL=https://<api>/notification-webhooks/twilio` et exactement la même URL en POST dans la réception du numéro SMS et du sender WhatsApp.
- [ ] Configurer le provider WhatsApp Twilio et ses identifiants, puis un template texte approuvé dans `TWILIO_WHATSAPP_CONTENT_SID`.
- [ ] Faire approuver un template `twilio/quick-reply` avec contenu variable `{{1}}`, bouton « J’ai fait » et payload `{{2}}` ; renseigner `TWILIO_WHATSAPP_QUICK_REPLY_SID`. Entourer la variable du corps de texte fixe, par exemple « Rappel de tâche : {{1}}. Tu peux confirmer ci-dessous. ».
- [ ] Recevoir un rappel réel puis tester `FAIT <code>` et un report par SMS/WhatsApp ; vérifier la confirmation TwiML et la modification dans l’application.
- [ ] Recevoir un rappel avec bouton, cliquer « J’ai fait » et vérifier que seule la tâche correspondante passe en Terminée.

## Contrôles des webhooks

- [ ] Vérifier le rejet d’un secret UltraMsg incorrect et d’une signature Twilio invalide (HTTP 403, aucune modification).
- [ ] Rejouer le même événement fournisseur : vérifier l’absence de mutation ou de rappel supplémentaire.
- [ ] Vérifier qu’un autre numéro ne peut pas modifier la tâche et qu’une commande sans code ambiguë ne clôture aucune tâche.
- [ ] Vérifier le refus de clôture d’une tâche archivée ou encore bloquée par une tâche non terminée.

## PWA / Push et liens publics

- [ ] Installer la PWA depuis le domaine HTTPS de production et abonner à nouveau chaque appareil sur cette origine.
- [ ] Vérifier l’autorisation navigateur et système, puis recevoir réellement une bannière Push avec une échéance proche, page fermée.
- [ ] Vérifier le clic sur la notification, puis les liens email/SMS/WhatsApp, avec et sans session : destination publique correcte, sans localhost.
- [ ] Vérifier les navigateurs/appareils visés, dont iPhone/iPad depuis l’application ajoutée à l’écran d’accueil si ciblés.

## Fiabilité — reste du chantier P2

- [ ] Brancher et confirmer la livraison finale via les webhooks de statut fournisseurs implémentés : chantier distinct des webhooks de commandes ci-dessus. Voir [le protocole](NOTIFICATION-DELIVERY.md).
- [ ] Compléter les tests locaux déjà passés par un stress-test avec plusieurs processus BullMQ en production/staging, une interruption réseau vers les fournisseurs et un redémarrage ; contrôler les doublons et les envois incertains.

Pour chaque test, noter la date, l’environnement, le canal, la tâche de test, le résultat et l’identifiant fournisseur, sans secrets. Détails du fonctionnement : [P3 — Page du jour](P3-PAGE-DU-JOUR.md).

## P4 — Modèle IA et digest du dimanche

L’appel IA et la revue du dimanche sont implémentés. Les tests automatisés simulent les fournisseurs : ils ne prouvent ni le fonctionnement des identifiants déployés, ni la réception d’un email. Ces cases restent ouvertes jusqu’à observation réelle en staging ou production.

- [ ] Configurer les variables serveur `TEMPLATE_AI_OPENAI_API_KEY` et `TEMPLATE_AI_MODEL`, puis redémarrer l’API.
- [ ] Avec un compte de test, demander une suggestion IA à partir d’un texte sans données sensibles ; vérifier les propositions modifiables et l’absence de création avant confirmation.
- [ ] Confirmer les propositions retenues : vérifier les tâches, les échéances dans le fuseau du profil et l’absence de doublon.
- [ ] Activer les notifications générales, le canal Email et le résumé matinal du compte de test ; vérifier fuseau, heure configurée (7h30 par défaut), pauses et horaires autorisés.
- [ ] Un dimanche dans le fuseau du profil, vérifier scheduler et workers, réception réelle de « Ta revue du dimanche », compteurs de retards/blocages et CTA vers la revue sur le domaine déployé.
- [ ] Tester sans tâche due le dimanche mais avec retard ou blocage ; vérifier l’absence d’envoi sans tâche du jour, retard ni blocage.
- [ ] Vérifier l’absence de double envoi après redémarrage du worker.
- [ ] Consigner date, environnement, modèle, résultat et identifiant fournisseur email, sans secrets ni contenu privé.

L’historique exact des reports d’échéance reste **à implémenter**. La revue actuelle détecte les retards et blocages sans reconstituer les changements d’échéance précédents.
