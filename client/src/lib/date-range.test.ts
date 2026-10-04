import { defaultTaskDeadline } from "./date-range";
import { upcomingPeriodRange, upcomingPeriodCalendarBounds } from "./date-range";
import { canCreateTaskOnDate } from "./date-range";
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

describe("création depuis le calendrier", () => {
  it("autorise aujourd’hui même après minuit et les jours futurs", () => {
    const now = new Date(2026, 9, 4, 23, 12);
    expect(canCreateTaskOnDate(new Date(2026, 9, 4), now)).toBe(true);
    expect(canCreateTaskOnDate(new Date(2026, 9, 5), now)).toBe(true);
    expect(canCreateTaskOnDate(new Date(2026, 9, 3, 23, 59), now)).toBe(false);
  });
  it("compare aussi les jours à cheval sur deux années", () => {
    expect(canCreateTaskOnDate(new Date(2026, 11, 31), new Date(2027, 0, 1))).toBe(false);
  });
});

describe("période à venir du dashboard", () => {
  it("va du 4 au 11 octobre pour 7 jours", () => {
    const now = new Date(2026, 9, 4, 23, 15);
    expect(upcomingPeriodCalendarBounds(now, "7d")).toEqual({ from: "2026-10-04", to: "2026-10-11" });
    expect(upcomingPeriodRange(now, "7d").from).toEqual(new Date(2026, 9, 4));
    expect(upcomingPeriodRange(now, "7d").to).toEqual(new Date(2026, 9, 11, 23, 59, 59, 999));
  });
  it("ajoute le nombre de mois choisi", () => {
    const now = new Date(2026, 9, 4);
    expect(upcomingPeriodCalendarBounds(now, "1m").to).toBe("2026-11-04");
    expect(upcomingPeriodCalendarBounds(now, "2m").to).toBe("2026-12-04");
    expect(upcomingPeriodCalendarBounds(now, "3m").to).toBe("2027-01-04");
  });
});

describe("échéance par défaut", () => {
  it("conserve la saisie obligatoire sans configuration", () => {
    expect(defaultTaskDeadline(null, new Date(2026, 9, 4))).toBeUndefined();
  });
  it("ajoute le délai en jours, y compris zéro et le changement de mois", () => {
    const now = new Date(2026, 9, 31, 23);
    expect(defaultTaskDeadline(0, now)).toEqual(new Date(2026, 9, 31));
    expect(defaultTaskDeadline(7, now)).toEqual(new Date(2026, 10, 7));
  });
});
