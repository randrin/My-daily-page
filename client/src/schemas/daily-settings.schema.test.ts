import { describe, expect, it } from "vitest";
import { dailySettingsInputSchema } from "./daily-settings.schema";

const input = {
  dailyDigestEnabled: false,
  quietHoursEnabled: true,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
  quietHoursAllowUrgent: false,
};
describe("Daily settings", () => {
  it("supports an overnight window", () => {
    expect(dailySettingsInputSchema.safeParse(input).success).toBe(true);
  });
  it("rejects equal endpoints and invalid hours", () => {
    expect(
      dailySettingsInputSchema.safeParse({ ...input, quietHoursEnd: "22:00" })
        .success,
    ).toBe(false);
    expect(
      dailySettingsInputSchema.safeParse({ ...input, quietHoursStart: "24:10" })
        .success,
    ).toBe(false);
  });
});
