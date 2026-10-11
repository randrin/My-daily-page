# P3 — Page du jour

## Disponible

- `/dashboard/today` : trois tâches non terminées dues aujourd’hui, ordonnées par priorité puis heure d’échéance. Calcul dans le fuseau du profil, compteur des tâches terminées, édition et validation rapide.
- Arrivée sur cette page après connexion sans callback explicite ; les redirections demandées restent prioritaires.
- Pastille de couleur de catégorie sur les cartes.
- Dans **Notifications → Le rythme de ta journée** : résumé du matin et horaires silencieux. Les deux options sont désactivées par défaut.

## Digest du matin

Activer les rappels globalement, le canal Email et le résumé à 7h30. Le fuseau est celui du profil. Un email présente les trois premiers focus et un bouton vers la Page du jour. Les tâches terminées/archivées sont exclues ; aucun email si aucune tâche ne reste à faire aujourd’hui.

La planification tourne toutes les 30 secondes et utilise une queue BullMQ `daily-digests`. PostgreSQL conserve un enregistrement unique `(user_id, date)` dans `daily_digests`. Le worker recharge les préférences et les tâches au moment de l’envoi. Les horaires silencieux peuvent reporter le digest.

L’activation après 7h31 ne crée pas de résumé rétroactif : le prochain résumé sera celui du lendemain. Un job déjà planifié peut reprendre après une interruption, uniquement pendant la même journée locale. Un digest déjà traité n’est pas renvoyé lors d’une désactivation/réactivation.

Resend reçoit une clé d’idempotence stable. Le statut `sent` signifie accepté par Resend. Une interruption après la prise en charge (`sending`) ou un échec d’envoi (`uncertain`) exige une vérification fournisseur ; aucun renvoi aveugle. Les digests sont suivis séparément dans `daily_digests` et ne sont pas encore inclus dans l’historique des rappels de tâches.

## Horaires silencieux

Plage par défaut : 22h00–07h00, dans le fuseau utilisateur. Les plages traversant minuit sont prises en charge ; début et fin doivent être différents. Tous les canaux de rappel sont concernés, y compris l’email.

Le scheduler calcule la prochaine heure autorisée sans changer l’échéance ni la date initiale du rappel. Le worker revérifie ces horaires juste avant l’envoi et reporte le job BullMQ si nécessaire. La fin de la plage autorise l’envoi. Les changements d’heure sont traités en parcourant les instants réels.

Une tâche Urgente traverse cette plage uniquement si l’option d’autorisation explicite est activée. Le digest n’a pas cette dérogation. Une préférence modifiée ne peut pas retenir un message déjà transmis au fournisseur.

## Mise en place

Migration : `1758295200000-DailyPageSettings.ts` (appliquée sur la base locale durant l’implémentation). Sur un autre environnement : exécuter les migrations API, puis redémarrer l’API. Redis/BullMQ et Resend réutilisent la configuration P2 ; aucun nouveau service externe.

Pour vérifier : créer une tâche due aujourd’hui, activer Email, les rappels et le digest avant 7h30 locale. Pour les horaires silencieux, choisir une plage qui couvre l’heure courante et une fin proche, puis prévoir un rappel pendant cette plage. Il doit rester en attente jusqu’à la fin, sauf urgence autorisée.

Les tests utilisent des providers simulés : aucun SMS, WhatsApp ou email réel n’est envoyé. Ils couvrent le fuseau, le changement d’heure, les limites horaires, l’autorisation urgente, le report, le digest vide, les préférences désactivées, l’anti-doublon et l’incertitude réseau.

## Récurrence mensuelle

Dans le drawer de création/édition, choisir **Répétition → Tous les mois**. Une échéance est obligatoire. Terminer la tâche crée automatiquement une occurrence À faire avec le même titre, la description, la catégorie et la priorité. Les notes, dépendances, images et rappels manuels ne sont pas copiés ; les rappels automatiques suivent les préférences actuelles.

La date conserve le jour prévu et l’heure locale dans le fuseau du profil au moment de la génération. Le 31 devient le dernier jour d’un mois plus court, puis revient au 31. Les mois déjà passés sont sautés pour obtenir une prochaine échéance future. Une heure inexistante au changement d’heure est reportée au premier instant local valide ; une heure répétée utilise sa première occurrence. Modifier la date d’une occurrence redéfinit son jour de référence.

