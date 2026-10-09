import { Priority } from '@entities/enums';

export type DailyTiming = {
  timezone: string;
  notificationsPausedUntil?: Date | null;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  quietHoursAllowUrgent: boolean;
  smartQuietHoursEnabled?: boolean;
};

export function localDay(now: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

function localMinutes(now: Date, formatter: Intl.DateTimeFormat): number {
  const parts = formatter.formatToParts(now);
  return (
    Number(parts.find((p) => p.type === 'hour')?.value) * 60 +
    Number(parts.find((p) => p.type === 'minute')?.value)
  );
}

export function nextDeliveryTime(
  now: Date,
  settings: DailyTiming,
  priority?: Priority,
  deadline?: Date | null,
): Date {
  const pauseEnd = settings.notificationsPausedUntil;
  if (pauseEnd && pauseEnd.getTime() > now.getTime()) now = pauseEnd;
  if (
    !settings.quietHoursEnabled ||
    (priority === Priority.URGENT &&
      (settings.quietHoursAllowUrgent ||
        (settings.smartQuietHoursEnabled &&
          deadline &&
          localDay(deadline, settings.timezone) ===
            localDay(now, settings.timezone))))
  )
    return now;
  const minutes = (value: string) =>
    Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
  const start = minutes(settings.quietHoursStart);
  const end = minutes(settings.quietHoursEnd);
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: settings.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const isQuiet = (date: Date) => {
    const minute = localMinutes(date, formatter);
    return start < end
      ? minute >= start && minute < end
      : minute >= start || minute < end;
  };
  if (!isQuiet(now)) return now;
  // Walk actual instants, so skipped/repeated local hours are handled correctly.
  let candidate = new Date(Math.floor(now.getTime() / 60000) * 60000 + 60000);
  for (
    let i = 0;
    i < 27 * 60;
    i++, candidate = new Date(candidate.getTime() + 60000)
  ) {
    if (!isQuiet(candidate)) return candidate;
  }
  throw new Error('Invalid quiet-hours window');
}

export function morningTime(date: string, timezone: string): Date {
  const target = Date.parse(`${date}T07:30:00Z`);
  let instant = target;
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  for (let i = 0; i < 4; i++) {
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(instant)).map((p) => [p.type, p.value]),
    );
    const local = Date.parse(
      `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}Z`,
    );
    if (local === target) return new Date(instant);
    instant += target - local;
  }
  throw new Error('Unable to resolve morning digest time');
}
