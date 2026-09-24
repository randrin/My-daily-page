import { endOfDay, format, startOfDay, subDays, subMonths } from "date-fns";
import type { DateRange } from "react-day-picker";

export const DASHBOARD_PERIOD_PRESETS = ["7d", "1m", "2m", "3m", "custom"] as const;
export type DashboardPeriodPreset = (typeof DASHBOARD_PERIOD_PRESETS)[number];
export type DashboardFixedPreset = Exclude<DashboardPeriodPreset, "custom">;

export function taskDatesToRange(
  start?: Date | null,
  end?: Date | null,
): DateRange | undefined {
  if (!start && !end) return undefined;
  const from = start ?? end;
  if (!from) return undefined;
  return { from, to: end ?? start ?? from };
}

export function deadlineToRange(
  deadline?: Date | null,
): DateRange | undefined {
  if (!deadline) return undefined;
  return { from: deadline, to: deadline };
}

export function rangeToDeadline(range?: DateRange): Date | undefined {
  if (!range?.from) return undefined;
  return range.to ?? range.from;
}

export function rangeToTaskDates(range?: DateRange): {
  toDoBefore?: Date;
  dueDate?: Date;
} {
  if (!range?.from) return {};
  return {
    toDoBefore: range.from,
    dueDate: range.to ?? range.from,
  };
}

export function rangeToIsoBounds(range?: DateRange): {
  from?: string;
  to?: string;
} {
  if (!range?.from) return {};
  return {
    from: startOfDay(range.from).toISOString(),
    to: endOfDay(range.to ?? range.from).toISOString(),
  };
}

export function rollingPeriodRange(
  now: Date,
  preset: DashboardFixedPreset,
): DateRange {
  const to = endOfDay(now);
  if (preset === "7d") {
    return { from: startOfDay(subDays(now, 7)), to };
  }
  const months = preset === "1m" ? 1 : preset === "2m" ? 2 : 3;
  return { from: startOfDay(subMonths(now, months)), to };
}

export function rollingPeriodCalendarBounds(
  now: Date,
  preset: DashboardFixedPreset,
): { from: string; to: string } {
  const range = rollingPeriodRange(now, preset);
  return {
    from: format(range.from ?? now, "yyyy-MM-dd"),
    to: format(now, "yyyy-MM-dd"),
  };
}

export function lastMonthRange(now: Date): DateRange {
  return rollingPeriodRange(now, "1m");
}

export function lastMonthCalendarBounds(now: Date): { from: string; to: string } {
  return rollingPeriodCalendarBounds(now, "1m");
}

export function calendarDateToLocalDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}
