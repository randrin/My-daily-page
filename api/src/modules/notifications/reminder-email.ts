import * as sanitizeHtml from 'sanitize-html';
import { Priority } from '@entities/enums';

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        char
      ],
  );

export function reminderEmail(input: {
  title: string;
  category?: string | null;
  priority?: Priority;
  description?: string | null;
  firstName?: string | null;
  deadline: Date | null;
  timezone: string;
  actionUrl: string;
  appUrl: string;
}) {
  const title = escapeHtml(input.title);
  const priorities: Record<
    Priority,
    { label: string; color: string; background: string }
  > = {
    [Priority.LOW]: { label: 'Basse', color: '#166534', background: '#dcfce7' },
    [Priority.MEDIUM]: {
      label: 'Moyenne',
      color: '#854d0e',
      background: '#fef9c3',
    },
    [Priority.HIGH]: {
      label: 'Haute',
      color: '#9a3412',
      background: '#ffedd5',
    },
    [Priority.URGENT]: {
      label: 'Urgente',
      color: '#991b1b',
      background: '#fee2e2',
    },
  };
  const priority = priorities[input.priority ?? Priority.MEDIUM];
  const rawDescription = input.description?.trim() ?? '';
  const descriptionHtml = sanitizeHtml(
    /<[a-z][\s\S]*>/i.test(rawDescription)
      ? rawDescription
      : escapeHtml(rawDescription).replace(/\r?\n/g, '<br>'),
    {
      allowedTags: [
        'p',
        'br',
        'strong',
        'b',
        'em',
        'i',
        'u',
        's',
        'ul',
        'ol',
        'li',
        'a',
      ],
      allowedAttributes: { a: ['href'] },
      allowedSchemes: ['https', 'http', 'mailto'],
    },
  );
  const hasDescription =
    sanitizeHtml(descriptionHtml, {
      allowedTags: [],
      allowedAttributes: {},
    }).replace(/&nbsp;|&#160;|\s/g, '').length > 0;
  const description = hasDescription
    ? `<div style="margin-top:20px;border-top:1px solid #e4e7ec;padding-top:16px;font-size:14px;line-height:1.6;overflow-wrap:anywhere"><strong>Description</strong><div>${descriptionHtml}</div></div>`
    : '';
  const date =
    input.deadline?.toLocaleString('fr-FR', {
      timeZone: input.timezone,
      dateStyle: 'full',
      timeStyle: 'short',
    }) ?? 'Non précisée';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"></head><body style="margin:0;background:#f4f6fa;font-family:Arial,sans-serif;color:#182230"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:auto;background:#fff;border:1px solid #e4e7ec;border-radius:16px"><tr><td style="padding:32px"><p style="margin:0 0 24px;color:#475467;font-size:13px;font-weight:bold">MY DAILY PAGE · RAPPEL</p><h1 style="margin:0 0 16px;font-size:26px">Une tâche attend ton attention</h1><p style="line-height:1.6">Bonjour${input.firstName ? ` ${escapeHtml(input.firstName)}` : ''}, voici la tâche à ne pas oublier.</p><div style="margin:24px 0;padding:20px;background:#f8fafc;border:1px solid #e4e7ec;border-radius:12px"><h2 style="margin:0 0 12px;font-size:20px">${title}</h2><p style="margin:0 0 16px;font-size:14px;line-height:1.8"><strong>Catégorie :</strong> ${escapeHtml(input.category?.trim() || 'Sans catégorie')}<br><strong>Priorité :</strong> <span style="display:inline-block;padding:2px 8px;border-radius:6px;color:${priority.color};background:${priority.background};font-weight:bold">${priority.label}</span></p><p style="margin:0;font-size:14px;line-height:1.6"><strong>Échéance :</strong> ${escapeHtml(date)}<br><span style="color:#667085">Fuseau : ${escapeHtml(input.timezone)}</span></p>${description}</div><p style="line-height:1.6">Tu as terminé ? Confirme-le pour clôturer la tâche et arrêter ses prochains rappels.</p><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="padding:8px 12px 8px 0"><a href="${escapeHtml(input.actionUrl)}" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:bold">J’ai fait</a></td><td style="padding:8px 0"><a href="${escapeHtml(input.appUrl)}/dashboard/tasks" style="display:inline-block;background:#eef2f6;color:#182230;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Voir mes tâches</a></td></tr></table><p style="margin:24px 0 0;font-size:12px;color:#667085;line-height:1.6">Le bouton ouvre une page de confirmation. L’ouverture de cet email ne modifie pas ta tâche. Le lien de confirmation est valable 7 jours.</p></td></tr></table></td></tr></table></body></html>`;
}
