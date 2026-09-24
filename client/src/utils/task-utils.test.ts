import { describe, expect, it } from "vitest";
import type { Task } from "@/types/task";
import { countActiveTaskFilters, sortTasks } from "@/utils/task-utils";

const tasks = [
  {
    id: "2",
    title: "Zoo",
    status: "todo",
    priority: "urgent",
    createdAt: new Date("2026-01-02"),
    updatedAt: new Date("2026-01-02"),
  },
  {
    id: "1",
    title: "Alpha",
    status: "done",
    priority: "low",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
] as Task[];

describe("sortTasks", () => {
  it("trie par titre", () => {
    expect(
      sortTasks(tasks, { key: "title", direction: "asc" }).map(
        (task) => task.title,
      ),
    ).toEqual(["Alpha", "Zoo"]);
  });

  it("trie le statut dans l’ordre métier", () => {
    expect(
      sortTasks(tasks, { key: "status", direction: "asc" }).map(
        (task) => task.status,
      ),
    ).toEqual(["todo", "done"]);
  });
});

describe("countActiveTaskFilters", () => {
  it("retourne 0 sans filtre de panneau", () => {
    expect(
      countActiveTaskFilters({
        status: "all",
        categoryId: "all",
        priority: "all",
      }),
    ).toBe(0);
  });

  it("compte chaque critère sélectionné une fois", () => {
    expect(
      countActiveTaskFilters({
        status: "todo",
        categoryId: "cat-1",
        priority: "high",
        deadlineFrom: new Date("2026-01-01"),
        deadlineTo: new Date("2026-01-31"),
        createdFrom: new Date("2026-01-01"),
      }),
    ).toBe(5);
  });
});
