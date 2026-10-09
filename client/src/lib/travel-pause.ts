import { reminderDeadline } from "@/lib/reminder-deadline";

export function formatTravelPause(
  iso: string | null | undefined,
  timezone: string,
): string {
  if (!iso) return "";
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(iso))
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function parseTravelPause(
  value: string,
  timezone: string,
): string | null | undefined {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})$/.exec(value);
  if (!match) return undefined;
  const [, year, month, day, time] = match;
  const calendar = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    calendar.getFullYear() !== Number(year) ||
    calendar.getMonth() !== Number(month) - 1 ||
    calendar.getDate() !== Number(day)
  )
    return undefined;
  return reminderDeadline(calendar, time, timezone)?.toISOString();
}
