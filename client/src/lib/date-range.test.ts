import { describe, expect, it } from "vitest";
import { rangeToTaskDates, taskDatesToRange } from "@/lib/date-range";

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
});
