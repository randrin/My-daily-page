import { describe, it, expect } from "vitest";
import { confirmationSchema, suggestionSchema } from "./assistant";
describe("Assistant confirmation", () => {
  it("requires explicit selection and future deadlines", () => {
    expect(confirmationSchema.safeParse({ tasks: [] }).success).toBe(false);
    expect(
      confirmationSchema.safeParse({
        tasks: [
          {
            title: "Lire",
            priority: "MEDIUM",
            deadline: "2000-01-01T12:00:00Z",
          },
        ],
      }).success,
    ).toBe(false);
    expect(
      confirmationSchema.safeParse({
        tasks: [
          {
            title: "Lire",
            priority: "HIGH",
            deadline: new Date(Date.now() + 86400000).toISOString(),
          },
        ],
      }).success,
    ).toBe(true);
  });
  it("rejects blank content and unknown input source", () => {
    expect(
      suggestionSchema.safeParse({
        text: " ",
        provider: "ai",
        mode: "capture",
        source: "manual",
      }).success,
    ).toBe(false);
    expect(
      suggestionSchema.safeParse({
        text: "Lire",
        provider: "ai",
        mode: "capture",
        source: "unauthorized",
      }).success,
    ).toBe(false);
  });
});
