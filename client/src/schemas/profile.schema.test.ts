import { describe, expect, it } from "vitest";
import {
  changePasswordSchema,
  profileFormSchema,
} from "@/schemas/profile.schema";

describe("profileFormSchema", () => {
  it("accepte un profil valide", () => {
    expect(
      profileFormSchema.safeParse({
        email: "demo@mydailypage.dev",
        phoneNumber: "+33600000000",
        whatsappNumber: "",
        timezone: "Europe/Paris",
      }).success,
    ).toBe(true);
  });

  it("refuse un email et un téléphone invalides", () => {
    const parsed = profileFormSchema.safeParse({
      email: "pas-un-email",
      phoneNumber: "abc",
      timezone: "Europe/Paris",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(
        parsed.error.issues.some((issue) => issue.message === "Email invalide"),
      ).toBe(true);
      expect(
        parsed.error.issues.some((issue) => issue.message === "Numéro invalide"),
      ).toBe(true);
    }
  });
});

describe("changePasswordSchema", () => {
  it("refuse une confirmation différente", () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "password123",
        newPassword: "newPassword123",
        confirmPassword: "newPassword124",
      }).success,
    ).toBe(false);
  });

  it("refuse un nouveau mot de passe identique à l’actuel", () => {
    const parsed = changePasswordSchema.safeParse({
      currentPassword: "password123",
      newPassword: "password123",
      confirmPassword: "password123",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(
        parsed.error.issues.some(
          (issue) =>
            issue.message === "Le nouveau mot de passe doit être différent",
        ),
      ).toBe(true);
    }
  });

  it("accepte un changement valide", () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "password123",
        newPassword: "newPassword123",
        confirmPassword: "newPassword123",
      }).success,
    ).toBe(true);
  });
});
