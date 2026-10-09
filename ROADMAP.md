# Roadmap — page du jour qui rappelle vraiment

Produit : **My Daily Page**.  
Promesse : ne plus rater une tâche importante. Le rappel part au bon moment, sur le canal choisi (email, SMS, WhatsApp). L’IA allège la journée ; elle n’envoie jamais un message à ta place.

| | |
|---|---|
| Phases | P0 → P4 |
| Horizon | 10–13 semaines après stabilisation du socle |
| Canaux | email, SMS, WhatsApp |
| Cœur produit | **P2 — Rappels** |

## Déjà écrit dans les règles métier

Un rappel = `triggerAt` futur + canal. Le client **crée**, BullMQ **envoie** (Resend / Twilio). SMS et WhatsApp exigent un numéro. Timezone par défaut `Europe/Paris`. Ne jamais envoyer depuis le navigateur.

Voir `client` / `api` skills : `business-rules.md`.

---

## Séquence à suivre

| Phase | Durée | Objectif | Dépend de |
|-------|--------|----------|-----------|
| P0 Socle | Maintenant | Auth + UI tâches | — |
| P1 Cœur réel | 2–3 sem. | API + profil + deadline persistée | P0 |
| P2 Rappels | 3–4 sem. | Job à l’échéance, 3 canaux, préférences | P1 (tâche + téléphone) |
| P3 Page du jour | 2 sem. | Focus, digest, quiet hours, done depuis le message | P2 |
| P4 IA | 3–4 sem. | Capture, découpage, brief, priorité | P3 (sinon l’IA parle dans le vide) |
| P5+ Compléments | Après P2 | Récurrentes, réponses SMS, plafond, PWA… | Un vrai rappel déjà parti |

**Prochaine étape :** P0 stabilisé ; compléter les validations P1 restantes (notes, paramètres, catégories), puis terminer le workflow de rappels P2.

**Juste après P2, ne garder que trois compléments :** réponses `FAIT` / `DEMAIN`, tâches récurrentes mensuelles, plafond SMS. Le reste attend.

---

## Checklist vérifiée — 5 octobre 2026

Les P0–P5 sont les phases de la roadmap, à suivre dans cet ordre. Une case cochée signifie que l’implémentation est présente et vérifiée dans le code ; elle ne certifie pas un déploiement en production. Les critères nécessitant un parcours utilisateur complet ou un envoi réel restent décochés. « Partiel » indique une base existante qui ne satisfait pas encore le critère de fin.

### P0 — Socle et stabilisation

- [x] Auth JWT, refresh token et session NextAuth ; guards sur les pages dashboard et routes API. Preuves : `api/src/modules/auth/`, `client/src/auth/`, `client/src/auth/guards.ts`.
- [x] Formulaire de tâche en drawer avec validation Zod et erreurs de champs. Preuve : `client/src/components/tasks/task-form.tsx`.
- [x] Dashboard et pages tâches alimentés par l’API via TanStack Query. Preuves : `client/src/hooks/use-tasks.ts`, `client/src/components/dashboard/dashboard-screen.tsx`, `client/src/components/tasks/tasks-screen.tsx`.
- [x] Statuts actifs alignés : `todo`, `in-process`, `blocked`, `done`, `archived` ; le schema refuse `complete`. Preuves : schemas client et mapper API.
- [x] Nettoyer les fichiers legacy inutilisés : suppression de `context/task-context.tsx`, `mocks/tasks.mock.ts` et `mocks/categories.mock.ts`, après vérification de l’absence d’import actif. Le localStorage de `taskViewMode` reste limité à l’UI.
- [x] Résoudre les 3 erreurs TypeScript client : retrait de la prop `modal` invalide du Select, typage explicite du test `field-errors.test.ts`, retrait des données mock legacy. Vérification `tsc --noEmit` réussie.
- [x] Valider les parcours de bout en bout sur serveurs locaux : connexion NextAuth, validation des champs, création avec échéance, rechargement, modification, suppression et isolation de lecture/modification/suppression entre deux comptes. Parcours Playwright rejouable : `client/e2e/p0.mjs`, commande `npm run test:e2e`. Aucun message d’hydratation détecté.
- [x] Corriger les anomalies révélées par le parcours : redirection de connexion interne malgré une AUTH_URL configurée sur un autre port ; conservation de la saisie lors d’un refetch API ; fermeture du calendrier par Échap sans fermeture du drawer parent.

