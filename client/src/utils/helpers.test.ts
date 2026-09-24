import { describe, expect, it } from "vitest";
import { firstLetterUppercase } from "@/utils/helpers";

describe("firstLetterUppercase", () => {
  it("met la première lettre en majuscule", () => {
    expect(firstLetterUppercase("education")).toBe("Education");
  });

  it("laisse une chaîne vide inchangée", () => {
    expect(firstLetterUppercase("")).toBe("");
  });
});
