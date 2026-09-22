import { describe, expect, it } from "vitest";
import { taskFormSchema } from "@/schemas/task.schema";

describe("taskFormSchema", () => {
  it("rejette un titre vide", () => {
    const result = taskFormSchema.safeParse({
      title: "  ",
      status: "todo",
      priority: "medium",
      category: "other",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Ce champ est requis");
    }
  });

  it("refuse une date à faire avant postérieure à l'échéance", () => {
    const result = taskFormSchema.safeParse({
      title: "Préparer la page du jour",
      status: "todo",
      priority: "medium",
      category: "work",
      dueDate: new Date("2026-09-21"),
      toDoBefore: new Date("2026-09-22"),
    });
    expect(result.success).toBe(false);
  });
});