La clôture et la génération sont transactionnelles, avec verrou et unicité de l’occurrence suivante. Les confirmations répétées ne génèrent pas de doublon. Réouvrir la tâche terminée ne supprime pas l’occurrence déjà créée. Désactiver la répétition sur l’occurrence suivante arrête la série à sa clôture. Une tâche archivée ne génère pas de nouvelle occurrence.

Migration `1758295300000-MonthlyRecurrence.ts`, appliquée localement. Aucun nouveau service externe.

## Conflits horaires

Le formulaire de création/édition vérifie l’échéance sélectionnée via `GET /tasks/conflicts`. Un avertissement liste jusqu’à cinq autres tâches actives prévues à la même minute (avec compteur si davantage). Il reste possible d’enregistrer la tâche. La tâche éditée, les terminées et les archivées sont exclues. Le contrôle est isolé au compte connecté et utilise l’instant UTC issu du fuseau du profil.

Ce contrôle signale une coïncidence d’échéances, pas un chevauchement de durée : les tâches n’ont pas de durée. Il reste indicatif ; un autre utilisateur du même compte peut modifier le planning après la vérification. Aucun conflit ne bloque l’enregistrement ni la génération mensuelle automatique.

## Mode voyage

Dans **Préférences de notification → Le rythme de ta journée**, choisir le fuseau et renseigner **Suspendre jusqu’au**, puis enregistrer. Laisser la date vide (ou utiliser **Lever la pause** puis enregistrer) réactive les envois. Une date future est obligatoire lorsqu’une pause est renseignée.

La pause concerne tous les canaux et toutes les priorités, même les urgences. Elle conserve l’activation générale des notifications. À son expiration, la reprise est automatique et respecte les horaires silencieux. Les rappels de tâches encore valides peuvent partir à la reprise ; les résumés matinaux des journées suspendues sont annulés, sans rattrapage. Un message déjà transmis au fournisseur ne peut pas être retenu.

Changer le fuseau modifie les heures affichées et le calcul des journées, sans déplacer les instants des échéances existantes. Les heures locales inexistantes lors d’un changement d’heure sont refusées pour la pause.

Migration `1758295400000-TravelPause.ts`, appliquée localement. Déployer les migrations et redémarrer l’API sur les autres environnements. Aucun nouveau service externe : PostgreSQL et BullMQ existants suffisent.

Pour vérifier sans envoi réel, les tests couvrent la suspension des urgences, la reprise automatique, les horaires silencieux à la reprise, la validation et la conversion des fuseaux, ainsi que l’annulation d’un digest reporté au lendemain.

## Modèles de listes datées

Depuis la Page du jour, **Utiliser un modèle** propose Paie, Voyage ou Rentrée. Choisir la date de départ et l’heure : les trois étapes sont réparties sur trois jours consécutifs. L’aperçu affiche chaque échéance dans le fuseau du profil avant confirmation. Les dates passées sont bloquées et les heures inexistantes lors d’un changement d’heure sont refusées.

`POST /tasks/lists` valide entre 1 et 20 titres/échéances futures et crée toutes les tâches dans une transaction, sous le compte authentifié. Elles démarrent À faire, priorité Moyenne, sans catégorie ; elles sont ensuite modifiables individuellement. Les rappels suivent les préférences existantes. Aucun service externe ni migration nécessaire.

Les modèles sont prédéfinis ; l’édition de modèles personnels n’est pas incluse. Réutiliser un modèle crée une nouvelle liste. En cas d’erreur réseau après validation, vérifier les tâches avant de relancer la création.

## Priorité principale du jour

La première tâche du classement est mise en avant sur la Page du jour et dans le résumé du matin. Le classement reste explicite : priorité, puis échéance, puis identifiant pour départager les égalités. La page rappelle les dépendances si la tâche est bloquée. Terminer cette tâche actualise le classement et met en avant la suivante.

Ce choix utilise les priorités saisies par l’utilisateur ; il ne prétend pas estimer automatiquement le coût ou les conséquences d’un retard. Aucun email supplémentaire ni nouveau service.

## Montant, référence et image dans les rappels

Les formulaires de création/édition proposent un montant facultatif (positif ou nul, dix chiffres entiers maximum et deux décimales), une devise EUR/USD/XAF et une référence de 120 caractères maximum. Les données financières sont conservées comme décimaux, sans calcul flottant en base. Vider le montant ou la référence les supprime ; les tâches archivées restent en lecture seule. Les occurrences mensuelles reprennent ces informations.

