import { Priority } from '@entities/enums';
export function suggestPriority(
  title: string,
  deadline: Date | null,
  now: Date,
) {
  if (/\burgent(?:e)?\b/i.test(title))
    return {
      priority: Priority.URGENT,
      reason: 'Urgence explicitement mentionnée ; à confirmer.',
    };
  if (deadline && deadline.getTime() - now.getTime() <= 86400000)
    return {
      priority: Priority.HIGH,
      reason: 'Échéance proche ou dépassée ; à vérifier.',
    };
  if (
    /facture|paiement|loyer|imp[oô]t|médical|medical|hôpital|hopital/i.test(
      title,
    )
  )
    return {
      priority: Priority.HIGH,
      reason:
        'Le contenu évoque une conséquence financière ou un rendez-vous de santé ; à confirmer.',
    };
  return {
    priority: Priority.MEDIUM,
    reason: 'Aucun signal d’urgence explicite ; priorité moyenne proposée.',
  };
}
export function limitUrgencies<
  T extends { priority: Priority; reason: string },
>(items: T[]) {
  let urgencies = 0;
  return items.map((item) => {
    const deferred = item.priority === Priority.URGENT && ++urgencies > 2;
    return {
      ...item,
      priority: deferred ? Priority.HIGH : item.priority,
      selected: !deferred,
      deferred,
      reason: deferred
        ? 'Plus de deux urgences proposées : mise de côté pour alléger la journée. Tu peux la replanifier.'
        : item.reason,
    };
  });
}
export function explainTask(
  priority: Priority,
  blocked: boolean,
  deadline: Date | null,
  now: Date,
) {
  if (blocked)
    return 'Dépendance ouverte : terminer ou clarifier les tâches qui bloquent avant de commencer.';
  if (deadline && deadline < now)
    return 'Échéance dépassée : décider de terminer ou de replanifier cette tâche.';
  if (priority === Priority.URGENT)
    return 'Priorité urgente choisie pour cette tâche : vérifier son échéance en premier.';
  if (priority === Priority.HIGH)
    return 'Priorité haute : avancer après les urgences, selon l’heure d’échéance.';
  return 'Avancer après les priorités plus élevées, dans l’ordre des échéances.';
}
