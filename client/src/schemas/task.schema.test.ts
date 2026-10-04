import { createTaskFormSchema } from "./task.schema";
import { describe, expect, it } from "vitest";
import {
  taskFormSchema,
  taskPageSchema,
  taskRangeSchema,
} from "@/schemas/task.schema";

describe("taskFormSchema", () => {
  it("rejette un titre vide", () => {
    const result = taskFormSchema.safeParse({
      title: "  ",
      status: "todo",
      priority: "medium",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Ce champ est requis");
    }
  });

  it("accepte une tâche sans catégorie ni échéance", () => {
    const result = taskFormSchema.safeParse({
      title: "Préparer la page du jour",
      status: "todo",
      priority: "medium",
    });
    expect(result.success).toBe(true);
  });

  it("accepte une imageUrl optionnelle", () => {
    const result = taskFormSchema.safeParse({
      title: "Tâche illustrée",
      status: "todo",
      priority: "medium",
      imageUrl: "http://localhost:9000/my-daily-page/task-image/u/2026/a.jpg",
    });
    expect(result.success).toBe(true);
  });

  it("exige des bloqueurs quand le statut est bloquée", () => {
    const result = taskFormSchema.safeParse({
      title: "Parent bloqué",
      status: "blocked",
      priority: "medium",
    });
    expect(result.success).toBe(false);
  });

  it("accepte une tâche bloquée avec des bloqueurs", () => {
    const result = taskFormSchema.safeParse({
      title: "Parent bloqué",
      status: "blocked",
      priority: "medium",
      blockerIds: ["11111111-1111-4111-8111-111111111111"],
    });
    expect(result.success).toBe(true);
  });

  it("refuse le statut complete", () => {
    const result = taskFormSchema.safeParse({
      title: "Ancien statut",
      status: "complete",
      priority: "medium",
    });
    expect(result.success).toBe(false);
  });
});

describe("taskPageSchema", () => {
  it("parse une page API", () => {
    const result = taskPageSchema.safeParse({
      items: [
        {
          id: "11111111-1111-1111-1111-111111111111",
          title: "Faire les courses",
          description: null,
          status: "todo",
          priority: "medium",
          deadline: null,
          categoryId: null,
          category: null,
          userId: "22222222-2222-2222-2222-222222222222",
          createdAt: "2026-09-22T10:00:00.000Z",
          updatedAt: "2026-09-22T10:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
    });
    expect(result.success).toBe(true);
  });
});

describe("taskRangeSchema", () => {
  it("parse une période API", () => {
    const result = taskRangeSchema.safeParse({
      items: [],
      total: 0,
      from: "2026-08-23T00:00:00.000Z",
      to: "2026-09-23T23:59:59.999Z",
    });
    expect(result.success).toBe(true);
  });
});

describe("échéance à la création", () => {
  const input = { title: "Nouvelle tâche", status: "todo", priority: "medium" };
  it("exige une échéance seulement à la création", () => {
    expect(createTaskFormSchema.safeParse(input).success).toBe(false);
    expect(createTaskFormSchema.safeParse({ ...input, deadline: new Date(2026, 9, 5) }).success).toBe(true);
    expect(taskFormSchema.safeParse(input).success).toBe(true);
  });
});