Les rappels email, SMS et WhatsApp affichent le montant et la référence lorsqu’ils sont présents. L’email comporte aussi **Voir la pièce jointe** vers l’image appartenant à la tâche. Il s’agit d’un lien vers l’image existante, pas d’une pièce jointe binaire ; les PDF ne sont pas pris en charge. L’image n’est pas copiée aux occurrences mensuelles. Les liens doivent être accessibles depuis l’environnement du destinataire.

Migration `1758295500000-TaskFinancialDetails.ts`, appliquée localement ; à exécuter sur les autres environnements avant redémarrage de l’API. Aucun nouveau service externe.

## Réponses SMS / WhatsApp et bouton direct

Les rappels texte comportent un code tâche de 12 caractères. Répondre `FAIT <code>`, `1H <code>` ou `DEMAIN 9H <code>`. Sans code, une commande n’est acceptée que si une seule tâche active correspond aux rappels envoyés au numéro du profil dans les sept derniers jours. Le code ne remplace pas la vérification du numéro propriétaire. Les tâches archivées et les dépendances non terminées empêchent la clôture. La récurrence mensuelle est conservée.

`1H` suspend les rappels de cette tâche pendant une heure ; `DEMAIN 9H` jusqu’au lendemain à 9h dans le fuseau du profil, y compris au changement d’heure. Une nouvelle notification est planifiée sur le canal utilisé. L’échéance métier reste inchangée. Les rappels qui auraient dû partir pendant le report sont remplacés par ce rappel unique, pour éviter une rafale à la reprise. Une escalade dont une étape est ainsi annulée s’arrête. Les pauses générales et horaires silencieux peuvent reporter davantage l’envoi. Chaque événement fournisseur est enregistré avec une clé unique : une retransmission ne répète pas la mutation. Les groupes WhatsApp et messages émis par l’instance elle-même sont ignorés.

### Configuration Twilio

1. Exposer l’API en HTTPS (déploiement ou tunnel local).
2. Définir `TWILIO_INBOUND_URL=https://api.example.com/notification-webhooks/twilio` avec **l’URL exacte** configurée dans Twilio, sans réécriture ni query supplémentaire.
3. Sur le numéro SMS et le sender WhatsApp, configurer **A message comes in → POST** vers cette URL. L’API vérifie `X-Twilio-Signature`, l’AccountSid et le MessageSid, puis renvoie une confirmation TwiML.
4. Pour le bouton, créer et faire approuver un template `twilio/quick-reply` : corps `Rappel : {{1}}`, bouton **J’ai fait**, identifiant/payload `{{2}}`. Définir son SID dans `TWILIO_WHATSAPP_QUICK_REPLY_SID`. Le worker transmet le contenu en variable 1 et `FAIT <code>` en variable 2. Conserver `TWILIO_WHATSAPP_CONTENT_SID` comme template texte de repli.
5. Redémarrer l’API. Tester avec un rappel réellement reçu : code correct, replay, commande sans code ambiguë, puis bouton. Aucun template ni webhook externe n’est créé automatiquement par le projet.