### P1 — Cœur réel

- [x] CRUD tâches persistant, filtres, tri et pagination, avec isolation par utilisateur JWT. Preuves : `api/src/modules/tasks/tasks.service.ts`, tests de service, API et hooks client.
- [x] CRUD catégories par utilisateur, sélection des catégories API. Preuves : modules catégories API et composants/hooks catégories client.
- [x] Profil : email, téléphone, WhatsApp et timezone ; changement de mot de passe. Route effective : `PATCH /auth/me`, et non `/users/me` dans l’ancienne roadmap. Preuves : module auth et `client/src/components/profile/`.
- [x] Échéance persistée et obligatoire à la création (DTO API + schema client), erreurs visibles dans le formulaire. Le modèle actif utilise `deadline` ; le range UI est converti en échéance.
- [x] Période du dashboard basée sur l’échéance : aujourd’hui → +7 jours / +1, +2 ou +3 mois ; période personnalisée. Les tâches hors échéance ou sans échéance sont exclues d’une période bornée. Preuves : `findInRange`, helpers de dates et tests.
- [x] Création depuis le calendrier avec échéance préremplie ; jours passés non créables. Preuves : `task-calendar.tsx`, `task-list.tsx`, helpers de dates et tests.
- [x] Blocage par tâches « À faire » ou « En cours », compteur des bloqueurs actifs et ouverture en édition depuis leur panneau. Preuves : `task-blockers.ts`, `task-blockers-list.tsx`, tests.
- [x] Images de tâches stockées via l’API, indicateur trombone et aperçu ; description riche. Preuves : module files, `task-image-field.tsx`, `task-card.tsx`, `lib/rich-text/`.
- [x] Notes multiples persistées, date de création et timeline dans un drawer dédié ; ajout masqué sur tâches archivées. Preuves : `TaskNote`, `task-notes.service.ts`, composants notes et tests.
- [x] Page Paramètres avec délai d’échéance par défaut par utilisateur ; date calendrier prioritaire ; vide = saisie obligatoire. Preuves : `defaultDeadlineDays`, `/auth/me/task-settings`, `task-settings-screen.tsx`, formulaire et tests.
- [x] Notifications de proximité d’échéance dans le header et ouverture de la tâche en édition. Ce menu est calculé depuis les tâches, il ne prouve pas l’envoi de rappels externes.
- [x] Vérifier en navigateur la persistance après refresh et sur un autre appareil pour tâches, notes, profil et paramètres ; tester deux comptes et l’isolation effective.
- [x] Vérifier la suppression d’une catégorie assignée et le passage de la tâche à « sans catégorie » sur une vraie base.

### P2 — Rappels : prochain chantier principal

- [x] Entités Reminder et préférences, migrations et routes de gestion isolées par utilisateur.
- [x] Préférences email / SMS / WhatsApp avec activation, contrôle des coordonnées et consentement explicite WhatsApp dans le formulaire.
- [x] Rappels automatiques selon les canaux activés ; priorité normale = un canal (email, puis WhatsApp, puis SMS), urgente = tous les canaux activés.
- [x] Jobs BullMQ différés à `triggerAt`, retries 3 fois et backoff exponentiel 30 s. Réconciliation toutes les 15 s et reprise après redémarrage.
- [x] Escalade urgente J-3, J-1, H-2 et échéance ; créneaux passés ignorés.
- [x] Heure d’échéance dans create/edit, conversion depuis la timezone du profil, validation des changements d’heure.
- [x] Fournisseur absent = échec explicite, jamais SENT. Envois désactivés par défaut (`NOTIFICATIONS_ENABLED=false`).
- [x] Replay SENT ignoré, ID de job stable, clé unique de planification, verrou PostgreSQL par rappel et clé d’idempotence Resend. Une livraison incertaine après interruption demande une vérification manuelle ; pas de garantie « exactement une fois » Twilio.
- [x] Historique dans Notifications : planification, acceptation fournisseur, tentatives, annulations et erreurs. SENT signifie acceptation, pas réception réelle.
- [x] Fallback email après échec final WhatsApp, uniquement si email activé ; le rappel WhatsApp reste FAILED.
- [x] Annulation/replanification après changement d’échéance, de préférences, done/archive/suppression (réconciliation sous 15 s, garde-fou worker juste avant envoi).
- [x] Plafond atomique de 3 rappels SMS/jour dans la timezone du profil ; excédents vers email activé.
- [x] Lien « J’ai fait » signé, expiration 7 jours ; GET de confirmation sans mutation, POST respecte les bloqueurs.
- [x] Workflow local PostgreSQL + Redis → job différé → provider simulé → SENT → replay ignoré → annulation DONE. Test rejouable : `api/test/p2-workflow.ts`, `npm run test:p2`.
- [x] Guide de configuration et recette : [docs/P2-RAPPELS.md](docs/P2-RAPPELS.md). Migration P2 appliquée localement sans modifier les doublons de coordonnées existants.
- [x] Recevoir un email réel Resend à l’heure attendue et valider le lien signé sur l’URL publique.
- [x] Recevoir un SMS et un WhatsApp Twilio réels avec template approuvé et consentement ; vérifier le fallback réel.
- [ ] Regrouper les excédents SMS dans un digest email unique (actuellement un email par excédent).
- [ ] Confirmer la livraison avec webhooks providers ; stress-test multi-workers et interruptions réseau réelles.

