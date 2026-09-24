import { describe, expect, it } from "vitest";
import {
  createNotificationPreferenceSchema,
  notificationPreferenceSchema,
  updateNotificationPreferenceSchema,
} from "@/schemas/notification-preference.schema";

describe("createNotificationPreferenceSchema", () => {
  it("accepte un canal et un flag enabled", () => {
    expect(
      createNotificationPreferenceSchema.safeParse({
        channel: "email",
        enabled: true,
      }).success,
    ).toBe(true);
  });

  it("exige un canal connu", () => {
    const parsed = createNotificationPreferenceSchema.safeParse({
      channel: "",
      enabled: true,
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(
        parsed.error.issues.some((issue) => issue.message === "Ce champ est requis"),
      ).toBe(true);
    }
  });

  it("refuse un canal inconnu", () => {
    expect(
      createNotificationPreferenceSchema.safeParse({
        channel: "push",
        enabled: true,
      }).success,
    ).toBe(false);
  });
});

describe("updateNotificationPreferenceSchema", () => {
  it("exige un booléen enabled", () => {
    expect(
      updateNotificationPreferenceSchema.safeParse({ enabled: false }).success,
    ).toBe(true);
    expect(
      updateNotificationPreferenceSchema.safeParse({ enabled: "oui" }).success,
    ).toBe(false);
  });
});

describe("notificationPreferenceSchema", () => {
  it("accepte une préférence API", () => {
    expect(
      notificationPreferenceSchema.safeParse({
        id: "33333333-3333-3333-3333-333333333333",
        userId: "11111111-1111-1111-1111-111111111111",
        channel: "sms",
        enabled: false,
      }).success,
    ).toBe(true);
  });
});
