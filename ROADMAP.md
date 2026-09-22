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

**Cette semaine :** finir P1 avant d’ouvrir Resend. Sans tâche persistée et sans téléphone en base, P2 sera du théâtre.

**Juste après P2, ne garder que trois compléments :** réponses `FAIT` / `DEMAIN`, tâches récurrentes mensuelles, plafond SMS. Le reste attend.

---

## P0 — Socle (en cours)

Auth, dashboard, tâches. Encore trop de mocks.

| Livrable | État | Pourquoi c’est bloquant ensuite |
|----------|------|--------------------------------|
| Auth JWT + refresh + NextAuth | Fait | Les jobs de rappel ont besoin d’un `userId` fiable. |
| Drawer tâche + période (range) | Fait (UI) | La deadline doit exister avant de planifier un envoi. |
| Dashboard encore sur mocks / localStorage | Dette | Un rappel sans tâche persistée n’a aucun sens. |
| Statut `complete` encore présent | Dette | Le mapper API refuse `complete` — les jobs rateront ces tâches. |

---

## P1 — Cœur réel (2–3 sem.)

Tâches et profil branchés sur l’API. Plus de `localStorage`.

| Histoire | Cible | Critère de fin |
|----------|--------|----------------|
| CRUD tâches via TanStack Query | `GET/POST/PATCH /tasks`, isolation JWT | Créer une tâche, recharger, elle est toujours là. |
| Catégories par user | Plus d’enum `work` / `personal` hardcodé | Créer « Admin », l’assigner, la supprimer (tâche sans cat.). |
| Profil : téléphone, WhatsApp, timezone | `PATCH /users/me` | Sans numéro, le canal SMS reste grisé. |
| Mapper `deadline` ↔ `dueDate` | `toDoBefore ≤ deadline` déjà en Zod | La période du drawer survit au refresh. |

---

## P2 — Rappels (3–4 sem.)

Échéance → email, SMS ou WhatsApp selon les préférences. **Cœur produit.**

| Histoire | Détail | Critère de fin |
|----------|--------|----------------|
| Préférences de canal | `email` / `sms` / `whatsapp`, chacun on/off | Activer SMS sans téléphone → 400 + message clair. |
| Rappel à la création | `triggerAt` = deadline (timezone user) | BullMQ programme le job, pas un `setTimeout` Nest. |
| Escalade d’une tâche urgente | J-3, J-1, H-2, à l’heure pile | 4 reminders `pending`, puis `sent` après le processor. |
| Email (Resend) en premier | Sujet + lien « J’ai fait » signé | Boîte mail réelle, pas un log console. |
| SMS puis WhatsApp (Twilio) | Même job, provider différent | Un user email-only ne reçoit jamais de SMS. |
| Idempotence | Un job rejoué n’envoie pas 2 fois | Retry BullMQ + statut `SENT` ignoré. |
| Plafond de notifications | Max 3 SMS / jour, 1 digest email | Au-delà, tout bascule en email. Protège Twilio. |

---

## P3 — Page du jour (2 sem.)

Une seule chose importante, digest du matin, quiet hours.

| Histoire | Détail | Critère de fin |
|----------|--------|----------------|
| Page du jour | 1–3 tâches dues aujourd’hui, urgent en tête | Au login, on atterrit ici, pas sur 40 cartes. |
| Digest 7h30 (timezone user) | Un seul message : « 2 urgentes aujourd’hui » | Pas 12 SMS le matin. |
| Quiet hours | ex. 22h–7h, sauf urgent explicite | Un rappel H-2 à 23h est reporté à 7h. |
| Marquer done depuis le message | Lien signé / bouton WhatsApp | La tâche passe `done` sans ouvrir l’app. |
| Réponses inbound | SMS / WhatsApp : `FAIT`, `DEMAIN 9H`, `1H` (snooze) | Un SMS « FAIT » clôture la tâche sans ouvrir l’app. |
| Tâches récurrentes | « Chaque 5 du mois » (loyer, Eneo, CNPS) | Le 5 suivant est créé + rappel J-1 après un `done`. |
| Conflit d’horaire | Deux tâches à la même heure | Warning à la création, pas à 18h01. |
| Mode voyage | Timezone + ne pas déranger jusqu’à une date | Jobs suivent le fuseau user, pas l’horloge serveur. |
| PWA / push | 4ᵉ canal, gratuit | Notif navigateur si SMS épuisé / crédit à zéro. |
| Modèles | « Semaine de paie », « Voyage », « Rentrée » | 1 tap → 5 tâches datées + rappels. |
| Montant + pièce jointe | Facture, référence, photo | Rappel : « 24 500 FCFA Eneo, aujourd’hui ». |

---

## P4 — IA (3–4 sem.)

Capturer, découper et prioriser les tâches quotidiennes.

| Capacité IA | Ce qu’elle fait | Garde-fou |
|-------------|-----------------|-----------|
| Capture en une phrase | « Payer Eneo vendredi, SMS » → tâche + rappel | Toujours demander confirmation avant d’écrire. |
| Découpage | Une tâche vague → 3 sous-tâches datées | L’user coche, l’IA ne crée pas 12 items. |
| Brief du matin | 3 lignes : quoi, pourquoi, dans quel ordre | Pas d’envoi autonome : le digest reste le canal. |
| Priorité suggérée | Deadline proche + mot « facture » → urgent | Override humain en 1 clic. |
| Inbox WhatsApp / mail | Forward d’un mail Eneo ou d’un vocal | L’IA propose une tâche, tu confirmes. |

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

- [ ] Brancher le dashboard sur `GET/POST /tasks` (finir les mocks).
- [ ] `PATCH /users/me` : `phoneNumber`, `whatsappNumber`, `timezone`.
- [ ] Écran Préférences : activer email / SMS / WhatsApp avec garde-fous.
- [ ] Entité `Reminder` + migration + enqueue BullMQ à la deadline.
- [ ] Premier email réel d’échéance, puis SMS, puis WhatsApp.
- [ ] IA seulement quand un rappel réel est déjà parti à l’heure.
- [ ] Ensuite seulement : réponses `FAIT` / `DEMAIN`, récurrentes mensuelles, plafond SMS.

---

Source : règles métier client/api (rappels, canaux, BullMQ) et état actuel du monorepo (auth faite, tâches encore mockées).