### P3 — Page du jour

- [x] Page focus : jusqu’à 3 tâches dues aujourd’hui, urgentes en tête, selon le fuseau du profil ; écran d’arrivée au login hors redirection explicite. Édition et validation rapide, compteur de progression et actualisation chaque minute (`/dashboard/today`).
- [x] Digest email à 7h30 dans la timezone utilisateur : un message regroupant les trois premiers focus, activable dans Notifications ; aucun envoi si la journée est vide. Suivi durable par utilisateur/jour, sans renvoi automatique en cas d’envoi incertain.
- [x] Horaires silencieux configurables (22h–7h par défaut), report des rappels et du digest hors plage ; dérogation pour les urgences uniquement si explicitement autorisée dans Notifications.
- [x] Marquer done depuis le lien signé avec confirmation/confettis, ou depuis un bouton WhatsApp Twilio quick-reply (template approuvé à configurer). UltraMsg conserve les commandes texte.
- [x] Réponses inbound SMS / WhatsApp : `FAIT`, `DEMAIN 9H`, `1H` avec code tâche, contrôle du numéro propriétaire, détection des ambiguïtés et idempotence. Webhook Twilio signé ; UltraMsg avec secret dédié. Le snooze conserve l’échéance.
- [x] Récurrence mensuelle : choix dans le formulaire ; prochaine occurrence créée après done (édition, validation rapide ou lien signé), sans doublon, avec rappels via le planificateur existant. Fins de mois et fuseau du profil pris en charge.
- [x] Détecter les tâches actives à la même minute et prévenir dans le formulaire de création/édition, sans bloquer l’enregistrement. Tâche éditée, terminées et archivées exclues ; vérification limitée aux tâches du compte.
- [x] Mode voyage : fuseau du profil et pause de tous les rappels jusqu’à une date/heure, reprise automatique avec horaires silencieux ; aucun rattrapage des résumés des journées suspendues.
- [x] PWA installable (manifest/icônes) et quatrième canal Push : abonnement explicite par appareil, envoi BullMQ/Web Push, nettoyage des abonnements expirés, respect des pauses/horaires/préférences. Clés VAPID à configurer.
- [x] Modèles de listes datées : paie, voyage, rentrée depuis la Page du jour ; aperçu des trois échéances dans le fuseau du profil et création transactionnelle.
- [x] Montant et référence facultatifs dans les tâches et rappels email/SMS/WhatsApp ; devise EUR/USD/XAF. L’email propose un CTA vers l’image jointe existante (pas de pièce jointe binaire ni PDF).
- [x] Une priorité principale du jour mise en avant sur la page et dans le digest, avec explication du classement (priorité puis échéance) et indication des dépendances si bloquée.
- [x] Escalade adaptative activable : pour les tâches non urgentes toujours ouvertes, deux emails espacés d’au moins une heure puis WhatsApp une heure après le second ; nécessite les deux canaux avec consentement WhatsApp. Arrêt si clôture, pause respectée, aucun renvoi aveugle d’une étape incertaine.
- [x] Horaires silencieux intelligents activables : dérogation pour les urgences dues le jour courant dans le fuseau du profil ; le mode voyage reste prioritaire.

