import type { DateRange } from "react-day-picker";

export function taskDatesToRange(
  start?: Date,
  end?: Date,
): DateRange | undefined {
  if (!start && !end) return undefined;
  const from = start ?? end;
  if (!from) return undefined;
  return { from, to: end ?? start };
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
