/** Convert a calendar day + wall-clock time in the user's timezone to UTC. */
export function reminderDeadline(day: Date | undefined, time: string, timezone: string): Date | undefined {
  if (!day || !/^\d{2}:\d{2}$/.test(time)) return undefined;
  const [hour, minute] = time.split(':').map(Number);
  if (hour > 23 || minute > 59) return undefined;
  const target = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute);
  const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const wallClock = (instant: number) => {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(instant)).map((part) => [part.type, part.value]));
    return Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));
  };
  let guess = target;
  for (let i = 0; i < 4; i++) {
    const difference = target - wallClock(guess);
    if (difference === 0) return new Date(guess);
    guess += difference;
  }
  return undefined; // Wall-clock time does not exist across a DST jump.
}

export function deadlineTime(deadline: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(deadline);
}
