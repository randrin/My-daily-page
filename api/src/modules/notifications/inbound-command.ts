import { localDay } from './daily-timing';

export type InboundCommand = {
  action: 'done' | 'hour' | 'tomorrow';
  taskCode?: string;
};
export function parseInboundCommand(text: string): InboundCommand | undefined {
  const match = /^(FAIT|1H|DEMAIN\s+9H)(?:\s+([a-f0-9]{12}))?$/i.exec(
    text.trim(),
  );
  if (!match) return undefined;
  return {
    action: /^FAIT$/i.test(match[1])
      ? 'done'
      : /^1H$/i.test(match[1])
        ? 'hour'
        : 'tomorrow',
    taskCode: match[2]?.toLowerCase(),
  };
}
export function snoozeUntil(
  action: 'hour' | 'tomorrow',
  now: Date,
  timezone: string,
): Date {
  if (action === 'hour') return new Date(now.getTime() + 3600000);
  const day = new Date(`${localDay(now, timezone)}T12:00:00Z`);
  day.setUTCDate(day.getUTCDate() + 1);
  const targetDay = day.toISOString().slice(0, 10);
  const start = Date.parse(`${targetDay}T00:00:00Z`) - 14 * 3600000;
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  for (let minute = 0; minute < 52 * 60; minute++) {
    const instant = new Date(start + minute * 60000);
    if (
      localDay(instant, timezone) === targetDay &&
      formatter.format(instant) === '09:00'
    )
      return instant;
  }
  throw new Error('Impossible de calculer demain à 9h dans ce fuseau');
}
