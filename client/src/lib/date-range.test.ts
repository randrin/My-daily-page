import { describe, expect, it } from "vitest";
import {
  calendarDateToLocalDate,
  lastMonthCalendarBounds,
  lastMonthRange,
  rangeToTaskDates,
  rollingPeriodCalendarBounds,
  rollingPeriodRange,
  taskDatesToRange,
} from "@/lib/date-range";

describe("task date range helpers", () => {
  it("mappe début → toDoBefore et fin → dueDate", () => {
    const start = new Date("2026-09-21");
    const end = new Date("2026-09-28");
    const range = taskDatesToRange(start, end);
    expect(range?.from).toEqual(start);
    expect(range?.to).toEqual(end);
    expect(rangeToTaskDates(range)).toEqual({
      toDoBefore: start,
      dueDate: end,
    });
  });

  it("répète le début si la fin n'est pas encore choisie", () => {
    const start = new Date("2026-09-21");
    expect(rangeToTaskDates({ from: start })).toEqual({
      toDoBefore: start,
      dueDate: start,
    });
  });

  it("calcule un mois glissant à partir d’une date fixe", () => {
    const now = new Date(2026, 8, 23, 15, 0, 0);
    const range = lastMonthRange(now);
    expect(range.from).toEqual(new Date(2026, 7, 23, 0, 0, 0, 0));
    expect(range.to?.getFullYear()).toBe(2026);
    expect(range.to?.getMonth()).toBe(8);
    expect(range.to?.getDate()).toBe(23);
    expect(lastMonthCalendarBounds(now)).toEqual({
      from: "2026-08-23",
      to: "2026-09-23",
    });
    expect(calendarDateToLocalDate("2026-08-23")).toEqual(
      new Date(2026, 7, 23),
    );
  });

  it("calcule 7 jours et 3 mois glissants", () => {
    const now = new Date(2026, 8, 23, 15, 0, 0);
    expect(rollingPeriodRange(now, "7d").from).toEqual(
      new Date(2026, 8, 16, 0, 0, 0, 0),
    );
    expect(rollingPeriodCalendarBounds(now, "7d")).toEqual({
      from: "2026-09-16",
      to: "2026-09-23",
    });
    expect(rollingPeriodRange(now, "3m").from).toEqual(
      new Date(2026, 5, 23, 0, 0, 0, 0),
    );
  });
});
