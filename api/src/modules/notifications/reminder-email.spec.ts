import { Priority } from '@entities/enums';
import { reminderEmail } from './reminder-email';

describe('Reminder email', () => {
  it('renders explicit CTAs and escapes user content', () => {
    const html = reminderEmail({
      title: '<script>test</script>',
      firstName: 'Marie',
      deadline: new Date('2026-10-06T12:00:00Z'),
      timezone: 'Europe/Paris',
      actionUrl: 'https://app.example.com/reminders/done?token=signed',
      appUrl: 'https://app.example.com',
    });
    expect(html).toContain('J’ai fait');
    expect(html).toContain('Voir mes tâches');
    expect(html).toContain('Échéance');
    expect(html).toContain('Bonjour Marie');
    expect(html).not.toContain('<script>');
    expect(html.replace(/<[^>]*>/g, '')).not.toContain('https://');
  });
  const base = {
    title: 'Ma tâche',
    deadline: null,
    timezone: 'Europe/Paris',
    actionUrl: 'https://app.example.com/done',
    appUrl: 'https://app.example.com',
  };
  it('includes category, French priority and sanitized rich description', () => {
    const html = reminderEmail({
      ...base,
      category: '<Travail>',
      priority: Priority.URGENT,
      description:
        '<p>Préparer <strong>le rapport</strong></p><script>alert(1)</script><a href="javascript:alert(1)">Lien</a><img src="x" onerror="alert(1)">',
    });
    expect(html).toContain('&lt;Travail&gt;');
    expect(html).toContain('Urgente');
    expect(html).toContain('<strong>le rapport</strong>');
    expect(html).not.toMatch(/<script|<img|javascript:|onerror/);
  });
  it.each([null, '', '<p><br></p>', '<p>&nbsp;</p>'])(
    'omits an empty description: %s',
    (description) => {
      const html = reminderEmail({ ...base, description });
      expect(html).not.toContain('<strong>Description</strong>');
      expect(html).toContain('Sans catégorie');
    },
  );
  it('preserves line breaks in plain descriptions and renders each priority', () => {
    for (const [priority, label] of [
      [Priority.LOW, 'Basse'],
      [Priority.MEDIUM, 'Moyenne'],
      [Priority.HIGH, 'Haute'],
      [Priority.URGENT, 'Urgente'],
    ] as const) {
      const html = reminderEmail({
        ...base,
        priority,
        description: 'Première ligne\nDeuxième ligne',
      });
      expect(html).toContain(label);
      expect(html).toContain('Première ligne<br />Deuxième ligne');
    }
  });
});
