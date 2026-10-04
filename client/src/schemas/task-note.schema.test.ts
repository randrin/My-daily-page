import { describe, expect, it } from "vitest";
import { taskNoteInputSchema, taskNoteSchema } from "./task-note.schema";

describe("notes", () => {
  it("rejette les notes vides et trop longues", () => {
    expect(taskNoteInputSchema.safeParse({ content: "  " }).success).toBe(false);
    expect(taskNoteInputSchema.safeParse({ content: "x".repeat(10001) }).success).toBe(false);
    expect(taskNoteInputSchema.parse({ content: " Note " }).content).toBe("Note");
  });
  it("convertit la date serveur pour la timeline", () => {
    const note = taskNoteSchema.parse({ id: "00000000-0000-4000-8000-000000000001", taskId: "00000000-0000-4000-8000-000000000002", content: "Note", createdAt: "2026-10-04T12:00:00Z" });
    expect(note.createdAt.toISOString()).toBe("2026-10-04T12:00:00.000Z");
  });
});
