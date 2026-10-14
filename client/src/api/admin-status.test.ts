import { describe, it, expect } from "vitest";
import { accountStatusSchema } from "./admin";
describe("Account status confirmation", () => {
  it("requires a controlled suspension reason", () => {
    expect(accountStatusSchema.safeParse({ suspended: true }).success).toBe(
      false,
    );
    expect(
      accountStatusSchema.safeParse({ suspended: true, reason: "security" })
        .success,
    ).toBe(true);
    expect(
      accountStatusSchema.safeParse({ suspended: true, reason: "arbitrary" })
        .success,
    ).toBe(false);
  });
  it("allows reactivation without a suspension reason", () => {
    expect(accountStatusSchema.safeParse({ suspended: false }).success).toBe(
      true,
    );
  });
});