Validation opérationnelle P3 (distincte de l’implémentation) :
- [ ] Brancher les URLs publiques de webhooks, le secret UltraMsg et le template Twilio approuvé ; tester un vrai `FAIT`, un report et un bouton WhatsApp.
- [ ] Configurer les clés VAPID et tester installation + réception push sur les navigateurs/appareils visés.
- [ ] Observer une escalade réelle complète et le passage d’une plage silencieuse, avec les préférences utilisateur voulues.
- [x] Tests automatisés et vérification PostgreSQL en transaction annulée, sans envoi réel.

### P4 — IA, après validation des rappels réels

- [ ] Capture en une phrase → proposition de tâche et rappel, confirmation avant création.
- [ ] Découpage en sous-tâches datées, sélection humaine avant écriture.
- [ ] Brief du matin : quoi, pourquoi, ordre ; intégration au digest.
- [ ] Priorité suggérée selon échéance et contenu, modifiable par l’utilisateur.
- [ ] Inbox mail / WhatsApp / vocal → proposition confirmée par l’utilisateur.
- [ ] Anti-charge mentale : limiter les urgences et reporter les autres propositions.
- [ ] Revue du dimanche : tâches reportées et points bloquants.

### P5+ — Compléments à arbitrer

- [ ] Fenêtres d’énergie basées sur les habitudes de réalisation.
- [ ] Binôme de redevabilité, avec consentement explicite.
- [ ] Définir la priorité des futurs réglages : catégorie et priorité par défaut, délai de rappel, période dashboard, vue et tri initial.

### Résultat des vérifications

Audit du code et tests locaux le **5 octobre 2026** :

- **API : 70 tests réussis dans 15 suites ; TypeScript valide.**
- **Client : 93 tests réussis dans 20 fichiers ; TypeScript valide.**
- Parcours navigateur P0 complet validé le 5 octobre 2026 sur les vrais serveurs locaux, avec deux comptes de test. Rapport : `client/test-results/p0/report.json` (ignoré par Git) ; mode d’emploi : `client/e2e/README.md`. Aucun envoi Resend/Twilio effectué.
- Les cases cochées décrivent le code actuel du workspace, y compris ses modifications non commitées.

---

### Ce que l’IA ne doit pas faire

- Envoyer un WhatsApp toute seule
- Inventer une deadline
- Marquer une tâche `done`
- Utiliser tes messages pour entraîner un modèle public

Le modèle propose, tu confirmes, BullMQ exécute.

---

## Comment un rappel doit vivre

Exemple : tâche urgente, deadline le 21 sept. 18h, timezone `Europe/Paris`, canaux email + WhatsApp.

| Quand | Quoi | Canal | Si ça échoue |
|-------|------|-------|--------------|
| À la création | 4 jobs : J-3, J-1, H-2, 18h pile | Selon préférences | Job leftover, pas d’envoi HTTP |
| J-1 18h | « Demain : payer le loyer » | Email (léger) + WhatsApp si urgent | Retry 3×, puis `failed` + pastille dashboard |
| 21 sept. 18h | Rappel d’échéance, bouton J’ai fait | Canal préféré primaire | Fallback : email si WhatsApp 400 |
| Après `done` | Annuler les jobs restants | — | Un done tardif ne doit plus spammer |

### Règle d’or des canaux

- **Email** = défaut, presque gratuit, lien signé. Premier canal à brancher.
- **SMS** = court, cher, pour l’urgent. `phoneNumber` requis. ~160 caractères.
- **WhatsApp** = conversationnel, opt-in explicite (template Twilio). `whatsappNumber` requis. Bon pour « Réponds FAIT ».

Un user peut n’en activer qu’un. Jamais les trois à la même seconde sauf priorité `urgent`.

---

## Préférences utilisateur (P1–P2)

| Canal | Condition | Usage |
|-------|-----------|--------|
| Email | Toujours disponible (compte) | Digest + lien « J’ai fait » |
| SMS | `phoneNumber` renseigné | Urgent / échéance du jour |
| WhatsApp | `whatsappNumber` + opt-in | Réponse « FAIT » |

---

## Suggestions innovantes (après P2)

À ne pas commencer avant qu’un vrai SMS parte à l’heure. Sinon tu construis un démo IA sur un agenda mort.