Références : [sécurité des webhooks Twilio](https://www.twilio.com/docs/usage/webhooks/webhooks-security), [quick-reply et ButtonPayload](https://www.twilio.com/docs/content/twilio-quick-reply).

### Configuration UltraMsg

Définir un secret aléatoire dédié d’au moins 32 caractères dans `ULTRAMSG_WEBHOOK_SECRET`, différent de `ULTRAMSG_TOKEN`. Configurer **Webhook on Received** sur `https://api.example.com/notification-webhooks/ultramsg?secret=<secret>`. Le secret et l’instance sont vérifiés ; ne pas journaliser cette URL avec sa query. HTTPS est nécessaire. Ce mécanisme utilise un secret partagé dans l’URL, pas une signature de corps documentée par UltraMsg.

L’API renvoie le résultat dans sa réponse JSON au fournisseur ; elle n’envoie pas un second WhatsApp de confirmation. Vérifier la modification dans l’application. Les boutons interactifs sont implémentés pour Twilio ; UltraMsg utilise les réponses texte. [Format des événements UltraMsg](https://blog.ultramsg.com/receive-whatsapp-api-messages-use-webhook-nodejs/).

## PWA et canal Push

Le client fournit `/manifest.webmanifest`, deux icônes PNG et `/sw.js`. Installer l’application via le menu du navigateur. Dans les préférences, **Activer sur cet appareil** demande l’autorisation système, crée un abonnement et active le canal Push. Les rappels globaux doivent aussi être activés. La désactivation par appareil supprime son abonnement ; désactiver le canal Push bloque tous les appareils. Seuls les services push HTTPS FCM, Mozilla et Apple (sous-domaines de `push.apple.com` inclus) sont acceptés par le serveur.

1. Dans `api/`, générer les clés : `npx web-push generate-vapid-keys --json`.
2. Renseigner `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` et `VAPID_SUBJECT=mailto:<adresse-de-contact>` dans l’environnement API, puis redémarrer. Ne pas exposer la clé privée au client. Conserver les mêmes clés entre les déploiements ; leur rotation nécessite de réabonner les appareils.
3. Utiliser HTTPS en production ; localhost est accepté pour les tests. Sur iPhone/iPad, installer d’abord sur l’écran d’accueil puis activer depuis l’application installée.
4. Activer les rappels globaux et abonner l’appareil. Pour tester uniquement le push, désactiver temporairement les autres canaux et créer une tâche avec une échéance proche.
5. Fermer la page puis vérifier le rappel et son ouverture sur la Page du jour. Une connexion peut être requise. Aucun envoi réel n’a été déclenché pendant le développement.

L’ordre des canaux pour les tâches ordinaires est Email, Push, WhatsApp, SMS ; les urgences utilisent tous les canaux activés. Les préférences, pauses, snooze et plages silencieuses sont revérifiés avant envoi. Les abonnements expirés (404/410) sont supprimés. Un envoi partiellement accepté n’est pas relancé pour éviter les doublons. Le statut accepté ne prouve pas que l’utilisateur a vu le rappel.

Le service worker ne met en cache aucune page privée ni réponse API. Le mode hors ligne complet n’est pas inclus. Les permissions et abonnements restent soumis au navigateur ; désactiver sur un appareil partagé avant de changer de compte.

Références : [Web Push](https://github.com/web-push-libs/web-push), [installation PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable).

## Escalade adaptative et horaires silencieux intelligents

Deux options sont désactivées par défaut dans **Le rythme de ta journée**.

- **Escalade adaptative** : pour une tâche non urgente non terminée, un email à l’échéance, un deuxième au moins une heure après l’acceptation du premier, puis WhatsApp au moins une heure après le deuxième. Email et WhatsApp doivent être activés, avec numéro et consentement WhatsApp. Une tâche terminée/archivée, un canal désactivé ou une étape précédente échouée/annulée arrête l’escalade. Les urgences gardent leur séquence multi-canal existante. Les tâches en retard de plus de sept jours ne sont pas reprises. L’activation peut reprendre une tâche encore ouverte de ces sept derniers jours. « Non traitée » signifie non terminée dans l’application : aucune mesure d’ouverture des emails n’est effectuée.
- **Horaires silencieux intelligents** : une urgence dont l’échéance est aujourd’hui dans le fuseau du profil peut traverser la plage silencieuse. Une urgence pour un autre jour reste reportée. La dérogation générale « Autoriser les urgences » reste une option distincte. Aucune déduction médicale ou financière par mots-clés ; le mode voyage et le snooze restent prioritaires.

## Déploiement et validation restante

Migrations locales appliquées : `1758295600000-InboundReminders`, `1758295700000-WebPush`, `1758295800000-AdaptiveReminders`. Exécuter les migrations avant de redémarrer l’API sur les autres environnements. Le retour arrière WebPush supprime la table d’abonnements mais conserve la valeur PostgreSQL `PUSH`, car supprimer une valeur d’enum utilisée n’est pas sûr.

Redis/BullMQ, PostgreSQL et les comptes fournisseur P2 sont réutilisés. Le push utilise les services des navigateurs avec VAPID, sans nouveau compte fournisseur payant. Les paramètres nécessaires figurent dans `api/.env.example`.

Les tests automatisés et la vérification PostgreSQL avec rollback couvrent les règles et les écritures sans appel fournisseur. La roadmap distingue l’implémentation terminée des validations opérationnelles restantes : URLs HTTPS, template WhatsApp approuvé, clés VAPID, vrais appareils et envois réels. L’historique du digest reste séparé de l’historique des rappels de tâches.
