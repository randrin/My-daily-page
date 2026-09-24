import { describe, expect, it } from "vitest";
import {
  categoryFormSchema,
  categorySchema,
} from "@/schemas/category.schema";

describe("categoryFormSchema", () => {
  it("exige un nom non vide", () => {
    const empty = categoryFormSchema.safeParse({ name: "   " });
    expect(empty.success).toBe(false);
    if (!empty.success) {
      expect(
        empty.error.issues.some((issue) => issue.message === "Ce champ est requis"),
      ).toBe(true);
    }

    expect(categoryFormSchema.safeParse({ name: "Travail" }).success).toBe(true);
  });

  it("refuse un nom trop long", () => {
    const parsed = categoryFormSchema.safeParse({ name: "a".repeat(81) });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(
        parsed.error.issues.some(
          (issue) => issue.message === "80 caractères maximum",
        ),
      ).toBe(true);
    }
  });
});

describe("categorySchema", () => {
  it("accepte une catégorie API", () => {
    const parsed = categorySchema.safeParse({
      id: "33333333-3333-3333-3333-333333333333",
      name: "Travail",
      color: "#3b82f6",
      userId: "11111111-1111-1111-1111-111111111111",
    });
    expect(parsed.success).toBe(true);
  });

  it("refuse une couleur hors hex", () => {
    expect(
      categorySchema.safeParse({
        id: "1",
        name: "Travail",
        color: "blue",
        userId: "1",
      }).success,
    ).toBe(false);
  });
});
