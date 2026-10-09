import { describe, expect, it } from "vitest";
import { taskFormSchema } from "./task.schema";
import { toTaskPayload } from "@/api/tasks";

describe("task financial fields", () => {
  const base = { title: "Invoice", status: "todo", priority: "medium", deadline: new Date("2099-01-01T09:00:00Z") };
  it("preserves precise amounts and clears optional fields", () => {
    const parsed = taskFormSchema.parse({ ...base, amount: "125.50", currency: "EUR", reference: "INV-42" });
    expect(toTaskPayload(parsed)).toMatchObject({ amount: "125.50", currency: "EUR", reference: "INV-42" });
    expect(taskFormSchema.safeParse({ ...base, amount: null, reference: null }).success).toBe(true);
  });
  it("rejects invalid money and oversized references", () => {
    for (const amount of ["-1", "12.345", "10000000000", "abc"]) expect(taskFormSchema.safeParse({ ...base, amount }).success).toBe(false);
    expect(taskFormSchema.safeParse({ ...base, reference: "x".repeat(121) }).success).toBe(false);
  });
});