| Idée | Pourquoi c’est différent | Impact | Effort |
|------|--------------------------|--------|--------|
| Une seule chose | Le matin, l’app choisit LA tâche qui, si ratée, coûte cher. | Très haut | P3, 3 jours |
| Escalade adaptative | Tu ignores l’email 2 fois → prochain rappel en WhatsApp. | Haut | P3, 1 sem. |
| Quiet hours intelligentes | Pas de SMS à 23h sauf « hôpital / paiement aujourd’hui ». | Haut | P3, 4 jours |
| Done depuis le message | Un tap, la journée avance. Zéro ouverture d’app. | Très haut | P3, 1 sem. |
| Capture vocale / phrase | « Rappelle-moi le dossier CNPS lundi 9h par SMS ». | Haut | P4, 1–2 sem. |
| Anti-charge mentale | L’IA refuse 8 tâches « urgentes ». Elle en garde 2 et park les autres. | Haut | P4, 1 sem. |
| Fenêtre d’énergie | Tâches admin le matin, appels l’après-midi — appris de tes `done`. | Moyen | Plus tard |
| Binôme de redevabilité | Si tu rates 2 échéances, un contact de confiance est prévenu (opt-in). | Fort | Plus tard, RGPD |
| Revue du dimanche | 5 bullets : ce qui a glissé, ce qui bloque la semaine. | Moyen | P4, 3 jours |
| Réponses `FAIT` / `DEMAIN` / `1H` | Le SMS devient un mini-assistant. Suite du bouton « J’ai fait ». | Très haut | P3, 1–2 sem. |
| Plafond SMS | Max 3 SMS / jour, le reste en email. | Haut | P2 fin / P3, 2 jours |
| Tâches récurrentes mensuelles | Loyer, Eneo, CNPS : le cas d’usage #1 admin perso. | Très haut | P3, 1–2 sem. |
| Montant + pièce jointe | Le rappel cite le montant et la facture. | Haut | P3, 1 sem. |
| Conflit d’horaire | Deux tâches à 18h détectées à la création. | Moyen | P3, 3 jours |
| Mode voyage | Fuseau + pause des rappels non urgents. | Haut | P3, 4 jours |
| PWA / push | 4ᵉ canal gratuit quand le SMS est trop cher. | Haut | P3, 1 sem. |
| Modèles de listes | 1 tap → semaine de paie / voyage déjà daté. | Moyen | P3, 3 jours |
| Inbox mail / WhatsApp | Un forward devient une tâche proposée. | Haut | P4, 1–2 sem. |

### Hors scope pour l’instant

Listes partagées, binôme de redevabilité (déjà en « plus tard »), Apple Watch, sync Google Calendar complète. Ça dilue l’isolation `userId` et le focus « *ma* page du jour ».

---

## Stack déjà prévue — ne pas réinventer

| Couche | Outil | Rôle |
|--------|--------|------|
| API | Nest + TypeORM + JWT | Tâches, reminders, préférences |
| Queue | BullMQ + Redis | Déclenchement à `triggerAt` |
| Email | Resend | P2 semaine 1 |
| SMS / WhatsApp | Twilio | P2 semaines 2–3 |
| Client | Query + Zod + NextAuth | Préférences, page du jour |
| IA | API dédiée côté Nest | P4 seulement, jamais depuis le client |

---

## Prochaines actions concrètes

- [x] Corriger les 3 erreurs TypeScript client et nettoyer les restes legacy (P0).
- [ ] Valider la persistance, l’isolation et les parcours navigateur du cœur produit (P1).
- [x] Relier création/modification de tâche → rappels → jobs différés, selon les préférences (P2).
- [x] Sécuriser les garde-fous des canaux, les replays et les providers non configurés (P2).
- [ ] Recevoir un premier email réel d’échéance, puis SMS et WhatsApp (P2).
- [ ] Ensuite : réponses `FAIT` / `DEMAIN`, récurrentes mensuelles et plafond SMS (P2 fin / P3).
- [ ] Commencer l’IA uniquement après validation d’un rappel réel parti à l’heure (P4).

---

Source : audit du code client/API et tests locaux du 5 octobre 2026. Les tableaux de scénarios et suggestions ci-dessus décrivent les objectifs ; la checklist vérifiée indique leur état réel.
