import { describe, expect, it } from "vitest";
import { getPasswordStrength } from "./password-strength";
describe("password strength guidance", () => {
  it("starts neutral and keeps short or common passwords weak", () => {
    expect(getPasswordStrength("").level).toBe(0);
    expect(getPasswordStrength("Ab1!").level).toBe(1);
    expect(getPasswordStrength("Password123!VeryLong").level).toBe(1);
    expect(getPasswordStrength("aaaaaaaaaaaaaaaa").level).toBe(1);
  });
  it("distinguishes medium, strong and excellent", () => {
    expect(getPasswordStrength("Bateau7!").level).toBe(2);
    expect(getPasswordStrength("Bateau-Lune7!").level).toBe(3);
    expect(getPasswordStrength("Bateau-Lune7!Soleil").level).toBe(4);
  });
  it("recognizes accented letters and does not count spaces as symbols", () => {
    const result = getPasswordStrength("Été tranquille 7");
    expect(result.criteria[1].met).toBe(true);
    expect(result.criteria[3].met).toBe(false);
  });
});
