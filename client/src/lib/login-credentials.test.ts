import { describe, it, expect } from "vitest";
import { loginCredentials, normalizeMfaCode } from "./login-credentials";
describe("Two-step credentials transport", () => {
  const input = { email: "test@example.invalid", password: "test-password" };
  it("omits the code entirely on the first step, including URLSearchParams serialization", () => {
    const serialized = new URLSearchParams(loginCredentials(input));
    expect(serialized.has("code")).toBe(false);
    expect(serialized.get("email")).toBe(input.email);
    expect(serialized.get("password")).toBe(input.password);
  });
  it("preserves six digits and leading zeros on the second step", () => {
    expect(
      new URLSearchParams(loginCredentials(input, " 001 234 ")).get("code"),
    ).toBe("001234");
  });
  it("handles old empty credentials and recovery codes without losing their characters", () => {
    for (const value of [undefined, null, "", "undefined", "null", "  "])
      expect(normalizeMfaCode(value)).toBeUndefined();
    expect(
      loginCredentials(input, "abcdef01-abcdef02-abcdef03-abcdef04").code,
    ).toBe("abcdef01-abcdef02-abcdef03-abcdef04");
  });
});
