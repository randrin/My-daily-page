import { describe, expect, it } from "vitest";
import { buildTaskList, buildCustomTaskList } from "./task-list-templates";

describe("dated templates", () => {
  it("keeps local time when crossing daylight saving time", () => {
    const tasks = buildTaskList(
      "travel",
      new Date(2026, 9, 24),
      "09:00",
      "Europe/Paris",
    );
    expect(tasks?.map((task) => task.deadline)).toEqual([
      "2026-10-24T07:00:00.000Z",
      "2026-10-25T08:00:00.000Z",
      "2026-10-26T08:00:00.000Z",
    ]);
  });
  it("rejects an unknown model or nonexistent local time", () => {
    expect(
      buildTaskList("unknown", new Date(2026, 0, 1), "09:00", "UTC"),
    ).toBeUndefined();
    expect(
      buildTaskList("pay", new Date(2026, 2, 29), "02:30", "Europe/Paris"),
    ).toBeUndefined();
  });
});

describe("custom dated templates", () => {
  it("keeps offsets when inactive steps are excluded and supports per-task time edits", () => {
    const items = [
      { title: "Avant", dayOffset: 0, time: "09:00", enabled: false },
      { title: " Après ", dayOffset: 2, time: "14:30", enabled: true },
    ];
    expect(
      buildCustomTaskList(items, new Date(2026, 9, 24), "Europe/Paris"),
    ).toEqual([{ title: "Après", deadline: "2026-10-26T13:30:00.000Z" }]);
    expect(items[1].title).toBe(" Après ");
  });
  it("rejects nonexistent DST times instead of shifting deadlines", () => {
    expect(
      buildCustomTaskList(
        [{ title: "Test", dayOffset: 0, time: "02:30", enabled: true }],
        new Date(2026, 2, 29),
        "Europe/Paris",
      ),
    ).toBeUndefined();
  });
  it("returns no tasks for an empty selection and rejects invalid edits", () => {
    expect(buildCustomTaskList([], new Date(2026, 9, 24), "UTC")).toEqual([]);
    expect(
      buildCustomTaskList(
        [{ title: "", dayOffset: 0, time: "09:00", enabled: true }],
        new Date(2026, 9, 24),
        "UTC",
      ),
    ).toBeUndefined();
  });
});
