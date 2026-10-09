import { describe, expect, it } from "vitest";
import { taskFormSchema } from "./task.schema";

describe("Monthly task form", () => {
  const input = { title: "Loyer", status: "todo", priority: "high", recurrence: "monthly" };
  it("requires a deadline for monthly recurrence", () => {
    expect(taskFormSchema.safeParse(input).success).toBe(false);
    expect(taskFormSchema.safeParse({ ...input, deadline: new Date("2030-01-31T09:00Z") }).success).toBe(true);
  });
  it("allows recurrence to be disabled and rejects unsupported rules", () => {
    expect(taskFormSchema.safeParse({ ...input, recurrence: null }).success).toBe(true);
    expect(taskFormSchema.safeParse({ ...input, recurrence: "weekly" }).success).toBe(false);
  });
});
